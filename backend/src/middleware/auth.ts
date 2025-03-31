import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, getUserById } from '../models/user';
import database from '../config/db';

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

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  next();
}

export default { authenticate, authorize, generateToken, requireAdmin };