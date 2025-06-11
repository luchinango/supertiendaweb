import prisma from '../config/prisma';
import {SaleStatus, PaymentStatus, PaymentMethod, InvoiceType} from '../../prisma/generated';

interface SaleCreateData {
  businessId: number;
  cartId: number;
  userId: number;
  customerId?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface SaleUpdateData {
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

interface ProcessSaleData {
  cartId: number;
  customerId?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export const saleService = {
  async getAll() {
    return await prisma.sale.findMany({
      include: {
        business: true,
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        },
        user: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        CashRegister: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getById(id: number) {
    return await prisma.sale.findUnique({
      where: {id},
      include: {
        business: true,
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        },
        user: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        CashRegister: true
      }
    });
  },

  async create(data: SaleCreateData) {
    const cart = await prisma.cart.findUnique({
      where: {id: data.cartId},
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    if (cart.status !== 'ACTIVE') {
      throw new Error('El carrito no está activo');
    }

    const openCashRegister = await prisma.cashRegister.findFirst({
      where: {
        businessId: data.businessId,
        userId: data.userId,
        status: 'OPEN'
      }
    });

    const subtotal = cart.subtotal;
    const taxAmount = cart.taxAmount;
    const totalAmount = cart.totalAmount;

    const invoiceNumber = await this.generateInvoiceNumber(data.businessId);

    const sale = await prisma.sale.create({
      data: {
        businessId: data.businessId,
        cartId: data.cartId,
        userId: data.userId,
        customerId: data.customerId,
        invoiceNumber: invoiceNumber,
        invoiceType: InvoiceType.FACTURA,
        status: SaleStatus.COMPLETED,
        subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PAID,
        notes: data.notes,
        cashRegisterId: openCashRegister?.id || null,
        createdBy: data.userId,
        updatedBy: data.userId
      },
      include: {
        business: true,
        cart: true,
        user: true,
        customer: true,
        items: true,
        CashRegister: true
      }
    });

    const saleItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        return await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.unitPrice,
            taxRate: cartItem.taxRate,
            taxAmount: cartItem.taxAmount,
            totalPrice: cartItem.totalPrice
          }
        });
      })
    );

    await prisma.cart.update({
      where: {id: data.cartId},
      data: {status: 'COMPLETED'}
    });

    await this.updateInventory(sale.id);

    return {
      ...sale,
      items: saleItems
    };
  },

  async update(id: number, data: SaleUpdateData) {
    return await prisma.sale.update({
      where: {id},
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        business: true,
        cart: true,
        user: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  },

  async remove(id: number) {
    const sale = await prisma.sale.findUnique({
      where: {id},
      include: {items: true}
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    if (sale.status === SaleStatus.COMPLETED) {
      throw new Error('No se puede eliminar una venta completada');
    }

    await prisma.saleItem.deleteMany({
      where: {saleId: id}
    });

    await prisma.sale.delete({
      where: {id}
    });
  },

  async getByBusiness(businessId: number) {
    return await prisma.sale.findMany({
      where: {businessId: businessId},
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        },
        user: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getByCustomer(customerId: number) {
    return await prisma.sale.findMany({
      where: {customerId: customerId},
      include: {
        business: true,
        cart: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getByDateRange(startDate: Date, endDate: Date, businessId?: number) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (businessId) {
      where.businessId = businessId;
    }

    return await prisma.sale.findMany({
      where,
      include: {
        business: true,
        cart: true,
        user: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async processSale(data: ProcessSaleData) {
    const cart = await prisma.cart.findUnique({
      where: {id: data.cartId},
      include: {
        business: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    if (cart.status !== 'ACTIVE') {
      throw new Error('El carrito no está activo');
    }

    const saleData: SaleCreateData = {
      businessId: cart.businessId,
      cartId: data.cartId,
      userId: cart.userId,
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      notes: data.notes
    };

    return await this.create(saleData);
  },

  async cancelSale(id: number, reason: string) {
    const sale = await prisma.sale.findUnique({
      where: {id},
      include: {items: true}
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new Error('Solo se pueden cancelar ventas completadas');
    }

    const updatedSale = await prisma.sale.update({
      where: {id},
      data: {
        status: SaleStatus.CANCELLED,
        notes: reason,
        updatedAt: new Date()
      }
    });

    await this.revertInventory(id);

    return updatedSale;
  },

  async refundSale(id: number, amount: number, reason: string) {
    const sale = await prisma.sale.findUnique({
      where: {id},
      include: {items: true}
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new Error('Solo se pueden reembolsar ventas completadas');
    }

    if (amount > Number(sale.totalAmount)) {
      throw new Error('El monto de reembolso no puede ser mayor al total de la venta');
    }

    const newStatus = amount === Number(sale.totalAmount) ? SaleStatus.REFUNDED : SaleStatus.PARTIALLY_REFUNDED;

    const updatedSale = await prisma.sale.update({
      where: {id},
      data: {
        status: newStatus,
        notes: reason,
        updatedAt: new Date()
      }
    });

    return updatedSale;
  },

  async generateInvoiceNumber(businessId: number) {
    const fiscalSettings = await prisma.fiscalSettings.findUnique({
      where: {businessId: businessId}
    });

    if (!fiscalSettings) {
      throw new Error('Configuración fiscal no encontrada');
    }

    const currentNumber = fiscalSettings.invoiceCurrentNumber;
    const series = fiscalSettings.invoiceSeries;

    await prisma.fiscalSettings.update({
      where: {businessId: businessId},
      data: {
        invoiceCurrentNumber: currentNumber + 1
      }
    });

    return `${series}-${currentNumber.toString().padStart(8, '0')}`;
  },

  async updateInventory(saleId: number) {
    const sale = await prisma.sale.findUnique({
      where: {id: saleId},
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    for (const item of sale.items) {
      await prisma.businessProduct.updateMany({
        where: {
          businessId: sale.businessId,
          productId: item.productId
        },
        data: {
          currentStock: {
            decrement: item.quantity
          },
          availableStock: {
            decrement: item.quantity
          }
        }
      });

      await prisma.inventoryTransaction.create({
        data: {
          businessId: sale.businessId,
          productId: item.productId,
          userId: sale.userId,
          transactionType: 'SALE',
          quantity: -item.quantity,
          unitCost: item.unitPrice,
          totalCost: item.totalPrice,
          referenceId: sale.id,
          referenceType: 'sale',
          notes: `Venta #${sale.invoiceNumber}`
        }
      });
    }
  },

  async revertInventory(saleId: number) {
    const sale = await prisma.sale.findUnique({
      where: {id: saleId},
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    for (const item of sale.items) {
      await prisma.businessProduct.updateMany({
        where: {
          businessId: sale.businessId,
          productId: item.productId
        },
        data: {
          currentStock: {
            increment: item.quantity
          },
          availableStock: {
            increment: item.quantity
          }
        }
      });

      await prisma.inventoryTransaction.create({
        data: {
          businessId: sale.businessId,
          productId: item.productId,
          userId: sale.userId,
          transactionType: 'RETURN',
          quantity: item.quantity,
          unitCost: item.unitPrice,
          totalCost: item.totalPrice,
          referenceId: sale.id,
          referenceType: 'sale_cancellation',
          notes: `Cancelación de venta #${sale.invoiceNumber}`
        }
      });
    }
  }
};
