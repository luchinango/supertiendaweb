import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { authService } from '../services/authService';
import { UnauthorizedError } from '../errors';

const SALT_ROUNDS = 10;

export const getAll = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { role: true, employee: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { role: true, employee: true },
  });
  if (!user) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(user);
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    res.status(401).json({ message: 'Usuario no autenticado' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, employee: true },
  });

  if (!user) {
    res.status(404).json({ message: 'Usuario no encontrado' });
    return;
  }

  res.json(user);
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, roleId, status } = req.body;

    await authService.createUser({
      username,
      password,
      roleId,
      status
    });

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'El nombre de usuario ya está en uso') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roleId, status } = req.body;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      roleId,
      status,
      updatedAt: new Date(),
    },
  });

  res.json(user);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
