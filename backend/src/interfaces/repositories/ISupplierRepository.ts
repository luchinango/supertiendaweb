import { SupplierResponse, CreateSupplierRequestNew, UpdateSupplierRequest, SupplierListResponse, SupplierStats, SupplierSearchResult } from '../../types/api';
import { PaginationParams } from '../../types/pagination';

export interface ISupplierRepository {
  findById(id: number): Promise<SupplierResponse | null>;

  findMany(
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

  create(data: CreateSupplierRequestNew, businessId: number): Promise<SupplierResponse>;

  update(id: number, data: UpdateSupplierRequest): Promise<SupplierResponse>;

  delete(id: number): Promise<void>;

  search(query: string, businessId: number): Promise<SupplierSearchResult[]>;

  findByCode(code: string, businessId: number): Promise<SupplierResponse | null>;

  findByDocumentNumber(documentNumber: string, businessId: number): Promise<SupplierResponse | null>;

  findWithDebt(businessId: number): Promise<SupplierResponse[]>;

  findByStatus(status: string, businessId: number): Promise<SupplierResponse[]>;

  findByDepartment(department: string, businessId: number): Promise<SupplierResponse[]>;

  getStats(businessId: number): Promise<SupplierStats>;

  existsByCode(code: string, businessId: number, excludeId?: number): Promise<boolean>;

  existsByDocumentNumber(documentNumber: string, businessId: number, excludeId?: number): Promise<boolean>;
}
