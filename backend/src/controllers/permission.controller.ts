import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const permission = await prisma.permission.findUnique({ where: { id: Number(id) } });
  if (!permission) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(permission);
};

export const create = async (req: Request, res: Response) => {
  const { code, name, description } = req.body;
  const permission = await prisma.permission.create({
    data: { code, name, description }
  });
  res.status(201).json(permission);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, name, description } = req.body;
  const permission = await prisma.permission.update({
    where: { id: Number(id) },
    data: { code, name, description }
  });
  res.json(permission);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.permission.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
