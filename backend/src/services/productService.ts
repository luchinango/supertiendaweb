import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ProductResponse {
  id: number;
  supplier_id: number;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  purchase_price: number;
  sale_price: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  unit: string;
  min_stock: number;
  max_stock: number;
  actual_stock: number;
  expiration_date?: string;
  image?: string;
  category_name?: string;
  supplier_name?: string;
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

// Funciones específicas para products.ts
export const createProduct = async (product: Partial<ProductResponse>): Promise<ApiResponse<ProductResponse>> => {
  return await api.post('/api/products', product).then((res: AxiosResponse) => res.data);
};

export const fetchProducts = async (): Promise<ApiResponse<ProductResponse[]>> => {
  return await api.get('/api/products').then((res: AxiosResponse) => res.data);
};

export const fetchProductById = async (id: number): Promise<ApiResponse<ProductResponse>> => {
  return await api.get(`/api/products/${id}`).then((res: AxiosResponse) => res.data);
};

export const updateProduct = async (id: number, product: Partial<ProductResponse>): Promise<ApiResponse<ProductResponse>> => {
  return await api.put(`/api/products/${id}`, product).then((res: AxiosResponse) => res.data);
};

export const patchProduct = async (id: number, updates: Partial<ProductResponse>): Promise<ApiResponse<ProductResponse>> => {
  return await api.patch(`/api/products/${id}`, updates).then((res: AxiosResponse) => res.data);
};

export const deactivateProduct = async (id: number): Promise<ApiResponse<{ message: string; data: Partial<ProductResponse> }>> => {
  return await api.post(`/api/products/delete/${id}`).then((res: AxiosResponse) => res.data);
};

export default api;