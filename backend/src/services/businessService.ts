import prisma from '../config/prisma';
import {BusinessStatus, BusinessType} from '@prisma/client';
import {NotFoundError} from '../errors';

interface CreateBusinessData {
  name: string;
  legal_name?: string;
  description?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  type_id: number;
  created_by: number;
  updated_by: number;
}

interface UpdateBusinessData {
  name?: string;
  legal_name?: string;
  description?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  status?: BusinessStatus;
  type_id?: number;
  updated_by: number;
}

class BusinessService {
  async create(data: CreateBusinessData) {
    const businessType = await prisma.businessType.findUnique({
      where: {id: data.type_id}
    });

    if (!businessType) {
      throw new NotFoundError('Tipo de negocio no encontrado');
    }

    return prisma.business.create({
      data: {
        ...data,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        type: true
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

    if (data.type_id) {
      const businessType = await prisma.businessType.findUnique({
        where: {id: data.type_id}
      });

      if (!businessType) {
        throw new NotFoundError('Tipo de negocio no encontrado');
      }
    }

    return prisma.business.update({
      where: {id},
      data: {
        ...data,
        updated_at: new Date()
      },
      include: {
        type: true
      }
    });
  }

  async getById(id: number) {
    const business = await prisma.business.findUnique({
      where: {id},
      include: {
        type: true,
        products: {
          include: {
            product: true
          }
        },
        BusinessOrgChart: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                employee: {
                  select: {
                    first_name: true,
                    last_name: true,
                    position: true
                  }
                }
              }
            },
            parent: true
          }
        }
      }
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    return business;
  }

  async getAll(filters?: {
    status?: BusinessStatus;
    type_id?: number;
    search?: string;
  }) {
    const where = {
      ...(filters?.status && {status: filters.status}),
      ...(filters?.type_id && {type_id: filters.type_id}),
      ...(filters?.search && {
        OR: [
          {name: {contains: filters.search}},
          {legal_name: {contains: filters.search}},
          {tax_id: {contains: filters.search}}
        ]
      })
    };

    return prisma.business.findMany({
      where,
      include: {
        type: true,
        products: {
          include: {
            product: true
          }
        },
        BusinessOrgChart: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: {
                  select: {
                    code: true,
                    name: true
                  }
                }
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
        updated_at: new Date()
      }
    });
  }

  async getBusinessTypes() {
    return prisma.businessType.findMany({
      orderBy: {
        name: 'asc'
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

    return prisma.businessProduct.create({
      data: {
        businessId,
        productId,
        customPrice,
        actualStock: 0
      },
      include: {
        product: true
      }
    });
  }

  async updateBusinessProduct(businessId: number, productId: number, data: {
    customPrice?: number;
    actualStock?: number;
  }) {
    return prisma.businessProduct.update({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      },
      data: {
        customPrice: data.customPrice,
        actualStock: data.actualStock
      },
      include: {
        product: true
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
    const business = await prisma.business.findUnique({
      where: {id: businessId}
    });

    if (!business) {
      throw new NotFoundError('Negocio no encontrado');
    }

    return prisma.businessProduct.findMany({
      where: {businessId},
      include: {
        product: true
      }
    });
  }
}

export const businessService = new BusinessService();
export default businessService;
