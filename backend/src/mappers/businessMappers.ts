import { BusinessResponse, BusinessListResponse } from '../types/api';
import { PaginationMeta } from '../types/pagination';

/**
 * Mapear Business entity a BusinessResponse DTO
 */
export function mapBusinessToBusinessResponse(business: any): BusinessResponse {
  return {
    id: business.id,
    name: business.name,
    legalName: business.legalName,
    description: business.description,
    nit: business.nit,
    businessType: business.businessType,
    email: business.email,
    phone: business.phone,
    address: business.address,
    city: business.city,
    department: business.department,
    country: business.country,
    postalCode: business.postalCode,
    logoUrl: business.logoUrl,
    website: business.website,
    timezone: business.timezone,
    currency: business.currency,
    defaultTaxRate: business.defaultTaxRate,
    status: business.status,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
    deletedAt: business.deletedAt,
    createdBy: business.createdBy,
    updatedBy: business.updatedBy,
    deletedBy: business.deletedBy,
  };
}

/**
 * Mapear lista de businesses a response
 */
export function mapBusinessesToResponse(businesses: any[]): BusinessResponse[] {
  return businesses.map(mapBusinessToBusinessResponse);
}

/**
 * Mapear resultados paginados de Business a BusinessListResponse
 */
export function mapPaginatedBusinessesToResponse(result: any): BusinessListResponse {
  return {
    data: result.data.map(mapBusinessToBusinessResponse),
    meta: {
      total: result.meta.total,
      page: result.meta.page || 1,
      limit: result.meta.limit || 10,
      totalPages: result.meta.totalPages,
      hasNextPage: result.meta.hasNextPage,
      hasPrevPage: result.meta.hasPrevPage,
      nextPage: result.meta.nextPage,
      prevPage: result.meta.prevPage,
    },
  };
}
