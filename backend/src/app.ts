import express, {Express} from 'express'
import prisma, {connectDB, disconnectDB} from './config/prisma';
import {errorHandler} from './middlewares/errorHandler'
import {swaggerSpec} from './config/swagger';

import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import rolePermissionRoutes from './routes/rolePermission.routes';
import userRoutes from './routes/user.routes';
import businessRoutes from './routes/business.routes';
import employeeRoutes from './routes/employee.routes'
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import businessProductRoutes from './routes/businessProduct.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseOrderRoutes from './routes/purchaseOrder.routes';
import purchaseOrderItemRoutes from './routes/purchaseOrderItem.routes';
import customerRoutes from './routes/customer.routes';
import cartRoutes from './routes/cart.routes';
import cartItemRoutes from './routes/cartItem.routes';
import supplierDebtRoutes from './routes/supplierDebt.routes';
import cashRegisterRoutes from './routes/cashRegister.routes';
import auditCashRegisterRoutes from './routes/auditCashRegister.routes';
import auditLogRoutes from './routes/auditLog.routes';
import authRoutes from './routes/auth.routes';
import saleRoutes from './routes/sale.routes';
import saleItemRoutes from './routes/saleItem.routes';
import inventoryRoutes from './routes/inventory.routes';

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
