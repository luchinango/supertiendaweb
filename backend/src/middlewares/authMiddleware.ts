import {Request, Response, NextFunction} from 'express'
import {UnauthorizedError, NotFoundError, ForbiddenError} from '../errors'
import authService from '../services/authService'
import prisma from '../config/prisma'
import {isPlatformRole, PLATFORM_ADMIN_ROLE} from '../helpers/platformAuth'

export interface AuthenticatedUser {
  id: number
  userId: number
  /** null solo para PLATFORM_ADMIN verificado desde BD */
  businessId: number | null
  username: string
  role: string
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser
  }
}

/**
 * Middleware de autenticación JWT (rutas legacy no-TSOA).
 * Por defecto exige contexto de empresa (rechaza plataforma).
 */
export const authenticate = (roles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado')
      }

      const token = authHeader.split(' ')[1]
      const decoded = await authService.verifyToken(token)

      if (isPlatformRole(decoded.role)) {
        throw new ForbiddenError('Usuario de plataforma no autorizado en rutas de empresa')
      }

      if (decoded.businessId == null) {
        throw new UnauthorizedError('Usuario sin empresa asignada')
      }

      if (roles && !roles.includes(decoded.role)) {
        throw new ForbiddenError('No tiene permisos para realizar esta acción')
      }

      req.user = {
        id: decoded.userId,
        userId: decoded.userId,
        businessId: decoded.businessId,
        username: decoded.username,
        role: decoded.role
      }

      next()
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      next(error)
    }
  }
}

/**
 * Middleware para verificar propiedad o admin de empresa
 */
export const checkOwnershipOrAdmin = (
  model: 'user' | 'business' | 'product',
  paramName = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === 'ADMIN') {
        return next()
      }

      const id = parseInt(req.params[paramName])
      const record = await (prisma[model] as any).findUnique({
        where: {id},
        select: {userId: true}
      })

      if (!record) {
        throw new NotFoundError(`${model} not found`)
      }

      if (record.userId !== req.user?.id) {
        throw new UnauthorizedError('Not authorized to access this resource')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Autenticación TSOA.
 * - Scopes que incluyen PLATFORM_ADMIN → solo plataforma (businessId null).
 * - Sin scopes / scopes tenant → solo empresa; rechaza PLATFORM_ADMIN.
 */
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName !== 'bearerAuth') {
    throw new UnauthorizedError('Método de autenticación no soportado');
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token no proporcionado');
  }

  const token = authHeader.split(' ')[1];
  const decoded = await authService.verifyToken(token);

  const wantsPlatform =
    Array.isArray(scopes) &&
    scopes.length > 0 &&
    scopes.includes(PLATFORM_ADMIN_ROLE);

  if (wantsPlatform) {
    if (!isPlatformRole(decoded.role) || decoded.businessId != null) {
      throw new ForbiddenError('Se requiere administrador de plataforma');
    }
    if (!scopes!.includes(decoded.role)) {
      throw new ForbiddenError('No tiene permisos para realizar esta acción');
    }

    const platformUser: AuthenticatedUser = {
      id: decoded.userId,
      userId: decoded.userId,
      businessId: null,
      username: decoded.username,
      role: PLATFORM_ADMIN_ROLE,
    };
    request.user = platformUser;
    return platformUser;
  }

  // Ruta tenant (default): rechazar plataforma y exigir empresa
  if (isPlatformRole(decoded.role) || decoded.businessId == null) {
    throw new ForbiddenError('Usuario de plataforma no autorizado en rutas de empresa');
  }

  if (scopes && scopes.length > 0 && !scopes.includes(decoded.role)) {
    throw new ForbiddenError('No tiene permisos para realizar esta acción');
  }

  const authUser: AuthenticatedUser = {
    id: decoded.userId,
    userId: decoded.userId,
    businessId: decoded.businessId,
    username: decoded.username,
    role: decoded.role,
  };

  request.user = authUser;
  return authUser;
}
