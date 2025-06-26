import { CustomerResponse } from '../types/api';

/**
 * Mapear Customer entity a CustomerResponse DTO
 */
export function mapCustomerToResponse(customer: any): CustomerResponse {
  return {
    id: customer.id,
    businessId: customer.businessId,
    firstName: customer.firstName,
    lastName: customer.lastName ?? null,
    documentType: customer.documentType ?? 'CI',
    documentNumber: customer.documentNumber ?? null,
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    address: customer.address ?? null,
    city: customer.city ?? null,
    department: customer.department ?? null,
    country: customer.country ?? 'Bolivia',
    postalCode: customer.postalCode ?? null,
    creditLimit: customer.creditLimit ?? null,
    currentBalance: customer.currentBalance ?? 0,
    loyaltyPoints: customer.loyaltyPoints ?? 0,
    isActive: customer.isActive ?? true,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    deletedAt: customer.deletedAt ?? null,
    createdBy: customer.createdBy ?? 0,
    updatedBy: customer.updatedBy ?? 0,
    deletedBy: customer.deletedBy ?? null,
  };
}

/**
 * Mapear lista de clientes a response
 */
export function mapCustomersToResponse(customers: any[]): CustomerResponse[] {
  return customers.map(mapCustomerToResponse);
}
