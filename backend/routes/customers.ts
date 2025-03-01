import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth'; // Asume middleware de autenticación

const router: Router = express.Router();

interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
}

// Middleware de autenticación para todas las rutas
router.use(authenticate);

// CREATE - Crear cliente (solo administradores)
router.post('/', authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const { 
      first_name, 
      last_name, 
      company_name, 
      tax_id, 
      address, 
      phone, 
      email 
    }: Customer = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO customers 
       (first_name, last_name, company_name, tax_id, address, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') 
       RETURNING *`,
      [first_name, last_name, company_name, tax_id, address, phone, email]
    );

    // Crear crédito inicial con saldo cero
    await pool.query(
      `INSERT INTO credits (customer_id, balance, credit_limit)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, 0.00, 0.00]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los clientes (solo usuarios autorizados)
router.get('/', authorize(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM customers WHERE status = 'active'`;
    const params = [];

    if (search) {
      query += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener cliente específico con crédito
router.get('/:id', authorize(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.*, 
        cr.balance, 
        cr.credit_limit,
        cr.last_topup
       FROM customers c
       JOIN credits cr ON c.id = cr.customer_id
       WHERE c.id = $1 AND c.status = 'active'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar cliente
router.put('/:id', authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Customer = req.body;

    const result = await pool.query(
      `UPDATE customers SET
       first_name = $1,
       last_name = $2,
       company_name = $3,
       tax_id = $4,
       address = $5,
       phone = $6,
       email = $7
       WHERE id = $8
       RETURNING *`,
      [
        updates.first_name,
        updates.last_name,
        updates.company_name,
        updates.tax_id,
        updates.address,
        updates.phone,
        updates.email,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Desactivar cliente
router.delete('/:id', authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await pool.query('BEGIN');
    
    // Desactivar cliente
    await pool.query(
      `UPDATE customers SET status = 'inactive' WHERE id = $1`,
      [id]
    );
    
    // Congelar crédito
    await pool.query(
      `UPDATE credits SET status = 'frozen' WHERE customer_id = $1`,
      [id]
    );
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Cliente desactivado y crédito congelado' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: (error as Error).message });
  }
});

// Gestión de Crédito Prepago
router.post('/:id/credit/topup', authorize(['admin', 'cashier']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // Transacción para actualizar crédito
    await pool.query('BEGIN');
    
    const credit = await pool.query(
      `UPDATE credits 
       SET 
         balance = balance + $1,
         last_topup = NOW(),
         total_topups = total_topups + $1
       WHERE customer_id = $2
       RETURNING *`,
      [amount, id]
    );

    // Registrar movimiento
    await pool.query(
      `INSERT INTO credit_transactions 
       (customer_id, amount, type, reference)
       VALUES ($1, $2, 'deposit', $3)`,
      [id, amount, reference]
    );

    await pool.query('COMMIT');

    res.json({
      message: 'Recarga exitosa',
      new_balance: credit.rows[0].balance,
      transaction_id: credit.rows[0].id
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: (error as Error).message });
  }
});

// Uso de crédito
router.post('/:id/credit/use', authorize(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, invoice_number } = req.body;

    const credit = await pool.query(
      `SELECT balance FROM credits WHERE customer_id = $1 FOR UPDATE`,
      [id]
    );

    if (credit.rows[0].balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    await pool.query('BEGIN');
    
    // Descontar saldo
    await pool.query(
      `UPDATE credits SET balance = balance - $1 WHERE customer_id = $2`,
      [amount, id]
    );

    // Registrar transacción
    await pool.query(
      `INSERT INTO credit_transactions 
       (customer_id, amount, type, reference)
       VALUES ($1, $2, 'payment', $3)`,
      [id, amount, invoice_number]
    );

    await pool.query('COMMIT');

    res.json({ 
      message: 'Pago realizado con crédito',
      remaining_balance: credit.rows[0].balance - amount
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: (error as Error).message });
  }
});

// Historial de transacciones
router.get('/:id/credit/history', authorize(['admin', 'sales']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const history = await pool.query(
      `SELECT * FROM credit_transactions
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json(history.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;