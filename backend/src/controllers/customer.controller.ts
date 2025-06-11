import {Request, Response} from 'express';
import {customerService} from '../services/customerService';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const customer = await customerService.getCustomerById(Number(id));
    res.json(customer);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    if (errorMessage === 'Cliente no encontrado') {
      res.status(404).json({error: errorMessage});
    } else {
      res.status(500).json({error: errorMessage});
    }
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    if (errorMessage.includes('Ya existe')) {
      res.status(400).json({error: errorMessage});
    } else {
      res.status(500).json({error: errorMessage});
    }
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const customer = await customerService.updateCustomer(Number(id), req.body);
    res.json(customer);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    if (errorMessage === 'Cliente no encontrado') {
      res.status(404).json({error: errorMessage});
    } else if (errorMessage.includes('Ya existe')) {
      res.status(400).json({error: errorMessage});
    } else {
      res.status(500).json({error: errorMessage});
    }
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const result = await customerService.deleteCustomer(Number(id));
    res.status(204).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    if (errorMessage === 'Cliente no encontrado') {
      res.status(404).json({error: errorMessage});
    } else if (errorMessage.includes('No se puede eliminar')) {
      res.status(400).json({error: errorMessage});
    } else {
      res.status(500).json({error: errorMessage});
    }
  }
};

export const findByDocument = async (req: Request, res: Response) => {
  try {
    const {documentType, documentNumber} = req.query;

    if (!documentType && !documentNumber) {
      res.status(400).json({error: 'Al menos documentType o documentNumber debe ser proporcionado'});
      return;
    }

    const customers = await customerService.findByDocument(
      documentType as any,
      documentNumber as string
    );

    res.json({
      success: true,
      customers,
      totalFound: customers.length,
      filters: {
        documentType: documentType || null,
        documentNumber: documentNumber || null
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({error: errorMessage});
  }
};
