import {
  User,
  Employee,
  Business,
  Product,
  Category,
  Supplier,
  Customer,
  Sale,
  PurchaseOrder,
} from '../../prisma/generated';
import { PaginationMeta } from './pagination';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Respuesta estándar para listas paginadas
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

export interface UserResponse extends Omit<User, 'passwordHash'> {
  role: {
    id: number;
    name: string;
    code: string;
  };
  employee: EmployeeResponse | null;
  phone: string | null;
  lastLogin: Date | null;
}

export interface EmployeeResponse extends Employee {
  business?: BusinessResponse;
}

export interface BusinessResponse extends Business {}

export interface ProductResponse {
  id: number;
  categoryId: number;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  costPrice: number;
  sellingPrice: number;
  taxType: string;
  taxRate: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  isActive: boolean;
  status: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: number;
  updatedBy: number;
  deletedBy?: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface CategoryResponse extends Category {
  productCount?: number;
  children?: CategoryResponse[];
  parent?: CategoryResponse;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryListResponse {
  data: CategoryResponse[];
  meta: PaginationMeta;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children: CategoryTreeNode[];
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
  topCategoriesByProducts: {
    id: number;
    name: string;
    productCount: number;
  }[];
}

export interface SupplierResponse {
  id: number;
  businessId: number;
  code?: string;
  name: string;
  documentType: 'NIT' | 'CI' | 'PASSPORT' | 'FOREIGN_ID';
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO';
  country: string;
  postalCode?: string;
  paymentTerms: number;
  creditLimit?: number;
  currentBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: number;
  updatedBy: number;
  deletedBy?: number;
}

export interface CustomerResponse extends Customer {
  business?: BusinessResponse;
}

export interface SaleResponse extends Sale {
  items?: SaleItemResponse[];
  customer?: CustomerResponse;
  employee?: EmployeeResponse;
}

export interface SaleItemResponse {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: ProductResponse;
}

export interface PurchaseOrderResponse extends PurchaseOrder {
  items?: PurchaseOrderItemResponse[];
  supplier?: SupplierResponse;
  business?: BusinessResponse;
}

export interface PurchaseOrderItemResponse {
  id: number;
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: ProductResponse;
}

export interface UserListResponse {
  data: UserResponse[];
  meta: PaginationMeta;
}

export interface ProductListResponse {
  data: ProductResponse[];
  meta: PaginationMeta;
}

export interface CustomerListResponse {
  data: CustomerResponse[];
  meta: PaginationMeta;
}

export interface SupplierListResponse {
  data: SupplierResponse[];
  meta: PaginationMeta;
}

export interface SaleListResponse {
  data: SaleResponse[];
  meta: PaginationMeta;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrderResponse[];
  meta: PaginationMeta;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
  employeeId?: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  employeeId?: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  name: string;
  categoryId: number;
  sku?: string;
  barcode?: string;
  description?: string;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  costPrice: number;
  sellingPrice: number;
  taxType?: string;
  taxRate?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  isActive?: boolean;
  status?: string;
  expiryDate?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: number;
  sku?: string;
  barcode?: string;
  description?: string;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  costPrice?: number;
  sellingPrice?: number;
  taxType?: string;
  taxRate?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  isActive?: boolean;
  status?: string;
  expiryDate?: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  businessId: number;
  creditLimit?: number;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  creditLimit?: number;
  isActive?: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  businessId: number;
  contactPerson?: string;
}

export interface CreateSupplierRequestNew {
  businessId?: number;
  code?: string;
  name: string;
  documentType?: 'NIT' | 'CI' | 'PASSPORT' | 'FOREIGN_ID';
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO';
  country?: string;
  postalCode?: string;
  paymentTerms?: number;
  creditLimit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
}

export interface UpdateSupplierRequest {
  code?: string;
  name?: string;
  documentType?: 'NIT' | 'CI' | 'PASSPORT' | 'FOREIGN_ID';
  documentNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO';
  country?: string;
  postalCode?: string;
  paymentTerms?: number;
  creditLimit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery {
  search?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: any;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  businessId?: number;
}

export interface ReportRequest {
  startDate: string;
  endDate: string;
  businessId?: number;
  format?: 'json' | 'csv' | 'pdf';
}

export interface SalesReportResponse {
  totalSales: number;
  totalItems: number;
  averageTicket: number;
  topProducts: Array<{
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByDate: Array<{
    date: string;
    sales: number;
    items: number;
  }>;
}

export interface InventoryReportResponse {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  products: Array<{
    productId: number;
    productName: string;
    stock: number;
    minStock: number;
    value: number;
  }>;
}

export interface LogQuery {
  level?: 'error' | 'warn' | 'info' | 'debug';
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

export interface LogResponse {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  meta: any;
  userId?: number;
  businessId?: number;
  ip?: string;
  userAgent?: string;
}

export interface LogStatsResponse {
  totalLogs: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  logsByLevel: Array<{
    level: string;
    count: number;
  }>;
  logsByHour: Array<{
    hour: string;
    count: number;
  }>;
}

export interface BusinessListResponse {
  data: BusinessResponse[];
  meta: PaginationMeta;
}

export interface CreateBusinessRequest {
  name: string;
  legalName?: string;
  description?: string;
  nit?: string;
  businessType?: 'EMPRESA_UNIPERSONAL' | 'SOCIEDAD_ANONIMA' | 'SOCIEDAD_LIMITADA' | 'SOCIEDAD_COOPERATIVA' | 'EMPRESA_PUBLICA' | 'ORGANIZACION_NO_LUCRATIVA' | 'PERSONA_NATURAL';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO';
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  website?: string;
  timezone?: string;
  currency?: 'BOB' | 'USD' | 'EUR';
  defaultTaxRate?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
}

export interface UpdateBusinessRequest {
  name?: string;
  legalName?: string;
  description?: string;
  nit?: string;
  businessType?: 'EMPRESA_UNIPERSONAL' | 'SOCIEDAD_ANONIMA' | 'SOCIEDAD_LIMITADA' | 'SOCIEDAD_COOPERATIVA' | 'EMPRESA_PUBLICA' | 'ORGANIZACION_NO_LUCRATIVA' | 'PERSONA_NATURAL';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO';
  country?: string;
  postalCode?: string;
  logoUrl?: string;
  website?: string;
  timezone?: string;
  currency?: 'BOB' | 'USD' | 'EUR';
  defaultTaxRate?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
}

export interface BusinessProductResponse {
  id: number;
  businessId: number;
  productId: number;
  customPrice: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestock?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductResponse;
  business?: {
    id: number;
    name: string;
  };
}

export interface CreateBusinessProductRequest {
  businessId: number;
  productId: number;
  customPrice: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
}

export interface UpdateBusinessProductRequest {
  customPrice?: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
  lastRestock?: Date;
}

export interface BusinessProductListResponse {
  data: BusinessProductResponse[];
  meta: PaginationMeta;
}

export interface BusinessProductStats {
  totalProducts: number;
  totalStockValue: number;
  averageStockLevel: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentlyRestockedProducts: number;
}

export interface BusinessProductSearchResult {
  id: number;
  businessId: number;
  productId: number;
  productName: string;
  productSku?: string;
  productBarcode?: string;
  customPrice: number;
  currentStock: number;
  availableStock: number;
  category?: {
    id: number;
    name: string;
  };
}

export interface BusinessProductSearchResponse {
  data: BusinessProductSearchResult[];
  meta: PaginationMeta;
}

export interface StockAdjustmentRequest {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface RestockRequest {
  quantity: number;
  unitCost?: number;
  reason?: string;
  notes?: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  suspendedSuppliers: number;
  suppliersWithDebt: number;
  totalDebt: number;
  averageCreditLimit: number;
}

export interface SupplierSearchResult {
  id: number;
  name: string;
  code?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  currentBalance: number;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  sellingPrice: number;
  status: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  averagePrice: number;
  totalValue: number;
}

export interface CreatePurchaseOrderRequest {
  businessId: number;
  supplierId: number;
  poNumber?: string;
  orderDate?: Date;
  expectedDate?: Date;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: number;
  poNumber?: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  orderDate?: Date;
  expectedDate?: Date;
  notes?: string;
}

export interface ApprovePurchaseOrderRequest {
  approvedBy: number;
}

export {
  BusinessProductCatalogItem,
  BusinessProductCatalogResponse,
  BusinessProductCatalogFilters,
  BulkConfigureProductsRequest,
  BulkConfigureProductsResponse
} from './businessProductTypes';

export { PaginationMeta };
