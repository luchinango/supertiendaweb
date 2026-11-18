import apiClient from './api-client';
import type { AxiosRequestConfig } from 'axios';

const convertFetchOptionsToAxios = (options?: RequestInit): AxiosRequestConfig => {
  if (!options) return {};

  const axiosConfig: AxiosRequestConfig = {};

  if (options.method) {
    axiosConfig.method = options.method.toLowerCase() as any;
  }

  if (options.body) {
    axiosConfig.data = options.body;
  }

  if (options.headers) {
    axiosConfig.headers = options.headers as any;
  }

  return axiosConfig;
};

export async function fetcher<T = any>(url: string, options?: RequestInit): Promise<T> {
  try {
    const axiosConfig = convertFetchOptionsToAxios(options);
    const response = await apiClient({
      url,
      ...axiosConfig,
    });

    return response.data;
  } catch (error: any) {
    const status = error.response?.status as number | undefined;
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const err = new Error(message) as Error & { status?: number; isForbidden?: boolean };
    err.status = status;
    err.isForbidden = status === 403;
    // Contención P1-F: 403 de catálogo maestro no debe tratarse como éxito
    throw err;
  }
}

// Helper para SWR - más simple y directo
export const swrFetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error fetching data');
  }
};
