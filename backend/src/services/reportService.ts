import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface GeneralReportResponse {
  totalSales: number;
  productsSold: number;
  activeCustomers: number;
  totalInventory: number;
}

interface BalanceResponse {
  balance: number;
}

interface ExpensesResponse {
  totalExpenses: number;
}

interface SalesResponse {
  total_sales: number;
}

interface TransactionResponse {
  id: number;
  customer_id: number;
  user_id: number;
  amount: number;
  type: string;
  created_at: string;
  [key: string]: any; // Para campos adicionales como reference
}

interface CreditResponse {
  id: number;
  first_name: string;
  last_name: string;
  balance: number;
}

interface PayableCreditResponse {
  id: number;
  company_name: string;
  remaining_amount: number;
}

interface CashRegisterResponse {
  id: number;
  user_id: number;
  opening_amount: number;
  closing_amount?: number;
  opening_date: string;
  closing_date?: string;
  notes?: string;
  status: 'abierta' | 'cerrada' | 'pendiente';
}

interface BestSellingProductResponse {
  product_id: number;
  product_name: string;
  supplier_id?: number;
  supplier_name?: string;
  total_quantity_sold: number;
}

interface FrequentCustomerResponse {
  customer_id: number;
  first_name: string;
  last_name: string;
  transaction_count: number;
}

interface ErrorResponse {
  error: string;
  message: string;
}

type ApiResponse<T> = T | ErrorResponse;

const API_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones específicas para report.ts
export const fetchGeneralReport = async (): Promise<ApiResponse<GeneralReportResponse>> => {
  return await api.get('/api/report').then((res: AxiosResponse) => res.data);
};

export const fetchBalance = async (): Promise<ApiResponse<BalanceResponse>> => {
  return await api.get('/api/report/balance').then((res: AxiosResponse) => res.data);
};

export const fetchExpenses = async (): Promise<ApiResponse<ExpensesResponse>> => {
  return await api.get('/api/report/expenses').then((res: AxiosResponse) => res.data);
};

export const fetchSales = async (): Promise<ApiResponse<SalesResponse>> => {
  return await api.get('/api/report/sales').then((res: AxiosResponse) => res.data);
};

export const fetchTransactions = async (): Promise<ApiResponse<TransactionResponse[]>> => {
  return await api.get('/api/report/transactions').then((res: AxiosResponse) => res.data);
};

export const fetchIncomeTransactions = async (): Promise<ApiResponse<TransactionResponse[]>> => {
  return await api.get('/api/report/transactions/income').then((res: AxiosResponse) => res.data);
};

export const fetchExpenseTransactions = async (): Promise<ApiResponse<TransactionResponse[]>> => {
  return await api.get('/api/report/transactions/expenses').then((res: AxiosResponse) => res.data);
};

export const fetchCredits = async (): Promise<ApiResponse<CreditResponse[]>> => {
  return await api.get('/api/report/credits').then((res: AxiosResponse) => res.data);
};

export const fetchPayableCredits = async (): Promise<ApiResponse<PayableCreditResponse[]>> => {
  return await api.get('/api/report/payable_credits').then((res: AxiosResponse) => res.data);
};

export const fetchCashRegisters = async (): Promise<ApiResponse<CashRegisterResponse[]>> => {
  return await api.get('/api/report/cash_registers').then((res: AxiosResponse) => res.data);
};

export const fetchBestSellingProducts = async (): Promise<ApiResponse<BestSellingProductResponse[]>> => {
  return await api.get('/api/report/best_selling_products').then((res: AxiosResponse) => res.data);
};

export const fetchFrequentCustomers = async (): Promise<ApiResponse<FrequentCustomerResponse[]>> => {
  return await api.get('/api/report/frequent_customers').then((res: AxiosResponse) => res.data);
};

export default api;