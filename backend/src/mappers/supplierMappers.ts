import { SupplierResponse } from '../types/api';
import { PaginatedResult } from '../types/pagination';

export function mapSupplierToSupplierResponse(supplier: any): SupplierResponse {
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

export function mapPaginatedSuppliersToResponse(
  result: PaginatedResult<any>
): PaginatedResult<SupplierResponse> {
  return {
    ...result,
    data: result.data.map(mapSupplierToSupplierResponse),
  };
}
