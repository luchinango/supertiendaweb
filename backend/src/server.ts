import express, { Request, Response, NextFunction, Application} from 'express';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import { generateToken, requireAdmin } from './middleware/auth';
import { User as UserModel } from './models/user';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./swagger";
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';

// Cargar variables de entorno desde .env
dotenv.config();

import userRoutes from './routes/user';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import productRoutes from './routes/products';
import salesControlRouter from './routes/salesControl';
import cartRoutes from './routes/cart';
import purchaseOrderRoutes from './routes/purchaseOrders';
import transactionsRouter from './routes/transactions';
import mermasRouter from './routes/mermas';
import creditRoutes from './services/creditService';
import kardexRouter from './routes/kardex';
import perishablesRouter from './routes/perishables';
import reportRoutes from './routes/reports';
import alarmRoutes from './routes/alarms';
import categoriesRouter from './routes/categories';
import cashRegistersRouter from './routes/cashRegisters';
import businessRoutes from './routes/business';
import inventoryReportRoutes from './routes/inventoryReports';
import movimientosRouter from './routes/movimientosRouter';

// Definición de la interfaz User
export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  password: string;
  first_name: string;
  last_name: string;
}

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // Cambia esto en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Si usas autenticación con cookies o JWT
}));

app.use(express.json());

/* // Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); */

// Ruta raíz para verificar el estado del servidor
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend funcionando', timestamp: new Date() });
});

// Ejemplo de ruta protegida
app.get('/api/admin', requireAdmin, (req, res) => {
  res.json({ message: 'Acceso para admin concedido' });
});

// Cargar el archivo YAML
// const swaggerDocument = yaml.load(readFileSync('./docs/openapi.yaml', 'utf8')) as swaggerUi.JsonObject;

// Configurar Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Registro de rutas
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customers', transactionsRouter); // Para /api/customers/:customerId/transactions
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales-control', salesControlRouter);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/transactions', transactionsRouter);
app.use('/api/mermas', mermasRouter);
app.use('/api/credits', creditRoutes);
app.use('/api', kardexRouter);
app.use('/api/perishables', perishablesRouter);
app.use('/api/reports', reportRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/cash-registers', cashRegistersRouter);
app.use('/api/business', businessRoutes);
app.use('/api/inventory-report', inventoryReportRoutes);
app.use('/api/movimientos', movimientosRouter); // Para /api/movimientos/:movimientoId

// Depuración: Listar todas las rutas registradas
// app._router.stack.forEach((middleware: any) => {
//   if (middleware.route) {
    // Rutas directas
//     console.log(`Ruta registrada: ${middleware.route.path} (${Object.keys(middleware.route.methods).join(', ')})`);
//   } else if (middleware.name === 'router' && middleware.handle.stack) {
    // Rutas dentro de un router (como movimientosRouter)
//     const path = middleware.regexp.toString().replace(/\/\^\\/, '').replace(/\\\/?.*/, '');
//     middleware.handle.stack.forEach((handler: any) => {
//       if (handler.route) {
//         console.log(`Ruta registrada: ${path}${handler.route.path} (${Object.keys(handler.route.methods).join(', ')})`);
//       }
//     });
//   }
// });

// Tarea cron para productos vencidos (mermas)
const checkExpiredProducts = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/mermas/check-expired', // Asegúrate de que la URL sea correcta
      {},
      { headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` } }
    );
    console.log('Mermas automáticas procesadas:', response.data);
  } catch (error) {
    console.error('Error al procesar mermas automáticas:', error);
  }
};

// Tarea cron para perecederos vencidos
const checkExpiredPerishables = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/perishables/check-expired',
      {},
      { headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` } }
    );
    console.log('Perecederos vencidos procesados:', response.data);
  } catch (error) {
    console.error('Error al procesar perecederos vencidos:', error);
  }
};

// Programar ambas tareas a las 00:00
cron.schedule('0 0 * * *', checkExpiredProducts);
// cron.schedule('0 0 * * *', checkExpiredPerishables);

// Manejo global de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error capturado en el middleware global:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: err.message || 'Algo salió mal en el servidor' });
});

// Iniciar el servidor
const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
  // Generación de token de prueba (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    const testUser: User & { role?: string } = {
      id: 1,
      username: 'admin',
      email: 'admin@tienda.com',
      role_id: 1,
      role: 'admin',
      password: 'hashed_password',
      first_name: 'Admin',
      last_name: 'User',
    };
    const token = generateToken(testUser);
    console.log('Token de prueba generado:', token);
  }
});