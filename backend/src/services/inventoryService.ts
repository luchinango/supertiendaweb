import prisma from '../config/prisma';
import {InventoryTransactionType} from '../../prisma/generated';

interface ReceiveItemData {
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  notes?: string;
}

interface AdjustInventoryData {
  business_id: number;
  product_id: number;
  quantity: number;
  reason: string;
  user_id: number;
}

interface TransferInventoryData {
  from_business_id: number;
  to_business_id: number;
  product_id: number;
  quantity: number;
  user_id: number;
  notes?: string;
}

export const inventoryService = {
  /**
   * Recibir mercancía de una orden de compra
   */
  async receivePurchaseOrder(purchaseOrderId: number, items: ReceiveItemData[], userId: number) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {id: purchaseOrderId},
      include: {
        items: true,
        business: true
      }
    });

    if (!purchaseOrder) {
      throw new Error('Orden de compra no encontrada');
    }

    if (purchaseOrder.status === 'RECEIVED') {
      throw new Error('La orden de compra ya fue recibida');
    }

    // Procesar cada ítem recibido
    for (const itemData of items) {
      const poItem = purchaseOrder.items.find(
        item => item.productId === itemData.product_id
      );

      if (!poItem) {
        throw new Error(`Producto ${itemData.product_id} no está en la orden de compra`);
      }

      // Verificar que no se reciba más de lo ordenado
      const totalReceived = poItem.receivedQuantity + itemData.quantity;
      if (totalReceived > poItem.quantity) {
        throw new Error(`Cantidad recibida excede la cantidad ordenada para producto ${itemData.product_id}`);
      }

      // Actualizar cantidad recibida en la orden
      await prisma.purchaseOrderItem.update({
        where: {id: poItem.id},
        data: {
          receivedQuantity: totalReceived
        }
      });

      // Actualizar inventario
      await this.addToInventory({
        business_id: purchaseOrder.businessId,
        product_id: itemData.product_id,
        quantity: itemData.quantity,
        unit_cost: itemData.unit_cost,
        transaction_type: 'PURCHASE',
        reference_id: purchaseOrderId,
        reference_type: 'purchase_order',
        notes: itemData.notes || `Recepción de orden #${purchaseOrder.poNumber}`,
        user_id: userId
      });
    }

    // Verificar si toda la orden fue recibida
    const allReceived = purchaseOrder.items.every(item =>
      item.receivedQuantity >= item.quantity
    );

    // Actualizar estado de la orden
    const newStatus = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    await prisma.purchaseOrder.update({
      where: {id: purchaseOrderId},
      data: {
        status: newStatus,
        receivedDate: new Date()
      }
    });

    return {message: 'Mercancía recibida exitosamente', status: newStatus};
  },

  /**
   * Agregar stock al inventario
   */
  async addToInventory(data: {
    business_id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    transaction_type: InventoryTransactionType;
    reference_id?: number;
    reference_type?: string;
    notes?: string;
    user_id: number;
  }) {
    // Actualizar BusinessProduct
    await prisma.businessProduct.upsert({
      where: {
        businessId_productId: {
          businessId: data.business_id,
          productId: data.product_id
        }
      },
      update: {
        currentStock: {
          increment: data.quantity
        },
        availableStock: {
          increment: data.quantity
        },
        lastRestock: new Date()
      },
      create: {
        businessId: data.business_id,
        productId: data.product_id,
        currentStock: data.quantity,
        availableStock: data.quantity,
        lastRestock: new Date(),
        customPrice: data.unit_cost
      }
    });

    // Registrar transacción de inventario
    await prisma.inventoryTransaction.create({
      data: {
        businessId: data.business_id,
        productId: data.product_id,
        userId: data.user_id,
        transactionType: data.transaction_type,
        quantity: data.quantity,
        unitCost: data.unit_cost,
        totalCost: data.quantity * data.unit_cost,
        referenceId: data.reference_id,
        referenceType: data.reference_type,
        notes: data.notes
      }
    });
  },

  /**
   * Remover stock del inventario
   */
  async removeFromInventory(data: {
    business_id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    transaction_type: InventoryTransactionType;
    reference_id?: number;
    reference_type?: string;
    notes?: string;
    user_id: number;
  }) {
    // Verificar stock disponible
    const businessProduct = await prisma.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId: data.business_id,
          productId: data.product_id
        }
      }
    });

    if (!businessProduct || businessProduct.availableStock < data.quantity) {
      throw new Error('Stock insuficiente');
    }

    // Actualizar BusinessProduct
    await prisma.businessProduct.update({
      where: {
        businessId_productId: {
          businessId: data.business_id,
          productId: data.product_id
        }
      },
      data: {
        currentStock: {
          decrement: data.quantity
        },
        availableStock: {
          decrement: data.quantity
        }
      }
    });

    // Registrar transacción de inventario
    await prisma.inventoryTransaction.create({
      data: {
        businessId: data.business_id,
        productId: data.product_id,
        userId: data.user_id,
        transactionType: data.transaction_type,
        quantity: -data.quantity, // Negativo para salidas
        unitCost: data.unit_cost,
        totalCost: data.quantity * data.unit_cost,
        referenceId: data.reference_id,
        referenceType: data.reference_type,
        notes: data.notes
      }
    });
  },

  /**
   * Ajuste de inventario (mermas, daños, etc.)
   */
  async adjustInventory(data: AdjustInventoryData) {
    if (data.quantity > 0) {
      // Ajuste positivo (entrada)
      await this.addToInventory({
        business_id: data.business_id,
        product_id: data.product_id,
        quantity: data.quantity,
        unit_cost: 0, // Para ajustes no hay costo
        transaction_type: 'ADJUSTMENT',
        notes: data.reason,
        user_id: data.user_id
      });
    } else {
      // Ajuste negativo (salida)
      await this.removeFromInventory({
        business_id: data.business_id,
        product_id: data.product_id,
        quantity: Math.abs(data.quantity),
        unit_cost: 0,
        transaction_type: 'ADJUSTMENT',
        notes: data.reason,
        user_id: data.user_id
      });
    }
  },

  /**
   * Transferencia entre negocios
   */
  async transferInventory(data: TransferInventoryData) {
    // Remover del negocio origen
    await this.removeFromInventory({
      business_id: data.from_business_id,
      product_id: data.product_id,
      quantity: data.quantity,
      unit_cost: 0,
      transaction_type: 'TRANSFER',
      notes: `Transferencia a negocio ${data.to_business_id}`,
      user_id: data.user_id
    });

    // Agregar al negocio destino
    await this.addToInventory({
      business_id: data.to_business_id,
      product_id: data.product_id,
      quantity: data.quantity,
      unit_cost: 0,
      transaction_type: 'TRANSFER',
      notes: `Transferencia desde negocio ${data.from_business_id}`,
      user_id: data.user_id
    });
  },

  /**
   * Obtener stock actual de un producto
   */
  async getCurrentStock(businessId: number, productId: number) {
    const businessProduct = await prisma.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId: businessId,
          productId: productId
        }
      },
      include: {
        product: true
      }
    });

    return businessProduct || {
      currentStock: 0,
      availableStock: 0,
      reservedStock: 0,
      product: null
    };
  },

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts(businessId: number) {
    // Primero obtener todos los productos del negocio con su información
    const businessProducts = await prisma.businessProduct.findMany({
      where: {businessId: businessId},
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    // Filtrar los que tienen stock bajo
    const lowStockProducts = businessProducts.filter(bp =>
      bp.currentStock <= bp.product.minStock
    );

    return lowStockProducts;
  },

  

  /**
   * Generar reporte de inventario
   */
  async generateInventoryReport(businessId: number) {
    const products = await prisma.businessProduct.findMany({
      where: {businessId: businessId},
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    const report = {
      total_products: products.length,
      total_value: 0,
      low_stock_products: 0,
      out_of_stock_products: 0,
      products: products.map(bp => ({
        id: bp.product.id,
        name: bp.product.name,
        category: bp.product.category.name,
        current_stock: bp.currentStock,
        available_stock: bp.availableStock,
        reserved_stock: bp.reservedStock,
        min_stock: bp.product.minStock,
        max_stock: bp.product.maxStock,
        reorder_point: bp.product.reorderPoint,
        status: this.getStockStatus(bp.currentStock, bp.product.minStock, bp.product.maxStock || undefined),
        value: bp.currentStock * Number(bp.product.costPrice)
      }))
    };

    report.total_value = report.products.reduce((sum, p) => sum + p.value, 0);
    report.low_stock_products = report.products.filter(p => p.status === 'LOW').length;
    report.out_of_stock_products = report.products.filter(p => p.status === 'OUT_OF_STOCK').length;

    return report;
  },

  /**
   * Determinar estado del stock
   */
  getStockStatus(currentStock: number, minStock: number, maxStock?: number): string {
    if (currentStock === 0) return 'OUT_OF_STOCK';
    if (currentStock <= minStock) return 'LOW';
    if (maxStock && currentStock >= maxStock) return 'HIGH';
    return 'NORMAL';
  }
};