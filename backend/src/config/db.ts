import { Pool } from 'pg';

const pool: Pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tienda',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

/* app.use(cors({
  origin: 'http://localhost:3000', // O la URL de tu frontend en producción
})); */

export default pool;