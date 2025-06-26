import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';


/**
 * Middleware para logging de requests HTTP
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body: any) {
    const responseTime = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
      responseTime: `${responseTime}ms`,
      contentLength: body ? body.length : 0,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': req.get('Content-Type'),
        accept: req.get('Accept'),
        authorization: req.get('Authorization') ? 'Bearer ***' : undefined,
      },
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Client Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }

    return originalSend.call(this, body);
  };

  logger.debug('Request Started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  next();
};

/**
 * Middleware para logging de errores específicos
 */
export const errorLoggingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logData = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
    },
    timestamp: new Date().toISOString(),
  };

  logger.error('Request Error', logData);
  next(error);
};

/**
 * Middleware para logging de autenticación
 */
export const authLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;

  res.json = function (body: any) {
    if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
      const logData = {
        action: req.path.includes('login') ? 'LOGIN_ATTEMPT' : 'REGISTER_ATTEMPT',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        timestamp: new Date().toISOString(),
      };

      if (res.statusCode < 400) {
        logger.info('Authentication Success', logData);
      } else {
        logger.warn('Authentication Failure', logData);
      }
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Middleware para logging de operaciones de base de datos
 */
export const databaseLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json;

  res.json = function (body: any) {
    const isCRUDOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
    const isUserOperation =
      req.path.includes('/users') ||
      req.path.includes('/products') ||
      req.path.includes('/customers') ||
      req.path.includes('/sales');

    if (isCRUDOperation && isUserOperation) {
      const logData = {
        operation: req.method,
        resource: req.path.split('/')[2] || 'unknown',
        userId: (req as any).user?.id,
        ip: req.ip || req.connection.remoteAddress,
        success: res.statusCode < 400,
        timestamp: new Date().toISOString(),
      };

      logger.info('Database Operation', logData);
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Función para sanitizar el body de la request (remover datos sensibles)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'key'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}

/**
 * Middleware para logging de performance
 */
export const performanceLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body: any) {
    const responseTime = Date.now() - start;

    if (responseTime > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware para logging de rate limiting
 */
export const rateLimitLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalSend = res.send;

  res.send = function (body: any) {
    if (res.statusCode === 429) {
      logger.warn('Rate Limit Exceeded', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
    }

    return originalSend.call(this, body);
  };

  next();
};
