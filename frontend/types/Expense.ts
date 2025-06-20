export interface Expense {
  id: number
  name: string
  amount: number
  category: string
  date: string
  is_debt: boolean
  payment_method?: 'cash' | 'card' | 'transfer' | 'credit'
  supplier_id?: number
  supplier_name?: string
  due_date?: string
  notes?: string
  status: 'paid' | 'pending' | 'overdue'
  created_at: string
  updated_at: string
  products?: ExpenseProduct[]
}

export interface ExpenseProduct {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface ExpenseCategory {
  id: string
  name: string
  icon: React.ReactNode
  description?: string
}

export interface ExpenseFormData {
  name: string
  amount: number
  category: string
  date: Date
  is_debt: boolean
  payment_method?: 'cash' | 'card' | 'transfer' | 'credit'
  supplier_id?: number
  notes?: string
  products?: ExpenseProduct[]
}

export interface ExpenseDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (expenseId: number) => void
}

export interface EditExpensePanelProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense
  onSave: (updatedExpense: Expense) => void
}
