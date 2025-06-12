import prisma from '../config/prisma';
import {ProductStatus} from '../../prisma/generated';
import {Decimal} from '@prisma/client/runtime/library';

import {
  ProductQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse
} from '../types/productTypes';

export class ProductService {
  private convertToProductResponse(product: any): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      sku: product.sku || '',
      barcode: product.barcode || '',
      brand: product.brand,
      unit: product.unit,
      minStock: product.minStock,
      maxStock: product.maxStock,
      reorderPoint: product.reorderPoint,
      expiryDate: product.expiryDate,
      status: product.status,
      categoryId: product.categoryId,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description
      } : undefined
    };
  }

  async getProductById(id: number): Promise<ProductResponse | null> {
    const product = await prisma.product.findUnique({
      where: {id},
      include: {category: true}
    });
    return product ? this.convertToProductResponse(product) : null;
  }

  async searchProducts(query: string, businessId: number): Promise<ProductResponse[]> {
    const products = await prisma.product.findMany({
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
        },
        category: true
      }
    });
    return products.map(product => this.convertToProductResponse(product));
  }

  async getQuickProducts(businessId: number, limit: number): Promise<ProductResponse[]> {
    const products = await prisma.product.findMany({
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
        },
        category: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    return products.map(product => this.convertToProductResponse(product));
  }

  async getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      status,
      isActive,
      minStock,
      maxStock,
      minPrice,
      maxPrice
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {sku: {contains: search, mode: 'insensitive'}},
        {barcode: {contains: search, mode: 'insensitive'}},
        {brand: {contains: search, mode: 'insensitive'}}
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status as ProductStatus;
    if (isActive !== undefined) where.isActive = isActive;
    if (minStock !== undefined) where.minStock = {gte: minStock};
    if (maxStock !== undefined) where.maxStock = {lte: maxStock};
    if (minPrice !== undefined) where.sellingPrice = {gte: new Decimal(minPrice)};
    if (maxPrice !== undefined) where.sellingPrice = {lte: new Decimal(maxPrice)};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {category: true},
        skip,
        take: limit,
        orderBy: {createdAt: 'desc'}
      }),
      prisma.product.count({where})
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      products: products.map(product => this.convertToProductResponse(product)),
      total,
      page,
      totalPages,
      limit
    };
  }

  async checkBarcodeExists(barcode: string): Promise<ProductResponse | null> {
    const product = await prisma.product.findUnique({
      where: {barcode}
    });
    return product ? this.convertToProductResponse(product) : null;
  }

  async createProduct(productData: CreateProductRequest): Promise<ProductResponse> {
    const data: any = {
      name: productData.name,
      costPrice: new Decimal(productData.costPrice),
      sellingPrice: new Decimal(productData.sellingPrice),
      sku: productData.sku,
      barcode: productData.barcode,
      status: productData.status || ProductStatus.ACTIVE
    };

    if (productData.brand !== undefined) data.brand = productData.brand;
    if (productData.unit !== undefined) data.unit = productData.unit;
    if (productData.minStock !== undefined) data.minStock = productData.minStock;
    if (productData.maxStock !== undefined) data.maxStock = productData.maxStock;
    if (productData.reorderPoint !== undefined) data.reorderPoint = productData.reorderPoint;
    if (productData.expiryDate !== undefined) data.expiryDate = productData.expiryDate;
    if (productData.categoryId !== undefined) data.categoryId = productData.categoryId;
    if (productData.description !== undefined) data.description = productData.description;

    const product = await prisma.product.create({
      data
    });
    return this.convertToProductResponse(product);
  }

  async updateProduct(id: number, productData: UpdateProductRequest): Promise<ProductResponse> {
    const data: any = {...productData};

    if (productData.costPrice !== undefined) {
      data.costPrice = new Decimal(productData.costPrice);
    }
    if (productData.sellingPrice !== undefined) {
      data.sellingPrice = new Decimal(productData.sellingPrice);
    }

    const product = await prisma.product.update({
      where: {id},
      data
    });
    return this.convertToProductResponse(product);
  }

  async softDeleteProduct(id: number): Promise<ProductResponse> {
    const product = await prisma.product.update({
      where: {id},
      data: {deletedAt: new Date(), isActive: false, status: ProductStatus.INACTIVE}
    });
    return this.convertToProductResponse(product);
  }
}

export const productService = new ProductService();
