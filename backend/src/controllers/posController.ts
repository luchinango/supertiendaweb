import {Request, Response} from 'express';
import {posService} from '../services/posService';

/**
 * Iniciar una nueva venta (crear carrito)
 */
export const startSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const businessId = 1;

    if (!userId) {
      res.status(401).json({error: 'Usuario no autenticado'});
      return;
    }

    const result = await posService.startSale({
      businessId,
      userId
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Agregar producto al carrito
 */
export const addItemToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId, productId, quantity} = req.body;

    const result = await posService.addItemToCart({
      cartId,
      productId,
      quantity
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Remover producto del carrito
 */
export const removeItemFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId, productId} = req.params;

    const result = await posService.removeItemFromCart(
      parseInt(cartId),
      parseInt(productId)
    );

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Actualizar cantidad de un producto en el carrito
 */
export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId, productId} = req.params;
    const {quantity} = req.body;

    const result = await posService.updateItemQuantity({
      cartId: parseInt(cartId),
      productId: parseInt(productId),
      quantity
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Obtener resumen de venta actual
 */
export const getSaleSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId} = req.params;

    const result = await posService.getSaleSummary(parseInt(cartId));

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Completar venta (pago y facturación)
 */
export const completeSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId} = req.params;
    const {paymentMethod, notes} = req.body;

    const result = await posService.completeSale({
      cartId: parseInt(cartId),
      paymentMethod,
      notes
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Cancelar venta
 */
export const cancelSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId} = req.params;
    const {reason} = req.body;

    const result = await posService.cancelSale({
      cartId: parseInt(cartId),
      reason
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Buscar productos por código o nombre
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {query} = req.query;
    const businessId = 1; // Por defecto

    const result = await posService.searchProducts({
      query: query as string,
      businessId
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Obtener productos rápidos (más vendidos)
 */
export const getQuickProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = 1; // Por defecto
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await posService.getQuickProducts({
      businessId,
      limit
    });

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

/**
 * Asignar cliente al carrito
 */
export const assignCustomerToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const {cartId} = req.params;
    const {customerId} = req.body;

    const result = await posService.assignCustomerToCart(
      parseInt(cartId),
      customerId
    );

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};
