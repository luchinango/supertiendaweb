import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(suppliers);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await prisma.supplier.findUnique({
    where: { id: Number(id) },
  });
  if (!supplier) {
    res.status(404).json({ message: 'No encontrado' });
    return;
  }
  res.json(supplier);
};

export const create = async (req: Request, res: Response) => {
  const {
    name,
    contactPerson,
    phone,
    email,
    documentNumber,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  } = req.body;

  // Verificar unicidad de NIT/documentNumber
  if (documentNumber) {
    const exists = await prisma.supplier.findFirst({ where: { documentNumber } });
    if (exists) {
      res.status(400).json({ message: 'El NIT ya está registrado' });
      return;
    }
  }

  const supplier = await prisma.supplier.create({
    data: {
      name,
      contactPerson,
      phone,
      email,
      documentNumber,
      address,
      city,
      department,
      country,
      postalCode,
      paymentTerms,
      creditLimit,
      status,
      notes,
    },
  });

  res.status(201).json(supplier);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    contactPerson,
    phone,
    email,
    documentNumber,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  } = req.body;

  const supplier = await prisma.supplier.update({
    where: { id: Number(id) },
    data: {
      name,
      contactPerson,
      phone,
      email,
      documentNumber,
      address,
      city,
      department,
      country,
      postalCode,
      paymentTerms,
      creditLimit,
      status,
      notes,
    },
  });

  res.json(supplier);
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.supplier.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
