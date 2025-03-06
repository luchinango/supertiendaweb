import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { getUserById } from '../models/user';

declare global {
  namespace Express {
      interface Request {
          user?: User | null; // Añade la propiedad user que puede ser null
      }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_desarrollo';

// Generar token
export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Middleware de autenticación
export const authenticate = async (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user; // Añade el usuario al request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }
    next();
  };
};