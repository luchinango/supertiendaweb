import {Request, Response, NextFunction} from 'express'
import {UnauthorizedError, NotFoundError} from '../errors'
import authService from '../services/authService'
import prisma from '../config/prisma'

export interface AuthenticatedUser {
  id: number
  userId: number
  businessId: number
  username: string
  role: string
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser
  }
}

/**
 * Middleware de autenticación JWT
 * @param roles Roles permitidos (opcional)
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

      if (roles && !roles.includes(decoded.role)) {
        throw new UnauthorizedError('No tiene permisos para realizar esta acción')
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
 * Middleware para verificar propiedad o admin
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
