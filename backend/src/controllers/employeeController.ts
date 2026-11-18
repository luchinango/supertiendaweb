import {Router, Request, Response, NextFunction} from 'express';
import employeeService from '../services/employeeService';
import {EmployeeStatus, Gender} from '../../generated';
import {resolveBusinessId} from '../helpers/tenantContext';
import {authenticate} from '../middlewares/authMiddleware';

const router = Router();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req);
    const filters = {
      status: req.query.status as EmployeeStatus | undefined,
      gender: req.query.gender as Gender | undefined,
      search: req.query.search as string | undefined
    };
    const employees = await employeeService.getAll(businessId, filters);
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req);
    const {id} = req.params;
    const employee = await employeeService.getById(Number(id), businessId);
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req, req.body?.businessId);
    const employeeData = {
      ...req.body,
      businessId,
      startDate: new Date(req.body.startDate || req.body.start_date),
      birthDate: (req.body.birthDate || req.body.birth_date)
        ? new Date(req.body.birthDate || req.body.birth_date)
        : undefined
    };
    const employee = await employeeService.create(employeeData);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req, req.body?.businessId);
    const {id} = req.params;
    const employeeData = {
      ...req.body,
      birthDate: (req.body.birthDate || req.body.birth_date)
        ? new Date(req.body.birthDate || req.body.birth_date)
        : undefined
    };
    delete (employeeData as any).businessId;
    const employee = await employeeService.update(Number(id), businessId, employeeData);
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req);
    const {id} = req.params;
    await employeeService.delete(Number(id), businessId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = resolveBusinessId(req);
    const {userId} = req.params;
    const employee = await employeeService.getByUserId(Number(userId), businessId);
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

router.use(authenticate());
router.get('/', getAll);
router.get('/user/:userId', getByUserId);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
