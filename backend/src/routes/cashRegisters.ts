import express, { Request, Response } from 'express';
import pool from '../config/db'; 

const router = express.Router();

// Middleware de autenticación y autorización eliminado
// router.use(authenticate); // Eliminado
// Middleware para restringir a roles 1, 2 o 3 también eliminado/comentado
/*
const restrictToRoles = (req: Request, res: Response, next: Function) => {
    const userRole = (req as any).user?.role_id;
    if (!userRole || ![1, 2, 3].includes(userRole)) {
        return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
    }
    next();
};
router.use(restrictToRoles);
*/

interface CashRegister {
    id?: number;
    user_id: number;
    opening_amount: number;
    closing_amount?: number;
    opening_date: string;
    closing_date?: string;
    notes?: string;
    status: 'abierta' | 'cerrada' | 'pendiente';
}

interface AuditCashRegister {
    id?: number;
    cash_register_id: number;
    action: string;
    action_date: string;
    user_id: number;
    details?: string;
}

// Apertura de caja
router.post('/open', async (req: Request, res: Response) => {
    const { opening_amount, notes } = req.body;
    const userId = 1; // Valor predeterminado para pruebas sin autenticación

    if (typeof opening_amount !== 'number' || opening_amount < 0) {
        return res.status(400).json({ error: 'El monto inicial debe ser un número no negativo' });
    }

    try {
        await pool.query('BEGIN');

        const existing = await pool.query(
            `SELECT id FROM cash_registers WHERE status IN ('abierta', 'pendiente') LIMIT 1`
        );
        if (existing.rows.length > 0) {
            throw new Error('Ya existe una caja abierta o pendiente');
        }

        const cashResult = await pool.query(
            `INSERT INTO cash_registers (user_id, opening_amount, status, opening_date, notes, closing_amount)
             VALUES ($1, $2, 'abierta', CURRENT_TIMESTAMP, $3, $4) RETURNING *`,
            [userId, opening_amount, notes || null, 0.00]
        );
        const newCashRegister: CashRegister = cashResult.rows[0];

        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, action_date, details)
             VALUES ($1, 'apertura', $2, CURRENT_TIMESTAMP, $3)`,
            [newCashRegister.id, userId, `Caja abierta con monto inicial: ${opening_amount}`]
        );

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Caja abierta exitosamente', cashRegister: newCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al abrir caja:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

// Cierre normal de caja
router.put('/close', async (req: Request, res: Response) => {
    const { closing_amount, notes } = req.body;
    const userId = 1; // Valor predeterminado para pruebas sin autenticación

    if (typeof closing_amount !== 'number' || closing_amount < 0) {
        return res.status(400).json({ error: 'El monto final debe ser un número no negativo' });
    }

    try {
        await pool.query('BEGIN');

        const cashResult = await pool.query(
            `UPDATE cash_registers
             SET status = 'cerrada', 
                 closing_amount = $1, 
                 closing_date = CURRENT_TIMESTAMP,
                 user_id = $2,  -- Nota: Esto sobrescribe el user_id original
                 notes = COALESCE($3, notes)
             WHERE status = 'abierta'
             RETURNING *`,
            [closing_amount, userId, notes || null]
        );
        if (cashResult.rows.length === 0) {
            throw new Error('No hay caja abierta para cerrar');
        }
        const closedCashRegister: CashRegister = cashResult.rows[0];

        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, action_date, details)
             VALUES ($1, 'cierre_normal', $2, CURRENT_TIMESTAMP, $3)`,
            [closedCashRegister.id, userId, `Caja cerrada con monto final: ${closing_amount}`]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja cerrada exitosamente', cashRegister: closedCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al cerrar caja:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

// Cierre inesperado
router.put('/unexpected-close', async (req: Request, res: Response) => {
    const userId = 1; // Valor predeterminado para pruebas sin autenticación

    try {
        await pool.query('BEGIN');

        const cashResult = await pool.query(
            `UPDATE cash_registers
             SET status = 'pendiente', 
                 notes = COALESCE(notes, '') || ' - Cierre inesperado'
             WHERE status = 'abierta'
             RETURNING *`
        );
        if (cashResult.rows.length === 0) {
            throw new Error('No hay caja abierta para marcar como pendiente');
        }
        const pendingCashRegister: CashRegister = cashResult.rows[0];

        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, action_date, details)
             VALUES ($1, 'cierre_pendiente', $2, CURRENT_TIMESTAMP, $3)`,
            [pendingCashRegister.id, userId, 'Cierre inesperado detectado']
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja marcada como pendiente', cashRegister: pendingCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al marcar cierre inesperado:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

// Verificación de estado
router.get('/check-status', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM cash_registers WHERE status IN ('abierta', 'pendiente') LIMIT 1`
        );
        const cashRegister: CashRegister | undefined = result.rows[0];

        if (cashRegister) {
            res.json({
                message: cashRegister.status === 'abierta'
                    ? 'Caja abierta detectada. Continúa operando normalmente.'
                    : 'Caja pendiente detectada. Realiza auditoría y ciérrala antes de continuar.',
                cashRegister
            });
        } else {
            res.json({ message: 'No hay cajas abiertas o pendientes. Puedes abrir una nueva.' });
        }
    } catch (error) {
        console.error('Error al verificar estado:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Auditoría y cierre de caja pendiente
router.put('/audit-and-close', async (req: Request, res: Response) => {
    const { closing_amount, notes } = req.body;
    const userId = 1; // Valor predeterminado para pruebas sin autenticación

    if (typeof closing_amount !== 'number' || closing_amount < 0) {
        return res.status(400).json({ error: 'El monto final debe ser un número no negativo' });
    }

    try {
        await pool.query('BEGIN');

        const cashResult = await pool.query(
            `UPDATE cash_registers
             SET status = 'cerrada', 
                 closing_amount = $1, 
                 closing_date = CURRENT_TIMESTAMP,
                 user_id = $2,  -- Nota: Esto sobrescribe el user_id original
                 notes = COALESCE($3, notes)
             WHERE status = 'pendiente'
             RETURNING *`,
            [closing_amount, userId, notes || null]
        );
        if (cashResult.rows.length === 0) {
            throw new Error('No hay caja pendiente para auditar y cerrar');
        }
        const closedCashRegister: CashRegister = cashResult.rows[0];

        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, action_date, details)
             VALUES ($1, 'auditoria', $2, CURRENT_TIMESTAMP, $3)`,
            [closedCashRegister.id, userId, `Caja pendiente cerrada tras auditoría. Monto final: ${closing_amount}`]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja pendiente cerrada tras auditoría', cashRegister: closedCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al auditar y cerrar caja:', error);
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;