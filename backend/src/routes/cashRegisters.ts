import express, { Request, Response } from 'express';
import pool from '../config/db'; 
import authMiddleware from '../middleware/auth'; 

const router = express.Router();

// Middleware para verificar roles 1, 2 o 3
const restrictToRoles = (req: Request, res: Response, next: Function) => {
    const userRole = (req as any).user?.role_id; // Cambiar de .role a .role_id
    if (![1, 2, 3].includes(userRole)) {
        return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
    }
    next();
};

// Aplicar autenticación y restricción de roles a todas las rutas
router.use(authMiddleware.authenticate); // Ajusta según tu implementación de autenticación
router.use(restrictToRoles);

// Interfaz corregida para CashRegister
interface CashRegister {
    id?: number;
    user_id: number; // Cambiado de opening_user_id
    opening_amount: number; // Cambiado de initial_amount
    closing_amount?: number; // Nullable o con valor por defecto
    opening_date: string;
    closing_date?: string;
    notes?: string; // Cambiado de observations
    status: 'abierta' | 'cerrada' | 'pendiente';
}

// Interfaz para AuditCashRegister
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
    const { opening_amount, notes } = req.body; // Ajustado a los nombres de la tabla
    const userId = (req as any).user.id; // ID del usuario autenticado

    if (opening_amount === undefined || opening_amount < 0) {
        return res.status(400).json({ error: 'Monto inicial inválido' });
    }

    try {
        await pool.query('BEGIN');

        // Verificar si ya hay una caja abierta o pendiente
        const existing = await pool.query(
            `SELECT id FROM cash_registers WHERE status IN ('abierta', 'pendiente') LIMIT 1`
        );
        if (existing.rows.length > 0) {
            throw new Error('Ya existe una caja abierta o pendiente');
        }

        // Insertar nueva caja
        const cashResult = await pool.query(
            `INSERT INTO cash_registers (opening_amount, status, user_id, notes, closing_amount)
             VALUES ($1, 'abierta', $2, $3, $4) RETURNING *`,
            [opening_amount, userId, notes || null, 0.00] // closing_amount con valor por defecto
        );
        const newCashRegister: CashRegister = cashResult.rows[0];

        // Registrar en auditoría
        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, details)
             VALUES ($1, 'apertura', $2, $3)`,
            [newCashRegister.id, userId, `Caja abierta con monto inicial: ${opening_amount}`]
        );

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Caja abierta exitosamente', cashRegister: newCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

// Cierre normal de caja
router.put('/close', async (req: Request, res: Response) => {
    const { closing_amount, notes } = req.body; // Cambiado de final_amount a closing_amount y observations a notes
    const userId = (req as any).user.id;

    if (closing_amount === undefined || closing_amount < 0) {
        return res.status(400).json({ error: 'Monto final inválido' });
    }

    try {
        await pool.query('BEGIN');

        // Buscar caja abierta y actualizarla
        const cashResult = await pool.query(
            `UPDATE cash_registers
             SET status = 'cerrada', 
                 closing_amount = $1, 
                 closing_date = CURRENT_TIMESTAMP,
                 user_id = $2,  -- Asumiendo que user_id se actualiza al cerrar
                 notes = COALESCE($3, notes)
             WHERE status = 'abierta'
             RETURNING *`,
            [closing_amount, userId, notes || null]
        );
        if (cashResult.rows.length === 0) {
            throw new Error('No hay caja abierta para cerrar');
        }
        const closedCashRegister: CashRegister = cashResult.rows[0];

        // Registrar en auditoría
        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, details)
             VALUES ($1, 'cierre_normal', $2, $3)`,
            [closedCashRegister.id, userId, `Caja cerrada con monto final: ${closing_amount}`]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja cerrada exitosamente', cashRegister: closedCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

// Cierre inesperado (simulado)
router.put('/unexpected-close', async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        await pool.query('BEGIN');

        // Actualizar caja abierta a pendiente
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

        // Registrar en auditoría
        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, details)
             VALUES ($1, 'cierre_pendiente', $2, $3)`,
            [pendingCashRegister.id, userId, 'Cierre inesperado detectado']
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja marcada como pendiente', cashRegister: pendingCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

// Verificación al reinicio del sistema
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
        res.status(500).json({ error: (error as Error).message });
    }
});

// Auditoría y cierre de caja pendiente
router.put('/audit-and-close', async (req: Request, res: Response) => {
    const { closing_amount, notes } = req.body; // Cambiado de final_amount a closing_amount y observations a notes
    const userId = (req as any).user.id;

    if (closing_amount === undefined || closing_amount < 0) {
        return res.status(400).json({ error: 'Monto final inválido' });
    }

    try {
        await pool.query('BEGIN');

        // Buscar caja pendiente
        const cashResult = await pool.query(
            `UPDATE cash_registers
             SET status = 'cerrada', 
                 closing_amount = $1, 
                 closing_date = CURRENT_TIMESTAMP,
                 user_id = $2,  -- Cambiado de closing_user_id a user_id
                 notes = COALESCE($3, notes)
             WHERE status = 'pendiente'
             RETURNING *`,
            [closing_amount, userId, notes || null]
        );
        if (cashResult.rows.length === 0) {
            throw new Error('No hay caja pendiente para auditar y cerrar');
        }
        const closedCashRegister: CashRegister = cashResult.rows[0];

        // Registrar en auditoría
        await pool.query(
            `INSERT INTO audit_cash_registers (cash_register_id, action, user_id, details)
             VALUES ($1, 'auditoria', $2, $3)`,
            [closedCashRegister.id, userId, `Caja pendiente cerrada tras auditoría. Monto final: ${closing_amount}`]
        );

        await pool.query('COMMIT');
        res.json({ message: 'Caja pendiente cerrada tras auditoría', cashRegister: closedCashRegister });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;