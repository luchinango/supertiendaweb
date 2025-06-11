import prisma from '../config/prisma';
import {CashRegisterStatus, PaymentMethod, SaleStatus} from '../../prisma/generated';
import {Decimal} from '@prisma/client/runtime/library';

export interface CashRegisterData {
  businessId: number;
  userId: number;
  registerNumber: string;
  openingAmount: number;
  notes?: string;
}

export interface CashRegisterCloseData {
  closingAmount: number;
  notes?: string;
}

export interface CashRegisterSummary {
  id: number;
  registerNumber: string;
  openingAmount: number;
  closingAmount?: number;
  currentAmount: number;
  openingDate: Date;
  closingDate?: Date;
  status: CashRegisterStatus;
  totalSales: number;
  totalCashSales: number;
  totalCardSales: number;
  totalOtherSales: number;
  salesCount: number;
  notes?: string;
  user: {
    id: number;
    username: string;
  };
}

export class CashRegisterService {
  /**
   * Abre una nueva caja registradora
   */
  async openCashRegister(data: CashRegisterData) {
    const existingOpenRegister = await prisma.cashRegister.findFirst({
      where: {
        businessId: data.businessId,
        userId: data.userId,
        status: CashRegisterStatus.OPEN
      }
    });

    if (existingOpenRegister) {
      throw new Error('Ya existe una caja abierta para este usuario');
    }

    const existingRegisterNumber = await prisma.cashRegister.findUnique({
      where: {
        registerNumber: data.registerNumber
      }
    });

    if (existingRegisterNumber) {
      throw new Error('El número de registro ya existe');
    }

    const cashRegister = await prisma.cashRegister.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        registerNumber: data.registerNumber,
        openingAmount: new Decimal(data.openingAmount),
        currentAmount: new Decimal(data.openingAmount),
        status: CashRegisterStatus.OPEN,
        notes: data.notes,
        createdBy: data.userId,
        updatedBy: data.userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await prisma.auditCashRegister.create({
      data: {
        cashRegisterId: cashRegister.id,
        userId: data.userId,
        action: 'OPEN',
        amount: new Decimal(data.openingAmount),
        details: `Apertura de caja con monto inicial: ${data.openingAmount}`
      }
    });

    return cashRegister;
  }

