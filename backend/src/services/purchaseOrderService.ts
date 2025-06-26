import prisma from '../config/prisma';
import { DIContainer } from '../container/DIContainer';
import { ValidationError, NotFoundError } from '../errors';
import { PurchaseOrderStatus } from '../../prisma/generated';
import { IPurchaseOrderService } from '../interfaces/services/IPurchaseOrderService';

export interface CreatePurchaseOrderRequest {
  businessId: number;
  supplierId: number;
  poNumber?: string;
  orderDate?: Date;
  expectedDate?: Date;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: number;
  poNumber?: string;
  status?: PurchaseOrderStatus;
  orderDate?: Date;
  expectedDate?: Date;
  notes?: string;
}

export interface PurchaseOrderResponse {
  id: number;
  businessId: number;
  supplierId: number;
  poNumber?: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseOrderItemResponse[];
  supplier?: any;
  business?: any;
}

export interface PurchaseOrderItemResponse {
  id: number;
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  createdAt: Date;
  product?: any;
}

export class PurchaseOrderService implements IPurchaseOrderService {

  async create(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
    if (!data.businessId || data.businessId <= 0) {
      throw new ValidationError('El ID del negocio es requerido y debe ser válido');
    }

    if (!data.supplierId || data.supplierId <= 0) {
      throw new ValidationError('El ID del proveedor es requerido y debe ser válido');
    }

    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Debe incluir al menos un item en la orden de compra');
    }

    // Validar items
    for (const item of data.items) {
      if (!item.productId || item.productId <= 0) {
        throw new ValidationError('Todos los items deben tener un ID de producto válido');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new ValidationError('Todos los items deben tener una cantidad mayor a 0');
      }
      if (!item.unitCost || item.unitCost <= 0) {
        throw new ValidationError('Todos los items deben tener un costo unitario mayor a 0');
      }
    }

    // Calcular totales
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const taxAmount = subtotal * 0.13; // IVA 13%
    const totalAmount = subtotal + taxAmount;

    const businessProductService = DIContainer.getBusinessProductService();

    // Crear la orden de compra con sus items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        businessId: data.businessId,
        supplierId: data.supplierId,
        poNumber: data.poNumber,
        status: 'DRAFT',
        orderDate: data.orderDate || new Date(),
        expectedDate: data.expectedDate,
        subtotal,
        taxAmount,
        totalAmount,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        business: true
      }
    });

    // INTEGRACIÓN CON BUSINESS PRODUCT
    // Para cada item, crear o actualizar BusinessProduct si no existe
    for (const item of data.items) {
      let businessProduct = await businessProductService.findByBusinessAndProduct(
        data.businessId,
        item.productId
      );

      if (!businessProduct) {
        // Crear BusinessProduct si no existe (sin stock inicial, se agregará al recibir)
        await businessProductService.create({
          businessId: data.businessId,
          productId: item.productId,
          customPrice: item.unitCost * 1.3, // Margen del 30% por defecto
          currentStock: 0, // Sin stock hasta que se reciba
          reservedStock: 0,
          availableStock: 0,
        });
      }
    }

    return this.mapToResponse(purchaseOrder);
  }

  async update(id: number, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) {
      throw new NotFoundError('Orden de compra no encontrada');
    }

    // No permitir editar órdenes ya recibidas
    if (existingOrder.status === 'RECEIVED') {
      throw new ValidationError('No se puede editar una orden de compra ya recibida');
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: data.supplierId,
        poNumber: data.poNumber,
        status: data.status,
        orderDate: data.orderDate,
        expectedDate: data.expectedDate,
        notes: data.notes,
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        business: true
      }
    });

    return this.mapToResponse(updatedOrder);
  }

  async findById(id: number): Promise<PurchaseOrderResponse | null> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        business: true
      }
    });

    return purchaseOrder ? this.mapToResponse(purchaseOrder) : null;
  }

  async findMany(
    paginationParams: any,
    additionalFilters: any = {}
  ): Promise<{ data: PurchaseOrderResponse[], meta: any }> {
    const {
      page = 1,
      limit = 10,
      search
    } = paginationParams;

    const {
      businessId,
      status,
      supplierId
    } = additionalFilters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (businessId) where.businessId = businessId;
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          supplier: true,
          business: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(po => this.mapToResponse(po)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  }

  async delete(id: number): Promise<void> {
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      throw new NotFoundError('Orden de compra no encontrada');
    }

    if (existingOrder.status === 'RECEIVED') {
      throw new ValidationError('No se puede eliminar una orden de compra ya recibida');
    }

    await prisma.purchaseOrder.delete({
      where: { id }
    });
  }

  async approvePurchaseOrder(id: number, approvedBy: number): Promise<PurchaseOrderResponse> {
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      throw new NotFoundError('Orden de compra no encontrada');
    }

    if (existingOrder.status !== 'DRAFT') {
      throw new ValidationError('Solo se pueden aprobar órdenes en estado DRAFT');
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        business: true
      }
    });

    return this.mapToResponse(updatedOrder);
  }

  private mapToResponse(purchaseOrder: any): PurchaseOrderResponse {
    return {
      id: purchaseOrder.id,
      businessId: purchaseOrder.businessId,
      supplierId: purchaseOrder.supplierId,
      poNumber: purchaseOrder.poNumber,
      status: purchaseOrder.status,
      orderDate: purchaseOrder.orderDate,
      expectedDate: purchaseOrder.expectedDate,
      receivedDate: purchaseOrder.receivedDate,
      subtotal: Number(purchaseOrder.subtotal),
      taxAmount: Number(purchaseOrder.taxAmount),
      totalAmount: Number(purchaseOrder.totalAmount),
      notes: purchaseOrder.notes,
      createdAt: purchaseOrder.createdAt,
      updatedAt: purchaseOrder.updatedAt,
      items: purchaseOrder.items?.map((item: any) => ({
        id: item.id,
        purchaseOrderId: item.purchaseOrderId,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: Number(item.unitCost),
        receivedQuantity: item.receivedQuantity,
        createdAt: item.createdAt,
        product: item.product
      })),
      supplier: purchaseOrder.supplier,
      business: purchaseOrder.business
    };
  }
}
