import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = await prisma.role.findUnique({ where: { id: Number(id) } });
  if (!role) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(role);
};

export const create = async (req: Request, res: Response) => {
  const { code, name } = req.body;
  const role = await prisma.role.create({
    data: { code, name }
  });
  res.status(201).json(role);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, name } = req.body;
  const role = await prisma.role.update({
    where: { id: Number(id) },
    data: { code, name }
  });
  res.json(role);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.role.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
