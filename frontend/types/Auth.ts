import type { ApiResponse } from './Api'

export interface EmployeeData {
  businessId: number
  phone: string
  address: string
  email: string
  birthDate: string
  gender: "MALE" | "FEMALE"
  status: "ACTIVE" | "INACTIVE"
  startDate: string
  position: string
  lastName: string
  firstName: string
}

export interface User {
  id: number
  username: string
  role: string
  employee?: EmployeeData
  email?: string
  name?: string
  businessId?: number
  permissions?: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
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
