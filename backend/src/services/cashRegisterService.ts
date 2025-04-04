// src/services/cashRegisterService.ts
import pool from '../config/db';

interface CashRegister {
  id: number;
  user_id: number;
  opening_amount: number;
  closing_amount: number;
  opening_date: string;
  closing_date?: string;
  notes?: string;
  status: 'abierta' | 'cerrada' | 'pendiente';
}

const cashRegisterService = {
  // Abrir una nueva caja
  openCashRegister: async (initialBalance: number, userId: number): Promise<{ cashRegisterId: number; message: string }> => {
    const query = `
      INSERT INTO cash_registers (user_id, opening_amount, closing_amount, opening_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [userId, initialBalance, 0, new Date().toISOString(), 'abierta'];
    const result = await pool.query(query, values);
    const cashRegisterId = result.rows[0].id;
    return { cashRegisterId, message: 'Caja abierta exitosamente' };
  },

  // Cerrar una caja
  closeCashRegister: async (cashRegisterId: number): Promise<any> => {
    // Verificar si la caja existe y no está cerrada
    const checkQuery = `SELECT * FROM cash_registers WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [cashRegisterId]);
    const cashRegister = checkResult.rows[0];
    if (!cashRegister) {
      throw new Error('Caja no encontrada');
    }
    if (cashRegister.status === 'cerrada') {
      throw new Error('La caja ya está cerrada');
    }

    // Calcular el balance final (suma de transacciones)
    const transactionsQuery = `
      SELECT 
        SUM(CASE WHEN t.customer_id IS NOT NULL THEN t.amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN t.customer_id IS NULL THEN t.amount ELSE 0 END) as total_expenses
      FROM transactions t
      WHERE t.created_at >= $1 AND (t.created_at <= $2 OR $2 IS NULL)
    `;
    const transactionsResult = await pool.query(transactionsQuery, [cashRegister.opening_date, cashRegister.closing_date]);
    const totalSales = parseFloat(transactionsResult.rows[0].total_sales) || 0;
    const totalExpenses = parseFloat(transactionsResult.rows[0].total_expenses) || 0;
    const closingAmount = cashRegister.opening_amount + totalSales - totalExpenses;

    // Cerrar la caja
    const updateQuery = `
      UPDATE cash_registers
      SET status = $1, closing_date = $2, closing_amount = $3
      WHERE id = $4
      RETURNING *
    `;
    const closedAt = new Date().toISOString();
    const updateResult = await pool.query(updateQuery, ['cerrada', closedAt, closingAmount, cashRegisterId]);
    const updatedCashRegister = updateResult.rows[0];

    const balance = updatedCashRegister.closing_amount;
    return {
      cashRegisterId,
      closedAt,
      summary: {
        totalSales,
        totalExpenses,
        balance,
      },
    };
  },

  // Obtener resumen de la caja
  getSummary: async (cashRegisterId: number): Promise<any> => {
    // Obtener la caja
    const query = `SELECT * FROM cash_registers WHERE id = $1`;
    const result = await pool.query(query, [cashRegisterId]);
    const cashRegister = result.rows[0];
    if (!cashRegister) {
      throw new Error('Caja no encontrada');
    }

    // Calcular total_sales y total_expenses desde las transacciones
    const transactionsQuery = `
      SELECT 
        SUM(CASE WHEN t.customer_id IS NOT NULL THEN t.amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN t.customer_id IS NULL THEN t.amount ELSE 0 END) as total_expenses
      FROM transactions t
      WHERE t.created_at >= $1 AND (t.created_at <= $2 OR $2 IS NULL)
    `;
    const transactionsResult = await pool.query(transactionsQuery, [cashRegister.opening_date, cashRegister.closing_date]);
    const totalSales = parseFloat(transactionsResult.rows[0].total_sales) || 0;
    const totalExpenses = parseFloat(transactionsResult.rows[0].total_expenses) || 0;

    // Calcular balance y beneficios
    const balance = parseFloat(cashRegister.opening_amount) + totalSales - totalExpenses;
    const profits = totalSales - totalExpenses;
    const profitPercentage = totalSales > 0 ? (profits / totalSales) * 100 : 0;

    return {
      balance,
      totalSales,
      totalExpenses,
      profits: {
        amount: profits,
        percentage: profitPercentage,
      },
    };
  },

  // Actualizar los totales de la caja (no necesario, ya que lo calculamos dinámicamente)
  updateTotals: async (cashRegisterId: number, saleAmount: number = 0, expenseAmount: number = 0): Promise<void> => {
    // No necesitamos este método, ya que total_sales y total_expenses se calculan dinámicamente
  },

  // Obtener todas las cajas (para reportes)
  getAllCashRegisters: async (): Promise<any[]> => {
    const query = `SELECT * FROM cash_registers`;
    const result = await pool.query(query);
    return result.rows;
  },
};

export default cashRegisterService;