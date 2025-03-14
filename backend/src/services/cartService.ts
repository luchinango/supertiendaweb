import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface CartResponse {
  id: number;
  customer_id: number;
  created_at: string;
}

interface CartItemResponse {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  name?: string;
  price?: number;
}

interface CheckoutResponse {
  message: string;
  total_cost: number;
  customer_payment_method: string;
  transaction: {
    id: number;
    customer_id: number;
    user_id: number;
    amount: number;
    type: string;
    reference: string;
    created_at: string;
  };
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

// Funciones específicas para cart.ts
export const createCart = async (customer_id: number): Promise<ApiResponse<CartResponse>> => {
  return await api.post('/api/cart', { customer_id }).then((res: AxiosResponse) => res.data);
};

export const addItemToCart = async (item: { cart_id: number; product_id: number; quantity?: number }): Promise<ApiResponse<CartItemResponse>> => {
  return await api.post('/api/cart/items', item).then((res: AxiosResponse) => res.data);
};

export const fetchCartItems = async (cartId: number): Promise<ApiResponse<CartItemResponse[]>> => {
  return await api.get(`/api/cart/${cartId}`).then((res: AxiosResponse) => res.data);
};

export const removeItemFromCart = async (
  cartId: number,
  itemId: number
): Promise<ApiResponse<{ message: string; removedItem: CartItemResponse; updatedStock: number }>> => {
  return await api.delete(`/api/cart/${cartId}/items/${itemId}`).then((res: AxiosResponse) => res.data);
};

export const checkoutCart = async (
  cartId: number,
  checkoutData: { customer_payment_method: 'cash' | 'credit'; user_id: number }
): Promise<ApiResponse<CheckoutResponse>> => {
  return await api.post(`/api/cart/${cartId}/checkout`, checkoutData).then((res: AxiosResponse) => res.data);
};

export default api;