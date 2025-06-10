import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: {firstName: 'asc'},
  });
  res.json(customers);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const customer = await prisma.customer.findUnique({
    where: {id: Number(id)},
  });
  if (!customer) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(customer);
};

export const create = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    address,
    phone,
    documentType,
    documentNumber,
    email,
    city,
    department,
    country,
    postalCode,
    creditLimit,
    currentBalance,
    loyaltyPoints,
    isActive,
  } = req.body;

  const customer = await prisma.customer.create({
    data: {
      firstName,
      lastName,
      address,
      phone,
      documentType,
      documentNumber,
      email,
      city,
      department,
      country,
      postalCode,
      creditLimit,
      currentBalance,
      loyaltyPoints,
      isActive,
    },
  });

  res.status(201).json(customer);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    firstName,
    lastName,
    address,
    phone,
    documentType,
    documentNumber,
    email,
    city,
    department,
    country,
    postalCode,
    creditLimit,
    currentBalance,
    loyaltyPoints,
    isActive,
  } = req.body;

  const customer = await prisma.customer.update({
    where: {id: Number(id)},
    data: {
      firstName,
      lastName,
      address,
      phone,
      documentType,
      documentNumber,
      email,
      city,
      department,
      country,
      postalCode,
      creditLimit,
      currentBalance,
      loyaltyPoints,
      isActive,
    },
  });

  res.json(customer);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.customer.delete({where: {id: Number(id)}});
  res.status(204).send();
};
