// src/routes/movimientosRouter.ts
import { Router, Request, Response } from 'express';
import cashRegisterService from '../services/cashRegisterService';
import transactionService from '../services/transactionService';
import reportService from '../services/reportService';

// Crear el router
const movimientosRouter = Router();

// 1. Abrir una caja
movimientosRouter.post('/cash-register/open', async (req: Request, res: Response) => {
  try {
    const { initialBalance, userId } = req.body;
    if (!userId || initialBalance === undefined) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos: initialBalance y userId son requeridos' });
    }
    const result = await cashRegisterService.openCashRegister(initialBalance, userId);
    res.status(201).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al abrir la caja', error: error.message });
  }
});

// 2. Cerrar una caja
movimientosRouter.post('/cash-register/close/:cashRegisterId', async (req: Request, res: Response) => {
  try {
    const { cashRegisterId } = req.params;
    const result = await cashRegisterService.closeCashRegister(parseInt(cashRegisterId));
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al cerrar la caja', error: error.message });
  }
});

// 3. Registrar una nueva venta
movimientosRouter.post('/transactions/sale', async (req: Request, res: Response) => {
  try {
    const { cashRegisterId, concept, amount, paymentMethod, customerId, products, date, userId } = req.body;
    if (!cashRegisterId || !concept || !amount || !paymentMethod || !customerId || !userId) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos requeridos' });
    }
    const result = await transactionService.createSale({ ...req.body, cashRegisterId: parseInt(cashRegisterId) });
    res.status(201).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al registrar la venta', error: error.message });
  }
});

// 4. Registrar un nuevo gasto
movimientosRouter.post('/transactions/expense', async (req: Request, res: Response) => {
  try {
    const { cashRegisterId, concept, amount, paymentMethod, supplierId, date, userId } = req.body;
    if (!cashRegisterId || !concept || !amount || !paymentMethod || !userId) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos requeridos' });
    }
    const result = await transactionService.createExpense({ ...req.body, cashRegisterId: parseInt(cashRegisterId) });
    res.status(201).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al registrar el gasto', error: error.message });
  }
});

// 5. Obtener resumen (balance, ventas, gastos, beneficios)
movimientosRouter.get('/cash-register/:cashRegisterId/summary', async (req: Request, res: Response) => {
  try {
    const { cashRegisterId } = req.params;
    const summary = await cashRegisterService.getSummary(parseInt(cashRegisterId));
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al obtener el resumen', error: error.message });
  }
});

// 6. Obtener transacciones filtradas
movimientosRouter.get('/reports/transactions', async (req: Request, res: Response) => {
  try {
    const { period, startDate, endDate, concept, type, cashRegisterId } = req.query;
    const filters = { period, startDate, endDate, concept, type, cashRegisterId: cashRegisterId ? parseInt(cashRegisterId as string) : undefined };
    const transactions = await transactionService.getTransactions(filters);
    res.status(200).json({ status: 'success', data: transactions });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al obtener las transacciones', error: error.message });
  }
});

// 7. Obtener informe general de cierres de caja
movimientosRouter.get('/reports/closings', async (req: Request, res: Response) => {
  try {
    const closings = await reportService.getClosings();
    res.status(200).json({ status: 'success', data: closings });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al obtener los cierres de caja', error: error.message });
  }
});

// 8. Descargar reporte
movimientosRouter.get('/reports/download', async (req: Request, res: Response) => {
  try {
    const { type, format, period, startDate, endDate, cashRegisterId } = req.query;
    if (!type || !format) {
      return res.status(400).json({ status: 'error', message: 'Faltan parámetros: type y format son requeridos' });
    }
    const filters = { type, period, startDate, endDate, cashRegisterId: cashRegisterId ? parseInt(cashRegisterId as string) : undefined };
    const result = await reportService.downloadReport(filters, format as string);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Error al descargar el reporte', error: error.message });
  }
});

export default movimientosRouter;