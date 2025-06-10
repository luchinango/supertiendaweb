import { Request, Response, NextFunction } from 'express';
import { saleItemService } from '../services/saleItemService';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await saleItemService.getAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await saleItemService.getById(Number(id));
    if (!item) {
      res.status(404).json({ message: 'Ítem de venta no encontrado' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemData = req.body;
    const item = await saleItemService.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const item = await saleItemService.update(Number(id), updateData);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await saleItemService.remove(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getBySale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params;
    const items = await saleItemService.getBySale(Number(saleId));
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getByProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const items = await saleItemService.getByProduct(Number(productId));
    res.json(items);
  } catch (error) {
    next(error);
  }
}; 