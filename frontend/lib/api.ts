import apiClient from './api-client';

async function fetchAPI(endpoint: string, method = 'GET', body: any = null) {
  try {
    const response = await apiClient({
      url: `/${endpoint}`,
      method: method.toLowerCase() as any,
      data: body,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
}

export const api = {
  getProducts: () => fetchAPI('products'),
  createProduct: (product: any) => fetchAPI('products', 'POST', product),
};
