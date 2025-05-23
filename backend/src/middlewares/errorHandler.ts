import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  console.error(err.stack)

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}
