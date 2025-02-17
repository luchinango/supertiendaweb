import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
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
app.use('/', productRoutes);

// Ruta para obtener usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los usuarios activos');
  }
});

app.get('/test', (req, res) => {
  res.send('¡Ruta de prueba funciona!');
});

// Ruta para obtener productos
/* app.get('/api/productos', async (req, res) => {
  try {
    const products = await prisma.producto.findMany();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los productos');
  }
}); */

// Routes
// app.use('/api', productRoutes);

// Error Handling
// app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  prisma.$connect()
    .then(() => console.log('Conectado a PostgreSQL'))
    .catch((err) => console.error('Error de conexión:', err));
});

/* // Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
}); */