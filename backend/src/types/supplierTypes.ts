import {Decimal} from '@prisma/client/runtime/library';
import {SupplierStatus, DocumentType, Department} from 'prisma/generated';
import { PaginationMeta } from './pagination';

/**
 * Tipos para operaciones de proveedores
 */

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  documentType?: string;
  minCreditLimit?: number;
  maxCreditLimit?: number;
  minBalance?: number;
  maxBalance?: number;
}

export interface CreateSupplierRequest {
  businessId?: number;
  code?: string;
  name: string;
  documentType?: DocumentType;
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  paymentTerms?: number;
  creditLimit?: number | Decimal;
  status?: SupplierStatus;
  notes?: string;
}

export interface UpdateSupplierRequest {
  code?: string;
  name?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  paymentTerms?: number;
  creditLimit?: number | Decimal;
  status?: SupplierStatus;
  notes?: string;
}

export interface SupplierResponse {
  id: number;
  businessId: number;
  code?: string;
  name: string;
  documentType: DocumentType;
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country: string;
  postalCode?: string;
  paymentTerms: number;
  creditLimit?: Decimal;
  currentBalance: Decimal;
  status: SupplierStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: number;
  updatedBy: number;
  deletedBy?: number;
  business?: {
    id: number;
    name: string;
  };
  purchaseOrders?: {
    id: number;
    poNumber?: string;
    status: string;
    totalAmount: Decimal;
  }[];
  supplierDebts?: {
    id: number;
    amount: Decimal;
    paidAmount: Decimal;
    dueDate: Date;
    isPaid: boolean;
  }[];
}

export interface SupplierListResponse {
  data: SupplierResponse[];
  meta: PaginationMeta;
}

export interface SupplierPathParams {
  id: string;
}

export interface SupplierErrorResponse {
  message: string;
  error?: string;
  details?: string[];
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalCreditLimit: Decimal;
  totalCurrentBalance: Decimal;
  suppliersWithDebt: number;
  averagePaymentTerms: number;
}

export interface SupplierSearchResult {
  id: number;
  name: string;
  code?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  status: SupplierStatus;
  currentBalance: Decimal;
}
