import {Request, Response} from 'express';
import {supplierService} from '../services/supplierService';
import {
  SupplierQueryParams,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierPathParams,
  SupplierErrorResponse
} from '../types/supplierTypes';

export const getAll = async (req: Request<{}, {}, {}, SupplierQueryParams>, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    department,
    documentType,
    minCreditLimit,
    maxCreditLimit,
    minBalance,
    maxBalance
  } = req.query;

  const result = await supplierService.getSuppliers({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    status: status as string,
    department: department as string,
    documentType: documentType as string,
    minCreditLimit: minCreditLimit ? Number(minCreditLimit) : undefined,
    maxCreditLimit: maxCreditLimit ? Number(maxCreditLimit) : undefined,
    minBalance: minBalance ? Number(minBalance) : undefined,
    maxBalance: maxBalance ? Number(maxBalance) : undefined
  });
  res.json(result);
};

export const getById = async (req: Request<SupplierPathParams>, res: Response) => {
  const {id} = req.params;
  const supplier = await supplierService.getSupplierById(Number(id));
  if (!supplier) {
    const errorResponse: SupplierErrorResponse = {message: 'Proveedor no encontrado'};
    res.status(404).json(errorResponse);
    return;
  }
  res.json(supplier);
};

export const search = async (req: Request<{}, {}, {}, { q: string }>, res: Response) => {
  const {q} = req.query;
  if (!q || q.length < 2) {
    const errorResponse: SupplierErrorResponse = {message: 'Término de búsqueda debe tener al menos 2 caracteres'};
    res.status(400).json(errorResponse);
    return;
  }

  const suppliers = await supplierService.searchSuppliers(q, 1);
  res.json(suppliers);
};

export const create = async (req: Request<{}, {}, CreateSupplierRequest>, res: Response) => {
  const {
    code,
    name,
    documentType,
    documentNumber,
    contactPerson,
    email,
    phone,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  } = req.body;

  if (code) {
    const codeExists = await supplierService.checkCodeExists(code);
    if (codeExists) {
      const errorResponse: SupplierErrorResponse = {message: 'El código ya está registrado'};
      res.status(400).json(errorResponse);
      return;
    }
  }

  if (documentNumber) {
    const documentExists = await supplierService.checkDocumentNumberExists(documentNumber);
    if (documentExists) {
      const errorResponse: SupplierErrorResponse = {message: 'El NIT ya está registrado'};
      res.status(400).json(errorResponse);
      return;
    }
  }

  const supplier = await supplierService.createSupplier({
    code,
    name,
    documentType,
    documentNumber,
    contactPerson,
    email,
    phone,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  });

  res.status(201).json(supplier);
};

export const update = async (req: Request<SupplierPathParams, {}, UpdateSupplierRequest>, res: Response) => {
  const {id} = req.params;
  const {
    code,
    name,
    documentType,
    documentNumber,
    contactPerson,
    email,
    phone,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  } = req.body;

  const existingSupplier = await supplierService.getSupplierById(Number(id));
  if (!existingSupplier) {
    const errorResponse: SupplierErrorResponse = {message: 'Proveedor no encontrado'};
    res.status(404).json(errorResponse);
    return;
  }

  if (code && code !== existingSupplier.code) {
    const codeExists = await supplierService.checkCodeExists(code);
    if (codeExists) {
      const errorResponse: SupplierErrorResponse = {message: 'El código ya está registrado'};
      res.status(400).json(errorResponse);
      return;
    }
  }

  if (documentNumber && documentNumber !== existingSupplier.documentNumber) {
    const documentExists = await supplierService.checkDocumentNumberExists(documentNumber);
    if (documentExists) {
      const errorResponse: SupplierErrorResponse = {message: 'El NIT ya está registrado'};
      res.status(400).json(errorResponse);
      return;
    }
  }

  const supplier = await supplierService.updateSupplier(Number(id), {
    code,
    name,
    documentType,
    documentNumber,
    contactPerson,
    email,
    phone,
    address,
    city,
    department,
    country,
    postalCode,
    paymentTerms,
    creditLimit,
    status,
    notes,
  });

  res.json(supplier);
};

export const remove = async (req: Request<SupplierPathParams>, res: Response) => {
  const {id} = req.params;

  const existingSupplier = await supplierService.getSupplierById(Number(id));
  if (!existingSupplier) {
    const errorResponse: SupplierErrorResponse = {message: 'Proveedor no encontrado'};
    res.status(404).json(errorResponse);
    return;
  }

  await supplierService.softDeleteSupplier(Number(id));
  res.status(204).send();
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await supplierService.getSupplierStats(1);
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de proveedores:', error);
    const errorResponse: SupplierErrorResponse = {message: 'Error interno del servidor'};
    res.status(500).json(errorResponse);
  }
};

export const getSuppliersWithDebt = async (_req: Request, res: Response) => {
  try {
    const suppliers = await supplierService.getSuppliersWithDebt(1);
    res.json(suppliers);
  } catch (error) {
    console.error('Error al obtener proveedores con deuda:', error);
    const errorResponse: SupplierErrorResponse = {message: 'Error interno del servidor'};
    res.status(500).json(errorResponse);
  }
};
