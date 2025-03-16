import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// Endpoint: Crear Transacción
router.post('/:customerId/transactions',  
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { amount, type, invoice_number, notes } = req.body;
    const userId = req.user!.id; // Cambiamos userId por id

    if (!['cash', 'credit'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de transacción inválido' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    try {
      await pool.query('BEGIN');
      const transaction = await pool.query(
        `INSERT INTO transactions 
         (customer_id, user_id, amount, type, invoice_number, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [customerId, userId, amount, type, invoice_number, notes]
      );

      if (type === 'credit') {
        await pool.query(
          `UPDATE credits 
           SET balance = balance - $1 
           WHERE customer_id = $2`,
          [amount, customerId]
        );
      }

      await pool.query('COMMIT');
      res.status(201).json(transaction.rows[0]);
    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ 
        error: 'Error en la transacción',
        details: (error as Error).message 
      });
    }
});

// Resto de los endpoints sin cambios
router.get('/:customerId/transactions', async (req: Request, res: Response) => {
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
    res.json({ total: result.rowCount, transactions: result.rows });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:customerId/transactions/:transactionId', async (req: Request, res: Response) => {
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

router.patch('/:customerId/transactions/:transactionId/cancel', async (req: Request, res: Response) => {
  const { customerId, transactionId } = req.params;
  try {
    await pool.query('BEGIN');
    const transaction = await pool.query(
      `UPDATE transactions 
       SET status = 'cancelled'
       WHERE id = $1 AND customer_id = $2
       RETURNING *`,
      [transactionId, customerId]
    );
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