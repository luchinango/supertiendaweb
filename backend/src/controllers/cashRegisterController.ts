import {Request, Response} from 'express';
import prisma from '../config/prisma';
import {CashRegisterService, CashRegisterData, CashRegisterCloseData} from '../services/cashRegisterService';
import {CashRegisterStatus} from '../../prisma/generated';

const cashRegisterService = new CashRegisterService();

export const getAll = async (_req: Request, res: Response) => {
  const cashRegisters = await prisma.cashRegister.findMany({
    include: {
      user: true,
      auditLogs: true,
    },
    orderBy: {openingDate: 'desc'},
  });
  res.json(cashRegisters);
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const register = await prisma.cashRegister.findUnique({
    where: {id: Number(id)},
    include: {
      user: true,
      auditLogs: true,
    },
  });
  if (!register) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(register);
};

export const create = async (req: Request, res: Response) => {
  const {businessId, userId, registerNumber, openingAmount, notes} = req.body;

  const register = await prisma.cashRegister.create({
    data: {
      businessId,
      userId,
      registerNumber,
      openingAmount,
      currentAmount: openingAmount,
      notes,
      status: "OPEN",
    },
  });

  res.status(201).json(register);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {closingAmount, notes, status} = req.body;

  const register = await prisma.cashRegister.update({
    where: {id: Number(id)},
    data: {
      closingAmount,
      notes,
      status,
      closingDate: new Date(),
    },
  });

  res.json(register);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.cashRegister.delete({where: {id: Number(id)}});
  res.status(204).send();
};

/**
 * Abre una nueva caja registradora
 */
export const openCashRegister = async (req: Request, res: Response) => {
  try {
    const {businessId, userId} = req.user!;
    const {registerNumber, openingAmount, notes} = req.body;

    if(!registerNumber || !openingAmount)
    {
      res.status(400).json({
        error: 'registerNumber y openingAmount son requeridos'
      });
      return;
    }

    if (openingAmount < 0) {
      res.status(400).json({
        error: 'El monto de apertura no puede ser negativo'
      });
      return;
    }

    const data: CashRegisterData = {
      businessId,
      userId,
      registerNumber,
      openingAmount,
      notes
    };

    const cashRegister = await cashRegisterService.openCashRegister(data);

    res.status(201).json({
      success: true,
      message: 'Caja abierta exitosamente',
      data: cashRegister
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      error: error.message
    });
    return;
  }
};

/**
 * Cierra una caja registradora
 */
export const closeCashRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const {userId} = req.user!;
    const {id} = req.params;
    const {closingAmount, notes} = req.body;

    if(!closingAmount)
    {
      res.status(400).json({
        error: 'closingAmount es requerido'
      });
      return;
    }

    if (closingAmount < 0) {
      res.status(400).json({
        error: 'El monto de cierre no puede ser negativo'
      });
      return;
    }

    const data: CashRegisterCloseData = {
      closingAmount,
      notes
    };

    const result = await cashRegisterService.closeCashRegister(parseInt(id), userId, data);

    res.json({
      success: true,
      message: 'Caja cerrada exitosamente',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message
    });
  }
};

/**
 * Obtiene el resumen de una caja
 */
export const getCashRegisterSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    const summary = await cashRegisterService.getCashRegisterSummary(parseInt(id));

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(404).json({
      error: error.message
    });
  }
};

/**
 * Lista las cajas registradoras
 */
export const listCashRegisters = async (req: Request, res: Response): Promise<void> => {
  try {
    const {businessId} = req.user!;
    const {
      status,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    if (status) filters.status = status as CashRegisterStatus;
    if (userId) filters.userId = parseInt(userId as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await cashRegisterService.listCashRegisters(businessId, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
};

/**
 * Obtiene la caja abierta actual del usuario
 */
export const getCurrentOpenCashRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const {businessId, userId} = req.user!;
    const cashRegister = await cashRegisterService.getCurrentOpenCashRegister(businessId, userId);

    if(!cashRegister)
    {
      res.status(404).json({
        error: 'No hay caja abierta para este usuario'
      });
      return;
    }

    res.json({
      success: true,
      data: cashRegister
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
};

/**
 * Actualiza el monto actual de la caja
 */
export const updateCurrentAmount = async (req: Request, res: Response): Promise<void> => {
  try {
    const {userId} = req.user!;
    const {id} = req.params;
    const {newAmount, reason} = req.body;

    if(!newAmount || !reason)
    {
      res.status(400).json({
        error: 'newAmount y reason son requeridos'
      });
      return;
    }

    if (newAmount < 0) {
      res.status(400).json({
        error: 'El monto no puede ser negativo'
      });
      return;
    }

    const cashRegister = await cashRegisterService.updateCurrentAmount(
      parseInt(id),
      userId,
      newAmount,
      reason
    );

    res.json({
      success: true,
      message: 'Monto actualizado exitosamente',
      data: cashRegister
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message
    });
  }
};

/**
 * Obtiene el historial de auditoría de una caja
 */
export const getAuditHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;
    const auditHistory = await cashRegisterService.getAuditHistory(parseInt(id));

    res.json({
      success: true,
      data: auditHistory
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
};
