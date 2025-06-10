import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface TransactionResponse {
  id: number;
  customer_id: number;
  user_id: number;
  amount: number;
  type: 'cash' | 'credit';
  invoice_number?: string;
  notes?: string;
  status?: string;
  created_at: string;
}

interface TransactionListResponse {
  total: number;
  transactions: TransactionResponse[];
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

// Funciones específicas para transactions.ts
export const createTransaction = async (
  customerId: number,
  transaction: { amount: number; type: 'cash' | 'credit'; invoice_number?: string; notes?: string }
): Promise<ApiResponse<TransactionResponse>> => {
  return await api.post(`/api/customers/${customerId}/transactions`, transaction).then((res: AxiosResponse) => res.data);
};

export const fetchTransactionsByCustomer = async (
  customerId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<TransactionListResponse>> => {
  return await api.get(`/api/customers/${customerId}/transactions?limit=${limit}&offset=${offset}`).then((res: AxiosResponse) => res.data);
};

export const fetchTransactionById = async (
  customerId: number,
  transactionId: number
): Promise<ApiResponse<TransactionResponse>> => {
  return await api.get(`/api/customers/${customerId}/transactions/${transactionId}`).then((res: AxiosResponse) => res.data);
};

export const cancelTransaction = async (
  customerId: number,
  transactionId: number
): Promise<ApiResponse<TransactionResponse>> => {
  return await api.patch(`/api/customers/${customerId}/transactions/${transactionId}/cancel`).then((res: AxiosResponse) => res.data);
};

interface TransactionService {
  createSale(data: any): Promise<any>;
  createExpense(data: any): Promise<any>;
  getTransactions(filters: any): Promise<any>;
}

const transactionService: TransactionService = {
  async createSale(data) {
    // Implementation of createSale
    return Promise.resolve({ /* sale data */ });
  },
  async createExpense(data) {
    // Implementation of createExpense
    return Promise.resolve({ /* expense data */ });
  },
  async getTransactions(filters) {
    // Implementation of getTransactions
    return Promise.resolve([]);
  }
};

export default transactionService;
// export default api;
