import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';

const router = Router();

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
    const product = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const price_at_time = product.rows[0].price;
    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, quantity, price_at_time]
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

export default router;
