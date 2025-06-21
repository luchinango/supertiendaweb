import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { getAuthToken, removeAuthToken } from './auth-utils'

// const API_BASE_URL = process.env['NEXT_PUBLIC_BACKEND_URL'] || 'http://localhost:3001'
const API_BASE_URL = '/api/'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeAuthToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'Error del servidor'
  } else if (error.request) {
    return 'Error de conexión. Verifica tu conexión a internet.'
  } else {
    return 'Error inesperado'
  }
}

export default apiClient
