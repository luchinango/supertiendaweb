import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const orgCharts = await prisma.businessOrgChart.findMany({
    include: {
      business: true,
      user: true,
      parent: true,
      childrens: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orgCharts);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const orgChart = await prisma.businessOrgChart.findUnique({
    where: { id: Number(id) },
    include: { business: true, user: true, parent: true, childrens: true },
  });
  if (!orgChart) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(orgChart);
};

export const create = async (req: Request, res: Response) => {
  const { businessId, userId, position, parentPositionId } = req.body;

  const orgChart = await prisma.businessOrgChart.create({
    data: {
      businessId,
      userId,
      position,
      parentPositionId,
    },
  });

  res.status(201).json(orgChart);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { businessId, userId, position, parentPositionId } = req.body;

  const updated = await prisma.businessOrgChart.update({
    where: { id: Number(id) },
    data: {
      businessId,
      userId,
      position,
      parentPositionId,
      createdAt: new Date(),
    },
  });

  res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.businessOrgChart.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
