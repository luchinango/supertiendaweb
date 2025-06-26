import prisma from '../config/prisma';
import { PrismaClient } from '../../prisma/generated';
import { DatabaseError, NotFoundError } from '../errors';

/**
 * Clase base para servicios con funcionalidades comunes
 */
export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Obtener un registro por ID
   */
  protected async findById<T>(
    model: keyof PrismaClient,
    id: number,
    include?: any
  ): Promise<T | null> {
    try {
      const result = await (this.prisma[model] as any).findUnique({
        where: { id },
        include,
      });
      return result as T;
    } catch (error) {
      throw new DatabaseError(
        `Error al buscar ${String(model)} por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtener un registro por ID o lanzar error si no existe
   */
  protected async findByIdOrThrow<T>(
    model: keyof PrismaClient,
    id: number,
    include?: any,
    errorMessage?: string
  ): Promise<T> {
    const result = await this.findById<T>(model, id, include);
    if (!result) {
      throw new NotFoundError(errorMessage || `${String(model)} con ID ${id} no encontrado`);
    }
    return result;
  }

  /**
   * Crear un nuevo registro
   */
  protected async create<T>(model: keyof PrismaClient, data: any, include?: any): Promise<T> {
    try {
      const result = await (this.prisma[model] as any).create({
        data,
        include,
      });
      return result as T;
    } catch (error) {
      throw new DatabaseError(
        `Error al crear ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Actualizar un registro
   */
  protected async update<T>(
    model: keyof PrismaClient,
    id: number,
    data: any,
    include?: any
  ): Promise<T> {
    try {
      const result = await (this.prisma[model] as any).update({
        where: { id },
        data,
        include,
      });
      return result as T;
    } catch (error) {
      throw new DatabaseError(
        `Error al actualizar ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Eliminar un registro
   */
  protected async delete(model: keyof PrismaClient, id: number): Promise<void> {
    try {
      await (this.prisma[model] as any).delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError(
        `Error al eliminar ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Eliminación suave (soft delete)
   */
  protected async softDelete(model: keyof PrismaClient, id: number): Promise<void> {
    try {
      await (this.prisma[model] as any).update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED',
        },
      });
    } catch (error) {
      throw new DatabaseError(
        `Error al eliminar suavemente ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Buscar registros con filtros y paginación
   */
  protected async findMany<T>(
    model: keyof PrismaClient,
    options: {
      where?: any;
      include?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
    } = {}
  ): Promise<T[]> {
    try {
      const result = await (this.prisma[model] as any).findMany(options);
      return result as T[];
    } catch (error) {
      throw new DatabaseError(
        `Error al buscar ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Contar registros con filtros
   */
  protected async count(model: keyof PrismaClient, where?: any): Promise<number> {
    try {
      return await (this.prisma[model] as any).count({ where });
    } catch (error) {
      throw new DatabaseError(
        `Error al contar ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Verificar si existe un registro
   */
  protected async exists(model: keyof PrismaClient, where: any): Promise<boolean> {
    try {
      const count = await (this.prisma[model] as any).count({ where });
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        `Error al verificar existencia de ${String(model)}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Ejecutar transacción
   */
  protected async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      throw new DatabaseError(
        `Error en transacción: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Calcular paginación
   */
  protected calculatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null,
    };
  }

  /**
   * Construir filtros de búsqueda
   */
  protected buildSearchFilter(search: string, fields: string[]) {
    if (!search || search.trim().length === 0) {
      return {};
    }

    const searchTerm = search.trim();
    const searchConditions = fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }));

    return {
      OR: searchConditions,
    };
  }

  /**
   * Limpiar recursos
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
