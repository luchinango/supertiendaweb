import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';

const router: Router = express.Router();

interface PurchaseOrder {
  id?: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  order_date?: Date;
  status: string;
  product_name?: string; // Agregado para el JOIN con products
  supplier_name?: string; // Agregado para el JOIN con suppliers
}

// CREATE - Crear una orden de compra
router.post('/', async (req: Request, res: Response) => {
  try {
    const { product_id, supplier_id, quantity, status }: Partial<PurchaseOrder> = req.body;
    const result = await pool.query(
      `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, supplier_id, quantity, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todas las órdenes de compra
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener una orden de compra por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT po.*, p.name AS product_name, s.name AS supplier_name
       FROM purchase_orders po
       JOIN products p ON po.product_id = p.id
       JOIN suppliers s ON po.supplier_id = s.id
       WHERE po.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar una orden de compra
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id, supplier_id, quantity, status }: Partial<PurchaseOrder> = req.body;
    const result = await pool.query(
      `UPDATE purchase_orders
       SET product_id = $1, supplier_id = $2, quantity = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [product_id, supplier_id, quantity, status, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar una orden de compra
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Purchase order not found' });
    } else {
      res.json({ message: 'Purchase order deleted', purchaseOrder: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;