import prisma from '../config/prisma';
import {CartStatus, PaymentMethod, DocumentType, Department} from '../../prisma/generated';
import {cartService} from './cartService';
import {saleService} from './saleService';
import {customerService} from './customerService';
import { ProductService } from './ProductService';
import {cashRegisterService} from './cashRegisterService';
import { BusinessProductService } from './BusinessProductService';
import { DIContainer } from '../container/DIContainer';
import { ProductRepository } from '../repositories/ProductRepository';
import {
  ProductSearchResult,
} from '../types/api';

const businessProductService = new BusinessProductService(DIContainer.getBusinessProductRepository());
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);

export interface CartItemInput {
  productId: number;
  quantity: number;
}

export interface CustomerInput {
  firstName: string;
  lastName?: string;
  documentType: DocumentType;
  documentNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
}

export interface PaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SaleInput {
  customerId?: number;
  customerData?: CustomerInput;
  items: CartItemInput[];
  payment: PaymentInput;
  discountAmount?: number;
  notes?: string;
}

export interface StartSaleInput {
  businessId: number;
  userId: number;
  customerId?: number;
}

export interface AddItemInput {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface UpdateQuantityInput {
  cartId: number;
  productId: number;
  quantity: number;
}

export interface CompleteSaleInput {
  cartId: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CancelSaleInput {
  cartId: number;
  reason?: string;
}

export interface SearchProductsInput {
  query: string;
  businessId?: number;
}

export interface QuickProductsInput {
  businessId?: number;
  limit?: number;
}

export interface QuickProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
}

export class POSService {
  /**
   * Iniciar una nueva venta (crear carrito)
   */
  async startSale(input: StartSaleInput) {
    const {businessId, userId} = input;

    const cashRegister = await cashRegisterService.getCurrentOpenCashRegister(businessId, userId);
    if (!cashRegister) {
      throw new Error('No hay una caja registradora abierta para este usuario');
    }

    const cart = await cartService.createCart(userId, businessId);

    return {
      success: true,
      cart,
      cashRegister
    };
  }

  /**
   * Asignar cliente al carrito (para facturación)
   */
  async assignCustomerToCart(cartId: number, customerId: number) {
    if (!cartId || !customerId) {
      throw new Error('cartId y customerId son requeridos');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no encontrado o no está activo');
    }

    await prisma.cart.update({
      where: {id: cartId},
      data: {customerId}
    });

    return {
      success: true,
      message: 'Cliente asignado al carrito',
      cart: await prisma.cart.findUnique({where: {id: cartId}})
    };
  }

  /**
   * Agregar producto al carrito
   */
  async addItemToCart(input: AddItemInput) {
    const {cartId, productId, quantity} = input;

    if (!cartId || !productId || !quantity || quantity <= 0) {
      throw new Error('Parámetros inválidos: cartId, productId y quantity son requeridos');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no encontrado o no está activo');
    }

    const product = await productService.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const businessProduct = await prisma.businessProduct.findFirst({
      where: {
        businessId: cart.businessId,
        productId: productId
      }
    });

    if (!businessProduct) {
      throw new Error('Producto no disponible en este negocio');
    }

    const currentStock = businessProduct.currentStock;
    if (currentStock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${currentStock}`);
    }

    const cartItem = await cartService.addItem(cartId, productId, quantity);

    return {
      success: true,
      cartItem,
      updatedCart: await prisma.cart.findUnique({where: {id: cartId}})
    };
  }

  /**
   * Remover producto del carrito
   */
  async removeItemFromCart(cartId: number, productId: number) {
    // Validar parámetros
    if (!cartId || !productId) {
      throw new Error('cartId y productId son requeridos');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no encontrado o no está activo');
    }

    await cartService.removeItem(cartId, productId);

    return {
      success: true,
      message: 'Producto removido del carrito',
      updatedCart: await prisma.cart.findUnique({where: {id: cartId}})
    };
  }

  /**
   * Actualizar cantidad de producto en el carrito
   */
  async updateItemQuantity(input: UpdateQuantityInput) {
    const {cartId, productId, quantity} = input;

    if (!cartId || !productId || !quantity || quantity <= 0) {
      throw new Error('Parámetros inválidos: cartId, productId y quantity son requeridos');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no encontrado o no está activo');
    }

    const businessProduct = await prisma.businessProduct.findFirst({
      where: {
        businessId: cart.businessId,
        productId: productId
      }
    });

    if (!businessProduct) {
      throw new Error('Producto no disponible en este negocio');
    }

    const currentStock = businessProduct.currentStock;
    if (currentStock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${currentStock}`);
    }

