import type {Product} from './Product'

export interface Promotion {
  id: number
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle'
  discount_percentage?: number
  discount_amount?: number
  start_date: string
  end_date: string
  is_active: boolean
  applies_to_all_products: boolean
  product_ids?: number[]
  category_ids?: number[]
  minimum_purchase?: number
  maximum_discount?: number
  usage_limit?: number
  used_count: number
  created_at: string
  updated_at: string
}

export interface ProductPromotion extends Promotion {
  product_id: number
  product: Product
  original_price: number
  promotional_price: number
  stock_affected: number
}

export interface BundlePromotion extends Promotion {
  type: 'bundle'
  bundle_items: BundleItem[]
  bundle_price: number
}

export interface BundleItem {
  product_id: number
  product_name: string
  quantity: number
  original_price: number
}

export interface PromotionFormData {
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle'
  discount_percentage?: number
  discount_amount?: number
  start_date: Date
  end_date: Date
  applies_to_all_products: boolean
  product_ids?: number[]
  category_ids?: number[]
  minimum_purchase?: number
  maximum_discount?: number
  usage_limit?: number
}

export interface CreatePromotionPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  onCreatePromotion: (promotion: PromotionFormData) => void
}

export interface PromotionFormProps {
  product?: Product
  onSubmit: (promotion: PromotionFormData) => void
  onCancel: () => void
}
