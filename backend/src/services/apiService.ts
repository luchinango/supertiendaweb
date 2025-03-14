import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios/index';

// Definir tipos para las respuestas del backend (ajusta según tu API)
interface DataResponse {
  id: number;
  name: string;
  // Agrega más propiedades según lo que devuelva tu backend
}

interface PostRequest {
  name: string;
  // Agrega más propiedades según lo que envíes al backend
}

// Base URL desde variables de entorno
const API_URL: string | undefined = process.env.REACT_APP_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para obtener datos
export const fetchData = async (): Promise<DataResponse[]> => {
  try {
    const response: AxiosResponse<DataResponse[]> = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Función para enviar datos
export const postData = async (data: PostRequest): Promise<DataResponse> => {
  try {
    const response: AxiosResponse<DataResponse> = await api.post('/data', data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export default api;