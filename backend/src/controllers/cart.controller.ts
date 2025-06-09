import {Request, Response, NextFunction} from 'express';
import prisma from '../config/prisma';
import {cartService} from '../services/cartService';
import {BusinessError} from '../utils/errors';

export const getAll = async (_req: Request, res: Response) => {
  const carts = await prisma.cart.findMany({
    include: {
      customer: true,
      cartItems: true,
    },
    orderBy: {created_at: 'desc'},
  });
  res.json(carts);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const cart = await prisma.cart.findUnique({
    where: {id: Number(id)},
    include: {
      customer: true,
      cartItems: true,
    },
  });
  if (!cart) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(cart);
};

export const create = async (req: Request, res: Response) => {
  const {customer_id} = req.body;

  const cart = await prisma.cart.create({
    data: {
      customer_id,
    },
  });

  res.status(201).json(cart);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {customer_id} = req.body;

  const cart = await prisma.cart.update({
    where: {id: Number(id)},
    data: {
      customer_id,
      created_at: new Date(),
    },
  });

  res.json(cart);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cart.delete({where: {id: Number(id)}});
  res.status(204).send();
};

export const getActiveCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const {businessId} = req.params;

    if (!userId) {
      throw new BusinessError('Usuario no autenticado');
    }

    const cart = await cartService.getActiveCart(userId, Number(businessId));
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const createCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const {businessId} = req.params;

    if (!userId) {
      throw new BusinessError('Usuario no autenticado');
    }

    const cart = await cartService.createCart(userId, Number(businessId));
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {cartId} = req.params;
    const {productId, quantity} = req.body;

    if (!productId || !quantity) {
      throw new BusinessError('Producto y cantidad son requeridos');
    }

    const item = await cartService.addItem(Number(cartId), Number(productId), Number(quantity));
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {cartId, productId} = req.params;
    const {quantity} = req.body;

    if (!quantity) {
      throw new BusinessError('La cantidad es requerida');
    }

    const item = await cartService.updateItemQuantity(
      Number(cartId),
      Number(productId),
      Number(quantity)
    );
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {cartId, productId} = req.params;
    await cartService.removeItem(Number(cartId), Number(productId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {cartId} = req.params;
    await cartService.clearCart(Number(cartId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getCartTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {cartId} = req.params;
    const total = await cartService.getCartTotal(Number(cartId));
    res.json({total});
  } catch (error) {
    next(error);
  }
};
