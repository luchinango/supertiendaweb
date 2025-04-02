import { Pool } from 'pg';

const pool: Pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '206.183.128.36',
  database: process.env.DB_NAME || 'super_tienda',
  password: process.env.DB_PASSWORD || 'qgvTfRSMUerCtY4FqUNvDpuzBsH84D',
  port: parseInt(process.env.DB_PORT || '5217', 10),
});

/* app.use(cors({
  origin: 'http://localhost:3000', // O la URL de tu frontend en producción
})); */

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar a la base de datos:', err.stack);
  }
  console.log('Conexión a la base de datos exitosa');
  release();
});

export default pool;