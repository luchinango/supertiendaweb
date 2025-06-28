import apiClient from '@/lib/api-client';

export async function openCashRegister(data: { initialAmount: number; userId: number }) {
  try {
    const response = await apiClient.post('/cash-registers/open', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al abrir caja');
  }
}