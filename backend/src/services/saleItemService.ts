import prisma from '../config/prisma';

interface SaleItemCreateData {
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
}

interface SaleItemUpdateData {
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  discountAmount?: number;
}

export const saleItemService = {
  async getAll() {
    return await prisma.saleItem.findMany({
      include: {
        sale: {
          include: {
            business: true,
            customer: true
          }
        },
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getById(id: number) {
    return await prisma.saleItem.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            business: true,
            customer: true
          }
        },
        product: {
          include: {
            category: true
          }
        }
      }
    });
  },

  async create(data: SaleItemCreateData) {
    // Calcular totales
    const taxRate = data.taxRate || 13; // IVA 13% por defecto
    const discountAmount = data.discountAmount || 0;

    const subtotal = data.quantity * data.unitPrice;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const totalPrice = subtotal + taxAmount - discountAmount;

    return await prisma.saleItem.create({
      data: {
        saleId: data.saleId,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        taxRate: taxRate,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        totalPrice: totalPrice
      },
      include: {
        sale: true,
        product: true
      }
    });
  },

  async update(id: number, data: SaleItemUpdateData) {
    const currentItem = await prisma.saleItem.findUnique({
      where: { id }
    });

    if (!currentItem) {
      throw new Error('Ítem de venta no encontrado');
    }

    // Usar valores actuales si no se proporcionan nuevos
    const quantity = data.quantity ?? currentItem.quantity;
    const unitPrice = data.unitPrice ?? Number(currentItem.unitPrice);
    const taxRate = data.taxRate ?? Number(currentItem.taxRate);
    const discountAmount = data.discountAmount ?? Number(currentItem.discountAmount);

    // Recalcular totales
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const totalPrice = subtotal + taxAmount - discountAmount;

    return await prisma.saleItem.update({
      where: { id },
      data: {
        quantity,
        unitPrice: unitPrice,
        taxRate: taxRate,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        totalPrice: totalPrice
      },
      include: {
        sale: true,
        product: true
      }
    });
  },

  async remove(id: number) {
    const item = await prisma.saleItem.findUnique({
      where: { id },
      include: { sale: true }
    });

    if (!item) {
      throw new Error('Ítem de venta no encontrado');
    }

    // Verificar si la venta permite modificaciones
    if (item.sale.status === 'COMPLETED') {
      throw new Error('No se puede eliminar un ítem de una venta completada');
    }

    await prisma.saleItem.delete({
      where: { id }
    });
  },

  async getBySale(saleId: number) {
    return await prisma.saleItem.findMany({
      where: { saleId: saleId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  },

  async getByProduct(productId: number) {
    return await prisma.saleItem.findMany({
      where: { productId: productId },
      include: {
        sale: {
          include: {
            business: true,
            customer: true
          }
        },
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getSalesSummary(businessId: number, startDate?: Date, endDate?: Date) {
    const where: any = {
      sale: {
        business_id: businessId
      }
    };

    if (startDate && endDate) {
      where.sale.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const summary = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
        totalPrice: true,
        taxAmount: true,
        discountAmount: true
      },
      _count: {
        id: true
      }
    });

    // Obtener información de productos
    const productIds = summary.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true }
    });

    return summary.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        product: product,
        total_quantity: item._sum.quantity || 0,
        total_amount: item._sum.totalPrice || 0,
        total_tax: item._sum.taxAmount || 0,
        total_discount: item._sum.discountAmount || 0,
        sale_count: item._count.id
      };
    });
  },

  async getTopSellingProducts(businessId: number, limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: any = {
      sale: {
        business_id: businessId
      }
    };

    if (startDate && endDate) {
      where.sale.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    // Obtener información de productos
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true }
    });

    return topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        product: product,
        total_quantity: item._sum.quantity || 0,
        total_revenue: item._sum.totalPrice || 0
      };
    });
  }
};