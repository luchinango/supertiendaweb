import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Body,
  Query,
  Security,
  SuccessResponse,
  Response,
  Example,
  Request
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { BasePaginationController } from './basePaginationController';
import { IBusinessProductService } from '../interfaces/services/IBusinessProductService';
import { DIContainer } from '../container/DIContainer';
import { BusinessProductCatalogService } from '../services/BusinessProductCatalogService';
import {
  BusinessProductResponse,
  CreateBusinessProductRequest,
  UpdateBusinessProductRequest,
  BusinessProductListResponse,
  BusinessProductStats,
  BusinessProductSearchResult,
  StockAdjustmentRequest,
  RestockRequest,
  BusinessProductCatalogResponse,
  BusinessProductCatalogFilters,
  BulkConfigureProductsRequest,
  BulkConfigureProductsResponse,
  ApiResponse,
  PaginatedApiResponse
} from '../types/api';
import { PaginationParams } from '../types/pagination';
import { createSuccessResponse } from '../helpers/responseHelpers';
import prisma from '../config/prisma';

@Route('business-products')
@Tags('Productos de Negocio')
export class BusinessProductController extends BasePaginationController {
  private businessProductService: IBusinessProductService;
  private catalogService: BusinessProductCatalogService;

  constructor() {
    super();
    this.businessProductService = DIContainer.getBusinessProductService();
    this.catalogService = new BusinessProductCatalogService(prisma);
  }

  /**
   * Obtiene los parámetros de paginación validados
   */
  private getPaginationParams(page: number, limit: number): PaginationParams {
    return {
      page: page || 1,
      limit: Math.min(limit || 10, 100)
    };
  }

  /**
   * Obtiene el catálogo completo de productos para el business del usuario autenticado
   * Incluye productos configurados y no configurados
   */
  @Get('catalog')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Catálogo de productos obtenido exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessProductCatalogForCurrentUser(
    @Query() page: number = 1,
    @Query() limit: number = 20,
    @Query() categoryId?: number,
    @Query() search?: string,
    @Query() isActive?: boolean,
    @Query() stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_CONFIGURED',
    @Query() isConfigured?: boolean,
    @Query() brand?: string,
    @Query() minPrice?: number,
    @Query() maxPrice?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductCatalogResponse>> {
    const businessId = this.getBusinessId(undefined, request!);

    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    };

    const filters: BusinessProductCatalogFilters = {
      categoryId,
      search,
      isActive,
      stockStatus,
      isConfigured,
      brand,
      minPrice,
      maxPrice
    };

    const result = await this.catalogService.getBusinessProductCatalog(
      businessId,
      paginationParams,
      filters
    );

    return this.createSuccessResponse(result, 'Catálogo de productos obtenido exitosamente');
  }

  /**
   * Obtiene productos por categoría para el business del usuario autenticado
   */
  @Get('catalog/category/{categoryId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos por categoría obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business o categoría no encontrados')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getProductsByCategoryForCurrentUser(
    @Path() categoryId: number,
    @Query() page: number = 1,
    @Query() limit: number = 50,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductCatalogResponse>> {
    const businessId = this.getBusinessId(undefined, request!);

    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    };

    const result = await this.catalogService.getProductsByCategory(
      businessId,
      categoryId,
      paginationParams
    );

    return this.createSuccessResponse(result, 'Productos por categoría obtenidos exitosamente');
  }

  /**
   * Obtener estadísticas del catálogo para el business del usuario autenticado
   */
  @Get('catalog/stats')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Estadísticas del catálogo obtenidas exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCatalogStatsForCurrentUser(
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const businessId = this.getBusinessId(undefined, request!);

    const stats = await this.catalogService.getCatalogStats(businessId);
    return this.createSuccessResponse(stats, 'Estadísticas del catálogo obtenidas exitosamente');
  }

  /**
   * Configurar productos masivamente para un business
   */
  @Post('catalog/bulk-configure')
  @Security('bearerAuth')
  @SuccessResponse('201', 'Productos configurados exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos inválidos')
  @Response<ApiResponse<string>>('404', 'Business no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async bulkConfigureProducts(
    @Body() request: BulkConfigureProductsRequest,
    @Request() expressRequest?: ExpressRequest
  ): Promise<ApiResponse<BulkConfigureProductsResponse>> {
    if (!request.businessId) {
      request.businessId = this.getBusinessId(undefined, expressRequest!);
    }

    const result = await this.catalogService.bulkConfigureProducts(request);
    this.setStatus(201);
    return this.createSuccessResponse(result, 'Productos configurados exitosamente');
  }

