import { PrismaClient } from '../../prisma/generated';
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse, CategoryStats, CategoryTreeNode } from '../types/categoryTypes';
import { PaginationParams } from '../types/pagination';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToCategoryResponse(category: any): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      deletedBy: category.deletedBy,
      productCount: category._count?.products || 0,
      parent: category.parent ? this.mapToCategoryResponse(category.parent) : undefined,
      children: category.childrens ? category.childrens.map((child: any) => this.mapToCategoryResponse(child)) : undefined
    };
  }

  async findById(id: number): Promise<CategoryResponse | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        childrens: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return category ? this.mapToCategoryResponse(category) : null;
  }

  async findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      isActive?: boolean;
      parentId?: number;
      hasProducts?: boolean;
      search?: string;
    }
  ): Promise<CategoryListResponse> {
    const { page, limit } = paginationParams;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (additionalFilters?.isActive !== undefined) {
      where.isActive = additionalFilters.isActive;
    }

    if (additionalFilters?.parentId !== undefined) {
      where.parentId = additionalFilters.parentId;
    }

    if (additionalFilters?.search) {
      where.OR = [
        { name: { contains: additionalFilters.search, mode: 'insensitive' } },
        { description: { contains: additionalFilters.search, mode: 'insensitive' } }
      ];
    }

    if (additionalFilters?.hasProducts) {
      where.products = {
        some: {}
      };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          parent: true,
          _count: {
            select: { products: true, childrens: true }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.category.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: categories.map(category => this.mapToCategoryResponse(category)),
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

  async create(data: CreateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        createdBy: 1,
        updatedBy: 1
      },
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToCategoryResponse(category);
  }

  async update(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedBy: 1,
        updatedAt: new Date()
      },
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return this.mapToCategoryResponse(category);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: 1
      }
    });
  }

  async findByName(name: string, excludeId?: number): Promise<CategoryResponse | null> {
    const where: any = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const category = await this.prisma.category.findFirst({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return category ? this.mapToCategoryResponse(category) : null;
  }

  async findChildren(parentId: number): Promise<CategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      include: {
        _count: {
          select: { products: true, childrens: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(category => this.mapToCategoryResponse(category));
  }

  async findParents(categoryId: number): Promise<CategoryResponse[]> {
    const parents: CategoryResponse[] = [];
    let currentId = categoryId;

    while (currentId) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentId },
        include: {
          parent: true,
          _count: {
            select: { products: true }
          }
        }
      });

      if (!category || !category.parent) break;

      parents.unshift(this.mapToCategoryResponse(category.parent));
      currentId = category.parent.id;
    }

    return parents;
  }

  async findTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        childrens: {
          include: {
            childrens: {
              include: {
                childrens: true,
                _count: { select: { products: true } }
              }
            },
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(category => this.buildTreeNode(category));
  }

  private buildTreeNode(category: any): CategoryTreeNode {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
      children: category.childrens ? category.childrens.map((child: any) => this.buildTreeNode(child)) : []
    };
  }

  async findWithProductCount(): Promise<CategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories.map(category => this.mapToCategoryResponse(category));
  }

  async activate(id: number): Promise<CategoryResponse> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<CategoryResponse> {
    return this.update(id, { isActive: false });
  }

  async getStats(): Promise<CategoryStats> {
    const [
      totalCategories,
      activeCategories,
      categoriesWithProducts,
      topCategories
    ] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.category.count({
        where: {
          products: {
            some: {}
          }
        }
      }),
      this.prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    const totalProducts = await this.prisma.product.count();
    const averageProductsPerCategory = totalCategories > 0 ? totalProducts / totalCategories : 0;

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      categoriesWithProducts,
      averageProductsPerCategory: Math.round(averageProductsPerCategory * 100) / 100,
      topCategoriesByProducts: topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products
      }))
    };
  }

  async hasProducts(id: number): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id }
    });
    return count > 0;
  }

  async hasChildren(id: number): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { parentId: id }
    });
    return count > 0;
  }

  async isValidParent(parentId: number, childId: number): Promise<boolean> {
    if (parentId === childId) return false;

    let currentId = parentId;
    while (currentId) {
      if (currentId === childId) return false;

      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });

      if (!parent || !parent.parentId) break;
      currentId = parent.parentId;
    }

    return true;
  }
}