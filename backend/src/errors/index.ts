export class CustomError extends Error {
  statusCode: number;
  /** Código estable de negocio (sync / API comercial). */
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, code = 'VALIDATION', details?: unknown) {
    super(message, 400, code, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string, code = 'UNAUTHORIZED', details?: unknown) {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string, code = 'FORBIDDEN', details?: unknown) {
    super(message, 403, code, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, code = 'NOT_FOUND', details?: unknown) {
    super(message, 404, code, details);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, code = 'CONFLICT', details?: unknown) {
    super(message, 409, code, details);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, code = 'DATABASE_ERROR', details?: unknown) {
    super(message, 500, code, details);
  }
}
