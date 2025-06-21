import type { ApiResponse } from './Api'

export interface User {
  id: number
  email: string
  name: string
  username: string
  role: "admin" | "employee" | "owner"
  businessId?: number
  permissions?: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterRequest {
  name: string
  email: string
  username: string
  password: string
  businessName: string
  businessType: string
}

export interface RegisterResponse {
  user: User
  token: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  checkAuth: () => Promise<void>
}

export type { ApiResponse }
