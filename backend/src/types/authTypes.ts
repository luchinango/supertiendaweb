import {EmployeeStatus, Gender, UserStatus, BusinessStatus, Department, BusinessType} from '../../prisma/generated';

/**
 * Payload del token JWT
 */
export interface TokenPayload {
  userId: number;
  username: string;
  businessId: number;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: string;
    employee?: {
      firstName: string;
      lastName: string | null;
      position: string;
      startDate: Date;
      status: EmployeeStatus;
      gender: Gender;
      birthDate: Date | null;
      email: string | null;
      address: string | null;
      phone: string | null;
      businessId: number;
    };
  };
}

/**
 * Request de login
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Request de cambio de contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Request de refresh token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Respuesta completa del verify token
 */
export interface VerifyTokenResponse {
  id: number;
  username: string;
  phone: string | null;
  status: UserStatus;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  role: {
    id: number;
    name: string;
    code: string;
  };
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    startDate: Date;
    endDate: Date | null;
    salary: string | null;
    gender: Gender;
    birthDate: Date | null;
    email: string | null;
    address: string | null;
    phone: string | null;
    ciNumber: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    status: EmployeeStatus;
    businessId: number;
    business: {
      id: number;
      name: string;
      legalName: string;
      nit: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      department: Department;
      country: string | null;
      businessType: BusinessType;
      status: BusinessStatus;
    };
  } | null;
}
