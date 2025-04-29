import express, { Request, Response, NextFunction, Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './app'
import swaggerDocs from './config/swagger'

dotenv.config();


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

// Configuración de CORS
app.use(cors({
  origin: process.env.cors_origin, // Cambia esto en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Si usas autenticación con cookies o JWT
}));

app.use(express.json());

/* // Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); */

// Ruta raíz para verificar el estado del servidor

/*
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend funcionando', timestamp: new Date() });
});

// Ejemplo de ruta protegida
app.get('/api/admin', requireAdmin, (req, res) => {
  res.json({ message: 'Acceso para admin concedido' });
});
*/

// Cargar el archivo YAML
// const swaggerDocument = yaml.load(readFileSync('./docs/openapi.yaml', 'utf8')) as swaggerUi.JsonObject;

// Configurar Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Registro de rutas


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
/*
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
const server = app.listen(PORT, () => {
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
*/

const PORT: number = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  swaggerDocs(app, PORT)
})

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})

export default server
