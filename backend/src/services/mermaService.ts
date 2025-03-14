import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface MermaResponse {
  id: number;
  product_id: number;
  quantity: number;
  type: string;
  date: string;
  value: number;
  responsible_id?: number;
  observations?: string;
  kardex_id?: number;
  is_automated?: boolean;
  product_name?: string;
  responsible_name?: string;
}

interface MermaReportResponse {
  total_mermas: number;
  total_vencidos: number;
  total_dañados: number;
  total_perdidos: number;
  mermas_detalladas: MermaResponse[];
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

// Funciones específicas para mermas.ts
export const createMerma = async (
  merma: { product_id: number; quantity: number; type: string; date: string; value?: number; responsible_id?: number; observations?: string }
): Promise<ApiResponse<{ message: string; mermaId: number }>> => {
  return await api.post('/api/mermas', merma).then((res: AxiosResponse) => res.data);
};

export const fetchMermas = async (): Promise<ApiResponse<MermaResponse[]>> => {
  return await api.get('/api/mermas').then((res: AxiosResponse) => res.data);
};

export const deleteMerma = async (id: number): Promise<ApiResponse<{ message: string }>> => {
  return await api.delete(`/api/mermas/${id}`).then((res: AxiosResponse) => res.data);
};

export const checkExpiredProducts = async (): Promise<ApiResponse<CheckExpiredResponse>> => {
  return await api.post('/api/mermas/check-expired').then((res: AxiosResponse) => res.data);
};

export const fetchMermaReport = async (): Promise<ApiResponse<MermaReportResponse>> => {
  return await api.get('/api/mermas/report').then((res: AxiosResponse) => res.data);
};

export default api;