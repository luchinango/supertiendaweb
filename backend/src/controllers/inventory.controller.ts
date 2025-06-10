import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventoryService';
import { authenticate } from '../middlewares/authMiddleware';

export const receivePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purchaseOrderId } = req.params;
    const { items } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const result = await inventoryService.receivePurchaseOrder(
      Number(purchaseOrderId),
      items,
      userId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, productId } = req.params;
    const { quantity, reason } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    await inventoryService.adjustInventory({
      business_id: Number(businessId),
      product_id: Number(productId),
      quantity: Number(quantity),
      reason,
      user_id: userId
    });

    res.json({ message: 'Inventario ajustado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const transferInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromBusinessId, toBusinessId, productId } = req.params;
    const { quantity, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    await inventoryService.transferInventory({
      from_business_id: Number(fromBusinessId),
      to_business_id: Number(toBusinessId),
      product_id: Number(productId),
      quantity: Number(quantity),
      user_id: userId,
      notes
    });

    res.json({ message: 'Transferencia realizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, productId } = req.params;
    const stock = await inventoryService.getCurrentStock(Number(businessId), Number(productId));
    res.json(stock);
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const products = await inventoryService.getLowStockProducts(Number(businessId));
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const generateInventoryReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const report = await inventoryService.generateInventoryReport(Number(businessId));
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const addToInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, productId } = req.params;
    const { quantity, unit_cost, transaction_type, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    await inventoryService.addToInventory({
      business_id: Number(businessId),
      product_id: Number(productId),
      quantity: Number(quantity),
      unit_cost: Number(unit_cost),
      transaction_type,
      notes,
      user_id: userId
    });

    res.json({ message: 'Stock agregado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const removeFromInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, productId } = req.params;
    const { quantity, unit_cost, transaction_type, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    await inventoryService.removeFromInventory({
      business_id: Number(businessId),
      product_id: Number(productId),
      quantity: Number(quantity),
      unit_cost: Number(unit_cost),
      transaction_type,
      notes,
      user_id: userId
    });

    res.json({ message: 'Stock removido exitosamente' });
  } catch (error) {
    next(error);
  }
}; 