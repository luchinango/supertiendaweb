import {Request, Response, NextFunction} from 'express';
import {UnauthorizedError} from '../errors';
import authService from '../services/authService';

export const authenticate = (requiredRole?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado');
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = await authService.verifyToken(token);

        if (requiredRole && decoded.role !== requiredRole) {
          throw new UnauthorizedError('No tiene permisos para realizar esta acción');
        }

        req.user = {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role
        };

        next();
      } catch (error) {
        console.error('Error verificando token:', error);
        if (error instanceof UnauthorizedError) {
          throw error;
        }
        throw new UnauthorizedError('Token inválido o expirado');
      }
    } catch (error) {
      next(error);
    }
  };
};
