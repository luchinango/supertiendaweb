import { PrismaClient, SupplierStatus, DocumentType, Department } from '../../prisma/generated';
import { Decimal } from '@prisma/client/runtime/library';
import { ISupplierRepository } from '../interfaces/repositories/ISupplierRepository';
import {
  SupplierResponse,
  CreateSupplierRequestNew,
  UpdateSupplierRequest,
  SupplierListResponse,
  SupplierStats,
  SupplierSearchResult
} from '../types/api';
import { PaginationParams } from '../types/pagination';

export class SupplierRepository implements ISupplierRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToSupplierResponse(supplier: any): SupplierResponse {
    return {
      id: supplier.id,
      businessId: supplier.businessId,
      code: supplier.code || undefined,
      name: supplier.name,
      documentType: supplier.documentType,
      documentNumber: supplier.documentNumber || undefined,
      contactPerson: supplier.contactPerson || undefined,
      email: supplier.email || undefined,
      phone: supplier.phone || undefined,
      address: supplier.address || undefined,
      city: supplier.city || undefined,
      department: supplier.department || undefined,
      country: supplier.country,
      postalCode: supplier.postalCode || undefined,
      paymentTerms: supplier.paymentTerms,
      creditLimit: supplier.creditLimit ? Number(supplier.creditLimit) : undefined,
      currentBalance: Number(supplier.currentBalance),
      status: supplier.status,
      notes: supplier.notes || undefined,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      deletedAt: supplier.deletedAt || undefined,
      createdBy: supplier.createdBy,
      updatedBy: supplier.updatedBy,
      deletedBy: supplier.deletedBy || undefined,
    };
  }

  async findById(id: number): Promise<SupplierResponse | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    return supplier ? this.mapToSupplierResponse(supplier) : null;
  }

  async findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      status?: string;
      department?: string;
      documentType?: string;
      minCreditLimit?: number;
      maxCreditLimit?: number;
      minBalance?: number;
      maxBalance?: number;
    }
  ): Promise<SupplierListResponse> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationParams;
    const skip = (page - 1) * limit;
    const businessId = 1; // Default business ID

    const where: any = { businessId };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Additional filters
    if (additionalFilters?.status) {
      where.status = additionalFilters.status as SupplierStatus;
    }
    if (additionalFilters?.department) {
      where.department = additionalFilters.department as Department;
    }
    if (additionalFilters?.documentType) {
      where.documentType = additionalFilters.documentType as DocumentType;
    }
    if (additionalFilters?.minCreditLimit !== undefined) {
      where.creditLimit = { gte: new Decimal(additionalFilters.minCreditLimit) };
    }
    if (additionalFilters?.maxCreditLimit !== undefined) {
      where.creditLimit = { ...where.creditLimit, lte: new Decimal(additionalFilters.maxCreditLimit) };
    }
    if (additionalFilters?.minBalance !== undefined) {
      where.currentBalance = { gte: new Decimal(additionalFilters.minBalance) };
    }
    if (additionalFilters?.maxBalance !== undefined) {
      where.currentBalance = { ...where.currentBalance, lte: new Decimal(additionalFilters.maxBalance) };
    }

    // Sorting
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    const mappedSuppliers = suppliers.map(supplier => this.mapToSupplierResponse(supplier));

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

  async create(data: CreateSupplierRequestNew, businessId: number): Promise<SupplierResponse> {
    const supplierData: any = {
      businessId,
      name: data.name,
      paymentTerms: data.paymentTerms || 30,
      status: data.status || SupplierStatus.ACTIVE,
      currentBalance: new Decimal(0),
      country: data.country || 'Bolivia',
      documentType: data.documentType || DocumentType.NIT,
    };

    // Add optional fields only if defined
    if (data.code !== undefined) supplierData.code = data.code;
    if (data.documentNumber !== undefined) supplierData.documentNumber = data.documentNumber;
    if (data.contactPerson !== undefined) supplierData.contactPerson = data.contactPerson;
    if (data.email !== undefined) supplierData.email = data.email;
    if (data.phone !== undefined) supplierData.phone = data.phone;
    if (data.address !== undefined) supplierData.address = data.address;
    if (data.city !== undefined) supplierData.city = data.city;
    if (data.department !== undefined) supplierData.department = data.department;
    if (data.postalCode !== undefined) supplierData.postalCode = data.postalCode;
    if (data.creditLimit !== undefined) supplierData.creditLimit = new Decimal(data.creditLimit);
    if (data.notes !== undefined) supplierData.notes = data.notes;

    const supplier = await this.prisma.supplier.create({
      data: supplierData,
    });

    return this.mapToSupplierResponse(supplier);
  }

  async update(id: number, data: UpdateSupplierRequest): Promise<SupplierResponse> {
    const updateData: any = {};

    // Only update fields that are defined
    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.documentType !== undefined) updateData.documentType = data.documentType;
    if (data.documentNumber !== undefined) updateData.documentNumber = data.documentNumber;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
    if (data.creditLimit !== undefined) updateData.creditLimit = new Decimal(data.creditLimit);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    updateData.updatedAt = new Date();

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: updateData,
    });

    return this.mapToSupplierResponse(supplier);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: SupplierStatus.INACTIVE,
      },
    });
  }

  async search(query: string, businessId: number): Promise<SupplierSearchResult[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { documentNumber: { contains: query, mode: 'insensitive' } },
          { contactPerson: { contains: query, mode: 'insensitive' } },
        ],
        businessId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        documentNumber: true,
        phone: true,
        email: true,
        status: true,
        currentBalance: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    return suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      code: supplier.code || undefined,
      documentNumber: supplier.documentNumber || undefined,
      phone: supplier.phone || undefined,
      email: supplier.email || undefined,
      status: supplier.status,
      currentBalance: Number(supplier.currentBalance),
    }));
  }

  async findByCode(code: string, businessId: number): Promise<SupplierResponse | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { code, businessId },
    });

    return supplier ? this.mapToSupplierResponse(supplier) : null;
  }

  async findByDocumentNumber(documentNumber: string, businessId: number): Promise<SupplierResponse | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { documentNumber, businessId },
    });

    return supplier ? this.mapToSupplierResponse(supplier) : null;
  }

  async findWithDebt(businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        businessId,
        currentBalance: { gt: new Decimal(0) },
      },
      orderBy: { currentBalance: 'desc' },
    });

    return suppliers.map(supplier => this.mapToSupplierResponse(supplier));
  }

  async findByStatus(status: string, businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { status: status as SupplierStatus, businessId },
      orderBy: { name: 'asc' },
    });

    return suppliers.map(supplier => this.mapToSupplierResponse(supplier));
  }

  async findByDepartment(department: string, businessId: number): Promise<SupplierResponse[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { department: department as Department, businessId },
      orderBy: { name: 'asc' },
    });

    return suppliers.map(supplier => this.mapToSupplierResponse(supplier));
  }

  async getStats(businessId: number): Promise<SupplierStats> {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalCreditLimit,
      totalCurrentBalance,
      suppliersWithDebt,
      averagePaymentTerms,
    ] = await Promise.all([
      this.prisma.supplier.count({ where: { businessId } }),
      this.prisma.supplier.count({ where: { businessId, status: SupplierStatus.ACTIVE } }),
      this.prisma.supplier.count({ where: { businessId, status: SupplierStatus.INACTIVE } }),
      this.prisma.supplier.aggregate({
        where: { businessId },
        _sum: { creditLimit: true },
      }),
      this.prisma.supplier.aggregate({
        where: { businessId },
        _sum: { currentBalance: true },
      }),
      this.prisma.supplier.count({
        where: {
          businessId,
          currentBalance: { gt: new Decimal(0) },
        },
      }),
      this.prisma.supplier.aggregate({
        where: { businessId },
        _avg: { paymentTerms: true },
      }),
    ]);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalCreditLimit: Number(totalCreditLimit._sum.creditLimit || 0),
      totalCurrentBalance: Number(totalCurrentBalance._sum.currentBalance || 0),
      suppliersWithDebt,
      averagePaymentTerms: averagePaymentTerms._avg.paymentTerms || 0,
    };
  }

  async existsByCode(code: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = { code, businessId };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.supplier.count({ where });
    return count > 0;
  }

  async existsByDocumentNumber(documentNumber: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = { documentNumber, businessId };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.supplier.count({ where });
    return count > 0;
  }
}
