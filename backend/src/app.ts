import express, {Express} from 'express'
import prisma, {connectDB, disconnectDB} from './config/prisma';
import {errorHandler} from './middlewares/errorHandler'
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

// import roleRoutes from './routes/roleRoutes';
// import permissionRoutes from './routes/permissionRoutes';
// import rolePermissionRoutes from './routes/rolePermissionRoutes';
// import userRoutes from './routes/userRoutes';
// import businessRoutes from './routes/businessRoutes';
// import employeeRoutes from './routes/employeeRoutes'
// import categoryRoutes from './routes/categoryRoutes';
// import productRoutes from './routes/productRoutes';
// import businessProductRoutes from './routes/businessProductRoutes';
// import supplierRoutes from './routes/supplierRoutes';
// import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
// import purchaseOrderItemRoutes from './routes/purchaseOrderItemRoutes';
// import customerRoutes from './routes/customerRoutes';
// import cartRoutes from './routes/cartRoutes';
// import cartItemRoutes from './routes/cartItemRoutes';
// import supplierDebtRoutes from './routes/supplierDebtRoutes';
// import cashRegisterRoutes from './routes/cashRegisterRoutes';
// import auditCashRegisterRoutes from './routes/auditCashRegisterRoutes';
// import auditLogRoutes from './routes/auditLogRoutes';
// import authRoutes from './routes/authRoutes';
// import saleRoutes from './routes/saleRoutes';
// import saleItemRoutes from './routes/saleItemRoutes';
// import inventoryRoutes from './routes/inventoryRoutes';
// import posRoutes from './routes/posRoutes';

const app: Express = express()
app.use(express.json())
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

// Ruta básica de health check
app.get('/', (req, res) => {
  res.json({
    message: 'Super Tienda Web API',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Configurar Swagger UI para la documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .auth-wrapper {
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 10px;
      margin: 10px 0;
      background-color: #f8f9fa;
    }
    .swagger-ui .btn.authorize {
      background-color: #4CAF50;
      border-color: #4CAF50;
      color: white;
      font-weight: bold;
      font-size: 16px;
      padding: 10px 20px;
    }
    .swagger-ui .btn.authorize:hover {
      background-color: #45a049;
    }
  `,
  customSiteTitle: 'Super Tienda Web API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: -1,
    docExpansion: 'list'
  }
}));


// Registrar rutas TSOA auto-generadas
RegisterRoutes(app);

// app.use('/api', roleRoutes);
// app.use('/api', permissionRoutes);
// app.use('/api', rolePermissionRoutes);
// app.use('/api', userRoutes);
// app.use('/api', businessRoutes);
// app.use('/api', employeeRoutes)
// app.use('/api', categoryRoutes);
// app.use('/api', productRoutes);
// app.use('/api', businessProductRoutes);
// app.use('/api', supplierRoutes);
// app.use('/api', purchaseOrderRoutes);
// app.use('/api', purchaseOrderItemRoutes);
// app.use('/api', customerRoutes);
// app.use('/api', cartRoutes);
// app.use('/api', cartItemRoutes);
// app.use('/api', supplierDebtRoutes);
// app.use('/api', cashRegisterRoutes);
// app.use('/api', auditCashRegisterRoutes);
// app.use('/api', auditLogRoutes);
// app.use('/api', authRoutes);
// app.use('/api', saleRoutes);
// app.use('/api', saleItemRoutes);
// app.use('/api', inventoryRoutes);
// app.use('/api/pos', posRoutes);

app.use(errorHandler as unknown as express.ErrorRequestHandler)

const shutdown = async () => {
  console.log('🛑 Shutting down server...');
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app
