export * from './responseHelpers';
export * from './validationHelpers';
export * from './errorHelpers';
export * from './productHelpers';
export * from '../mappers';

export function ensureExists<T>(
  value: T | null | undefined,
  entityName: string,
  id?: number | string
): T {
  if (value === null || value === undefined) {
    const idStr = id ? ` con ID ${id}` : '';
    throw new Error(`${entityName}${idStr} no encontrado`);
  }
  return value;
}
