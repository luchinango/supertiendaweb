import prisma from "../config/prisma";
import {SupplierStatus, DocumentType, Department} from '../../prisma/generated';
import {Decimal} from '@prisma/client/runtime/library';

import {
  SupplierQueryParams,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierResponse,
  SupplierListResponse,
  SupplierStats,
  SupplierSearchResult
} from '../types/supplierTypes';

export class SupplierService {
  private convertToSupplierResponse(supplier: any): SupplierResponse {
    return {
      id: supplier.id,
      businessId: supplier.businessId,
      code: supplier.code,
      name: supplier.name,
      documentType: supplier.documentType,
      documentNumber: supplier.documentNumber,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      department: supplier.department,
      country: supplier.country,
      postalCode: supplier.postalCode,
      paymentTerms: supplier.paymentTerms,
      creditLimit: supplier.creditLimit,
      currentBalance: supplier.currentBalance,
      status: supplier.status,
      notes: supplier.notes,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      deletedAt: supplier.deletedAt,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      deletedBy: supplier.deletedBy,
      business: supplier.business ? {
        id: supplier.business.id,
        name: supplier.business.name
      } : undefined,
      purchaseOrders: supplier.purchaseOrders?.map((po: any) => ({
        id: po.id,
        poNumber: po.poNumber,
        status: po.status,
        totalAmount: po.totalAmount
      })) || [],
      supplierDebts: supplier.supplierDebts?.map((debt: any) => ({
        id: debt.id,
        amount: debt.amount,
        paidAmount: debt.paidAmount,
        dueDate: debt.dueDate,
        isPaid: debt.isPaid
      })) || []
    };
  }

