import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth';

interface User {
  userId: number;
}

declare global {
  namespace Express {
    interface User {
      userId: number;
    }
  }
}

const router = Router();

// ===============================
// Endpoint: Crear Transacción
// ===============================
router.post('/:customerId/transactions', 
  authenticate, 
  authorize(['sales', 'cashier']), 
  async (req: Request, res: Response) => {
    
    const { customerId } = req.params;
    const { amount, type, invoice_number, notes } = req.body;
    const userId = req.user!.userId;

    // Validación de datos
    if (!['cash', 'credit'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de transacción inválido' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    try {
      await pool.query('BEGIN'); // Iniciar transacción SQL

      // 1. Registrar transacción
      const transaction = await pool.query(
        `INSERT INTO transactions 
         (customer_id, user_id, amount, type, invoice_number, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [customerId, userId, amount, type, invoice_number, notes]
      );

      // 2. Si es crédito, actualizar saldo
      if (type === 'credit') {
        await pool.query(
          `UPDATE credits 
           SET balance = balance - $1 
           WHERE customer_id = $2`,
          [amount, customerId]
        );
      }

      await pool.query('COMMIT'); // Confirmar cambios
      
      res.status(201).json(transaction.rows[0]);

    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ 
        error: 'Error en la transacción',
        details: (error as Error).message 
      });
    }
});

// ===============================
// Endpoint: Obtener Todas las Transacciones de un Cliente
// ===============================
router.get('/:customerId/transactions',
  authenticate,
  authorize(['admin', 'sales', 'cashier']),
  async (req: Request, res: Response) => {
    
    const { customerId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    try {
      const result = await pool.query(
        `SELECT * FROM transactions 
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      );

      res.json({
        total: result.rowCount,
        transactions: result.rows
      });

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
});

// ===============================
// Endpoint: Obtener Transacción Específica
// ===============================
router.get('/:customerId/transactions/:transactionId',
  authenticate,
  authorize(['admin', 'sales', 'cashier']),
  async (req: Request, res: Response) => {
    
    const { customerId, transactionId } = req.params;

    try {
      const result = await pool.query(
        `SELECT * FROM transactions 
         WHERE id = $1 AND customer_id = $2`,
        [transactionId, customerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      res.json(result.rows[0]);

    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
});

// ===============================
// Endpoint: Anular Transacción (Soft Delete)
// ===============================
router.patch('/:customerId/transactions/:transactionId/cancel',
  authenticate,
  authorize(['admin', 'cashier']),
  async (req: Request, res: Response) => {
    
    const { customerId, transactionId } = req.params;

    try {
      await pool.query('BEGIN');

      // 1. Marcar transacción como anulada
      const transaction = await pool.query(
        `UPDATE transactions 
         SET status = 'cancelled'
         WHERE id = $1 AND customer_id = $2
         RETURNING *`,
        [transactionId, customerId]
      );

      // 2. Si era crédito, revertir saldo
      if (transaction.rows[0].type === 'credit') {
        await pool.query(
          `UPDATE credits 
           SET balance = balance + $1 
           WHERE customer_id = $2`,
          [transaction.rows[0].amount, customerId]
        );
      }

      await pool.query('COMMIT');
      res.json(transaction.rows[0]);

    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: (error as Error).message });
    }
});

export default router;