    const cartItem = await cartService.updateItemQuantity(cartId, productId, quantity);

    return {
      success: true,
      cartItem,
      updatedCart: await prisma.cart.findUnique({where: {id: cartId}})
    };
  }

  /**
   * Registrar nuevo cliente
   */
  async registerCustomer(customerData: CustomerInput, businessId: number = 1) {
    const customer = await customerService.createCustomer({
      ...customerData,
      businessId,
      isActive: true
    });

    return {
      success: true,
      customer
    };
  }

  /**
   * Obtener resumen de venta
   */
  async getSaleSummary(cartId: number) {
    const cart = await prisma.cart.findUnique({
      where: {id: cartId},
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    let total = 0;
    const items = cart.items.map(item => {
      const subtotal = item.quantity * Number(item.unitPrice);
      total += subtotal;
      return {
        ...item,
        subtotal
      };
    });

    return {
      cart,
      items,
      total,
      customer: cart.customer
    };
  }

  /**
   * Buscar productos para agregar al carrito
   */
  async searchProducts(input: SearchProductsInput): Promise<ProductSearchResult[]> {
    const {query, businessId} = input;
    const products = await productService.search(query.trim(), businessId || 1);
    return products;
  }

  /**
   * Obtener productos más vendidos/populares
   */
  async getQuickProducts(input: QuickProductsInput): Promise<QuickProduct[]> {
    const {businessId, limit = 10} = input;

    // Por ahora devolver productos aleatorios del negocio
    const businessProducts = await prisma.businessProduct.findMany({
      where: {businessId: businessId || 1},
      include: {
        product: true
      },
      take: limit,
      orderBy: {
        currentStock: 'desc'
      }
    });

    return businessProducts.map(bp => ({
      id: bp.productId,
      name: bp.product.name,
      price: Number(bp.customPrice),
      stock: bp.currentStock,
      barcode: bp.product.barcode || undefined
    }));
  }

  /**
   * Procesar venta completa en una sola operación
   */
  async processSale(saleInput: SaleInput, userId: number) {
    const {customerId, customerData, items, payment, discountAmount = 0, notes} = saleInput;

    if (!items || items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    if (!payment || !payment.method) {
      throw new Error('Método de pago es requerido');
    }

    let finalCustomerId = customerId;
    if (!customerId && customerData) {
      throw new Error('Cliente debe estar registrado previamente');
    }

    const cartResult = await this.startSale({
      businessId: 1,
      userId,
      customerId: finalCustomerId
    });
    const cart = cartResult.cart;

    for (const item of items) {
      await this.addItemToCart({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity
      });
    }


    const sale = await this.completeSale({
      cartId: cart.id,
      paymentMethod: payment.method,
      notes
    });

    return {
      success: true,
      sale: sale.sale,
      cart: await prisma.cart.findUnique({where: {id: cart.id}})
    };
  }

  /**
   * Completar venta (pago y facturación)
   */
  async completeSale(input: CompleteSaleInput) {
    const {cartId, paymentMethod, notes} = input;

    if (!cartId || !paymentMethod) {
      throw new Error('cartId y paymentMethod son requeridos');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no válido para completar venta');
    }

    const items = await prisma.cartItem.findMany({where: {cartId}});
    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const sale = await saleService.create({
      businessId: cart.businessId,
      cartId: cart.id,
      userId: cart.userId,
      customerId: cart.customerId || undefined,
      paymentMethod,
      notes
    });

    return {
      success: true,
      sale,
      message: 'Venta completada exitosamente'
    };
  }

  /**
   * Cancelar venta
   */
  async cancelSale(input: CancelSaleInput) {
    const {cartId, reason} = input;

    if (!cartId) {
      throw new Error('cartId es requerido');
    }

    const cart = await prisma.cart.findFirst({
      where: {id: cartId, status: CartStatus.ACTIVE}
    });
    if (!cart) {
      throw new Error('Carrito no encontrado o no está activo');
    }

    await prisma.cart.update({
      where: {id: cartId},
      data: {status: CartStatus.ABANDONED}
    });

    return {
      success: true,
      message: 'Venta cancelada exitosamente',
      reason
    };
  }
}

export const posService = new POSService();
