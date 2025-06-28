import apiClient from '@/lib/api-client'
import type { AxiosError } from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '@/types'

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Error de autenticación',
      }
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return {
      success: false,
      error: 'Registro no implementado en el backend',
    }

    // try {
    //   const response = await apiClient.post<RegisterResponse>('/auth/register', userData)
    //   return {
    //     success: true,
    //     data: response.data,
    //   }
    // } catch (error) {
    //   const axiosError = error as AxiosError<{ message: string }>
    //   return {
    //     success: false,
    //     error: axiosError.response?.data?.message || 'Error en el registro',
    //   }
    // }
  },

  me: async (): Promise<ApiResponse<any>> => {
    try {
      // Usa la ruta y método que tu backend espera
      const response = await apiClient.get('/auth/me')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Error de autenticación',
      }
    }
  },

  logout: async (): Promise<ApiResponse> => {
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    }
  },
}
