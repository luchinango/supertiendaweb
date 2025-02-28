import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { CreditService } from '../services/creditService';

const router: Router = express.Router();

interface Cart {
  id?: number;
  customer_id: number;
  created_at?: Date;
}

interface CartItem {
  id?: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  name?: string;
  price?: number;
}

// CREATE - Crear un carrito
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_id }: Partial<Cart> = req.body;
    // Validar que customer_id esté presente
    if (!customer_id) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await pool.query(
      'INSERT INTO cart (customer_id) VALUES ($1) RETURNING *',
      [customer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Agregar producto al carrito
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { cart_id, product_id, quantity }: Partial<CartItem> = req.body;

    // Validar campos requeridos
    if (!cart_id || !product_id) {
      return res.status(400).json({ error: 'Cart ID and Product ID are required' });
    }

    // Asignar un valor por defecto a quantity si no está definido
    const finalQuantity = quantity ?? 1; // Si quantity es undefined, usa 1 como valor por defecto

    // Verificar si el carrito existe
    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [cart_id]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Verificar si el producto existe y obtener su precio y proveedor
    const product = await pool.query('SELECT price, supplier_id FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const price_at_time = product.rows[0].price;
    const supplierId = product.rows[0].supplier_id;

    // Verificar si el producto está en consignación
    const consignmentItem = await pool.query(
      `SELECT ci.consignment_id, ci.quantity_delivered, ci.quantity_sold
       FROM consignment_items ci
       JOIN consignments c ON ci.consignment_id = c.id
       WHERE c.supplier_id = $1 AND ci.product_id = $2 AND c.status = 'active'`,
      [supplierId, product_id]
    );

    if (consignmentItem.rows.length > 0) {
      const { consignment_id, quantity_delivered, quantity_sold } = consignmentItem.rows[0];
      const availableToSell = quantity_delivered - quantity_sold;

      // Ahora finalQuantity está garantizado como número, así que no habrá error
      if (finalQuantity > availableToSell) {
        return res.status(400).json({ error: `Only ${availableToSell} units available for this consignment` });
      }
    }

    // Insertar el ítem en el carrito
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, finalQuantity, price_at_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener contenido del carrito
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      'SELECT ci.*, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST - Finalizar compra del carrito (procesar método de pago)
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { customer_payment_method, supplier_payment_method }: { customer_payment_method: 'cash' | 'credits'; supplier_payment_method: 'cash' | 'credit' } = req.body;

    // Validar el método de pago del cliente
    if (!customer_payment_method || !['cash', 'credits'].includes(customer_payment_method)) {
      return res.status(400).json({ error: 'Invalid customer payment method. Must be "cash" or "credits"' });
    }

    // Validar el método de pago del supplier
    if (!supplier_payment_method || !['cash', 'credit'].includes(supplier_payment_method)) {
      return res.status(400).json({ error: 'Invalid supplier payment method. Must be "cash" or "credit"' });
    }

    // Verificar el carrito
    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [id]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const customerId = cart.rows[0].customer_id;

    // Obtener los ítems del carrito
    const cartItems = await pool.query(
      'SELECT ci.*, p.price, p.supplier_id FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [id]
    );
    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calcular el costo total
    const totalCost = cartItems.rows.reduce((sum: number, item: CartItem) => {
      return sum + (item.quantity * item.price_at_time);
    }, 0);

    // Verificar si el cliente paga con créditos
    if (customer_payment_method === 'credits') {
      await CreditService.deductCustomerBalance(customerId, totalCost);
    }

    // Verificar si hay productos en consignación
    for (const item of cartItems.rows) {
      const { product_id, quantity, price_at_time, supplier_id } = item;

      const consignmentItem = await pool.query(
        `SELECT ci.consignment_id, ci.quantity_delivered, ci.quantity_sold
         FROM consignment_items ci
         JOIN consignments c ON ci.consignment_id = c.id
         WHERE c.supplier_id = $1 AND ci.product_id = $2 AND c.status = 'active'`,
        [supplier_id, product_id]
      );

      if (consignmentItem.rows.length > 0) {
        const consignmentId = consignmentItem.rows[0].consignment_id;
        await CreditService.updateConsignmentSale(consignmentId, product_id, quantity);
      } else {
        // Si no es consignación, procesar pago al supplier
        if (supplier_payment_method === 'credit') {
          await CreditService.createSupplierDebt(supplier_id, quantity * price_at_time);
        }
      }
    }

    // Eliminar ítems del carrito
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [id]);

    res.json({
      message: 'Purchase completed successfully',
      total_cost: totalCost,
      customer_payment_method,
      supplier_payment_method
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;