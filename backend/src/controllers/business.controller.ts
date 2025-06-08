import {Request, Response, NextFunction} from 'express';
import {businessService} from '../services/businessService';
import {UnauthorizedError} from '../errors';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessData = {
      ...req.body,
      created_by: req.user?.id,
      updated_by: req.user?.id
    };

    const business = await businessService.create(businessData);
    res.status(201).json(business);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const businessData = {
      ...req.body,
      updated_by: req.user?.id
    };

    const business = await businessService.update(Number(id), businessData);
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    const business = await businessService.getById(Number(id));
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {status, type_id, search} = req.query;
    const businesses = await businessService.getAll({
      status: status as any,
      type_id: type_id ? Number(type_id) : undefined,
      search: search as string
    });
    res.json(businesses);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id} = req.params;
    await businessService.delete(Number(id));
    res.json({message: 'Negocio desactivado exitosamente'});
  } catch (error) {
    next(error);
  }
};

export const getBusinessTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await businessService.getBusinessTypes();
    res.json(types);
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {businessId} = req.params;
    const {productId, customPrice} = req.body;

    const businessProduct = await businessService.addProductToBusiness(
      Number(businessId),
      Number(productId),
      customPrice
    );
    res.status(201).json(businessProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {businessId, productId} = req.params;
    const {customPrice, actualStock} = req.body;

    const businessProduct = await businessService.updateBusinessProduct(
      Number(businessId),
      Number(productId),
      {customPrice, actualStock}
    );
    res.json(businessProduct);
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {businessId, productId} = req.params;
    await businessService.removeProductFromBusiness(
      Number(businessId),
      Number(productId)
    );
    res.json({message: 'Producto removido del negocio exitosamente'});
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {businessId} = req.params;
    const products = await businessService.getBusinessProducts(Number(businessId));
    res.json(products);
  } catch (error) {
    next(error);
  }
};
