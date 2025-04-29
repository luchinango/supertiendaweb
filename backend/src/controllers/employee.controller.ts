import {Request, Response} from "express";
import prisma from "../config/prisma";

import {createEmployeeSchema, updateEmployeeSchema} from '../validators/employee.validator';

function toISOStringIfDate(dateString: string) {
  // if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return date.toISOString();
}

export const getAll = async (_req: Request, res: Response) => {
  const employees = await prisma.employee.findMany();
  res.json(employees);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const employee = await prisma.employee.findUnique({where: {id: Number(id)}});
  if (!employee) {
    res.status(404).json({message: 'Not found'});
  } else {
    res.json(employee);
  }
};

export const create = async (req: Request, res: Response) => {
  const validation = createEmployeeSchema.safeParse(req.body);
  if (!validation.success) {
    console.log(validation.error.format());
    res.status(400).json({errors: validation.error.format()});
    return;
  }

  validation.data.start_date = toISOStringIfDate(validation.data.start_date);
  // validation.data.birth_date = toISOStringIfDate(validation.data.birth_date);


  const employee = await prisma.employee.create({
    data: validation.data
  });
  res.status(201).json(employee);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const validation = updateEmployeeSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({errors: validation.error.format()});
    return
  }
  const updated = await prisma.employee.update({
    where: {id: Number(id)},
    data: validation.data,
  });
  res.json(updated);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.employee.delete({where: {id: Number(id)}});
  res.status(204).send();
};
