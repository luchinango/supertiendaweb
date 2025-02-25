import pool from '../config/db';
import express, { Request, Response, Router } from 'express';

const router = Router();

interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  mobile_phone?: string;
  role: string;
  created_at?: Date;
}

// CREATE - Registrar un usuario
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name, address, mobile_phone, role }: Partial<User> = req.body;
    const result = await pool.query(
      `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [username, password, email, first_name, last_name, address, mobile_phone, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los usuarios
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un usuario por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un usuario
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, email, first_name, last_name, address, mobile_phone, role }: Partial<User> = req.body;
    const result = await pool.query(
      `UPDATE users SET username = $1, password = $2, email = $3, first_name = $4, last_name = $5, address = $6, mobile_phone = $7, role = $8
       WHERE id = $9 RETURNING *`,
      [username, password, email, first_name, last_name, address, mobile_phone, role, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar un usuario
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'User deleted', user: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
