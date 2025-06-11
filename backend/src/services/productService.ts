import prisma from '../config/prisma';

export class ProductService {
  async getProductById(id: number) {
    return await prisma.product.findUnique({
      where: {id}
    });
  }

  async searchProducts(query: string, businessId: number) {
    return await prisma.product.findMany({
      where: {
        OR: [
          {name: {contains: query, mode: 'insensitive'}},
          {sku: {contains: query, mode: 'insensitive'}}
        ],
        businessProducts: {
          some: {
            businessId
          }
        }
      },
      include: {
        businessProducts: {
          where: {businessId}
        }
      }
    });
  }

  async getQuickProducts(businessId: number, limit: number) {
    return await prisma.product.findMany({
      where: {
        businessProducts: {
          some: {
            businessId
          }
        }
      },
      include: {
        businessProducts: {
          where: {businessId}
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const productService = new ProductService();
