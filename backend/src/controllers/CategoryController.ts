import {
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Query,
  Header,
  Route,
  Tags,
  Security,
  SuccessResponse,
  Response,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { CategoryService } from '../services/CategoryService';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { BasePaginationController } from './basePaginationController';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryStats,
  CategoryTreeNode,
} from '../types/categoryTypes';
import { ApiResponse, ErrorResponse, PaginatedApiResponse } from '../types/api';
import { PaginationParams } from '../types/pagination';
import { NotFoundError } from '../errors';
import { rejectCatalogMasterMutation } from '../helpers/catalogContainment';
import prisma from '../config/prisma';
import { CatalogCommercialService } from '../services/CatalogCommercialService';
import { requireAuthUser } from '../helpers/tenantContext';
import { readCommercialDeviceId, requireIdempotencyKey } from './privateCatalogHttp';
import {
  CreatePrivateCategoryBody,
  PrivateCategoryDto,
  UpdatePrivateCategoryBody,
} from '../types/catalogCommercialTypes';

@Route('categories')
@Tags('Categorías')
export class CategoryController extends BasePaginationController {
  private categoryService: CategoryService;
  private catalog = new CatalogCommercialService(prisma);

  constructor() {
    super();
    const categoryRepository = new CategoryRepository(prisma);
    this.categoryService = new CategoryService(categoryRepository);
  }

  @Get()
  @Security('bearerAuth')
  @SuccessResponse('200', 'Categorías obtenidas exitosamente')
  public async getCategories(
    @Request() request: ExpressRequest,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() isActive?: boolean,
    @Query() parentId?: number,
    @Query() hasProducts?: boolean,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedApiResponse<CategoryResponse>> {
    const businessId = this.getBusinessId(undefined, request);
    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      sortBy,
      sortOrder,
    };

    const result = await this.categoryService.findMany(paginationParams, businessId, {
      search,
      isActive,
      parentId,
      hasProducts,
    });
    return this.createPaginatedResponseDirect(result.items, result.meta, 'Categorías obtenidas exitosamente');
  }

  @Post('private')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(403, 'Prohibido')
  @Response(409, 'Conflicto')
  public async createPrivateCategory(
    @Body() body: CreatePrivateCategoryBody,
    @Request() request: ExpressRequest,
    @Header('Idempotency-Key') idempotencyKey?: string,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<PrivateCategoryDto> {
    const actor = requireAuthUser(request);
    return this.catalog.createPrivateCategory(
      actor,
      requireIdempotencyKey(idempotencyKey),
      body,
      readCommercialDeviceId(xDeviceId)
    );
  }

  @Put('private/{id}')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  @Response(403, 'Prohibido')
  @Response(404, 'No encontrado')
  @Response(409, 'Conflicto')
  public async updatePrivateCategory(
    @Path() id: number,
    @Body() body: UpdatePrivateCategoryBody,
    @Request() request: ExpressRequest,
    @Header('Idempotency-Key') idempotencyKey?: string,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<PrivateCategoryDto> {
    const actor = requireAuthUser(request);
    return this.catalog.updatePrivateCategory(
      actor,
      id,
      requireIdempotencyKey(idempotencyKey),
      body,
      readCommercialDeviceId(xDeviceId)
    );
  }

  @Get('{id}')
  @Security('bearerAuth')
  public async getCategoryById(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    const businessId = this.getBusinessId(undefined, request);
    const category = await this.categoryService.findById(id, businessId);

    if (!category) {
      this.setStatus(404);
      throw new NotFoundError('Categoría no encontrada');
    }

    return this.createSuccessResponse(category, 'Categoría obtenida exitosamente');
  }

  @Post()
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async createCategory(
    @Body() categoryData: CreateCategoryRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async updateCategory(
    @Path() id: number,
    @Body() categoryData: UpdateCategoryRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async deleteCategory(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<void> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Get('tree')
  @Security('bearerAuth')
  public async getCategoryTree(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryTreeNode[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const tree = await this.categoryService.findTree(businessId);
    return this.createSuccessResponse(tree, 'Árbol de categorías obtenido exitosamente');
  }

  @Get('{id}/children')
  @Security('bearerAuth')
  public async getCategoryChildren(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    try {
      const children = await this.categoryService.findChildren(id, businessId);
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

  @Put('{id}/activate')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async activateCategory(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}/deactivate')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async deactivateCategory(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Get('stats')
  @Security('bearerAuth')
  public async getCategoryStats(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryStats>> {
    const businessId = this.getBusinessId(undefined, request);
    const stats = await this.categoryService.getStats(businessId);
    return this.createSuccessResponse(stats, 'Estadísticas obtenidas exitosamente');
  }

  @Get('search/{name}')
  @Security('bearerAuth')
  public async searchCategoryByName(
    @Path() name: string,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse | null>> {
    const businessId = this.getBusinessId(undefined, request);
    const category = await this.categoryService.findByName(name, businessId);
    return this.createSuccessResponse(category, 'Búsqueda completada');
  }
}
