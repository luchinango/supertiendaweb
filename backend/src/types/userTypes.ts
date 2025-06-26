import {UserStatus, Gender, EmployeeStatus} from '../../prisma/generated';

/**
 * Usuario básico sin información sensible
 */
export interface UserBasic {
  id: number;
  username: string;
  phone?: string | null;
  status: UserStatus;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
}

/**
 * Usuario completo con relaciones
 */
export interface User {
  id: number;
  username: string;
  phone?: string | null;
  status: UserStatus;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  role: {
    id: number;
    code: string;
    name: string;
    description?: string | null;
  };
  employee?: {
    id: number;
    firstName: string;
    lastName?: string | null;
    position: string;
    department?: string | null;
    startDate: Date;
    endDate?: Date | null;
    salary?: number | null;
    status: EmployeeStatus;
    gender: Gender;
    birthDate?: Date | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    ciNumber?: string | null;
    businessId: number;
  } | null;
}

/**
 * Request para crear usuario
 */
export interface CreateUserRequest {
  username: string;
  password: string;
  phone?: string;
  roleId: number;
  status?: UserStatus;
  employee?: {
    firstName: string;
    lastName?: string;
    position: string;
    department?: string;
    startDate: Date;
    salary?: number;
    gender: Gender;
    birthDate?: Date;
    email?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    ciNumber?: string;
    businessId: number;
  };
}

/**
 * Request para actualizar usuario
 */
export interface UpdateUserRequest {
  phone?: string;
  roleId?: number;
  status?: UserStatus;
  employee?: {
    firstName?: string;
    lastName?: string;
    position?: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    salary?: number;
    status?: EmployeeStatus;
    gender?: Gender;
    birthDate?: Date;
    email?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    ciNumber?: string;
    businessId?: number;
  };
}

/**
 * Request para cambiar contraseña
 */
export interface ChangeUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Request para resetear contraseña
 */
export interface ResetUserPasswordRequest {
  newPassword: string;
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UserFilters {
  status?: UserStatus;
  roleId?: number;
  businessId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada de usuarios
 */
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

/**
 * Estadísticas de usuarios
 */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pendingVerification: number;
  byRole: {
    roleName: string;
    count: number;
  }[];
  byBusiness: {
    businessName: string;
    count: number;
  }[];
}
