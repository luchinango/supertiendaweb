import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Tipos basados en user.ts.bk
interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  mobile_phone?: string;
  role_id: number;
  role?: string;
  created_at?: string;
  status?: string;
}

interface SupplierDebtResponse {
  id: number;
  supplier_id: number;
  user_id: number;
  amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
  supplier_name?: string;
  total_paid?: number;
}

interface DebtPaymentResponse {
  id: number;
  debt_id: number;
  amount: number;
  payment_date: string;
}

interface ConsignmentResponse {
  id: number;
  supplier_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  total_value: number;
  sold_value: number;
  status: string;
  created_at: string;
  updated_at: string;
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

// Funciones específicas para user.ts.bk
export const loginUser = async (email: string, password: string): Promise<ApiResponse<{ token: string }>> => {
  return await api.post('/api/users/login', { email, password }).then((res: AxiosResponse) => res.data);
};

export const registerUser = async (user: Partial<UserResponse>): Promise<ApiResponse<UserResponse>> => {
  return await api.post('/api/users/register', user).then((res: AxiosResponse) => res.data);
};

export const fetchUsers = async (): Promise<ApiResponse<UserResponse[]>> => {
  return await api.get('/api/users').then((res: AxiosResponse) => res.data);
};

export const fetchUserById = async (id: number): Promise<ApiResponse<UserResponse>> => {
  return await api.get(`/api/users/${id}`).then((res: AxiosResponse) => res.data);
};

export const updateUser = async (id: number, user: Partial<UserResponse>): Promise<ApiResponse<UserResponse>> => {
  return await api.put(`/api/users/${id}`, user).then((res: AxiosResponse) => res.data);
};

export const patchUser = async (id: number, updates: Partial<UserResponse>): Promise<ApiResponse<UserResponse>> => {
  return await api.patch(`/api/users/${id}`, updates).then((res: AxiosResponse) => res.data);
};

export const deactivateUser = async (id: number): Promise<ApiResponse<{ message: string; data: Partial<UserResponse> }>> => {
  return await api.post(`/api/users/delete/${id}`).then((res: AxiosResponse) => res.data);
};

// Deudas con proveedores
export const createSupplierDebt = async (
  userId: number,
  supplierId: number,
  debt: { amount: number; products?: { product_id: number; quantity: number; price: number }[] }
): Promise<ApiResponse<{ message: string; debt: SupplierDebtResponse }>> => {
  return await api.post(`/api/users/${userId}/suppliers/${supplierId}/debts`, debt).then((res: AxiosResponse) => res.data);
};

export const recordDebtPayment = async (
  userId: number,
  supplierId: number,
  debtId: number,
  payment: { amount: number }
): Promise<ApiResponse<{ message: string; payment: DebtPaymentResponse }>> => {
  return await api.post(`/api/users/${userId}/suppliers/${supplierId}/debts/${debtId}/payments`, payment).then((res: AxiosResponse) => res.data);
};

export const fetchUserDebts = async (userId: number): Promise<ApiResponse<SupplierDebtResponse[]>> => {
  return await api.get(`/api/users/${userId}/debts`).then((res: AxiosResponse) => res.data);
};

// Consignaciones
export const createConsignment = async (
  userId: number,
  supplierId: number,
  consignment: { items: { product_id: number; quantity_sent: number }[]; end_date?: string }
): Promise<ApiResponse<{ message: string; consignment: ConsignmentResponse }>> => {
  return await api.post(`/api/users/${userId}/suppliers/${supplierId}/consignments`, consignment).then((res: AxiosResponse) => res.data);
};

export const settleConsignment = async (
  userId: number,
  supplierId: number,
  consignmentId: number,
  items: { product_id: number; quantity_sold: number }[]
): Promise<ApiResponse<{ message: string; totalAmount: number }>> => {
  return await api.post(`/api/users/${userId}/suppliers/${supplierId}/consignments/${consignmentId}/settle`, { items }).then((res: AxiosResponse) => res.data);
};

export default api;
