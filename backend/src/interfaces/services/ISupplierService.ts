import { SupplierResponse, CreateSupplierRequestNew, UpdateSupplierRequest, SupplierListResponse, SupplierStats, SupplierSearchResult } from '../../types/api';
import { PaginationParams } from '../../types/pagination';

export interface ISupplierService {
  getSuppliers(
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
  ): Promise<SupplierListResponse>;

  getSupplierById(id: number): Promise<SupplierResponse | null>;

  createSupplier(data: CreateSupplierRequestNew, businessId?: number): Promise<SupplierResponse>;

  updateSupplier(id: number, data: UpdateSupplierRequest): Promise<SupplierResponse>;

  deleteSupplier(id: number): Promise<void>;

  searchSuppliers(query: string, businessId?: number): Promise<SupplierSearchResult[]>;

  activateSupplier(id: number): Promise<SupplierResponse>;
  deactivateSupplier(id: number): Promise<SupplierResponse>;
  suspendSupplier(id: number): Promise<SupplierResponse>;

  getSuppliersWithDebt(businessId?: number): Promise<SupplierResponse[]>;
  getSuppliersByStatus(status: string, businessId?: number): Promise<SupplierResponse[]>;
  getSuppliersByDepartment(department: string, businessId?: number): Promise<SupplierResponse[]>;

  getSupplierStats(businessId?: number): Promise<SupplierStats>;

  checkCodeExists(code: string, businessId?: number, excludeId?: number): Promise<boolean>;
  checkDocumentNumberExists(documentNumber: string, businessId?: number, excludeId?: number): Promise<boolean>;
}
