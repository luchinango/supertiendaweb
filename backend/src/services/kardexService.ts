import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface KardexMovementResponse {
  id: number;
  product_id: number;
  movement_type: 'entry' | 'exit';
  quantity: number;
  unit_price?: number;
  reference_id?: number;
  reference_type?: string;
  stock_after: number;
  movement_date: string;
  product_name?: string;
}

interface PriceComparisonResponse {
  purchase_history: { unit_price: number; created_at: string; supplier_name: string }[];
  low_price: { unit_price: number; created_at: string; supplier_name: string };
  best_price: { unit_price: number; created_at: string; supplier_name: string };
  lastPrice: { unit_price: number; created_at: string; supplier_name: string };
}

interface PurchaseOrderResponse {
  message: string;
  purchase_order_id: number;
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

// Funciones específicas para kardex.ts
export const registerKardexMovement = async (
  productId: number,
  movement: { movement_type: 'entry' | 'exit'; quantity: number; unit_price?: number; reference_id?: number; reference_type?: string }
): Promise<ApiResponse<KardexMovementResponse>> => {
  return await api.post(`/api/kardex/products/${productId}/movements`, movement).then((res: AxiosResponse) => res.data);
};

export const fetchKardexByProduct = async (
  productId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<{ total: number; movements: KardexMovementResponse[] }>> => {
  return await api.get(`/api/kardex/products/${productId}/kardex?limit=${limit}&offset=${offset}`).then((res: AxiosResponse) => res.data);
};

export const compareProductPrices = async (productId: number): Promise<ApiResponse<PriceComparisonResponse>> => {
  return await api.get(`/api/kardex/products/${productId}/prices`).then((res: AxiosResponse) => res.data);
};

export const registerPurchaseOrder = async (
  purchase: { supplier_id: number; items: { product_id: number; quantity: number; unit_price: number }[] }
): Promise<ApiResponse<PurchaseOrderResponse>> => {
  return await api.post('/api/kardex/purchase-orders', purchase).then((res: AxiosResponse) => res.data);
};

export default api;