import type {Customer} from './Customer'

export interface Transaction {
  id: number
  type: 'sale' | 'purchase' | 'expense' | 'refund'
  date: string
  total: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit'
  customer?: Customer
  items: TransactionItem[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface TransactionItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  discount?: number
  tax?: number
}

export interface Sale extends Transaction {
  type: 'sale'
  customer: Customer
  subtotal: number
  tax_amount: number
  discount_amount: number
  change_amount?: number
  cashier_id: number
  cash_register_id?: number
}

export interface Purchase extends Transaction {
  type: 'purchase'
  supplier_id: number
  supplier_name: string
  order_number?: string
  delivery_date?: string
}

export interface Expense extends Transaction {
  type: 'expense'
  category: string
  supplier_id?: number
  supplier_name?: string
  is_debt: boolean
  due_date?: string
}

export interface TransactionDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transactionId: number) => void
}

export interface EditTransactionPanelProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
  onSave: (updatedTransaction: Transaction) => void
}
