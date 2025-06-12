import {EmployeeStatus, Gender} from '../../prisma/generated';

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
