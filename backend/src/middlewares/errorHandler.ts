import { Request, Response, NextFunction } from 'express'
import { ValidateError } from 'tsoa'
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
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details !== undefined ? { details: err.details } : {}),
    })
  }

  // TSOA valida @Body() antes del controller — p.ej. login sin username → 400, no 500 (P2-C1.G2)
  // Usar name además de instanceof: ts-node/transpile puede romper el prototype chain.
  const isTsoaValidate =
    err instanceof ValidateError ||
    err?.name === 'ValidateError' ||
    (err as { fields?: unknown })?.fields != null
  if (isTsoaValidate) {
    return res.status(400).json({
      status: 'error',
      message: 'Datos de solicitud inválidos o incompletos',
      code: 'VALIDATION',
      details: (err as ValidateError).fields ?? undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    })
  }

  console.error('💥 Error no controlado:', err.stack)

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}
