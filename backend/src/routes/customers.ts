import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { authenticate, authorize } from "../middleware/auth";

const router: Router = express.Router();

// Interfaz para la tabla customers
interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  address?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

// Interfaz para la tabla credits
interface Credit {
  id?: number;
  customer_id: number;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
  credit_limit?: number; // Null o 0 para compras al contado, valor positivo para prepago
  status?: string;
}

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// CREATE - Registrar un nuevo cliente
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, address, phone, company_name, tax_id, email, status, credit_limit }: Partial<Customer & { credit_limit?: number }> = req.body;

    // Validar campos obligatorios
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Insertar el cliente
    const customerResult = await pool.query(
      `INSERT INTO customers (first_name, last_name, address, phone, company_name, tax_id, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [first_name, last_name, address || null, phone || null, company_name || null, tax_id || null, email || null, status || 'active']
    );

    // Crear registro de créditos inicial (todos tienen esta opción)
    const customerId = customerResult.rows[0].id;
    const initialBalance = 0.00; // Saldo inicial siempre 0
    const effectiveCreditLimit = credit_limit !== undefined ? credit_limit : null; // Null para compras al contado por defecto

    await pool.query(
      `INSERT INTO credits (customer_id, balance, credit_limit, created_at, updated_at, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4)`,
      [customerId, initialBalance, effectiveCreditLimit, 'active']
    );

    res.status(201).json(customerResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los clientes
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cr.balance, cr.credit_limit
       FROM customers c
       LEFT JOIN credits cr ON c.id = cr.customer_id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un cliente por ID con su saldo de crédito
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, cr.balance, cr.credit_limit
       FROM customers c
       LEFT JOIN credits cr ON c.id = cr.customer_id
       WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar completamente un cliente (PUT)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, address, phone, company_name, tax_id, email, status, credit_limit }: Partial<Customer & { credit_limit?: number }> = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET first_name = $1, last_name = $2, address = $3, phone = $4, company_name = $5, tax_id = $6, email = $7, status = $8
       WHERE id = $9 RETURNING *`,
      [first_name, last_name, address || null, phone || null, company_name || null, tax_id || null, email || null, status || 'active', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Actualizar credit_limit si se proporciona
    if (credit_limit !== undefined) {
      await pool.query(
        `UPDATE credits SET credit_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $2`,
        [credit_limit, id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH - Actualizar parcialmente un cliente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Customer & { credit_limit?: number }> = req.body;

    const existingCustomer = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof typeof updates] ?? null);

    const result = await pool.query(
      `UPDATE customers SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    // Actualizar credit_limit si está en los updates
    if ('credit_limit' in updates) {
      await pool.query(
        `UPDATE credits SET credit_limit = $1, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $2`,
        [updates.credit_limit, id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /:id/credits - Agregar o actualizar saldo prepago
router.post('/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { balance } = req.body; // Monto a agregar al saldo prepago

    if (!balance || isNaN(balance)) {
      return res.status(400).json({ error: 'Balance must be a valid number' });
    }

    const customerCheck = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const creditCheck = await pool.query('SELECT * FROM credits WHERE customer_id = $1', [id]);
    if (creditCheck.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO credits (customer_id, balance, created_at, updated_at, status)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active') RETURNING *`,
        [id, balance]
      );
      return res.status(201).json({ message: 'Credits initialized', credit: result.rows[0] });
    } else {
      const currentCredit = creditCheck.rows[0];
      if (currentCredit.credit_limit !== null && currentCredit.balance + balance > currentCredit.credit_limit) {
        return res.status(400).json({ error: 'Balance exceeds credit limit' });
      }
      const result = await pool.query(
        `UPDATE credits SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE customer_id = $2 RETURNING *`,
        [balance, id]
      );
      return res.status(200).json({ message: 'Credits updated', credit: result.rows[0] });
    }
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Desactivar un cliente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE customers SET status = 'inactive' WHERE id = $1 RETURNING id, first_name, last_name, status`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Customer with ID ${id} not found` });
    }

    // Desactivar también el registro de créditos
    await pool.query(
      `UPDATE credits SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE customer_id = $1`,
      [id]
    );

    res.status(200).json({
      message: `Customer with ID ${id} deactivated successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;