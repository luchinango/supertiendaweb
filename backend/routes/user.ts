import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt'; // Ahora lo usaremos

const router: Router = express.Router();

interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  mobile_phone?: string;
  role: string;
  created_at?: Date;
}

interface Credit {
  id?: number;
  user_id: number;
  amount: number;
  created_at?: Date;
  updated_at?: Date;
}

const SALT_ROUNDS = 10; // Número de rondas para el hash de bcrypt

// Ruta para agregar o actualizar créditos de un usuario
router.post('/:id/credits', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validar que amount sea un número válido
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    // Verificar que el usuario existe
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verificar si ya existe un registro de créditos para este usuario
    const creditCheck = await pool.query('SELECT * FROM credits WHERE user_id = $1', [id]);

    if (creditCheck.rows.length === 0) {
      // Si no existe, insertar un nuevo registro
      const result = await pool.query(
        'INSERT INTO credits (user_id, amount, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [id, amount]
      );
      return res.status(201).json({ message: 'Credits initialized', credit: result.rows[0] });
    } else {
      // Si existe, actualizar el amount sumando el valor recibido
      const result = await pool.query(
        'UPDATE credits SET amount = amount + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
        [amount, id]
      );
      return res.status(200).json({ message: 'Credits updated', credit: result.rows[0] });
    }
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Registrar un usuario
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name, address, mobile_phone, role }: Partial<User> = req.body;

    // Cifrar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password || '', SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [username, hashedPassword, email, first_name, last_name, address, mobile_phone, role]
    );

    // Crear un registro de créditos inicial para el nuevo usuario
    await pool.query(
      `INSERT INTO credits (user_id, amount) VALUES ($1, $2)`,
      [result.rows[0].id, 0.00]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los usuarios
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un usuario por ID con su saldo
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT u.*, c.amount
       FROM users u
       LEFT JOIN credits c ON u.id = c.user_id
       WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un usuario (PUT - reemplaza todos los campos)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, email, first_name, last_name, address, mobile_phone, role }: Partial<User> = req.body;

    // Cifrar la contraseña si se proporciona
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const result = await pool.query(
      `UPDATE users SET username = $1, password = $2, email = $3, first_name = $4, last_name = $5, address = $6, mobile_phone = $7, role = $8
       WHERE id = $9 RETURNING *`,
      [username, hashedPassword, email, first_name, last_name, address, mobile_phone, role, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH - Actualizar parcialmente un usuario
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<User> = req.body;

    // Obtener el usuario existente para mantener los valores no proporcionados
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Construir la consulta dinámica con solo los campos proporcionados
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    // Cifrar la contraseña si se proporciona en la actualización
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof Partial<User>]);

    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Eliminar un usuario (desactivar)
// DELETE - Inactivar un usuario (genérico)
router.post('/delete/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10); // Obtener el ID de la URL

  // Validar que el ID sea un número válido
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'El ID del usuario debe ser un número válido' });
  }

  try {
    // Actualizar el status a 'inactive' directamente
    const result = await pool.query(
      `UPDATE users 
       SET status = 'inactive' 
       WHERE id = $1 
       RETURNING id, username, status`,
      [userId]
    );

    // Verificar si se actualizó algún registro
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No se encontró un proveedor con ID ${userId}` });
    }

    res.status(200).json({ 
      message: `usuario con ID ${userId} desactivado correctamente`, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ 
      error: 'Error al intentar desactivar el usuario', 
      details: (error as Error).message 
    });
  }
});

// POST - Depositar créditos (aumentar saldo)
router.post('/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount }: { amount: number } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Verificar si el usuario existe
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Actualizar o insertar saldo en credits
    const creditResult = await pool.query(
      `INSERT INTO credits (user_id, amount) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET amount = credits.amount + $2
       RETURNING *`,
      [id, amount]
    );

    res.json({ message: 'Credits deposited successfully', amount: creditResult.rows[0].amount });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET - Consultar saldo de créditos
router.get('/:id/credits', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await pool.query(
      `SELECT amount FROM credits WHERE user_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User has no credits record' });
    }
    res.json({ amount: result.rows[0].amount });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;