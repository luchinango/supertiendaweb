import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface CustomerResponse {
  id: number;
  first_name: string;
  last_name: string;
  address?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  email?: string;
  status?: 'active' | 'inactive';
  balance?: number;
  credit_limit?: number;
}

interface CreditResponse {
  id: number;
  customer_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
  credit_limit?: number;
  status?: string;
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

// Funciones específicas para customers.ts
export const registerCustomer = async (customer: Partial<CustomerResponse> & { credit_limit?: number }): Promise<ApiResponse<CustomerResponse>> => {
  return await api.post('/api/customers/register', customer).then((res: AxiosResponse) => res.data);
};

export const fetchCustomers = async (): Promise<ApiResponse<CustomerResponse[]>> => {
  return await api.get('/api/customers').then((res: AxiosResponse) => res.data);
};

export const fetchCustomerById = async (id: number): Promise<ApiResponse<CustomerResponse>> => {
  return await api.get(`/api/customers/${id}`).then((res: AxiosResponse) => res.data);
};

export const updateCustomer = async (id: number, customer: Partial<CustomerResponse> & { credit_limit?: number }): Promise<ApiResponse<CustomerResponse>> => {
  return await api.put(`/api/customers/${id}`, customer).then((res: AxiosResponse) => res.data);
};

export const patchCustomer = async (id: number, updates: Partial<CustomerResponse> & { credit_limit?: number }): Promise<ApiResponse<CustomerResponse>> => {
  return await api.patch(`/api/customers/${id}`, updates).then((res: AxiosResponse) => res.data);
};

export const updateCustomerCredit = async (id: number, balance: number): Promise<ApiResponse<CreditResponse>> => {
  return await api.post(`/api/customers/${id}/credits`, { balance }).then((res: AxiosResponse) => res.data);
};

export const deactivateCustomer = async (id: number): Promise<ApiResponse<{ message: string; data: Partial<CustomerResponse> }>> => {
  return await api.delete(`/api/customers/${id}`).then((res: AxiosResponse) => res.data);
};

export default api;