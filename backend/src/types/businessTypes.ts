import {BusinessStatus, BusinessType, Department, Currency} from '../../prisma/generated';

export interface CreateBusinessData {
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

export interface UpdateBusinessData {
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

export interface BusinessFilters {
  status?: BusinessStatus;
  businessType?: BusinessType;
  department?: Department;
  search?: string;
  page?: number;
  limit?: number;
}
