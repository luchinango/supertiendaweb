import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface SupplierResponse {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  company_name: string;
  tax_id: string;
  address?: string;
  supplier_type: string;
  status: string;
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

// Funciones específicas para suppliers.ts
export const createSupplier = async (supplier: Partial<SupplierResponse>): Promise<ApiResponse<SupplierResponse>> => {
  return await api.post('/api/suppliers', supplier).then((res: AxiosResponse) => res.data);
};

export const fetchSuppliers = async (): Promise<ApiResponse<SupplierResponse[]>> => {
  return await api.get('/api/suppliers').then((res: AxiosResponse) => res.data);
};

export const fetchSupplierById = async (id: number): Promise<ApiResponse<SupplierResponse>> => {
  return await api.get(`/api/suppliers/${id}`).then((res: AxiosResponse) => res.data);
};

export const updateSupplier = async (id: number, supplier: Partial<SupplierResponse>): Promise<ApiResponse<SupplierResponse>> => {
  return await api.put(`/api/suppliers/${id}`, supplier).then((res: AxiosResponse) => res.data);
};

export const patchSupplier = async (id: number, updates: Partial<SupplierResponse>): Promise<ApiResponse<SupplierResponse>> => {
  return await api.patch(`/api/suppliers/${id}`, updates).then((res: AxiosResponse) => res.data);
};

export const deactivateSupplier = async (id: number): Promise<ApiResponse<{ message: string; data: Partial<SupplierResponse> }>> => {
  return await api.post(`/api/suppliers/delete/${id}`).then((res: AxiosResponse) => res.data);
};

export default api;