  async getSupplierById(id: number): Promise<SupplierResponse | null> {
    const supplier = await prisma.supplier.findUnique({
      where: {id},
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true
          }
        },
        supplierDebts: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            dueDate: true,
            isPaid: true
          }
        }
      }
    });
    return supplier ? this.convertToSupplierResponse(supplier) : null;
  }

  async searchSuppliers(query: string, businessId: number): Promise<SupplierSearchResult[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          {name: {contains: query, mode: 'insensitive'}},
          {code: {contains: query, mode: 'insensitive'}},
          {documentNumber: {contains: query, mode: 'insensitive'}},
          {contactPerson: {contains: query, mode: 'insensitive'}}
        ],
        businessId
      },
      select: {
        id: true,
        name: true,
        code: true,
        documentNumber: true,
        phone: true,
        email: true,
        status: true,
        currentBalance: true
      },
      take: 10,
      orderBy: {name: 'asc'}
    });
    return suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      code: supplier.code || undefined,
      documentNumber: supplier.documentNumber || undefined,
      phone: supplier.phone || undefined,
      email: supplier.email || undefined,
      status: supplier.status,
      currentBalance: supplier.currentBalance
    }));
  }

  async getSuppliers(params: SupplierQueryParams, businessId: number = 1): Promise<SupplierListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      department,
      documentType,
      minCreditLimit,
      maxCreditLimit,
      minBalance,
      maxBalance
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {businessId};

    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {code: {contains: search, mode: 'insensitive'}},
        {documentNumber: {contains: search, mode: 'insensitive'}},
        {contactPerson: {contains: search, mode: 'insensitive'}},
        {email: {contains: search, mode: 'insensitive'}}
      ];
    }
    if (status) where.status = status as SupplierStatus;
    if (department) where.department = department as Department;
    if (documentType) where.documentType = documentType as DocumentType;
    if (minCreditLimit !== undefined) where.creditLimit = {gte: new Decimal(minCreditLimit)};
    if (maxCreditLimit !== undefined) where.creditLimit = {...where.creditLimit, lte: new Decimal(maxCreditLimit)};
    if (minBalance !== undefined) where.currentBalance = {gte: new Decimal(minBalance)};
    if (maxBalance !== undefined) where.currentBalance = {...where.currentBalance, lte: new Decimal(maxBalance)};

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true
            }
          },
          purchaseOrders: {
            select: {
              id: true,
              poNumber: true,
              status: true,
              totalAmount: true
            }
          },
          supplierDebts: {
            select: {
              id: true,
              amount: true,
              paidAmount: true,
              dueDate: true,
              isPaid: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {name: 'asc'}
      }),
      prisma.supplier.count({where})
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      suppliers: suppliers.map(supplier => this.convertToSupplierResponse(supplier)),
      total,
      page,
      totalPages,
      limit
    };
  }

  async checkDocumentNumberExists(documentNumber: string, businessId: number = 1): Promise<boolean> {
    const supplier = await prisma.supplier.findFirst({
      where: {
        documentNumber,
        businessId
      }
    });
    return !!supplier;
  }

  async checkCodeExists(code: string, businessId: number = 1): Promise<boolean> {
    const supplier = await prisma.supplier.findFirst({
      where: {
        code,
        businessId
      }
    });
    return !!supplier;
  }

  async createSupplier(supplierData: CreateSupplierRequest, businessId: number = 1): Promise<SupplierResponse> {
    const data: any = {
      businessId,
      name: supplierData.name,
      paymentTerms: supplierData.paymentTerms || 30,
      status: supplierData.status || SupplierStatus.ACTIVE
    };

    // Agregar campos opcionales solo si están definidos
    if (supplierData.code !== undefined) data.code = supplierData.code;
    if (supplierData.documentType !== undefined) data.documentType = supplierData.documentType;
    if (supplierData.documentNumber !== undefined) data.documentNumber = supplierData.documentNumber;
    if (supplierData.contactPerson !== undefined) data.contactPerson = supplierData.contactPerson;
    if (supplierData.email !== undefined) data.email = supplierData.email;
    if (supplierData.phone !== undefined) data.phone = supplierData.phone;
    if (supplierData.address !== undefined) data.address = supplierData.address;
    if (supplierData.city !== undefined) data.city = supplierData.city;
    if (supplierData.department !== undefined) data.department = supplierData.department;
    if (supplierData.country !== undefined) data.country = supplierData.country;
    if (supplierData.postalCode !== undefined) data.postalCode = supplierData.postalCode;
    if (supplierData.creditLimit !== undefined) data.creditLimit = new Decimal(supplierData.creditLimit);
    if (supplierData.notes !== undefined) data.notes = supplierData.notes;

    const supplier = await prisma.supplier.create({
      data,
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return this.convertToSupplierResponse(supplier);
  }

  async updateSupplier(id: number, supplierData: UpdateSupplierRequest): Promise<SupplierResponse> {
    const data: any = {};

    // Agregar campos solo si están definidos
    if (supplierData.code !== undefined) data.code = supplierData.code;
    if (supplierData.name !== undefined) data.name = supplierData.name;
    if (supplierData.documentType !== undefined) data.documentType = supplierData.documentType;
    if (supplierData.documentNumber !== undefined) data.documentNumber = supplierData.documentNumber;
    if (supplierData.contactPerson !== undefined) data.contactPerson = supplierData.contactPerson;
    if (supplierData.email !== undefined) data.email = supplierData.email;
    if (supplierData.phone !== undefined) data.phone = supplierData.phone;
    if (supplierData.address !== undefined) data.address = supplierData.address;
    if (supplierData.city !== undefined) data.city = supplierData.city;
    if (supplierData.department !== undefined) data.department = supplierData.department;
    if (supplierData.country !== undefined) data.country = supplierData.country;
    if (supplierData.postalCode !== undefined) data.postalCode = supplierData.postalCode;
    if (supplierData.paymentTerms !== undefined) data.paymentTerms = supplierData.paymentTerms;
    if (supplierData.creditLimit !== undefined) data.creditLimit = new Decimal(supplierData.creditLimit);
    if (supplierData.status !== undefined) data.status = supplierData.status;
    if (supplierData.notes !== undefined) data.notes = supplierData.notes;

    const supplier = await prisma.supplier.update({
      where: {id},
      data,
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true
          }
        },
        supplierDebts: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            dueDate: true,
            isPaid: true
          }
        }
      }
    });
    return this.convertToSupplierResponse(supplier);
  }

  async softDeleteSupplier(id: number): Promise<SupplierResponse> {
    const supplier = await prisma.supplier.update({
      where: {id},
      data: {
        deletedAt: new Date(),
        status: SupplierStatus.INACTIVE
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return this.convertToSupplierResponse(supplier);
  }

  async getSupplierStats(businessId: number = 1): Promise<SupplierStats> {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalCreditLimit,
      totalCurrentBalance,
      suppliersWithDebt,
      averagePaymentTerms
    ] = await Promise.all([
      prisma.supplier.count({where: {businessId}}),
      prisma.supplier.count({where: {businessId, status: SupplierStatus.ACTIVE}}),
      prisma.supplier.count({where: {businessId, status: SupplierStatus.INACTIVE}}),
      prisma.supplier.aggregate({
        where: {businessId},
        _sum: {creditLimit: true}
      }),
      prisma.supplier.aggregate({
        where: {businessId},
        _sum: {currentBalance: true}
      }),
      prisma.supplier.count({
        where: {
          businessId,
          currentBalance: {gt: new Decimal(0)}
        }
      }),
      prisma.supplier.aggregate({
        where: {businessId},
        _avg: {paymentTerms: true}
      })
    ]);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalCreditLimit: totalCreditLimit._sum.creditLimit || new Decimal(0),
      totalCurrentBalance: totalCurrentBalance._sum.currentBalance || new Decimal(0),
      suppliersWithDebt,
      averagePaymentTerms: averagePaymentTerms._avg.paymentTerms || 0
    };
  }

  async getSuppliersWithDebt(businessId: number = 1): Promise<SupplierResponse[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        currentBalance: {gt: new Decimal(0)}
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        supplierDebts: {
          where: {isPaid: false},
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            dueDate: true,
            isPaid: true
          }
        }
      },
      orderBy: {currentBalance: 'desc'}
    });
    return suppliers.map(supplier => this.convertToSupplierResponse(supplier));
  }
}

export const supplierService = new SupplierService();
