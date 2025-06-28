import prisma from "../config/prisma";
import {SupplierStatus, DocumentType, Department} from '../../prisma/generated';
import {Decimal} from '@prisma/client/runtime/library';

import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierResponse,
  SupplierListResponse,
  SupplierStats,
  SupplierSearchResult,
  CreateSupplierRequestNew
} from '../types/api';
import { PaginationParams } from '../types/pagination';
import { ISupplierService } from '../interfaces/services/ISupplierService';
import { NotFoundError, ConflictError, ValidationError } from '../errors';

export class SupplierService implements ISupplierService {
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
      creditLimit: supplier.creditLimit ? Number(supplier.creditLimit) : undefined,
      currentBalance: Number(supplier.currentBalance),
      status: supplier.status,
      notes: supplier.notes,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      deletedAt: supplier.deletedAt,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      deletedBy: supplier.deletedBy,
    };
  }

  async getSupplierById(id: number, businessId: number): Promise<SupplierResponse | null> {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null
      },
    });

    return supplier ? this.convertToSupplierResponse(supplier) : null;
  }

  async searchSuppliers(query: string, businessId: number): Promise<SupplierSearchResult[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        AND: [
          { businessId },
          { deletedAt: null },
          {
            OR: [
              {name: {contains: query, mode: 'insensitive'}},
              {code: {contains: query, mode: 'insensitive'}},
              {documentNumber: {contains: query, mode: 'insensitive'}},
              {contactPerson: {contains: query, mode: 'insensitive'}}
            ]
          }
        ]
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
      currentBalance: Number(supplier.currentBalance)
    }));
  }

  async getSuppliers(
    paginationParams: PaginationParams,
    additionalFilters?: {
      status?: string;
      department?: string;
      documentType?: string;
      minCreditLimit?: number;
      maxCreditLimit?: number;
      minBalance?: number;
      maxBalance?: number;
      businessId?: number;
    }
  ): Promise<SupplierListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder
    } = paginationParams;

    const {
      status,
      department,
      documentType,
      minCreditLimit,
      maxCreditLimit,
      minBalance,
      maxBalance,
      businessId = 1
    } = additionalFilters || {};

    const skip = (page - 1) * limit;
    const where: any = {
      businessId,
      deletedAt: null
    };

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

    if (minCreditLimit !== undefined) {
      where.creditLimit = { gte: new Decimal(minCreditLimit) };
    }
    if (maxCreditLimit !== undefined) {
      where.creditLimit = { ...where.creditLimit, lte: new Decimal(maxCreditLimit) };
    }
    if (minBalance !== undefined) {
      where.currentBalance = { gte: new Decimal(minBalance) };
    }
    if (maxBalance !== undefined) {
      where.currentBalance = { ...where.currentBalance, lte: new Decimal(maxBalance) };
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.supplier.count({ where }),
    ]);

    const mappedSuppliers = suppliers.map(supplier => this.convertToSupplierResponse(supplier));

    return {
      data: mappedSuppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
        nextPage: skip + limit < total ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async checkDocumentNumberExists(documentNumber: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = {
      documentNumber,
      businessId,
      deletedAt: null
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.supplier.count({ where });
    return count > 0;
  }

  async checkCodeExists(code: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = {
      code,
      businessId,
      deletedAt: null
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.supplier.count({ where });
    return count > 0;
  }

  async createSupplier(supplierData: CreateSupplierRequestNew, businessId: number): Promise<SupplierResponse> {
    // Validaciones
    if (supplierData.code && await this.checkCodeExists(supplierData.code, businessId)) {
      throw new ConflictError(`Ya existe un proveedor con el código '${supplierData.code}' en este negocio`);
    }

    if (supplierData.documentNumber && await this.checkDocumentNumberExists(supplierData.documentNumber, businessId)) {
      throw new ConflictError(`Ya existe un proveedor con el documento '${supplierData.documentNumber}' en este negocio`);
    }

    const newSupplierData: any = {
      businessId,
      name: supplierData.name,
      paymentTerms: supplierData.paymentTerms || 30,
      status: supplierData.status || SupplierStatus.ACTIVE,
      currentBalance: new Decimal(0),
      country: supplierData.country || 'Bolivia',
      documentType: supplierData.documentType || DocumentType.NIT,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Agregar campos opcionales solo si están definidos
    if (supplierData.code !== undefined) newSupplierData.code = supplierData.code;
    if (supplierData.documentNumber !== undefined) newSupplierData.documentNumber = supplierData.documentNumber;
    if (supplierData.contactPerson !== undefined) newSupplierData.contactPerson = supplierData.contactPerson;
    if (supplierData.email !== undefined) newSupplierData.email = supplierData.email;
    if (supplierData.phone !== undefined) newSupplierData.phone = supplierData.phone;
    if (supplierData.address !== undefined) newSupplierData.address = supplierData.address;
    if (supplierData.city !== undefined) newSupplierData.city = supplierData.city;
    if (supplierData.department !== undefined) newSupplierData.department = supplierData.department;
    if (supplierData.postalCode !== undefined) newSupplierData.postalCode = supplierData.postalCode;
    if (supplierData.creditLimit !== undefined) newSupplierData.creditLimit = new Decimal(supplierData.creditLimit);
    if (supplierData.notes !== undefined) newSupplierData.notes = supplierData.notes;

    const supplier = await prisma.supplier.create({
      data: newSupplierData,
    });

    return this.convertToSupplierResponse(supplier);
  }

  async updateSupplier(id: number, supplierData: UpdateSupplierRequest, businessId: number): Promise<SupplierResponse> {
    // Verificar que el proveedor existe y pertenece al business
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null
      }
    });

    if (!existingSupplier) {
      throw new NotFoundError(`Proveedor con ID ${id} no encontrado en este negocio`);
    }

    // Validaciones de duplicados
    if (supplierData.code && supplierData.code !== existingSupplier.code) {
      if (await this.checkCodeExists(supplierData.code, businessId, id)) {
        throw new ConflictError(`Ya existe un proveedor con el código '${supplierData.code}' en este negocio`);
      }
    }

    if (supplierData.documentNumber && supplierData.documentNumber !== existingSupplier.documentNumber) {
      if (await this.checkDocumentNumberExists(supplierData.documentNumber, businessId, id)) {
        throw new ConflictError(`Ya existe un proveedor con el documento '${supplierData.documentNumber}' en este negocio`);
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Solo actualizar campos que están definidos
    if (supplierData.code !== undefined) updateData.code = supplierData.code;
    if (supplierData.name !== undefined) updateData.name = supplierData.name;
    if (supplierData.documentType !== undefined) updateData.documentType = supplierData.documentType;
    if (supplierData.documentNumber !== undefined) updateData.documentNumber = supplierData.documentNumber;
    if (supplierData.contactPerson !== undefined) updateData.contactPerson = supplierData.contactPerson;
    if (supplierData.email !== undefined) updateData.email = supplierData.email;
    if (supplierData.phone !== undefined) updateData.phone = supplierData.phone;
    if (supplierData.address !== undefined) updateData.address = supplierData.address;
    if (supplierData.city !== undefined) updateData.city = supplierData.city;
    if (supplierData.department !== undefined) updateData.department = supplierData.department;
    if (supplierData.country !== undefined) updateData.country = supplierData.country;
    if (supplierData.postalCode !== undefined) updateData.postalCode = supplierData.postalCode;
    if (supplierData.paymentTerms !== undefined) updateData.paymentTerms = supplierData.paymentTerms;
    if (supplierData.creditLimit !== undefined) updateData.creditLimit = new Decimal(supplierData.creditLimit);
    if (supplierData.status !== undefined) updateData.status = supplierData.status;
    if (supplierData.notes !== undefined) updateData.notes = supplierData.notes;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return this.convertToSupplierResponse(supplier);
  }

  async deleteSupplier(id: number, businessId: number): Promise<void> {
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id,
        businessId,
        deletedAt: null
      }
    });

    if (!existingSupplier) {
      throw new NotFoundError(`Proveedor con ID ${id} no encontrado en este negocio`);
    }

    await prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      },
    });
  }

  async activateSupplier(id: number, businessId: number): Promise<SupplierResponse> {
    const supplier = await this.updateSupplier(id, { status: SupplierStatus.ACTIVE }, businessId);
    return supplier;
  }

  async deactivateSupplier(id: number, businessId: number): Promise<SupplierResponse> {
    const supplier = await this.updateSupplier(id, { status: SupplierStatus.INACTIVE }, businessId);
    return supplier;
  }

  async suspendSupplier(id: number, businessId: number): Promise<SupplierResponse> {
    const supplier = await this.updateSupplier(id, { status: SupplierStatus.SUSPENDED }, businessId);
    return supplier;
  }

  async getSupplierStats(businessId: number): Promise<SupplierStats> {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suspendedSuppliers,
      suppliersWithDebt,
      totalDebt,
      averageCreditLimit
    ] = await Promise.all([
      prisma.supplier.count({
        where: { businessId, deletedAt: null }
      }),
      prisma.supplier.count({
        where: { businessId, status: SupplierStatus.ACTIVE, deletedAt: null }
      }),
      prisma.supplier.count({
        where: { businessId, status: SupplierStatus.INACTIVE, deletedAt: null }
      }),
      prisma.supplier.count({
        where: { businessId, status: SupplierStatus.SUSPENDED, deletedAt: null }
      }),
      prisma.supplier.count({
        where: {
          businessId,
          currentBalance: { gt: 0 },
          deletedAt: null
        }
      }),
      prisma.supplier.aggregate({
        where: { businessId, deletedAt: null },
        _sum: { currentBalance: true }
      }),
      prisma.supplier.aggregate({
        where: {
          businessId,
          creditLimit: { not: null },
          deletedAt: null
        },
        _avg: { creditLimit: true }
      })
    ]);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suspendedSuppliers,
      suppliersWithDebt,
      totalDebt: Number(totalDebt._sum.currentBalance || 0),
      averageCreditLimit: Number(averageCreditLimit._avg.creditLimit || 0)
    };
  }

  async getSuppliersWithDebt(businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        currentBalance: { gt: 0 },
        deletedAt: null
      },
      orderBy: { currentBalance: 'desc' }
    });

    return suppliers.map(supplier => this.convertToSupplierResponse(supplier));
  }

  async getSuppliersByStatus(status: string, businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        status: status as SupplierStatus,
        deletedAt: null
      },
      orderBy: { name: 'asc' }
    });

    return suppliers.map(supplier => this.convertToSupplierResponse(supplier));
  }

  async getSuppliersByDepartment(department: string, businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        department: department as Department,
        deletedAt: null
      },
      orderBy: { name: 'asc' }
    });

    return suppliers.map(supplier => this.convertToSupplierResponse(supplier));
  }
}

export const supplierService = new SupplierService();
