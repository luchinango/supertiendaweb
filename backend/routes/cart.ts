import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';

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
    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [cart_id]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const customerId = cart.rows[0].customer_id;
    const product = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const price_at_time = product.rows[0].price;
    const totalCost = price_at_time * (quantity || 1);

    // Verificar si el usuario tiene saldo suficiente
    const credit = await pool.query('SELECT amount FROM credits WHERE user_id = $1', [customerId]);
    if (credit.rows.length === 0 || credit.rows[0].amount < totalCost) {
      return res.status(400).json({ error: 'Insufficient credits to complete purchase' });
    }

    // Insertar el ítem en el carrito
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, quantity || 1, price_at_time]
    );

    // Descontar el costo del saldo
    await pool.query(
      `UPDATE credits SET amount = amount - $1 WHERE user_id = $2`,
      [totalCost, customerId]
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

router.put('/:id', async (req: Request, res: Response) => {
  const cartId = parseInt(req.params.id, 10);
  const { quantity } = req.body;

  if (isNaN(cartId) || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'ID o cantidad inválidos' });
  }

  try {
    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1 
       WHERE id = $2 
       RETURNING *`,
      [quantity, cartId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un registro con ID ${cartId}` });
    }

    res.status(200).json({ message: 'Cantidad actualizada correctamente', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito', details: (error as Error).message });
  }
});

export default router;