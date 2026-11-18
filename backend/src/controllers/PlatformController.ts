import {
  Controller,
  Get,
  Post,
  Put,
  Path,
  Body,
  Query,
  Route,
  Tags,
  Security,
  SuccessResponse,
  Response,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import {
  ApiResponse,
  ErrorResponse,
  PaginatedApiResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
} from '../types/api';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/categoryTypes';
import { requirePlatformUser } from '../helpers/platformAuth';
import { PlatformCatalogService } from '../services/PlatformCatalogService';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from '../errors';
import prisma from '../config/prisma';

interface PlatformHealthData {
  status: 'ok';
  scope: 'platform';
  role: 'PLATFORM_ADMIN';
  userId: number;
  username: string;
  timestamp: string;
}

/**
 * Administración CODEMEDIIA del catálogo maestro (P1-G / P1-H).
 * No expone stock, ventas ni datos de clientes de tenants.
 * No implementa DELETE maestro.
 */
@Route('platform')
@Tags('Plataforma')
export class PlatformController extends Controller {
  private catalog = new PlatformCatalogService(prisma);

  private handleError(error: unknown): never {
    if (error instanceof ForbiddenError) {
      this.setStatus(403);
      throw error;
    }
    if (error instanceof UnauthorizedError) {
      this.setStatus(401);
      throw error;
    }
    if (error instanceof NotFoundError) {
      this.setStatus(404);
      throw error;
    }
    if (error instanceof ConflictError) {
      this.setStatus(409);
      throw error;
    }
    if (error instanceof ValidationError) {
      this.setStatus(400);
      throw error;
    }
    this.setStatus(500);
    throw new Error('Error interno del servidor');
  }

  @Get('health')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  @SuccessResponse(200, 'Plataforma autenticada')
  @Response<ErrorResponse>(401, 'No autenticado')
  @Response<ErrorResponse>(403, 'No es administrador de plataforma')
  public async health(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<PlatformHealthData>> {
    const user = requirePlatformUser(request);
    return {
      success: true,
      data: {
        status: 'ok',
        scope: 'platform',
        role: 'PLATFORM_ADMIN',
        userId: user.userId,
        username: user.username,
        timestamp: new Date().toISOString(),
      },
      message: 'Plataforma autenticada',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('products')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  @Response<ErrorResponse>(403, 'Forbidden')
  public async listProducts(
    @Request() request: ExpressRequest,
    @Query() page: number = 1,
    @Query() limit: number = 20,
    @Query() search?: string
  ): Promise<PaginatedApiResponse<ProductResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const result = await this.catalog.listProducts(
        actor,
        { page, limit },
        search
      );
      return {
        success: true,
        data: result.data,
        meta: result.meta,
        message: 'Productos maestros obtenidos',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('products/{id}')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  public async getProduct(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const product = await this.catalog.getProduct(actor, id);
      return {
        success: true,
        data: product,
        message: 'Producto maestro obtenido',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('products')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  @SuccessResponse(201, 'Producto maestro creado')
  public async createProduct(
    @Body() body: CreateProductRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const product = await this.catalog.createProduct(actor, body);
      this.setStatus(201);
      return {
        success: true,
        data: product,
        message: 'Producto maestro creado',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put('products/{id}')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  public async updateProduct(
    @Path() id: number,
    @Body() body: UpdateProductRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const product = await this.catalog.updateProduct(actor, id, body);
      return {
        success: true,
        data: product,
        message: 'Producto maestro actualizado',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('categories')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  public async listCategories(
    @Request() request: ExpressRequest,
    @Query() page: number = 1,
    @Query() limit: number = 20,
    @Query() search?: string
  ): Promise<PaginatedApiResponse<CategoryResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const result = await this.catalog.listCategories(actor, { page, limit }, search);
      return {
        success: true,
        data: result.items,
        meta: result.meta,
        message: 'Categorías maestras obtenidas',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('categories')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  @SuccessResponse(201, 'Categoría maestra creada')
  public async createCategory(
    @Body() body: CreateCategoryRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const category = await this.catalog.createCategory(actor, body);
      this.setStatus(201);
      return {
        success: true,
        data: category,
        message: 'Categoría maestra creada',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put('categories/{id}')
  @Security('bearerAuth', ['PLATFORM_ADMIN'])
  public async updateCategory(
    @Path() id: number,
    @Body() body: UpdateCategoryRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const actor = requirePlatformUser(request);
      const category = await this.catalog.updateCategory(actor, id, body);
      return {
        success: true,
        data: category,
        message: 'Categoría maestra actualizada',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
