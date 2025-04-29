import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const types = await prisma.businessType.findMany();
  res.json(types);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const type = await prisma.businessType.findUnique({where: {id: Number(id)}});
  if (!type) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(type);
};

export const create = async (req: Request, res: Response) => {
  const {code, name} = req.body;
  const type = await prisma.businessType.create({
    data: {code, name},
  });
  res.status(201).json(type);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {code, name} = req.body;
  const type = await prisma.businessType.update({
    where: {id: Number(id)},
    data: {code, name},
  });
  res.json(type);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.businessType.delete({where: {id: Number(id)}});
  res.status(204).send();
};
