import { User } from '../types/userTypes';
import { UserResponse, EmployeeResponse } from '../types/api';
import { PaginatedResult } from '../types/pagination';

/**
 * Mapear Employee a EmployeeResponse
 */
export function mapEmployeeToEmployeeResponse(employee: any): EmployeeResponse | null {
  if (!employee) return null;

  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName ?? null,
    position: employee.position ?? null,
    department: employee.department ?? null,
    startDate: employee.startDate ?? null,
    endDate: employee.endDate ?? null,
    salary: employee.salary ?? null,
    status: employee.status ?? 'ACTIVE',
    gender: employee.gender ?? 'UNSPECIFIED',
    birthDate: employee.birthDate ?? null,
    email: employee.email ?? null,
    phone: employee.phone ?? null,
    address: employee.address ?? null,
    emergencyContact: employee.emergencyContact ?? null,
    emergencyPhone: employee.emergencyPhone ?? null,
    ciNumber: employee.ciNumber ?? null,
    businessId: employee.businessId ?? 1,
    createdAt: employee.createdAt ?? undefined,
    updatedAt: employee.updatedAt ?? undefined,
    userId: employee.userId ?? undefined,
    deletedAt: employee.deletedAt ?? null,
    business: employee.business ?? undefined,
    createdBy: employee.createdBy ?? 0,
    updatedBy: employee.updatedBy ?? 0,
    deletedBy: employee.deletedBy ?? null,
  };
}

/**
 * Mapear User a UserResponse
 */
export function mapUserToUserResponse(user: User): UserResponse {
  return {
    ...user,
    phone: user.phone ?? null,
    employee: (user.employee !== undefined && user.employee !== null
      ? mapEmployeeToEmployeeResponse(user.employee)
      : null) as EmployeeResponse | null,
    lastLogin: user.lastLogin ?? null,
  };
}

/**
 * Mapear resultado paginado de usuarios
 */
export function mapPaginatedUsersToResponse(
  result: PaginatedResult<User>
): PaginatedResult<UserResponse> {
  return {
    data: result.data.map(mapUserToUserResponse),
    meta: result.meta,
  };
}

/**
 * Mapear lista de usuarios a UserListResponse
 */
export function mapUsersToUserListResponse(users: User[]) {
  return users.map(mapUserToUserResponse);
}
