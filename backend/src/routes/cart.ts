import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { authenticate, authorize } from "../middleware/auth";

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

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// CREATE - Crear un carrito para un customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_id }: Partial<Cart> = req.body;
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

    if (!cart_id || !product_id) {
      return res.status(400).json({ error: 'Cart ID and Product ID are required' });
    }

    const finalQuantity = quantity ?? 1;

    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [cart_id]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await pool.query('BEGIN');

    const product = await pool.query(
      'SELECT price, supplier_id, actual_stock FROM products WHERE id = $1 FOR UPDATE',
      [product_id]
    );
    if (product.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const price_at_time = product.rows[0].price;
    const supplierId = product.rows[0].supplier_id;
    const availableStock = product.rows[0].actual_stock;

    if (finalQuantity > availableStock) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${availableStock} units available for this product` 
      });
    }

    // Verificar consignaciones (si aplica)
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

      if (finalQuantity > availableToSell) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Only ${availableToSell} units available for this consignment` 
        });
      }

      // Actualizar quantity_sold en consignment_items
      await pool.query(
        'UPDATE consignment_items SET quantity_sold = quantity_sold + $1 WHERE consignment_id = $2 AND product_id = $3',
        [finalQuantity, consignment_id, product_id]
      );
    }

    await pool.query(
      'UPDATE products SET actual_stock = actual_stock - $1 WHERE id = $2',
      [finalQuantity, product_id]
    );

    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, finalQuantity, price_at_time]
    );

    await pool.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
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

// DELETE - Quitar un ítem del carrito
router.delete('/:cartId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { cartId, itemId } = req.params as { cartId: string; itemId: string };
    const cartIdNum = parseInt(cartId, 10);
    const itemIdNum = parseInt(itemId, 10);

    if (isNaN(cartIdNum) || isNaN(itemIdNum)) {
      return res.status(400).json({ error: 'Cart ID and Item ID must be valid numbers' });
    }

    await pool.query('BEGIN');

    const cart = await pool.query('SELECT id FROM cart WHERE id = $1', [cartIdNum]);
    if (cart.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: `Cart with ID ${cartId} not found` });
    }

    const item = await pool.query(
      'SELECT id, cart_id, product_id, quantity FROM cart_items WHERE id = $1 AND cart_id = $2',
      [itemIdNum, cartIdNum]
    );

    if (item.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        error: `Cart item with ID ${itemId} not found in cart ${cartId}`,
        debug: `Searched for item with id = ${itemIdNum} in cart_id = ${cartIdNum}`
      });
    }

    const { product_id, quantity } = item.rows[0];

    // Devolver el stock
    const stockUpdate = await pool.query(
      'UPDATE products SET actual_stock = actual_stock + $1 WHERE id = $2 RETURNING actual_stock',
      [quantity, product_id]
    );

    if (stockUpdate.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(500).json({ error: `Failed to update stock for product ID ${product_id}` });
    }

    // Revertir quantity_sold en consignaciones si aplica
    const consignmentItem = await pool.query(
      `SELECT ci.consignment_id
       FROM consignment_items ci
       JOIN consignments c ON ci.consignment_id = c.id
       WHERE c.supplier_id = (SELECT supplier_id FROM products WHERE id = $1) AND ci.product_id = $1 AND c.status = 'active'`,
      [product_id]
    );

    if (consignmentItem.rows.length > 0) {
      const consignmentId = consignmentItem.rows[0].consignment_id;
      await pool.query(
        'UPDATE consignment_items SET quantity_sold = quantity_sold - $1 WHERE consignment_id = $2 AND product_id = $3',
        [quantity, consignmentId, product_id]
      );
    }

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *',
      [itemIdNum, cartIdNum]
    );

    await pool.query('COMMIT');
    res.status(200).json({
      message: `Item ${itemId} removed from cart ${cartId} successfully`,
      removedItem: result.rows[0],
      updatedStock: stockUpdate.rows[0].actual_stock
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      error: 'Failed to remove item from cart',
      details: (error as Error).message 
    });
  }
});

// POST - Finalizar compra del carrito (solo para customers, usando transactions)
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const cartIdNum = parseInt(id, 10);

    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Cart ID must be a valid number' });
    }

    const { customer_payment_method, user_id } = req.body;

    // Validación del método de pago del cliente
    if (!customer_payment_method) {
      return res.status(400).json({ 
        error: 'Customer payment method is required',
        expected: 'Must be "cash" or "credit"'
      });
    }
    if (!['cash', 'credit'].includes(customer_payment_method)) {
      return res.status(400).json({ 
        error: 'Invalid customer payment method',
        received: customer_payment_method,
        expected: 'Must be "cash" or "credit"'
      });
    }

    // Validación del user_id (necesario para transactions)
    if (!user_id || isNaN(parseInt(user_id, 10))) {
      return res.status(400).json({ error: 'User ID is required and must be a valid number' });
    }

    // Verificar el carrito
    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [cartIdNum]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: `Cart with ID ${cartIdNum} not found` });
    }

    const customerId = cart.rows[0].customer_id;

    // Obtener los ítems del carrito
    const cartItems = await pool.query(
      'SELECT ci.*, p.price, p.supplier_id FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [cartIdNum]
    );
    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalCost = cartItems.rows.reduce((sum: number, item: CartItem) => {
      return sum + (item.quantity * item.price_at_time);
    }, 0);

    await pool.query('BEGIN');

    // Si es crédito, verificar y deducir el saldo del cliente
    if (customer_payment_method === 'credit') {
      const customer = await pool.query(
        'SELECT credit_balance FROM customers WHERE id = $1 FOR UPDATE',
        [customerId]
      );
      if (customer.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Customer not found' });
      }

      const creditBalance = customer.rows[0].credit_balance || 0;
      if (creditBalance < totalCost) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Insufficient credit balance. Available: ${creditBalance}, Required: ${totalCost}` 
        });
      }

      await pool.query(
        'UPDATE customers SET credit_balance = credit_balance - $1 WHERE id = $2',
        [totalCost, customerId]
      );
    }

    // Registrar la transacción
    const transactionResult = await pool.query(
      `INSERT INTO transactions (customer_id, user_id, amount, type, reference, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [customerId, user_id, totalCost, customer_payment_method, `Checkout cart ${cartIdNum}`]
    );

    // Actualizar consignaciones si existen
    for (const item of cartItems.rows) {
      const { product_id, quantity, supplier_id } = item;

      const consignmentItem = await pool.query(
        `SELECT ci.consignment_id, ci.quantity_sold
         FROM consignment_items ci
         JOIN consignments c ON ci.consignment_id = c.id
         WHERE c.supplier_id = $1 AND ci.product_id = $2 AND c.status = 'active'`,
        [supplier_id, product_id]
      );

      if (consignmentItem.rows.length > 0) {
        const consignmentId = consignmentItem.rows[0].consignment_id;
        const currentSold = consignmentItem.rows[0].quantity_sold || 0;

        // Solo actualizar si no se actualizó al agregar al carrito
        if (currentSold < quantity) {
          await pool.query(
            'UPDATE consignment_items SET quantity_sold = quantity_sold + $1 WHERE consignment_id = $2 AND product_id = $3',
            [quantity - currentSold, consignmentId, product_id]
          );
        }
      }
    }

    // Vaciar el carrito
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartIdNum]);

    await pool.query('COMMIT');

    res.json({
      message: `Purchase for cart ${cartIdNum} completed successfully`,
      total_cost: totalCost,
      customer_payment_method,
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      error: 'Failed to complete purchase',
      details: (error as Error).message 
    });
  }
});

export default router;