import express from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = 5000;
const HOST = '192.168.0.23';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres', // Usuario de PostgreSQL
  host: 'localhost', // Host de la base de datos
  database: 'supertienda', // Nombre de la base de datos
  password: 'postgres', // Contraseña del usuario
  port: 5432, // Puerto de PostgreSQL
});

// Middleware para parsear JSON
app.use(express.json());

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Supertienda desde el BackEnd');
});

// Ruta para obtener usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empleados');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los usuarios');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});