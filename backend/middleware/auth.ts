import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import database from '../config/db';

export interface User {
  id: number;
  email: string;
  password: string;
  role_id?: number;
  role?: string;
}

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const [user] = await database.query('SELECT * FROM users WHERE id = ?', [id]);
    return user ? user[0] : null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: User & { role?: string } | null; // role es opcional
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_desarrollo';

export const generateToken = (user: User & { role?: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, roleId: user.role_id, role: user.role }, // Incluimos ambos
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; roleId?: number; role?: string };
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user; // Incluye role_id y role (si está presente)
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }
    next();
  };
};

export default { authenticate, authorize, generateToken };