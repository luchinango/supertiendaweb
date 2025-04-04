// src/services/reportService.ts
import cashRegisterService from './cashRegisterService';
import transactionService from './transactionService';
import pool from '../config/db';

// Interfaces (mantenemos las que ya tienes)
interface GeneralReportResponse {
  totalSales: number;
  productsSold: number;
  activeCustomers: number;
  totalInventory: number;
}

interface BalanceResponse {
  balance: number;
}

interface ExpensesResponse {
  totalExpenses: number;
}

interface SalesResponse {
  total_sales: number;
}

interface TransactionResponse {
  id: number;
  customer_id: number;
  user_id: number;
  amount: number;
  type: string;
  created_at: string;
  [key: string]: any; // Para campos adicionales como reference
}

interface CreditResponse {
  id: number;
  first_name: string;
  last_name: string;
  balance: number;
}

interface PayableCreditResponse {
  id: number;
  company_name: string;
  remaining_amount: number;
}

interface CashRegisterResponse {
  id: number;
  user_id: number;
  opening_amount: number;
  closing_amount?: number;
  opening_date: string;
  closing_date?: string;
  notes?: string;
  status: 'abierta' | 'cerrada' | 'pendiente';
}

interface BestSellingProductResponse {
  product_id: number;
  product_name: string;
  supplier_id?: number;
  supplier_name?: string;
  total_quantity_sold: number;
}

interface FrequentCustomerResponse {
  customer_id: number;
  first_name: string;
  last_name: string;
  transaction_count: number;
}

interface ErrorResponse {
  error: string;
  message: string;
}

type ApiResponse<T> = T | ErrorResponse;

// Funciones de reportService (eliminamos axios y usamos la lógica directa)
class ReportService {
  async getClosings(): Promise<any[]> {
    const cashRegisters = await cashRegisterService.getAllCashRegisters();
    const closings = [];
    for (const cr of cashRegisters) {
      if (cr.status !== 'cerrada') continue;

      const transactionsQuery = `
        SELECT 
          SUM(CASE WHEN t.customer_id IS NOT NULL THEN t.amount ELSE 0 END) as total_sales,
          SUM(CASE WHEN t.customer_id IS NULL THEN t.amount ELSE 0 END) as total_expenses
        FROM transactions t
        WHERE t.created_at >= $1 AND (t.created_at <= $2 OR $2 IS NULL)
      `;
      const transactionsResult = await pool.query(transactionsQuery, [cr.opening_date, cr.closing_date]);
      const totalSales = parseFloat(transactionsResult.rows[0].total_sales) || 0;
      const totalExpenses = parseFloat(transactionsResult.rows[0].total_expenses) || 0;

      closings.push({
        cashRegisterId: cr.id,
        openedAt: cr.opening_date,
        closedAt: cr.closing_date,
        summary: {
          totalSales,
          totalExpenses,
          balance: parseFloat(cr.closing_amount),
        },
      });
    }
    return closings;
  }

  async downloadReport(filters: any, format: string): Promise<any> {
    const transactions = await transactionService.getTransactions(filters);
    return { message: `Reporte generado en formato ${format}`, data: transactions };
  }
}

export default new ReportService();