  /**
   * Cierra una caja registradora
   */
  async closeCashRegister(cashRegisterId: number, userId: number, data: CashRegisterCloseData) {
    const cashRegister = await prisma.cashRegister.findUnique({
      where: {id: cashRegisterId},
      include: {
        sales: {
          select: {
            id: true,
            totalAmount: true,
            paymentMethod: true,
            status: true
          }
        }
      }
    });

    if (!cashRegister) {
      throw new Error('Caja registradora no encontrada');
    }

    if (cashRegister.status !== CashRegisterStatus.OPEN) {
      throw new Error('La caja ya está cerrada');
    }

    if (cashRegister.userId !== userId) {
      throw new Error('Solo el usuario que abrió la caja puede cerrarla');
    }

    const completedSales = cashRegister.sales.filter(sale => sale.status === SaleStatus.COMPLETED);
    const totalSales = completedSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    const cashSales = completedSales
    .filter(sale => sale.paymentMethod === PaymentMethod.CASH)
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    const cardSales = completedSales
    .filter(sale => sale.paymentMethod === PaymentMethod.CREDIT_CARD || sale.paymentMethod === PaymentMethod.DEBIT_CARD)
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    const otherSales = totalSales - cashSales - cardSales;

    const expectedAmount = Number(cashRegister.openingAmount) + cashSales;
    const difference = data.closingAmount - expectedAmount;

    const updatedCashRegister = await prisma.cashRegister.update({
      where: {id: cashRegisterId},
      data: {
        closingAmount: new Decimal(data.closingAmount),
        currentAmount: new Decimal(data.closingAmount),
        closingDate: new Date(),
        status: CashRegisterStatus.CLOSED,
        notes: data.notes,
        updatedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await prisma.auditCashRegister.create({
      data: {
        cashRegisterId: cashRegisterId,
        userId: userId,
        action: 'CLOSE',
        amount: new Decimal(data.closingAmount),
        details: `Cierre de caja. Total ventas: ${totalSales}, Ventas en efectivo: ${cashSales}, Diferencia: ${difference}`
      }
    });

    return {
      ...updatedCashRegister,
      summary: {
        totalSales,
        cashSales,
        cardSales,
        otherSales,
        salesCount: completedSales.length,
        expectedAmount,
        difference
      }
    };
  }

  /**
   * Obtiene el resumen de una caja
   */
  async getCashRegisterSummary(cashRegisterId: number) {
    const cashRegister = await prisma.cashRegister.findUnique({
      where: {id: cashRegisterId},
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        sales: {
          where: {
            status: SaleStatus.COMPLETED
          },
          select: {
            id: true,
            totalAmount: true,
            paymentMethod: true
          }
        }
      }
    });

    if (!cashRegister) {
      throw new Error('Caja registradora no encontrada');
    }

    const totalSales = cashRegister.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const cashSales = cashRegister.sales
    .filter(sale => sale.paymentMethod === PaymentMethod.CASH)
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const cardSales = cashRegister.sales
    .filter(sale => sale.paymentMethod === PaymentMethod.CREDIT_CARD || sale.paymentMethod === PaymentMethod.DEBIT_CARD)
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const otherSales = totalSales - cashSales - cardSales;

    return {
      id: cashRegister.id,
      registerNumber: cashRegister.registerNumber,
      openingAmount: Number(cashRegister.openingAmount),
      closingAmount: cashRegister.closingAmount ? Number(cashRegister.closingAmount) : undefined,
      currentAmount: Number(cashRegister.currentAmount),
      openingDate: cashRegister.openingDate,
      closingDate: cashRegister.closingDate || undefined,
      status: cashRegister.status,
      totalSales,
      totalCashSales: cashSales,
      totalCardSales: cardSales,
      totalOtherSales: otherSales,
      salesCount: cashRegister.sales.length,
      notes: cashRegister.notes || undefined,
      user: cashRegister.user
    };
  }

  /**
   * Lista las cajas registradoras de un negocio
   */
  async listCashRegisters(businessId: number, filters: {
    status?: CashRegisterStatus;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const {status, userId, startDate, endDate, page = 1, limit = 10} = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
      deletedAt: null
    };

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.openingDate = {};
      if (startDate) where.openingDate.gte = startDate;
      if (endDate) where.openingDate.lte = endDate;
    }

    const [cashRegisters, total] = await Promise.all([
      prisma.cashRegister.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          _count: {
            select: {
              sales: {
                where: {
                  status: SaleStatus.COMPLETED
                }
              }
            }
          }
        },
        orderBy: {
          openingDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.cashRegister.count({where})
    ]);

    return {
      cashRegisters,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtiene la caja abierta actual de un usuario
   */
  async getCurrentOpenCashRegister(businessId: number, userId: number) {
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        businessId,
        userId,
        status: CashRegisterStatus.OPEN
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        sales: {
          where: {
            status: SaleStatus.COMPLETED
          },
          select: {
            id: true,
            totalAmount: true,
            paymentMethod: true,
            createdAt: true
          }
        }
      }
    });

    if (!cashRegister) {
      return null;
    }

    const cashSales = cashRegister.sales
    .filter(sale => sale.paymentMethod === PaymentMethod.CASH)
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

    const expectedAmount = Number(cashRegister.openingAmount) + cashSales;

    return {
      ...cashRegister,
      currentExpectedAmount: expectedAmount,
      cashSales,
      salesCount: cashRegister.sales.length
    };
  }

  /**
   * Actualiza el monto actual de la caja (para ajustes)
   */
  async updateCurrentAmount(cashRegisterId: number, userId: number, newAmount: number, reason: string) {
    const cashRegister = await prisma.cashRegister.findUnique({
      where: {id: cashRegisterId}
    });

    if (!cashRegister) {
      throw new Error('Caja registradora no encontrada');
    }

    if (cashRegister.status !== 'OPEN') {
      throw new Error('Solo se puede ajustar una caja abierta');
    }

    if (cashRegister.userId !== userId) {
      throw new Error('Solo el usuario que abrió la caja puede hacer ajustes');
    }

    const oldAmount = Number(cashRegister.currentAmount);
    const difference = newAmount - oldAmount;

    const updatedCashRegister = await prisma.cashRegister.update({
      where: {id: cashRegisterId},
      data: {
        currentAmount: new Decimal(newAmount),
        updatedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    await prisma.auditCashRegister.create({
      data: {
        cashRegisterId,
        userId,
        action: 'ADJUSTMENT',
        amount: new Decimal(difference),
        details: `Ajuste de caja: ${oldAmount} → ${newAmount}. Razón: ${reason}`
      }
    });

    return updatedCashRegister;
  }

  /**
   * Obtiene el historial de auditoría de una caja
   */
  async getAuditHistory(cashRegisterId: number) {
    return await prisma.auditCashRegister.findMany({
      where: {cashRegisterId},
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const cashRegisterService = new CashRegisterService();
