import pool from '../config/db';
import { Router } from 'express';
// import { CreditService } from '../services/creditService';

interface Credit {
  id?: number;
  customer_id: number;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SupplierDebt {
  id?: number;
  supplier_id: number;
  total_amount: number;
  remaining_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

interface DebtPayment {
  id?: number;
  debt_id: number;
  amount: number;
  created_at?: Date;
}

interface Consignment {
  id?: number;
  supplier_id: number;
  start_date: string;
  end_date: string;
  total_value: number;
  sold_value: number;
  status: 'active' | 'completed' | 'canceled';
  created_at?: Date;
  updated_at?: Date;
}

interface ConsignmentItem {
  id?: number;
  consignment_id: number;
  product_id: number;
  quantity_delivered: number;
  quantity_sold: number;
  price_at_time: number;
  created_at?: Date;
}

const router = Router();

router.get('/customers/:customerId', (req, res) => {
  CreditService.getCustomerBalance(parseInt(req.params.customerId))
    .then(balance => res.json({ balance }))
    .catch(err => res.status(400).json({ error: err.message }));
});

router.post('/deduct', (req, res) => {
  CreditService.deductCustomerBalance(req.body.customerId, req.body.amount)
    .then(() => res.sendStatus(204))
    .catch(err => res.status(400).json({ error: err.message }));
});

export class CreditService {
  
  // Obtener saldo de un cliente
  static async getCustomerBalance(customerId: number): Promise<number> {
    const result = await pool.query('SELECT balance FROM credits WHERE customer_id = $1', [customerId]);
    if (result.rows.length === 0) {
      throw new Error('Customer has no credits record');
    }
    return result.rows[0].balance;
  }

  // Descontar saldo de un cliente
  static async deductCustomerBalance(customerId: number, amount: number): Promise<void> {
    const credit = await pool.query('SELECT balance FROM credits WHERE customer_id = $1', [customerId]);
    if (credit.rows.length === 0 || credit.rows[0].balance < amount) {
      throw new Error('Insufficient credits to complete purchase');
    }
    await pool.query('UPDATE credits SET balance = balance - $1 WHERE customer_id = $2', [amount, customerId]);
  }

  // Crear una deuda con un supplier
  static async createSupplierDebt(supplierId: number, totalAmount: number): Promise<SupplierDebt> {
    const result = await pool.query(
      `INSERT INTO supplier_debts (supplier_id, total_amount, remaining_amount)
       VALUES ($1, $2, $2) RETURNING *`,
      [supplierId, totalAmount]
    );
    return result.rows[0];
  }

  // Realizar un pago parcial de una deuda
  static async makeDebtPayment(debtId: number, amount: number): Promise<DebtPayment> {
    const debt = await pool.query('SELECT remaining_amount FROM supplier_debts WHERE id = $1', [debtId]);
    if (debt.rows.length === 0) {
      throw new Error('Debt not found');
    }

    const remainingAmount = debt.rows[0].remaining_amount;
    if (amount <= 0 || amount > remainingAmount) {
      throw new Error('Invalid payment amount');
    }

    const paymentResult = await pool.query(
      `INSERT INTO debt_payments (debt_id, amount) VALUES ($1, $2) RETURNING *`,
      [debtId, amount]
    );

    await pool.query(
      `UPDATE supplier_debts SET remaining_amount = remaining_amount - $1 WHERE id = $2`,
      [amount, debtId]
    );

    return paymentResult.rows[0];
  }

  // Crear una consignación
  static async createConsignment(
    supplierId: number,
    startDate: string,
    endDate: string,
    items: { product_id: number; quantity: number; price_at_time: number }[]
  ): Promise<Consignment> {
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price_at_time), 0);
    const consignmentResult = await pool.query(
      `INSERT INTO consignments (supplier_id, start_date, end_date, total_value, sold_value, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [supplierId, startDate, endDate, totalValue, 0.00, 'active']
    );

    const consignmentId = consignmentResult.rows[0].id;
    for (const item of items) {
      await pool.query(
        `INSERT INTO consignment_items (consignment_id, product_id, quantity_delivered, quantity_sold, price_at_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [consignmentId, item.product_id, item.quantity, 0, item.price_at_time]
      );
    }

    return consignmentResult.rows[0];
  }

  // Actualizar ventas de una consignación (cuando se vende un producto)
  static async updateConsignmentSale(
    consignmentId: number,
    productId: number,
    quantitySold: number
  ): Promise<void> {
    const item = await pool.query(
      `SELECT quantity_delivered, quantity_sold, price_at_time
       FROM consignment_items WHERE consignment_id = $1 AND product_id = $2`,
      [consignmentId, productId]
    );
    if (item.rows.length === 0) {
      throw new Error('Consignment item not found');
    }

    const { quantity_delivered, quantity_sold, price_at_time } = item.rows[0];
    const newQuantitySold = quantity_sold + quantitySold;
    if (newQuantitySold > quantity_delivered) {
      throw new Error('Cannot sell more than delivered quantity');
    }

    await pool.query(
      `UPDATE consignment_items SET quantity_sold = $1 WHERE consignment_id = $2 AND product_id = $3`,
      [newQuantitySold, consignmentId, productId]
    );

    const soldValue = quantitySold * price_at_time;
    await pool.query(
      `UPDATE consignments SET sold_value = sold_value + $1 WHERE id = $2`,
      [soldValue, consignmentId]
    );
  }

  // Finalizar una consignación
  static async finalizeConsignment(consignmentId: number): Promise<Consignment> {
    const result = await pool.query(
      `UPDATE consignments SET status = 'completed' WHERE id = $1 RETURNING *`,
      [consignmentId]
    );
    if (result.rows.length === 0) {
      throw new Error('Consignment not found');
    }
    return result.rows[0];
  }
}

export default router;