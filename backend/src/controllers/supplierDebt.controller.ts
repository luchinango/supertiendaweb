import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const debts = await prisma.supplierDebt.findMany({
    include: {
      supplier: true,
    },
    orderBy: {createdAt: 'desc'},
  });
  res.json(debts);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const debt = await prisma.supplierDebt.findUnique({
    where: {id: Number(id)},
    include: {
      supplier: true,
    },
  });
  if (!debt) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(debt);
};

export const create = async (req: Request, res: Response) => {
  const {supplierId, amount, paidAmount, dueDate} = req.body;

  const debt = await prisma.supplierDebt.create({
    data: {
      supplierId,
      amount,
      paidAmount,
      dueDate,
    },
  });

  res.status(201).json(debt);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {paidAmount, isPaid} = req.body;

  const debt = await prisma.supplierDebt.update({
    where: {id: Number(id)},
    data: {
      paidAmount,
      isPaid,
    },
  });

  res.json(debt);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.supplierDebt.delete({where: {id: Number(id)}});
  res.status(204).send();
};
