import express, { Router, Request, Response } from 'express';
import pool from '../config/db';

const router: Router = express.Router();

interface Customer {
  id?: number;
  user_id: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// CREATE - Crear un cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, first_name, last_name, company_name, tax_id, address, phone, email }: Partial<Customer> = req.body;
    const result = await pool.query(
      `INSERT INTO customers (user_id, first_name, last_name, company_name, tax_id, address, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, first_name, last_name, company_name, tax_id, address, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los clientes
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.username AS user_username
       FROM customers c
       JOIN users u ON c.user_id = u.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un cliente por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT c.*, u.username AS user_username
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un cliente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, first_name, last_name, company_name, tax_id, address, phone, email }: Partial<Customer> = req.body;
    const result = await pool.query(
      `UPDATE customers
       SET user_id = $1, first_name = $2, last_name = $3, company_name = $4, tax_id = $5, address = $6, phone = $7, email = $8
       WHERE id = $9 RETURNING *`,
      [user_id, first_name, last_name, company_name, tax_id, address, phone, email, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar un cliente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.json({ message: 'Customer deleted', customer: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;