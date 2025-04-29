import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const payments = await prisma.debtPayment.findMany({
    include: {
      supplier_debt: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(payments);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const payment = await prisma.debtPayment.findUnique({
    where: {id: Number(id)},
    include: {
      supplier_debt: true,
    },
  });
  if (!payment) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(payment);
};

export const create = async (req: Request, res: Response) => {
  const {debt_id, amount} = req.body;

  const payment = await prisma.debtPayment.create({
    data: {
      debt_id,
      amount,
    },
  });

  res.status(201).json(payment);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {amount} = req.body;

  const payment = await prisma.debtPayment.update({
    where: {id: Number(id)},
    data: {
      amount,
    },
  });

  res.json(payment);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.debtPayment.delete({where: {id: Number(id)}});
  res.status(204).send();
};
