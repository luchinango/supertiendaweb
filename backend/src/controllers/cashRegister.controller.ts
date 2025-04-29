import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const cashRegisters = await prisma.cashRegister.findMany({
    include: {
      user: true,
      audit_cash_registers: true,
    },
    orderBy: {opening_date: 'desc'},
  });
  res.json(cashRegisters);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const register = await prisma.cashRegister.findUnique({
    where: {id: Number(id)},
    include: {
      user: true,
      audit_cash_registers: true,
    },
  });
  if (!register) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(register);
};

export const create = async (req: Request, res: Response) => {
  const {user_id, opening_amount, notes} = req.body;

  const register = await prisma.cashRegister.create({
    data: {
      user_id,
      opening_amount,
      closing_amount: 0,
      notes,
      status: "abierta",
      opening_date: new Date(),
    },
  });

  res.status(201).json(register);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {closing_amount, notes, status} = req.body;

  const register = await prisma.cashRegister.update({
    where: {id: Number(id)},
    data: {
      closing_amount,
      notes,
      status,
      closing_date: new Date(),
    },
  });

  res.json(register);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cashRegister.delete({where: {id: Number(id)}});
  res.status(204).send();
};
