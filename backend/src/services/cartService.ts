import { PrismaClient, CartStatus, Cart, CartItem } from '@prisma/client';
import { BusinessError } from '../utils/errors';

const prisma = new PrismaClient();

export class CartService {
  async getActiveCart(userId: number, businessId: number): Promise<Cart | null> {
    return prisma.cart.findFirst({
      where: {
        user_id: userId,
        business_id: businessId,
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
    // Verificar si ya existe un carrito activo
    const existingCart = await this.getActiveCart(userId, businessId);
    if (existingCart) {
      throw new BusinessError('Ya existe un carrito activo para este negocio');
    }

    return prisma.cart.create({
      data: {
        user_id: userId,
        business_id: businessId,
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
    // Verificar que el carrito existe y está activo
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        status: CartStatus.ACTIVE
      },
      include: {
        business: {
          include: {
            products: {
              where: {
                product_id: productId
              }
            }
          }
        }
      }
    });

    if (!cart) {
      throw new BusinessError('Carrito no encontrado o no está activo');
    }

    // Verificar que el producto pertenece al negocio
    const businessProduct = cart.business.products[0];
    if (!businessProduct) {
      throw new BusinessError('El producto no está disponible en este negocio');
    }

    // Verificar stock
    if (businessProduct.actualStock < quantity) {
      throw new BusinessError('Stock insuficiente');
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cartId,
          product_id: productId
        }
      }
    });

    if (existingItem) {
      // Actualizar cantidad
      return prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity,
          price: businessProduct.customPrice
        }
      });
    }

    // Agregar nuevo item
    return prisma.cartItem.create({
      data: {
        cart_id: cartId,
        product_id: productId,
        quantity: quantity,
        price: businessProduct.customPrice
      }
    });
  }

  async updateItemQuantity(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cartId,
          product_id: productId
        }
      },
      include: {
        cart: {
          include: {
            business: {
              include: {
                products: {
                  where: {
                    product_id: productId
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

    // Verificar stock
    const businessProduct = cartItem.cart.business.products[0];
    if (businessProduct.actualStock < quantity) {
      throw new BusinessError('Stock insuficiente');
    }

    return prisma.cartItem.update({
      where: {
        id: cartItem.id
      },
      data: {
        quantity: quantity,
        price: businessProduct.customPrice
      }
    });
  }

  async removeItem(cartId: number, productId: number): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cartId,
          product_id: productId
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
        cart_id: cartId
      }
    });
  }

  async getCartTotal(cartId: number): Promise<number> {
    const items = await prisma.cartItem.findMany({
      where: {
        cart_id: cartId
      }
    });

    return items.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);
  }
}

export const cartService = new CartService();