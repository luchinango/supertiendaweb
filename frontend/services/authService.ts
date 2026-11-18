import apiClient from '@/lib/api-client'
import type { AxiosError } from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '@/types'

interface BackendLoginResponse {
  success: boolean
  data: LoginResponse
  message: string
  timestamp: string
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await apiClient.post<BackendLoginResponse>('/auth/login', credentials)

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data
        }
      } else {
        return {
          success: false,
          error: response.data.message || 'Error de autenticación',
        }
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
      const response = await apiClient.post('/auth/verify')
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      // Sin respuesta HTTP = red/offline: propagar para restauración local (P2-C1.F2)
      if (!axiosError.response) {
        throw error
      }
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Error de autenticación',
      }
    }
  },

  /**
   * Logout local-only: no hay revocación server-side de JWT en P1-D.
   * El caller debe borrar token/refresh del almacenamiento local.
   */
  logout: async (): Promise<ApiResponse> => {
    return {
      success: true,
      message: 'Sesión cerrada localmente (sin revocación server-side)',
    }
  },
}
