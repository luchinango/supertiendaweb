export interface ReportData {
  total_sales: number
  total_products: number
  total_customers: number
  total_suppliers: number
  low_stock_products: number
  expiring_products: number
  pending_orders: number
  overdue_credits: number
  monthly_sales: MonthlyData[]
  top_products: TopProduct[]
  top_categories: TopCategory[]
}

export interface MonthlyData {
  month: string
  sales: number
  expenses: number
  profit: number
  transactions: number
}

export interface TopProduct {
  id: number
  name: string
  sales_count: number
  revenue: number
  profit: number
}

export interface TopCategory {
  id: number
  name: string
  sales_count: number
  revenue: number
  products_count: number
}

export interface SalesReport {
  start_date: string
  end_date: string
  total_sales: number
  total_transactions: number
  average_ticket: number
  sales_by_payment_method: PaymentMethodData[]
  sales_by_category: CategorySalesData[]
  daily_sales: DailySalesData[]
}

export interface PaymentMethodData {
  method: 'cash' | 'card' | 'transfer' | 'credit'
  count: number
  amount: number
  percentage: number
}

export interface CategorySalesData {
  category_id: number
  category_name: string
  sales_count: number
  revenue: number
  percentage: number
}

export interface DailySalesData {
  date: string
  sales: number
  transactions: number
  average_ticket: number
}

export interface InventoryReport {
  total_products: number
  total_value: number
  low_stock_products: number
  out_of_stock_products: number
  expiring_products: number
  products_by_category: CategoryInventoryData[]
  value_by_category: CategoryValueData[]
}

export interface CategoryInventoryData {
  category_id: number
  category_name: string
  products_count: number
  total_stock: number
  total_value: number
}

export interface CategoryValueData {
  category_id: number
  category_name: string
  total_value: number
  percentage: number
}

export interface ReportFilter {
  start_date: Date
  end_date: Date
  category_id?: number
  supplier_id?: number
  payment_method?: 'cash' | 'card' | 'transfer' | 'credit'
  status?: 'pending' | 'completed' | 'cancelled'
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  include_charts: boolean
  include_details: boolean
}
