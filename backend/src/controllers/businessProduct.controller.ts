import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const businessProducts = await prisma.businessProduct.findMany({
    include: {
      business: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(businessProducts);
};

export const getById = async (req: Request, res: Response) => {
  const { businessId, productId } = req.params;
  const record = await prisma.businessProduct.findUnique({
    where: { 
      businessId_productId: {
        businessId: Number(businessId),
        productId: Number(productId)
      }
    },
    include: { business: true, product: true },
  });
  if (!record) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(record);
};

export const create = async (req: Request, res: Response) => {
  const { businessId, productId, customPrice, currentStock } = req.body;

  const record = await prisma.businessProduct.create({
    data: {
      businessId,
      productId,
      customPrice,
      currentStock,
    },
  });

  res.status(201).json(record);
};

export const update = async (req: Request, res: Response) => {
  const { businessId, productId } = req.params;
  const { customPrice, currentStock } = req.body;

  const record = await prisma.businessProduct.update({
    where: { 
      businessId_productId: {
        businessId: Number(businessId),
        productId: Number(productId)
      }
    },
    data: {
      customPrice,
      currentStock,
      updatedAt: new Date(),
    },
  });

  res.json(record);
};

export const remove = async (req: Request, res: Response) => {
  const { businessId, productId } = req.params;
  await prisma.businessProduct.delete({ 
    where: { 
      businessId_productId: {
        businessId: Number(businessId),
        productId: Number(productId)
      }
    } 
  });
  res.status(204).send();
};
