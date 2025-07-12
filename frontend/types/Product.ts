export interface Category {
  id: number
  name: string
  description?: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  max_stock: number
  category_id: number
  business_id: number
  sku?: string
  barcode?: string
  unit: string
  weight?: number
  dimensions?: string
  expiration_date?: string
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category // <-- agrega esta línea
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  max_stock: number
  category_id: number
  sku?: string
  barcode?: string
  unit: string
  weight?: number
  dimensions?: string
  expiration_date?: string
  image?: string
  is_active: boolean
}

export interface BusinessProduct {
  id: number
  businessId: number
  currentStock: number
  reservedStock: number
  availableStock: number
  customPrice: number
  lastRestock: string
  createdAt: string
  updatedAt: string
}

export interface CatalogProduct {
  id: number
  categoryId: number
  sku: string
  barcode: string
  name: string
  description: string
  brand: string
  model: string
  unit: string
  weight: number
  dimensions: string
  taxType: string
  taxRate: number
  minStock: number
  maxStock: number
  reorderPoint: number
  isActive: boolean
  status: string
  expiryDate: string
  category: {
    id: number
    name: string
    description: string
  }
  businessProduct: BusinessProduct
  effectivePrice: number
  effectiveStock: number
  isAvailableInBusiness: boolean
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}

export interface CatalogResponse {
  success: boolean
  data: {
    items: CatalogProduct[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
      nextPage: number | null
      prevPage: number | null
    }
    summary: {
      outOfStockProducts: number
      lowStockProducts: number
      inStockProducts: number
      notConfiguredProducts: number
      configuredProducts: number
      totalProducts: number
    }
  }
  message: string
  timestamp: string
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface CatalogFilters {
  categoryId?: number
  stockStatus?: StockStatus
  search?: string
  brand?: string
  isActive?: boolean
  isConfigured?: boolean
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}
