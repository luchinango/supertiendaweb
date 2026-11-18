import { Request as ExpressRequest } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';

/** Rol de plataforma CODEMEDIIA (sin Employee / sin businessId de tenant). */
export const PLATFORM_ADMIN_ROLE = 'PLATFORM_ADMIN';

export interface PlatformAuthUser {
  id: number;
  userId: number;
  username: string;
  role: typeof PLATFORM_ADMIN_ROLE;
  businessId: null;
}

export function isPlatformRole(role: string | undefined | null): boolean {
  return role === PLATFORM_ADMIN_ROLE;
}

/**
 * Exige usuario de plataforma ya autenticado en request.user
 * (rol rehidratado desde BD vía expressAuthentication).
 */
export function requirePlatformUser(request: ExpressRequest): PlatformAuthUser {
  const user = request.user as
    | { userId?: number; username?: string; role?: string; businessId?: number | null }
    | undefined;

  if (!user?.userId) {
    throw new UnauthorizedError('Usuario no autenticado');
  }

  if (!isPlatformRole(user.role)) {
    throw new ForbiddenError('Se requiere administrador de plataforma');
  }

  if (user.businessId != null) {
    throw new ForbiddenError('Contexto de plataforma inválido');
  }

  return {
    id: user.userId,
    userId: user.userId,
    username: user.username || '',
    role: PLATFORM_ADMIN_ROLE,
    businessId: null,
  };
}

/** Rechaza tokens de plataforma en rutas de tenant. */
export function rejectPlatformOnTenantRoute(role: string | undefined): void {
  if (isPlatformRole(role)) {
    throw new ForbiddenError('Usuario de plataforma no autorizado en rutas de empresa');
  }
}
