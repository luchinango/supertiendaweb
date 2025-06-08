import {Request, Response, NextFunction} from 'express';
import {authService} from '../services/authService';
import {UnauthorizedError} from '../errors';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      throw new UnauthorizedError('Usuario y contraseña son requeridos');
    }

    const authResponse = await authService.login(username, password);
    res.json(authResponse);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError('Token de actualización requerido');
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {currentPassword, newPassword} = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!currentPassword || !newPassword) {
      throw new UnauthorizedError('Contraseña actual y nueva contraseña son requeridas');
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({message: 'Contraseña actualizada exitosamente'});
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);
    res.json({valid: true, user: decoded});
  } catch (error) {
    next(error);
  }
};
