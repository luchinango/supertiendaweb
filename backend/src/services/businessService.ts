import prisma from '../config/prisma';
import {BusinessStatus, BusinessType, Department, Currency} from '../../generated';
import {NotFoundError} from '../errors';
import {CreateBusinessData, UpdateBusinessData, BusinessFilters} from '../types/businessTypes';

class BusinessService {
  async create(data: CreateBusinessData) {
    return prisma.business.create({
      data: {
        ...data,
        status: data.status || BusinessStatus.ACTIVE,
        businessType: data.businessType || 'PERSONA_NATURAL',
        department: data.department || 'LA_PAZ',
        country: data.country || 'Bolivia',
        timezone: data.timezone || 'America/La_Paz',
        currency: data.currency || 'BOB',
        defaultTaxRate: data.defaultTaxRate || 13,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async update(id: number, data: UpdateBusinessData) {
    const business = await prisma.business.findUnique({
      where: {id}
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    return prisma.business.update({
      where: {id},
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async getById(id: number) {
    const business = await prisma.business.findUnique({
      where: {id},
      include: {
        businessProducts: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        employees: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        fiscalSettings: true
      }
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    return business;
  }

  async getBusinesses(paginationParams: any, additionalFilters: any = {}) {
    const {
      page = 1,
      limit = 10,
      search
    } = paginationParams;

    const {
      status,
      businessType,
      department,
      id
    } = additionalFilters;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Aislamiento multiempresa: si se provee id, limitar a esa empresa
    if (id != null) where.id = id;
    if (status) where.status = status;
    if (businessType) where.businessType = businessType;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {legalName: {contains: search, mode: 'insensitive'}},
        {nit: {contains: search, mode: 'insensitive'}}
      ];
    }

    const [data, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          businessProducts: {
            include: {
              product: {include: {category: true}}
            }
          },
          employees: {
            include: {
              user: {select: {id: true, username: true}}
            }
          },
          fiscalSettings: true
        },
        skip,
        take: limit,
        orderBy: [{status: 'asc'}, {name: 'asc'}]
      }),
      prisma.business.count({where})
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
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

  async delete(id: number) {
    const business = await prisma.business.findUnique({
      where: {id}
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    return prisma.business.update({
      where: {id},
      data: {
        status: 'INACTIVE',
        updatedAt: new Date()
      }
    });
  }

  async addProductToBusiness(businessId: number, productId: number, customPrice?: number) {
    const [business, product] = await Promise.all([
      prisma.business.findUnique({where: {id: businessId}}),
      prisma.product.findUnique({where: {id: productId}})
    ]);

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    const active = await prisma.businessProduct.findFirst({
      where: { businessId, productId, deletedAt: null },
    });
    if (active) {
      return prisma.businessProduct.update({
        where: { id: active.id },
        data: {
          customPrice: customPrice || 0,
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });
    }
    // Soft-deleted: no reactivar; crear fila activa nueva
    return prisma.businessProduct.create({
      data: {
        businessId,
        productId,
        customPrice: customPrice || 0,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        version: 1,
      },
    });
  }

  async updateBusinessProduct(businessId: number, productId: number, data: {
    customPrice?: number;
    currentStock?: number;
    reservedStock?: number;
    availableStock?: number;
  }) {
    const businessProduct = await prisma.businessProduct.findFirst({
      where: { businessId, productId, deletedAt: null },
    });

    if (!businessProduct) {
      throw new NotFoundError('Producto no encontrado en el negocio');
    }

    return prisma.businessProduct.update({
      where: { id: businessProduct.id },
      data: {
        ...data,
        updatedAt: new Date(),
        version: { increment: 1 },
      }
    });
  }

  async removeProductFromBusiness(businessId: number, productId: number) {
    const businessProduct = await prisma.businessProduct.findFirst({
      where: { businessId, productId, deletedAt: null },
    });
    if (!businessProduct) {
      throw new NotFoundError('Producto no encontrado en el negocio');
    }
    return prisma.businessProduct.update({
      where: { id: businessProduct.id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }

  async getBusinessProducts(businessId: number) {
    return prisma.businessProduct.findMany({
      where: { businessId, deletedAt: null },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
  }
}

export default new BusinessService();
