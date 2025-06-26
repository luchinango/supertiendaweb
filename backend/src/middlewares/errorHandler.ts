import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🚨 Error Handler - Capturando error:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  console.error('💥 Error no controlado:', err.stack)

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}
