import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const credits = await prisma.credit.findMany({
    include: {
      customer: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(credits);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const credit = await prisma.credit.findUnique({
    where: {id: Number(id)},
    include: {customer: true},
  });
  if (!credit) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(credit);
};

export const create = async (req: Request, res: Response) => {
  const {customer_id, balance, credit_limit, status} = req.body;

  const exists = await prisma.credit.findUnique({
    where: {customer_id},
  });

  if (exists) {
    res.status(400).json({message: 'Este cliente ya tiene crédito registrado'});
    return;
  }

  const credit = await prisma.credit.create({
    data: {
      customer_id,
      balance,
      credit_limit,
      status,
    },
  });

  res.status(201).json(credit);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {balance, credit_limit, status} = req.body;

  const credit = await prisma.credit.update({
    where: {id: Number(id)},
    data: {
      balance,
      credit_limit,
      status,
      updated_at: new Date(),
    },
  });

  res.json(credit);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.credit.delete({where: {id: Number(id)}});
  res.status(204).send();
};
