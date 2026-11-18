import {
  Controller,
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
  Response,
  SuccessResponse,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { container } from '../container/DIContainer';
import { IProductService } from '../interfaces/services/IProductService';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductStats,
  ProductSearchResult,
} from '../types/api';
import { ApiResponse, ErrorResponse, PaginatedApiResponse } from '../types/api';
import { BasePaginationController } from './basePaginationController';
import { PaginationParams } from '../types/pagination';
import { rejectCatalogMasterMutation } from '../helpers/catalogContainment';
import prisma from '../config/prisma';
import { CatalogCommercialService } from '../services/CatalogCommercialService';
import { requireAuthUser } from '../helpers/tenantContext';
import { readCommercialDeviceId, requireIdempotencyKey } from './privateCatalogHttp';
import {
  AdoptResultDto,
  AdoptSharedProductBody,
  CreatePrivateProductBody,
  PrivateProductCommercialDto,
  PrivateProductListResponse,
  UpdatePrivateProductBody,
} from '../types/catalogCommercialTypes';

@Route('products')
@Tags('Productos')
export class ProductController extends BasePaginationController {
  private productService: IProductService;
  private catalog = new CatalogCommercialService(prisma);

  constructor() {
    super();
    this.productService = container.getProductService();
  }

  protected override buildPaginationParams(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): PaginationParams {
    return {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'asc',
    };
  }

  protected successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Lista productos visibles para la empresa (vinculados vía BusinessProduct).
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<ProductResponse>>(200, 'Lista de productos obtenida exitosamente')
  public async getProducts(
    @Request() request: ExpressRequest,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() categoryId?: number,
    @Query() status?: string,
    @Query() isActive?: boolean,
    @Query() minStock?: number,
    @Query() maxStock?: number,
    @Query() minPrice?: number,
    @Query() maxPrice?: number,
    @Query() brand?: string,
    @Query() taxType?: string,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc'
  ): Promise<PaginatedApiResponse<ProductResponse>> {
    const businessId = this.getBusinessId(undefined, request);
    const paginationParams = this.validatePagination(page, limit, search, sortBy, sortOrder);

    const result = await this.productService.findMany(paginationParams, businessId, {
      categoryId,
      status,
      isActive,
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      brand,
      taxType,
    });

    return this.createPaginatedResponse(result, 'Lista de productos obtenida exitosamente');
  }

  /**
   * Lista productos BUSINESS_PRIVATE de la empresa del JWT.
   * Declarado antes de `{id}` para no capturar el path "private".
   */
  @Get('private')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  public async listPrivateProducts(
    @Request() request: ExpressRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string
  ): Promise<PrivateProductListResponse> {
    const actor = requireAuthUser(request);
    return this.catalog.listPrivateProducts(actor, { page, limit, search });
  }