  /**
   * Obtiene el catálogo completo de productos para un business específico
   * Incluye productos configurados y no configurados
   */
  @Get('catalog/{businessId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Catálogo de productos obtenido exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessProductCatalog(
    @Path() businessId: number,
    @Query() page: number = 1,
    @Query() limit: number = 20,
    @Query() categoryId?: number,
    @Query() search?: string,
    @Query() isActive?: boolean,
    @Query() stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_CONFIGURED',
    @Query() isConfigured?: boolean,
    @Query() brand?: string,
    @Query() minPrice?: number,
    @Query() maxPrice?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductCatalogResponse>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);

    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    };

    const filters: BusinessProductCatalogFilters = {
      categoryId,
      search,
      isActive,
      stockStatus,
      isConfigured,
      brand,
      minPrice,
      maxPrice
    };

    const result = await this.catalogService.getBusinessProductCatalog(
      effectiveBusinessId,
      paginationParams,
      filters
    );

    return this.createSuccessResponse(result, 'Catálogo de productos obtenido exitosamente');
  }

  /**
   * Obtiene productos por categoría para un business específico
   * Incluye productos configurados y no configurados de esa categoría
   */
  @Get('catalog/{businessId}/category/{categoryId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos por categoría obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business o categoría no encontrados')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getProductsByCategoryForBusiness(
    @Path() businessId: number,
    @Path() categoryId: number,
    @Query() page: number = 1,
    @Query() limit: number = 50,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductCatalogResponse>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);

    const paginationParams: PaginationParams = {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    };

    const result = await this.catalogService.getProductsByCategory(
      effectiveBusinessId,
      categoryId,
      paginationParams
    );

    return this.createSuccessResponse(result, 'Productos por categoría obtenidos exitosamente');
  }

  /**
   * Obtener estadísticas del catálogo de productos para un business específico
   */
  @Get('catalog/{businessId}/stats')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Estadísticas del catálogo obtenidas exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('404', 'Business no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getCatalogStats(
    @Path() businessId: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);

    const stats = await this.catalogService.getCatalogStats(effectiveBusinessId);
    return this.createSuccessResponse(stats, 'Estadísticas del catálogo obtenidas exitosamente');
  }

  /**
   * Obtiene una lista paginada de productos de negocio con filtros opcionales
   */
  @Get('/')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Lista de productos de negocio obtenida exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros de consulta inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  @Example<PaginatedApiResponse<BusinessProductResponse>>({
    success: true,
    data: [
      {
        id: 1,
        businessId: 1,
        productId: 1,
        customPrice: 25.50,
        currentStock: 100,
        reservedStock: 10,
        availableStock: 90,
        lastRestock: new Date('2024-01-15T10:30:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        product: {
          id: 1,
          categoryId: 1,
          name: 'Producto Ejemplo',
          sku: 'SKU-001',
          barcode: '1234567890123',
          description: 'Descripción del producto',
          costPrice: 20.00,
          sellingPrice: 25.50,
          taxType: 'IVA',
          taxRate: 13,
          minStock: 5,
          reorderPoint: 10,
          isActive: true,
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          createdBy: 1,
          updatedBy: 1
        }
      }
    ],
    meta: {
      total: 150,
      page: 1,
      limit: 10,
      totalPages: 15,
      hasNextPage: true,
      hasPrevPage: false,
      nextPage: 2,
      prevPage: null
    },
    message: 'Productos de negocio obtenidos exitosamente',
    timestamp: '2024-01-15T10:30:00Z'
  })
  public async getBusinessProducts(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() businessId?: number,
    @Query() productId?: number,
    @Query() minStock?: number,
    @Query() maxStock?: number,
    @Query() minPrice?: number,
    @Query() maxPrice?: number,
    @Query() categoryId?: number,
    @Query() brand?: string,
    @Query() lowStock?: boolean,
    @Query() outOfStock?: boolean,
    @Request() request?: ExpressRequest
  ): Promise<PaginatedApiResponse<BusinessProductResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit);

      const effectiveBusinessId = businessId || this.getBusinessId(businessId, request!);

      const additionalFilters = {
        businessId: effectiveBusinessId,
        productId,
        minStock,
        maxStock,
        minPrice,
        maxPrice,
        categoryId,
        brand,
        lowStock,
        outOfStock
      };

      const result = await this.businessProductService.findMany(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Lista de productos de negocio obtenida exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Busca productos de negocio por término de búsqueda
   */
  @Get('search')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Búsqueda realizada exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros de búsqueda inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async searchBusinessProducts(
    @Query() query: string,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductSearchResult[]>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);
    const result = await this.businessProductService.search(query, effectiveBusinessId);
    return this.createSuccessResponse(result.data, 'Búsqueda realizada exitosamente');
  }

  /**
   * Verifica si existe una combinación business-product
   */
  @Get('exists')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Verificación realizada exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async checkBusinessProductExists(
    @Query() productId: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<{ exists: boolean }>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);
    const exists = await this.businessProductService.exists(effectiveBusinessId, productId);
    return this.createSuccessResponse({ exists }, 'Verificación realizada exitosamente');
  }

  /**
   * Obtiene todos los productos de un negocio específico
   */
  @Get('business/{businessId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos del negocio obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'ID de negocio inválido')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getProductsByBusiness(
    @Path() businessId: number
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const result = await this.businessProductService.findByBusiness(businessId);
    return this.createSuccessResponse(result, 'Productos del negocio obtenidos exitosamente');
  }

  /**
   * Obtiene productos con stock bajo en un negocio
   */
  @Get('business/{businessId}/low-stock')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos con stock bajo obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getLowStockProducts(
    @Path() businessId: number,
    @Query() threshold?: number
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const result = await this.businessProductService.findLowStock(businessId, threshold);
    return this.createSuccessResponse(result, 'Productos con stock bajo obtenidos exitosamente');
  }

  /**
   * Obtiene productos fuera de stock en un negocio
   */
  @Get('business/{businessId}/out-of-stock')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos fuera de stock obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'ID de negocio inválido')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getOutOfStockProducts(
    @Path() businessId: number
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const result = await this.businessProductService.findOutOfStock(businessId);
    return this.createSuccessResponse(result, 'Productos fuera de stock obtenidos exitosamente');
  }

  /**
   * Obtiene productos recientemente reabastecidos
   */
  @Get('business/{businessId}/recently-restocked')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos recientemente reabastecidos obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'Parámetros inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getRecentlyRestockedProducts(
    @Path() businessId: number,
    @Query() days?: number
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const result = await this.businessProductService.findRecentlyRestocked(businessId, days);
    return this.createSuccessResponse(result, 'Productos recientemente reabastecidos obtenidos exitosamente');
  }

  /**
   * Obtiene estadísticas de productos de un negocio
   */
  @Get('business/{businessId}/stats')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Estadísticas obtenidas exitosamente')
  @Response<ApiResponse<string>>('400', 'ID de negocio inválido')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessProductStats(
    @Path() businessId: number
  ): Promise<ApiResponse<BusinessProductStats>> {
    const result = await this.businessProductService.getStats(businessId);
    return this.createSuccessResponse(result, 'Estadísticas obtenidas exitosamente');
  }

  /**
   * Obtiene un producto de negocio por businessId y productId
   */
  @Get('business/{businessId}/product/{productId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Producto de negocio obtenido exitosamente')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessProductByBusinessAndProduct(
    @Path() businessId: number,
    @Path() productId: number
  ): Promise<ApiResponse<BusinessProductResponse | null>> {
    const result = await this.businessProductService.findByBusinessAndProduct(businessId, productId);
    return this.createSuccessResponse(result, 'Producto de negocio obtenido exitosamente');
  }

  /**
   * Obtiene todos los negocios que tienen un producto específico
   */
  @Get('product/{productId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Negocios con el producto obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'ID de producto inválido')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessesByProduct(
    @Path() productId: number
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const result = await this.businessProductService.findByProduct(productId);
    return this.createSuccessResponse(result, 'Negocios con el producto obtenidos exitosamente');
  }

  /**
   * Obtiene productos por categoría
   */
  @Get('category/{categoryId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos por categoría obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'ID de categoría inválido')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getProductsByCategory(
    @Path() categoryId: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);
    const result = await this.businessProductService.findByCategory(categoryId, effectiveBusinessId);
    return this.createSuccessResponse(result, 'Productos por categoría obtenidos exitosamente');
  }

  /**
   * Obtiene productos por marca
   */
  @Get('brand/{brand}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Productos por marca obtenidos exitosamente')
  @Response<ApiResponse<string>>('400', 'Marca inválida')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getProductsByBrand(
    @Path() brand: string,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<BusinessProductResponse[]>> {
    const effectiveBusinessId = this.getBusinessId(businessId, request!);
    const result = await this.businessProductService.findByBrand(brand, effectiveBusinessId);
    return this.createSuccessResponse(result, 'Productos por marca obtenidos exitosamente');
  }

  /**
   * Obtiene un producto de negocio por su ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Producto de negocio obtenido exitosamente')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async getBusinessProductById(
    @Path() id: number
  ): Promise<ApiResponse<BusinessProductResponse | null>> {
    const result = await this.businessProductService.findById(id);
    return this.createSuccessResponse(result, 'Producto de negocio obtenido exitosamente');
  }

  /**
   * Crea un nuevo producto de negocio
   */
  @Post('/')
  @Security('bearerAuth')
  @SuccessResponse('201', 'Producto de negocio creado exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos de entrada inválidos')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('409', 'Producto ya asignado al negocio')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async createBusinessProduct(
    @Body() data: CreateBusinessProductRequest
  ): Promise<BusinessProductResponse> {
    return await this.businessProductService.create(data);
  }

  /**
   * Actualiza un producto de negocio por su ID
   */
  @Put('{id}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Producto de negocio actualizado exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos de entrada inválidos')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async updateBusinessProduct(
    @Path() id: number,
    @Body() data: UpdateBusinessProductRequest
  ): Promise<BusinessProductResponse> {
    return await this.businessProductService.update(id, data);
  }

  /**
   * Actualiza un producto de negocio por businessId y productId
   */
  @Put('business/{businessId}/product/{productId}')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Producto de negocio actualizado exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos de entrada inválidos')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async updateBusinessProductByBusinessAndProduct(
    @Path() businessId: number,
    @Path() productId: number,
    @Body() data: UpdateBusinessProductRequest
  ): Promise<BusinessProductResponse> {
    return await this.businessProductService.updateByBusinessAndProduct(businessId, productId, data);
  }

  /**
   * Ajusta el stock de un producto de negocio
   */
  @Put('{id}/adjust-stock')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Stock ajustado exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos de ajuste inválidos')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async adjustStock(
    @Path() id: number,
    @Body() adjustment: StockAdjustmentRequest
  ): Promise<BusinessProductResponse> {
    return await this.businessProductService.adjustStock(id, adjustment);
  }

  /**
   * Reabastecer un producto de negocio
   */
  @Put('{id}/restock')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Producto reabastecido exitosamente')
  @Response<ApiResponse<string>>('400', 'Datos de reabastecimiento inválidos')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async restockProduct(
    @Path() id: number,
    @Body() restockData: RestockRequest
  ): Promise<BusinessProductResponse> {
    return await this.businessProductService.restock(id, restockData);
  }

  /**
   * Elimina un producto de negocio por su ID
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @SuccessResponse('204', 'Producto de negocio eliminado exitosamente')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async deleteBusinessProduct(
    @Path() id: number
  ): Promise<void> {
    await this.businessProductService.delete(id);
  }

  /**
   * Elimina un producto de negocio por businessId y productId
   */
  @Delete('business/{businessId}/product/{productId}')
  @Security('bearerAuth')
  @SuccessResponse('204', 'Producto de negocio eliminado exitosamente')
  @Response<ApiResponse<string>>('404', 'Producto de negocio no encontrado')
  @Response<ApiResponse<string>>('401', 'No autorizado')
  @Response<ApiResponse<string>>('500', 'Error interno del servidor')
  public async deleteBusinessProductByBusinessAndProduct(
    @Path() businessId: number,
    @Path() productId: number
  ): Promise<void> {
    await this.businessProductService.deleteByBusinessAndProduct(businessId, productId);
  }
}
