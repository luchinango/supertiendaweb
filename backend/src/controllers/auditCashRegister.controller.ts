import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const audits = await prisma.auditCashRegister.findMany({
    include: {
      cashRegister: true,
      user: true,
    },
    orderBy: {actionDate: 'desc'},
  });
  res.json(audits);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const audit = await prisma.auditCashRegister.findUnique({
    where: {id: Number(id)},
    include: {
      cashRegister: true,
      user: true,
    },
  });
  if (!audit) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(audit);
};

export const create = async (req: Request, res: Response) => {
  const {cashRegisterId, action, userId, details} = req.body;

  const audit = await prisma.auditCashRegister.create({
    data: {
      cashRegisterId,
      action,
      userId,
      details,
      actionDate: new Date(),
    },
  });

  res.status(201).json(audit);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.auditCashRegister.delete({where: {id: Number(id)}});
  res.status(204).send();
};
