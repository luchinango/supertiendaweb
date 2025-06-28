export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: ValidationError[]
  pagination?: PaginationInfo
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: ValidationError[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface SearchParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

export interface ApiHookResult<T> {
  data: T | undefined
  error: ApiError | null
  isLoading: boolean
  isValidating: boolean
  mutate: (data?: T, options?: any) => Promise<T | undefined>
  revalidate: () => Promise<boolean>
}

export interface ApiMutationResult<T, V> {
  data: T | undefined
  error: ApiError | null
  isLoading: boolean
  mutate: (variables: V) => Promise<T | undefined>
  reset: () => void
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export interface NewPaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
  message?: string
  timestamp?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

export interface CrudResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: number
    username: string
    role: string
    employee?: any
  }
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  firstName?: string
  lastName?: string
}

export interface RegisterResponse {
  token: string
  user: {
    id: number
    username: string
    role: string
  }
}
