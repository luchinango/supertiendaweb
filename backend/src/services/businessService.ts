import prisma from '../config/prisma';
import {BusinessStatus, BusinessType, Department, Currency} from '../../prisma/generated';

import {NotFoundError} from '../errors';

// Usar los enums desde Prisma
interface CreateBusinessData {
  name: string;
  legalName?: string;
  description?: string;
  nit?: string;
  businessType?: BusinessType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  website?: string;
  timezone?: string;
  currency?: Currency;
  defaultTaxRate?: number;
  status?: BusinessStatus;
  createdBy?: number;
  updatedBy?: number;
}

interface UpdateBusinessData {
  name?: string;
  legalName?: string;
  description?: string;
  nit?: string;
  businessType?: BusinessType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  website?: string;
  timezone?: string;
  currency?: Currency;
  defaultTaxRate?: number;
  status?: BusinessStatus;
  updatedBy?: number;
}

class BusinessService {
  async create(data: CreateBusinessData) {
    return prisma.business.create({
      data: {
        ...data,
        status: data.status || 'ACTIVE',
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

  async getAll(filters?: {
    status?: BusinessStatus;
    businessType?: BusinessType;
    department?: Department;
    search?: string;
  }) {
    const where = {
      ...(filters?.status && {status: filters.status}),
      ...(filters?.businessType && {businessType: filters.businessType}),
      ...(filters?.department && {department: filters.department}),
      ...(filters?.search && {
        OR: [
          {name: {contains: filters.search}},
          {legalName: {contains: filters.search}},
          {nit: {contains: filters.search}}
        ]
      })
    };

    return prisma.business.findMany({
      where,
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
        }
      },
      orderBy: [
        {status: 'asc'},
        {name: 'asc'}
      ]
    });
  }

  async delete(id: number) {
    const business = await prisma.business.findUnique({
      where: {id}
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    // En lugar de eliminar, cambiamos el estado a INACTIVE
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

    return prisma.businessProduct.upsert({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      },
      update: {
        customPrice: customPrice || 0
      },
      create: {
        businessId,
        productId,
        customPrice: customPrice || 0,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0
      }
    });
  }

  async updateBusinessProduct(businessId: number, productId: number, data: {
    customPrice?: number;
    currentStock?: number;
    reservedStock?: number;
    availableStock?: number;
  }) {
    const businessProduct = await prisma.businessProduct.findUnique({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      }
    });

    if (!businessProduct) {
      throw new NotFoundError('Producto no encontrado en el negocio');
    }

    return prisma.businessProduct.update({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async removeProductFromBusiness(businessId: number, productId: number) {
    return prisma.businessProduct.delete({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      }
    });
  }

  async getBusinessProducts(businessId: number) {
    return prisma.businessProduct.findMany({
      where: {businessId},
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
