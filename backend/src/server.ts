import express, { Request, Response, NextFunction, Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './app'
import swaggerDocs from './config/swagger'

dotenv.config();


// Configuración de CORS
app.use(cors({
  origin: process.env.cors_origin, // Cambia esto en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Si usas autenticación con cookies o JWT
}));

app.use(express.json());

/*
// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
// Ruta raíz para verificar el estado del servidor
// Cargar el archivo YAML
// const swaggerDocument = yaml.load(readFileSync('./docs/openapi.yaml', 'utf8')) as swaggerUi.JsonObject;

// Configurar Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
*/

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
