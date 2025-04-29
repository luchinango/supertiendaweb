import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const debts = await prisma.supplierDebt.findMany({
    include: {
      supplier: true,
      user: true,
      debt_payments: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(debts);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const debt = await prisma.supplierDebt.findUnique({
    where: {id: Number(id)},
    include: {
      supplier: true,
      user: true,
      debt_payments: true,
    },
  });
  if (!debt) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(debt);
};

export const create = async (req: Request, res: Response) => {
  const {supplier_id, amount, remaining_amount, user_id} = req.body;

  const debt = await prisma.supplierDebt.create({
    data: {
      supplier_id,
      amount,
      remaining_amount,
      user_id,
    },
  });

  res.status(201).json(debt);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {remaining_amount} = req.body;

  const debt = await prisma.supplierDebt.update({
    where: {id: Number(id)},
    data: {
      remaining_amount,
      updated_at: new Date(),
    },
  });

  res.json(debt);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.supplierDebt.delete({where: {id: Number(id)}});
  res.status(204).send();
};
