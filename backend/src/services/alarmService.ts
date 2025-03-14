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
}

interface TotalResponse {
  total: number;
}

interface PurchaseOrderResponse {
  id: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  total_amount: number;
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

// Funciones específicas para alarms.ts
export const fetchTotalExpiringProducts = async (): Promise<ApiResponse<TotalResponse>> => {
  return await api.get('/api/alarms/expiring_products/total').then((res: AxiosResponse) => res.data);
};

export const fetchTotalExpiredProducts = async (): Promise<ApiResponse<TotalResponse>> => {
  return await api.get('/api/alarms/expired_products/total').then((res: AxiosResponse) => res.data);
};

export const fetchTotalLowStockProducts = async (): Promise<ApiResponse<TotalResponse>> => {
  return await api.get('/api/alarms/low_stock_products/total').then((res: AxiosResponse) => res.data);
};

export const fetchExpiringProducts = async (): Promise<ApiResponse<ProductResponse[]>> => {
  return await api.get('/api/alarms/expiring_products').then((res: AxiosResponse) => res.data);
};

export const fetchExpiredProducts = async (): Promise<ApiResponse<ProductResponse[]>> => {
  return await api.get('/api/alarms/expired_products').then((res: AxiosResponse) => res.data);
};

export const fetchLowStockProducts = async (): Promise<ApiResponse<ProductResponse[]>> => {
  return await api.get('/api/alarms/low_stock_products').then((res: AxiosResponse) => res.data);
};

export const removeExpiredProduct = async (id: number): Promise<ApiResponse<{ message: string }>> => {
  return await api.put(`/api/alarms/remove_expired_product/${id}`).then((res: AxiosResponse) => res.data);
};

export const createPurchaseOrder = async (id: number): Promise<ApiResponse<{ message: string }>> => {
  return await api.post(`/api/alarms/create_purchase_order/${id}`).then((res: AxiosResponse) => res.data);
};

export const fetchPurchaseOrders = async (): Promise<ApiResponse<PurchaseOrderResponse[]>> => {
  return await api.get('/api/alarms/purchase_orders').then((res: AxiosResponse) => res.data);
};

export default api;