import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
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

// Funciones específicas para categories.ts
export const createCategory = async (category: { name: string; description?: string }): Promise<ApiResponse<{ message: string; category: CategoryResponse }>> => {
  return await api.post('/api/categories', category).then((res: AxiosResponse) => res.data);
};

export const fetchCategories = async (includeInactive: boolean = false): Promise<ApiResponse<CategoryResponse[]>> => {
  return await api.get(`/api/categories?includeInactive=${includeInactive}`).then((res: AxiosResponse) => res.data);
};

export const fetchCategoryById = async (id: number): Promise<ApiResponse<CategoryResponse>> => {
  return await api.get(`/api/categories/${id}`).then((res: AxiosResponse) => res.data);
};

export const updateCategory = async (id: number, category: Partial<CategoryResponse>): Promise<ApiResponse<{ message: string; category: CategoryResponse }>> => {
  return await api.put(`/api/categories/${id}`, category).then((res: AxiosResponse) => res.data);
};

export const deactivateCategory = async (id: number): Promise<ApiResponse<{ message: string; category: CategoryResponse }>> => {
  return await api.delete(`/api/categories/${id}`).then((res: AxiosResponse) => res.data);
};

export default api;