import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const list = await prisma.rolePermission.findMany({
    include: {
      role: true,
      permission: true,
    },
  });
  res.json(list);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.rolePermission.findUnique({
    where: { id: Number(id) },
    include: {
      role: true,
      permission: true,
    },
  });
  if (!entry) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(entry);
};

export const create = async (req: Request, res: Response) => {
  const { roleId, permissionId } = req.body;
  const entry = await prisma.rolePermission.create({
    data: { roleId, permissionId },
  });
  res.status(201).json(entry);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roleId, permissionId } = req.body;
  const updated = await prisma.rolePermission.update({
    where: { id: Number(id) },
    data: { roleId, permissionId },
  });
  res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.rolePermission.delete({
    where: { id: Number(id) },
  });
  res.status(204).send();
};
