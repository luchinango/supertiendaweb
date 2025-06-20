import type {Product} from './Product'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  available: number
  image?: string
  barcode?: string
  category?: string
}

export interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (id: number, quantity: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
  getItemQuantity: (productId: number) => number
}

export interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemoveItem: (id: number) => void
}
