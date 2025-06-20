import type {Employee} from './Employee'

export interface CashRegister {
  id: number
  name: string
  status: 'open' | 'closed' | 'suspended'
  opening_balance: number
  current_balance: number
  total_sales: number
  total_cash: number
  total_card: number
  total_transfer: number
  total_refunds: number
  opened_by: Employee
  opened_at: string
  closed_by?: Employee
  closed_at?: string
  notes?: string
  transactions_count: number
  last_transaction_at?: string
}

export interface CashRegisterOpening {
  opening_balance: number
  notes?: string
}

export interface CashRegisterClosing {
  closing_balance: number
  expected_balance: number
  difference: number
  notes?: string
}

export interface CashRegisterTransaction {
  id: number
  cash_register_id: number
  type: 'opening' | 'sale' | 'refund' | 'expense' | 'withdrawal' | 'deposit' | 'closing'
  amount: number
  description: string
  created_at: string
  created_by: Employee
}

export interface CashRegisterProps {
  isOpen: boolean
  onClose: () => void
  status: 'open' | 'closed' | 'suspended'
  onStatusChange: (status: 'open' | 'closed' | 'suspended') => void
}

export interface CashRegisterDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  cashRegister: CashRegister
  onEdit?: (cashRegister: CashRegister) => void
}

export interface CashRegisterFormData {
  name: string
  opening_balance: number
  notes?: string
}
