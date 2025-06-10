import { Request, Response, NextFunction } from 'express';
import { saleService } from '../services/saleService';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await saleService.getAll();
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sale = await saleService.getById(Number(id));
    if (!sale) {
      res.status(404).json({ message: 'Venta no encontrada' });
      return;
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saleData = req.body;
    const sale = await saleService.create(saleData);
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const sale = await saleService.update(Number(id), updateData);
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await saleService.remove(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getByBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const sales = await saleService.getByBusiness(Number(businessId));
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const getByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const sales = await saleService.getByCustomer(Number(customerId));
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const getByDateRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, businessId } = req.query;
    const sales = await saleService.getByDateRange(
      new Date(startDate as string),
      new Date(endDate as string),
      businessId ? Number(businessId) : undefined
    );
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

export const processSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId, customerId, paymentMethod, notes } = req.body;
    const sale = await saleService.processSale({
      cartId,
      customerId,
      paymentMethod,
      notes
    });
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

export const cancelSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sale = await saleService.cancelSale(Number(id), reason);
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

export const refundSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const sale = await saleService.refundSale(Number(id), amount, reason);
    res.json(sale);
  } catch (error) {
    next(error);
  }
}; 