  /**
   * Crea Product privado + BusinessProduct atómicamente.
   */
  @Post('private')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(403, 'Prohibido')
  @Response(409, 'Conflicto')
  public async createPrivateProduct(
    @Body() body: CreatePrivateProductBody,
    @Request() request: ExpressRequest,
    @Header('Idempotency-Key') idempotencyKey?: string,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<PrivateProductCommercialDto> {
    const actor = requireAuthUser(request);
    return this.catalog.createPrivateProduct(
      actor,
      requireIdempotencyKey(idempotencyKey),
      body,
      readCommercialDeviceId(xDeviceId)
    );
  }

  /**
   * Actualiza producto privado propio (no PLATFORM_SHARED).
   */
  @Put('private/{id}')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  @Response(403, 'Prohibido')
  @Response(404, 'No encontrado')
  @Response(409, 'Conflicto')
  public async updatePrivateProduct(
    @Path() id: number,
    @Body() body: UpdatePrivateProductBody,
    @Request() request: ExpressRequest,
    @Header('Idempotency-Key') idempotencyKey?: string,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<PrivateProductCommercialDto> {
    const actor = requireAuthUser(request);
    return this.catalog.updatePrivateProduct(
      actor,
      id,
      requireIdempotencyKey(idempotencyKey),
      body,
      readCommercialDeviceId(xDeviceId)
    );
  }

  /**
   * Adopta un producto PLATFORM_SHARED creando BP activo con customPrice.
   */
  @Post('shared/{productId}/adopt')
  @Security('bearerAuth')
  @Tags('Catálogo privado')
  @SuccessResponse(200, 'OK')
  @Response(403, 'Prohibido')
  @Response(404, 'No encontrado')
  @Response(409, 'Conflicto')
  public async adoptSharedProduct(
    @Path() productId: number,
    @Body() body: AdoptSharedProductBody,
    @Request() request: ExpressRequest,
    @Header('Idempotency-Key') idempotencyKey?: string,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<AdoptResultDto> {
    const actor = requireAuthUser(request);
    return this.catalog.adoptSharedProduct(
      actor,
      productId,
      requireIdempotencyKey(idempotencyKey),
      body,
      readCommercialDeviceId(xDeviceId)
    );
  }

  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto obtenido exitosamente')
  @Response<ApiResponse<string>>(404, 'Producto no encontrado')
  public async getProductById(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse | string>> {
    const businessId = this.getBusinessId(undefined, request);
    const product = await this.productService.findById(id, businessId);

    if (!product) {
      this.setStatus(404);
      return {
        success: false,
        data: 'Producto no encontrado',
        message: 'Producto no encontrado',
        timestamp: new Date().toISOString(),
      };
    }

    return this.successResponse(product, 'Producto obtenido exitosamente');
  }

  /** Contención P1-F: mutación de catálogo maestro bloqueada. */
  @Post('/')
  @Security('bearerAuth')
  @SuccessResponse(201, 'Producto creado exitosamente')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async createProduct(
    @Body() productData: CreateProductRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async updateProduct(
    @Path() id: number,
    @Body() productData: UpdateProductRequest,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async deleteProduct(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<null>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Get('search')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductSearchResult[]>>(200, 'Búsqueda realizada exitosamente')
  public async searchProducts(
    @Query() q: string,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductSearchResult[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const results = await this.productService.search(q, businessId);
    return this.successResponse(results, 'Búsqueda realizada exitosamente');
  }

  @Put('{id}/activate')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async activateProduct(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}/deactivate')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async deactivateProduct(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}/discontinue')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async discontinueProduct(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Put('{id}/out-of-stock')
  @Security('bearerAuth')
  @Response<ErrorResponse>(403, 'Mutación de catálogo maestro bloqueada')
  public async markOutOfStock(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse>> {
    this.getBusinessId(undefined, request);
    this.setStatus(403);
    rejectCatalogMasterMutation();
  }

  @Get('category/{categoryId}')
  @Security('bearerAuth')
  public async getProductsByCategory(
    @Path() categoryId: number,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const products = await this.productService.findByCategory(categoryId, businessId);
    return this.successResponse(products, 'Productos por categoría obtenidos exitosamente');
  }

  @Get('status/{status}')
  @Security('bearerAuth')
  public async getProductsByStatus(
    @Path() status: string,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const products = await this.productService.findByStatus(status, businessId);
    return this.successResponse(products, 'Productos por estado obtenidos exitosamente');
  }

  @Get('brand/{brand}')
  @Security('bearerAuth')
  public async getProductsByBrand(
    @Path() brand: string,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const products = await this.productService.findByBrand(brand, businessId);
    return this.successResponse(products, 'Productos por marca obtenidos exitosamente');
  }

  @Get('low-stock')
  @Security('bearerAuth')
  public async getProductsLowStock(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const products = await this.productService.findLowStock(businessId);
    return this.successResponse(products, 'Productos con stock bajo obtenidos exitosamente');
  }

  @Get('out-of-stock')
  @Security('bearerAuth')
  public async getProductsOutOfStock(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = this.getBusinessId(undefined, request);
    const products = await this.productService.findOutOfStock(businessId);
    return this.successResponse(products, 'Productos fuera de stock obtenidos exitosamente');
  }

  @Get('stats')
  @Security('bearerAuth')
  public async getProductStats(
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<ProductStats>> {
    const businessId = this.getBusinessId(undefined, request);
    const stats = await this.productService.getStats(businessId);
    return this.successResponse(stats, 'Estadísticas de productos obtenidas exitosamente');
  }

  @Get('validate/sku')
  @Security('bearerAuth')
  public async validateSku(
    @Query() sku: string,
    @Query() excludeId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<{ exists: boolean }>> {
    const businessId = this.getBusinessId(undefined, request!);
    const exists = await this.productService.existsBySku(sku, businessId, excludeId);
    return this.successResponse({ exists }, 'Validación de SKU realizada exitosamente');
  }

  @Get('validate/barcode')
  @Security('bearerAuth')
  public async validateBarcode(
    @Query() barcode: string,
    @Query() excludeId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<{ exists: boolean }>> {
    const businessId = this.getBusinessId(undefined, request!);
    const exists = await this.productService.existsByBarcode(barcode, businessId, excludeId);
    return this.successResponse({ exists }, 'Validación de código de barras realizada exitosamente');
  }
}
