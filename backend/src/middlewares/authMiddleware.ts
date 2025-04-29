import {Request, Response, NextFunction, RequestHandler} from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'
import { UnauthorizedError, NotFoundError } from '../errors'

// Interface para el usuario autenticado
export interface AuthenticatedUser {
  id: number
  username: string
  role: string
}

// Extensión de la interfaz Request de Express
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
        throw new UnauthorizedError('Authentication invalid')
      }

      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          role: {
            select: {
              name: true
            }
          },
          status: true
        }
      })

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Authentication invalid')
      }

      if (roles && !roles.includes(user.role.name)) {
        throw new UnauthorizedError('Unauthorized access')
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role.name
      }

      next()
    } catch (error) {
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
      if (req.user?.role === 'ADMIN') return next()

      const id = parseInt(req.params[paramName])
      const record = await (prisma[model] as any).findUnique({
        where: { id },
        select: { userId: true }
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
