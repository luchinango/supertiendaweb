import { Router, Request, Response } from 'express';
import express from 'express';
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
  status?: string;
}

interface Credit {
  id?: number;
  customer_id: number;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
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

    // Crear un registro de créditos inicial para el nuevo cliente
    await pool.query(
      `INSERT INTO credits (customer_id, balance) VALUES ($1, $2)`,
      [result.rows[0].id, 0.00]
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

// READ - Obtener un cliente por ID con su saldo
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT c.*, u.username AS user_username, cr.balance
       FROM customers c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN credits cr ON c.id = cr.customer_id
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

// UPDATE - Actualizar un cliente (PUT - reemplaza todos los campos)
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

// PATCH - Actualizar parcialmente un cliente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Customer> = req.body;

    const existingCustomer = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof Partial<Customer>]);

    const result = await pool.query(
      `UPDATE customers SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Inactivar un cliente (genérico)
router.post('/delete/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10); // Obtener el ID de la URL

  // Validar que el ID sea un número válido
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'El ID del cliente debe ser un número válido' });
  }

  try {
    // Actualizar el status a 'inactive' directamente
    const result = await pool.query(
      `UPDATE customers 
       SET status = 'inactive' 
       WHERE id = $1 
       RETURNING id, first_name, status`,
      [userId]
    );

    // Verificar si se actualizó algún registro
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un cliente con ID ${userId}` });
    }

    res.status(200).json({ 
      message: `Cliente con ID ${userId} desactivado correctamente`, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ 
      error: 'Error al intentar desactivar el cliente', 
      details: (error as Error).message 
    });
  }
});

// POST - Depositar créditos (aumentar saldo)
router.post('/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount }: { amount: number } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Verificar si el cliente existe
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Actualizar o insertar saldo en credits
    const creditResult = await pool.query(
      `INSERT INTO credits (customer_id, balance) VALUES ($1, $2)
       ON CONFLICT (customer_id) DO UPDATE SET balance = credits.balance + $2
       RETURNING *`,
      [id, amount]
    );

    res.json({ message: 'Credits deposited successfully', balance: creditResult.rows[0].balance });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET - Consultar saldo de créditos
router.get('/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT balance FROM credits WHERE customer_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer has no credits record' });
    }
    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;