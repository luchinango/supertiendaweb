import pool from "../config/db";

export interface User {
  id: number;
  email: string;
  password: string;
  role_id: number; // Cambiamos role por role_id
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null; // Devuelve role_id directamente
};

export const getUserById = async (id: number): Promise<User & { role?: string }> => {
  const query = `
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null; // role es opcional y viene de roles.name
};