const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 5000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres', // Usuario de PostgreSQL
  host: 'localhost',  // Host de la base de datos
  database: 'supertienda', // Nombre de la base de datos
  password: 'postgres', // Contraseña de PostgreSQL
  port: 5432, // Puerto de PostgreSQL (por defecto es 5432)
});

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo para obtener datos de la base de datos
app.get('/supertienda', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empleados'); // Cambia "tu_tabla" por el nombre de tu tabla
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los datos');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});