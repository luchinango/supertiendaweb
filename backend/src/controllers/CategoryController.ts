import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Query,
  Route,
  Tags,
  Security,
  SuccessResponse,
  Response,
} from 'tsoa';
import { CategoryService } from '../services/CategoryService';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { BasePaginationController } from './basePaginationController';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
  CategoryStats,
  CategoryTreeNode
} from '../types/categoryTypes';
import { ApiResponse, PaginatedApiResponse } from '../types/api';
import { PaginationParams } from '../types/pagination';
import { NotFoundError, ValidationError } from '../errors';
import { BusinessError } from '../utils/errors';
import prisma from '../config/prisma';

@Route('categories')
@Tags('Categorías')
export class CategoryController extends BasePaginationController {
  private categoryService: CategoryService;

  constructor() {
    super();
    const categoryRepository = new CategoryRepository(prisma);
    this.categoryService = new CategoryService(categoryRepository);
  }

  /**
   * Obtener todas las categorías con paginación
   */
  @Get()
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categorías obtenidas exitosamente')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCategories(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() isActive?: boolean,
    @Query() parentId?: number,
    @Query() hasProducts?: boolean,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedApiResponse<CategoryResponse>> {
    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      sortBy,
      sortOrder
    };

    const additionalFilters = {
      search,
      isActive,
      parentId,
      hasProducts
    };

    const result = await this.categoryService.findMany(paginationParams, additionalFilters);
    return this.createPaginatedResponseDirect(result.items, result.meta, 'Categorías obtenidas exitosamente');
  }

  /**
   * Obtener una categoría por ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categoría obtenida exitosamente')
  @Response<ApiResponse<string>>('404', 'Categoría no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCategoryById(@Path() id: number): Promise<ApiResponse<CategoryResponse>> {
    const category = await this.categoryService.findById(id);

    if (!category) {
      this.setStatus(404);
      throw new NotFoundError('Categoría no encontrada');
    }

    return this.createSuccessResponse(category, 'Categoría obtenida exitosamente');
  }

  /**
   * Crear una nueva categoría
   */
  @Post()
  @Security('bearerAuth')
  @SuccessResponse('201', 'Categoría creada exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async createCategory(
    @Body() categoryData: CreateCategoryRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const category = await this.categoryService.create(categoryData);
      this.setStatus(201);
      return this.createSuccessResponse(category, 'Categoría creada exitosamente');
    } catch (error) {
      if (error instanceof ValidationError) {
        this.setStatus(400);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Actualizar una categoría existente
   */
  @Put('{id}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categoría actualizada exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos inválidos')
  @Response<ApiResponse<string>>('404', 'Categoría no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async updateCategory(
    @Path() id: number,
    @Body() categoryData: UpdateCategoryRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const category = await this.categoryService.update(id, categoryData);
      return this.createSuccessResponse(category, 'Categoría actualizada exitosamente');
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      if (error instanceof ValidationError) {
        this.setStatus(400);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @SuccessResponse('204', 'Categoría eliminada exitosamente')
  @Response<ApiResponse<string>>('400', 'No se puede eliminar la categoría')
  @Response<ApiResponse<string>>('404', 'Categoría no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async deleteCategory(@Path() id: number): Promise<void> {
    try {
      await this.categoryService.delete(id);
      this.setStatus(204);
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      if (error instanceof BusinessError) {
        this.setStatus(400);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener árbol jerárquico de categorías
   */
  @Get('tree')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Árbol de categorías obtenido exitosamente')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCategoryTree(): Promise<ApiResponse<CategoryTreeNode[]>> {
    const tree = await this.categoryService.findTree();
    return this.createSuccessResponse(tree, 'Árbol de categorías obtenido exitosamente');
  }

  /**
   * Obtener subcategorías de una categoría padre
   */
  @Get('{id}/children')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Subcategorías obtenidas exitosamente')
  @Response<ApiResponse<string>>('404', 'Categoría padre no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCategoryChildren(@Path() id: number): Promise<ApiResponse<CategoryResponse[]>> {
    try {
      const children = await this.categoryService.findChildren(id);
      return this.createSuccessResponse(children, 'Subcategorías obtenidas exitosamente');
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Activar una categoría
   */
  @Put('{id}/activate')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categoría activada exitosamente')
  @Response<ApiResponse<string>>('400', 'La categoría ya está activa')
  @Response<ApiResponse<string>>('404', 'Categoría no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async activateCategory(@Path() id: number): Promise<ApiResponse<CategoryResponse>> {
    try {
      const category = await this.categoryService.activate(id);
      return this.createSuccessResponse(category, 'Categoría activada exitosamente');
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      if (error instanceof BusinessError) {
        this.setStatus(400);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Desactivar una categoría
   */
  @Put('{id}/deactivate')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categoría desactivada exitosamente')
  @Response<ApiResponse<string>>('400', 'No se puede desactivar la categoría')
  @Response<ApiResponse<string>>('404', 'Categoría no encontrada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async deactivateCategory(@Path() id: number): Promise<ApiResponse<CategoryResponse>> {
    try {
      const category = await this.categoryService.deactivate(id);
      return this.createSuccessResponse(category, 'Categoría desactivada exitosamente');
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      if (error instanceof BusinessError) {
        this.setStatus(400);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de categorías
   */
  @Get('stats')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Estadísticas obtenidas exitosamente')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCategoryStats(): Promise<ApiResponse<CategoryStats>> {
    const stats = await this.categoryService.getStats();
    return this.createSuccessResponse(stats, 'Estadísticas obtenidas exitosamente');
  }

  /**
   * Buscar categoría por nombre
   */
  @Get('search/{name}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Búsqueda completada')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async searchCategoryByName(@Path() name: string): Promise<ApiResponse<CategoryResponse | null>> {
    const category = await this.categoryService.findByName(name);
    return this.createSuccessResponse(category, 'Búsqueda completada');
  }
}