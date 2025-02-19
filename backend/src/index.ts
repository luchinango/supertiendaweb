import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import clienteRoutes from './routes/clienteRoutes';
import carritoRoutes from './routes/carritoRoutes';
// import { errorHandler } from './middleware/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = parseInt(process.env.PORT as string, 10) || 5000;
const HOST = '0.0.0.0'; // Cambiado para escuchar en todas las interfaces

// Middlewares
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  credentials: true // Permite credenciales
}));

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Supertienda desde el BackEnd');
});

app.options('/test-cors', cors()); // Habilita preflight para pruebas
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS está funcionando correctamente' });
});

// Rutas
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', proveedorRoutes);
app.use('/api', clienteRoutes);
app.use('/api', carritoRoutes);

app.get('/test', (req, res) => {
  res.send('¡Ruta de prueba funciona!');
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  prisma.$connect()
    .then((): void => console.log('Conectado a PostgreSQL'))
    .catch((err: Error): void => console.error('Error de conexión:', err));
});