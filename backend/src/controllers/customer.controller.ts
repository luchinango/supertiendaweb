import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: {first_name: 'asc'},
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
    first_name,
    last_name,
    address,
    phone,
    company_name,
    tax_id,
    email,
    status,
    credit_balance,
  } = req.body;

  if (tax_id) {
    const existsTax = await prisma.customer.findUnique({where: {tax_id}});
    if (existsTax) {
      res.status(400).json({message: 'El NIT ya está registrado'});
      return;
    }
  }

  if (email) {
    const existsEmail = await prisma.customer.findUnique({where: {email}});
    if (existsEmail) {
      res.status(400).json({message: 'El correo ya está registrado'});
      return;
    }
  }

  const customer = await prisma.customer.create({
    data: {
      first_name,
      last_name,
      address,
      phone,
      company_name,
      tax_id,
      email,
      status,
      credit_balance,
    },
  });

  res.status(201).json(customer);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    first_name,
    last_name,
    address,
    phone,
    company_name,
    tax_id,
    email,
    status,
    credit_balance,
  } = req.body;

  const customer = await prisma.customer.update({
    where: {id: Number(id)},
    data: {
      first_name,
      last_name,
      address,
      phone,
      company_name,
      tax_id,
      email,
      status,
      credit_balance,
    },
  });

  res.json(customer);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.customer.delete({where: {id: Number(id)}});
  res.status(204).send();
};
