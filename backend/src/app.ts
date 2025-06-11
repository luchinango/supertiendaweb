import express, {Express} from 'express'
import prisma, {connectDB, disconnectDB} from './config/prisma';
import {errorHandler} from './middlewares/errorHandler'
import {swaggerSpec} from './config/swagger';

import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import rolePermissionRoutes from './routes/rolePermissionRoutes';
import userRoutes from './routes/userRoutes';
import businessRoutes from './routes/businessRoutes';
import employeeRoutes from './routes/employeeRoutes'
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import businessProductRoutes from './routes/businessProductRoutes';
import supplierRoutes from './routes/supplierRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import purchaseOrderItemRoutes from './routes/purchaseOrderItemRoutes';
import customerRoutes from './routes/customerRoutes';
import cartRoutes from './routes/cartRoutes';
import cartItemRoutes from './routes/cartItemRoutes';
import supplierDebtRoutes from './routes/supplierDebtRoutes';
import cashRegisterRoutes from './routes/cashRegisterRoutes';
import auditCashRegisterRoutes from './routes/auditCashRegisterRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import authRoutes from './routes/authRoutes';
import saleRoutes from './routes/saleRoutes';
import saleItemRoutes from './routes/saleItemRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import posRoutes from './routes/posRoutes';

/*
import salesControlRouter from './routes/salesControl';
import perishablesRouter from './routes/perishables';
import reportRoutes from './routes/reports';
import alarmRoutes from './routes/alarms';
import inventoryReportRoutes from './routes/inventoryReports';
import movimientosRouter from './routes/movimientosRouter';
*/

const app: Express = express()
app.use(express.json())
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use('/api', roleRoutes);
app.use('/api', permissionRoutes);
app.use('/api', rolePermissionRoutes);
app.use('/api', userRoutes);
app.use('/api', businessRoutes);
app.use('/api', employeeRoutes)
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', businessProductRoutes);
app.use('/api', supplierRoutes);
app.use('/api', purchaseOrderRoutes);
app.use('/api', purchaseOrderItemRoutes);
app.use('/api', customerRoutes);
app.use('/api', cartRoutes);
app.use('/api', cartItemRoutes);
app.use('/api', supplierDebtRoutes);
app.use('/api', cashRegisterRoutes);
app.use('/api', auditCashRegisterRoutes);
app.use('/api', auditLogRoutes);
app.use('/api', authRoutes);
app.use('/api', saleRoutes);
app.use('/api', saleItemRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/pos', posRoutes);

/*
app.use('/api/sales-control', salesControlRouter);
app.use('/api/perishables', perishablesRouter);
app.use('/api/reports', reportRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/inventory-report', inventoryReportRoutes);
app.use('/api/movimientos', movimientosRouter); // Para /api/movimientos/:movimientoId
*/


app.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(errorHandler as express.ErrorRequestHandler)

const shutdown = async () => {
  console.log('🛑 Shutting down server...');
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app
