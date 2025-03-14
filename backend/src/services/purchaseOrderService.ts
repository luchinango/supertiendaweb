import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface PurchaseOrderResponse {
  id: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  order_date?: string;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  payment_type?: 'cash' | 'credit' | 'consignment';
  total_amount?: number;
  product_name?: string;
  supplier_name?: string;
}

interface ProductResponse {
  id: number;
  name: string;
  actual_stock: number;
  min_stock: number;
  supplier_id: number;
  price: number;
  category_id?: number;
}

interface CheckStockResponse {
  message: string;
  orders: PurchaseOrderResponse[];
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

// Funciones específicas para purchase_orders.ts
export const createProduct = async (product: Partial<ProductResponse>): Promise<ApiResponse<ProductResponse>> => {
  return await api.post('/api/purchase-orders/products', product).then((res: AxiosResponse) => res.data);
};

export const checkStockAndCreateOrders = async (): Promise<ApiResponse<CheckStockResponse>> => {
  return await api.get('/api/purchase-orders/check-stock').then((res: AxiosResponse) => res.data);
};

export const createPurchaseOrder = async (
  order: { product_id: number; supplier_id: number; quantity: number; payment_type?: 'cash' | 'credit' | 'consignment'; status?: string }
): Promise<ApiResponse<PurchaseOrderResponse>> => {
  return await api.post('/api/purchase-orders', order).then((res: AxiosResponse) => res.data);
};

export const processPurchaseOrder = async (id: number, payment_type?: string): Promise<ApiResponse<PurchaseOrderResponse>> => {
  return await api.post(`/api/purchase-orders/${id}/process`, { payment_type }).then((res: AxiosResponse) => res.data);
};

export const fetchPurchaseOrders = async (): Promise<ApiResponse<PurchaseOrderResponse[]>> => {
  return await api.get('/api/purchase-orders').then((res: AxiosResponse) => res.data);
};

export const fetchPurchaseOrderById = async (id: number): Promise<ApiResponse<PurchaseOrderResponse>> => {
  return await api.get(`/api/purchase-orders/${id}`).then((res: AxiosResponse) => res.data);
};

export const updatePurchaseOrder = async (
  id: number,
  order: Partial<PurchaseOrderResponse>
): Promise<ApiResponse<PurchaseOrderResponse>> => {
  return await api.put(`/api/purchase-orders/${id}`, order).then((res: AxiosResponse) => res.data);
};

export const deletePurchaseOrder = async (id: number): Promise<ApiResponse<{ message: string; purchaseOrder: PurchaseOrderResponse }>> => {
  return await api.delete(`/api/purchase-orders/${id}`).then((res: AxiosResponse) => res.data);
};

export default api;