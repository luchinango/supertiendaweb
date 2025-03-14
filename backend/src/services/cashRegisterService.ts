import axios, { AxiosInstance, AxiosResponse } from 'axios';

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

interface CheckStatusResponse {
  message: string;
  cashRegister?: CashRegisterResponse;
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

// Funciones específicas para cashRegisters.ts
export const openCashRegister = async (
  data: { opening_amount: number; notes?: string }
): Promise<ApiResponse<{ message: string; cashRegister: CashRegisterResponse }>> => {
  return await api.post('/api/cash-registers/open', data).then((res: AxiosResponse) => res.data);
};

export const closeCashRegister = async (
  data: { closing_amount: number; notes?: string }
): Promise<ApiResponse<{ message: string; cashRegister: CashRegisterResponse }>> => {
  return await api.put('/api/cash-registers/close', data).then((res: AxiosResponse) => res.data);
};

export const unexpectedCloseCashRegister = async (): Promise<ApiResponse<{ message: string; cashRegister: CashRegisterResponse }>> => {
  return await api.put('/api/cash-registers/unexpected-close').then((res: AxiosResponse) => res.data);
};

export const checkCashRegisterStatus = async (): Promise<ApiResponse<CheckStatusResponse>> => {
  return await api.get('/api/cash-registers/check-status').then((res: AxiosResponse) => res.data);
};

export const auditAndCloseCashRegister = async (
  data: { closing_amount: number; notes?: string }
): Promise<ApiResponse<{ message: string; cashRegister: CashRegisterResponse }>> => {
  return await api.put('/api/cash-registers/audit-and-close', data).then((res: AxiosResponse) => res.data);
};

export default api;