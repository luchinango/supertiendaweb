import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  const businesses = await prisma.business.findMany({
    include: {
      type: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(businesses);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const business = await prisma.business.findUnique({
    where: {id: Number(id)},
    include: {type: true},
  });
  if (!business) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(business);
};

export const create = async (req: Request, res: Response) => {
  const {
    name,
    legal_name,
    description,
    tax_id,
    email,
    phone,
    address,
    logo_url,
    website,
    timezone,
    currency,
    status,
    type_id,
    created_by,
    updated_by,
  } = req.body;

  const business = await prisma.business.create({
    data: {
      name,
      legal_name,
      description,
      tax_id,
      email,
      phone,
      address,
      logo_url,
      website,
      timezone,
      currency,
      status,
      type_id,
      created_by,
      updated_by,
    },
  });
  res.status(201).json(business);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {
    name,
    legal_name,
    description,
    tax_id,
    email,
    phone,
    address,
    logo_url,
    website,
    timezone,
    currency,
    status,
    type_id,
    updated_by,
  } = req.body;

  const business = await prisma.business.update({
    where: {id: Number(id)},
    data: {
      name,
      legal_name,
      description,
      tax_id,
      email,
      phone,
      address,
      logo_url,
      website,
      timezone,
      currency,
      status,
      type_id,
      updated_at: new Date(),
      updated_by,
    },
  });

  res.json(business);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.business.delete({where: {id: Number(id)}});
  res.status(204).send();
};
