import {Request, Response, NextFunction} from 'express';
import employeeService from '../services/employeeService';
import {EmployeeStatus, Gender} from '../../prisma/generated';


function toISOStringIfDate(dateString: string) {
  // if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return date.toISOString();
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      status: req.query.status as EmployeeStatus | undefined,
      gender: req.query.gender as Gender | undefined,
      search: req.query.search as string | undefined
    };

    const employees = await employeeService.getAll(filters);
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const employee = await employeeService.getById(Number(id));
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeData = {
      ...req.body,
      start_date: new Date(req.body.start_date),
      birth_date: req.body.birth_date ? new Date(req.body.birth_date) : undefined
    };

    const employee = await employeeService.create(employeeData);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const employeeData = {
      ...req.body,
      birth_date: req.body.birth_date ? new Date(req.body.birth_date) : undefined
    };

    const employee = await employeeService.update(Number(id), employeeData);
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    await employeeService.delete(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {userId} = req.params;
    const employee = await employeeService.getByUserId(Number(userId));
    res.json(employee);
  } catch (error) {
    next(error);
  }
};
