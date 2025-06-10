import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const audits = await prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {createdAt: 'desc'},
  });
  res.json(audits);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const audit = await prisma.auditLog.findUnique({
    where: {id: Number(id)},
    include: {user: true},
  });
  if (!audit) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(audit);
};

export const create = async (req: Request, res: Response) => {
  const {action, entity, entityId, oldValues, newValues, userId, ipAddress} = req.body;

  const audit = await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      userId,
      ipAddress,
    },
  });

  res.status(201).json(audit);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.auditLog.delete({where: {id: Number(id)}});
  res.status(204).send();
};
