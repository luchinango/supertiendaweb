import type {Category} from "@/types/Category";

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  cost: number
  profit: number
  profit_perc: number
  purchase_price?: number
  sale_price?: number
  sku?: string
  barcode?: string
  brand?: string
  unit?: string
  min_stock: number
  max_stock: number
  stock: number
  expiration_date?: string
  image?: string
  category_id?: number
  status?: string
  shelf_life_days?: number
  is_organic: boolean
  alert_sent?: boolean
  created_at: string
  updated_at: string
  category: Category
}
