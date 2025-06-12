import {Request, Response, NextFunction} from 'express';
import {userSchemas} from '../schemas/userSchemas';

/**
 * Middleware de validación para esquemas de usuarios.
 */
export const validateRequest = (schemaName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const schema = userSchemas[schemaName as keyof typeof userSchemas];

      if (!schema) {
        res.status(400).json({
          error: 'Esquema de validación no encontrado',
          message: `El esquema '${schemaName}' no existe`
        });
        return;
      }

      const validationErrors: string[] = [];
      const data = req.body;

      if ('required' in schema && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          if (data[field] === undefined || data[field] === null || data[field] === '') {
            validationErrors.push(`El campo '${field}' es requerido`);
          }
        }
      }

      if (schema.properties) {
        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
          if (data[field] !== undefined && data[field] !== null) {
            const value = data[field];

            if (fieldSchema.type === 'string') {
              if (typeof value !== 'string') {
                validationErrors.push(`El campo '${field}' debe ser una cadena de texto`);
              } else {
                if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
                  validationErrors.push(`El campo '${field}' debe tener al menos ${fieldSchema.minLength} caracteres`);
                }
                if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
                  validationErrors.push(`El campo '${field}' debe tener máximo ${fieldSchema.maxLength} caracteres`);
                }
                if (fieldSchema.format === 'email') {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(value)) {
                    validationErrors.push(`El campo '${field}' debe ser un email válido`);
                  }
                }
              }
            } else if (fieldSchema.type === 'integer') {
              if (!Number.isInteger(value)) {
                validationErrors.push(`El campo '${field}' debe ser un número entero`);
              } else {
                if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
                  validationErrors.push(`El campo '${field}' debe ser mayor o igual a ${fieldSchema.minimum}`);
                }
                if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
                  validationErrors.push(`El campo '${field}' debe ser menor o igual a ${fieldSchema.maximum}`);
                }
              }
            } else if (fieldSchema.type === 'number') {
              if (typeof value !== 'number' || isNaN(value)) {
                validationErrors.push(`El campo '${field}' debe ser un número`);
              } else {
                if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
                  validationErrors.push(`El campo '${field}' debe ser mayor o igual a ${fieldSchema.minimum}`);
                }
                if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
                  validationErrors.push(`El campo '${field}' debe ser menor o igual a ${fieldSchema.maximum}`);
                }
              }
            } else if (fieldSchema.type === 'array') {
              if (!Array.isArray(value)) {
                validationErrors.push(`El campo '${field}' debe ser un array`);
              }
            }

            if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
              validationErrors.push(`El campo '${field}' debe ser uno de: ${fieldSchema.enum.join(', ')}`);
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          message: 'Los datos proporcionados no cumplen con las validaciones requeridas',
          details: validationErrors
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en validación:', error);
      res.status(500).json({
        error: 'Error interno de validación',
        message: 'Error al validar los datos de entrada'
      });
      return;
    }
  };
};

/**
 * Middleware de validación para parámetros de consulta.
 */
export const validateQueryParams = (allowedParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      return res.status(400).json({
        error: 'Parámetros de consulta inválidos',
        message: `Parámetros no permitidos: ${invalidParams.join(', ')}`,
        allowedParams
      });
    }

    next();
  };
};

/**
 * Middleware de validación para IDs numéricos.
 */
export const validateNumericId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'El ID debe ser un número entero positivo'
    });
  }

  req.params.id = id.toString();
  next();
};
