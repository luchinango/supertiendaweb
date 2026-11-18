import { Request as ExpressRequest } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';
import { rejectPlatformOnTenantRoute } from './platformAuth';

export interface TenantAuthUser {
  id: number;
  userId: number;
  businessId: number;
  username: string;
  role: string;
}

/**
 * Obtiene el usuario autenticado adjunto por TSOA/expressAuthentication.
 * Rechaza PLATFORM_ADMIN (usar requirePlatformUser en rutas /platform).
 */
export function requireAuthUser(request: ExpressRequest): TenantAuthUser {
  const user = request.user as TenantAuthUser | undefined;

  if (!user?.userId) {
    throw new UnauthorizedError('Usuario no autenticado');
  }

  rejectPlatformOnTenantRoute(user.role);

  if (user.businessId == null || Number.isNaN(Number(user.businessId))) {
    throw new UnauthorizedError('Usuario sin empresa asignada');
  }

  return {
    id: user.userId,
    userId: user.userId,
    businessId: Number(user.businessId),
    username: user.username,
    role: user.role,
  };
}

/**
 * Resuelve el businessId efectivo desde el JWT.
 * Si el cliente envía businessId en query/body, solo se acepta si coincide con el token.
 * Nunca se usa fallback a businessId=1.
 */
export function resolveBusinessId(
  request: ExpressRequest,
  providedBusinessId?: number
): number {
  const user = requireAuthUser(request);

  if (
    providedBusinessId !== undefined &&
    providedBusinessId !== null &&
    Number(providedBusinessId) !== user.businessId
  ) {
    throw new ForbiddenError('No autorizado para acceder a datos de otra empresa');
  }

  return user.businessId;
}
