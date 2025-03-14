import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface PerishableReportItem {
  id: number;
  name: string;
  expirationDate?: string;
  stock: number;
  salePrice: number;
  isOrganic: boolean;
  category: string;
  status: string;
  daysSinceEntry?: number;
}

interface PerishableReportResponse {
  message: string;
  data: PerishableReportItem[];
  totalVencidos: number;
  generatedAt: string;
}

interface CheckExpiredResponse {
  message: string;
  mermasRegistradas: { product_id: number; quantity: number }[];
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

// Funciones específicas para perishables.ts
export const fetchPerishableReport = async (): Promise<ApiResponse<PerishableReportResponse>> => {
  return await api.get('/api/perishables/report').then((res: AxiosResponse) => res.data);
};

export const checkExpiredPerishables = async (): Promise<ApiResponse<CheckExpiredResponse>> => {
  return await api.post('/api/perishables/check-expired').then((res: AxiosResponse) => res.data);
};

export default api;