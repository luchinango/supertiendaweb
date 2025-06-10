import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const cashRegisters = await prisma.cashRegister.findMany({
    include: {
      user: true,
      auditLogs: true,
    },
    orderBy: {openingDate: 'desc'},
  });
  res.json(cashRegisters);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const register = await prisma.cashRegister.findUnique({
    where: {id: Number(id)},
    include: {
      user: true,
      auditLogs: true,
    },
  });
  if (!register) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(register);
};

export const create = async (req: Request, res: Response) => {
  const {businessId, userId, registerNumber, openingAmount, notes} = req.body;

  const register = await prisma.cashRegister.create({
    data: {
      businessId,
      userId,
      registerNumber,
      openingAmount,
      currentAmount: openingAmount,
      notes,
      status: "OPEN",
    },
  });

  res.status(201).json(register);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {closingAmount, notes, status} = req.body;

  const register = await prisma.cashRegister.update({
    where: {id: Number(id)},
    data: {
      closingAmount,
      notes,
      status,
      closingDate: new Date(),
    },
  });

  res.json(register);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cashRegister.delete({where: {id: Number(id)}});
  res.status(204).send();
};
