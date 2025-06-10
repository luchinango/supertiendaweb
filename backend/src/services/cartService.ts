import prisma from '../config/prisma';
import {CartStatus, Cart, CartItem} from '../../prisma/generated';
import {BusinessError} from '../utils/errors';

export class CartService {
  async getActiveCart(userId: number, businessId: number): Promise<Cart | null> {
    return prisma.cart.findFirst({
      where: {
        userId: userId,
        businessId: businessId,
        status: CartStatus.ACTIVE
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  }

  async createCart(userId: number, businessId: number): Promise<Cart> {
    const existingCart = await this.getActiveCart(userId, businessId);
    if (existingCart) {
      throw new BusinessError('Ya existe un carrito activo para este negocio');
    }

    return prisma.cart.create({
      data: {
        userId: userId,
        businessId: businessId,
        status: CartStatus.ACTIVE
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  }

  async addItem(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        status: CartStatus.ACTIVE
      },
      include: {
        business: {
          include: {
            businessProducts: {
              where: {
                productId: productId
              }
            }
          }
        }
      }
    });

    if (!cart) {
      throw new BusinessError('Carrito no encontrado o no está activo');
    }

    const businessProduct = cart.business.businessProducts[0];
    if (!businessProduct) {
      throw new BusinessError('El producto no está disponible en este negocio');
    }

    if (businessProduct.currentStock < quantity) {
      throw new BusinessError('Stock insuficiente');
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId
        }
      }
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity,
          unitPrice: businessProduct.customPrice
        }
      });
    }

    let taxRate = 0.13;
    let totalPrice = quantity * Number(businessProduct.customPrice);
    let taxAmount = totalPrice * taxRate;
    return prisma.cartItem.create({
      data: {
        cartId: cartId,
        productId: productId,
        quantity: quantity,
        unitPrice: businessProduct.customPrice,
        taxRate,
        totalPrice,
        taxAmount
      }
    });
  }

  async updateItemQuantity(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId
        }
      },
      include: {
        cart: {
          include: {
            business: {
              include: {
                businessProducts: {
                  where: {
                    productId: productId
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cartItem) {
      throw new BusinessError('Item no encontrado en el carrito');
    }

    if (cartItem.cart.status !== CartStatus.ACTIVE) {
      throw new BusinessError('El carrito no está activo');
    }

    const businessProduct = cartItem.cart.business.businessProducts[0];
    if (businessProduct.currentStock < quantity) {
      throw new BusinessError('Stock insuficiente');
    }

    return prisma.cartItem.update({
      where: {
        id: cartItem.id
      },
      data: {
        quantity: quantity,
        unitPrice: businessProduct.customPrice
      }
    });
  }

  async removeItem(cartId: number, productId: number): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId
        }
      },
      include: {
        cart: true
      }
    });

    if (!cartItem) {
      throw new BusinessError('Item no encontrado en el carrito');
    }

    if (cartItem.cart.status !== CartStatus.ACTIVE) {
      throw new BusinessError('El carrito no está activo');
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id
      }
    });
  }

  async clearCart(cartId: number): Promise<void> {
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        status: CartStatus.ACTIVE
      }
    });

    if (!cart) {
      throw new BusinessError('Carrito no encontrado o no está activo');
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cartId
      }
    });
  }

  async getCartTotal(cartId: number): Promise<number> {
    const items = await prisma.cartItem.findMany({
      where: {
        cartId: cartId
      }
    });

    return items.reduce((total, item) => {
      return total + (Number(item.unitPrice) * item.quantity);
    }, 0);
  }
}

export const cartService = new CartService();
