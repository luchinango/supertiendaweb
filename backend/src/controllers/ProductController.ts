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
  Response,
  SuccessResponse,
} from 'tsoa';
import { container } from '../container/DIContainer';
import { IProductService } from '../interfaces/services/IProductService';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStats,
  ProductSearchResult,
} from '../types/api';
import { ApiResponse, ErrorResponse, PaginatedApiResponse } from '../types/api';
import { BasePaginationController } from './basePaginationController';
import { PaginationParams } from '../types/pagination';

@Route('products')
@Tags('Productos')
export class ProductController extends BasePaginationController {
  private productService: IProductService;

  constructor() {
    super();
    this.productService = container.getProductService();
  }

  /**
   * Construye parámetros de paginación
   */
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

  /**
   * Respuesta de éxito
   */
  protected successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Respuesta de error
   */
  protected errorResponse(message: string, statusCode: number): ApiResponse<null> {
    this.setStatus(statusCode);
    return {
      success: false,
      data: null,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener lista paginada de productos con filtros avanzados
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<ProductResponse>>(200, 'Lista de productos obtenida exitosamente')
  public async getProducts(
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
    const paginationParams = this.validatePagination(page, limit, search, sortBy, sortOrder);

    const additionalFilters = {
      categoryId,
      status,
      isActive,
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      brand,
      taxType,
    };

    const result = await this.productService.findMany(paginationParams, additionalFilters);

    return this.createPaginatedResponse(result, 'Lista de productos obtenida exitosamente');
  }

  /**
   * Obtener producto por ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto obtenido exitosamente')
  @Response<ApiResponse<string>>(404, 'Producto no encontrado')
  public async getProductById(@Path() id: number): Promise<ApiResponse<ProductResponse | string>> {
    const product = await this.productService.findById(id);

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

  /**
   * Crear nuevo producto
   */
  @Post('/')
  @Security('bearerAuth')
  @SuccessResponse(201, 'Producto creado exitosamente')
  @Response<ApiResponse<ProductResponse>>(201, 'Producto creado exitosamente')
  @Response<ApiResponse<null>>(400, 'Datos inválidos')
  @Response<ApiResponse<null>>(409, 'Conflicto - SKU o código de barras ya existe')
  public async createProduct(
    @Body() productData: CreateProductRequest
  ): Promise<ApiResponse<ProductResponse>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const product = await this.productService.create(productData, businessId);

    return this.successResponse(product, 'Producto creado exitosamente');
  }

  /**
   * Actualizar producto existente
   */
  @Put('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto actualizado exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  @Response<ApiResponse<null>>(400, 'Datos inválidos')
  @Response<ApiResponse<null>>(409, 'Conflicto - SKU o código de barras ya existe')
  public async updateProduct(
    @Path() id: number,
    @Body() productData: UpdateProductRequest
  ): Promise<ApiResponse<ProductResponse>> {
    const product = await this.productService.update(id, productData);

    return this.successResponse(product, 'Producto actualizado exitosamente');
  }

  /**
   * Eliminar producto (soft delete)
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Producto eliminado exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  public async deleteProduct(@Path() id: number): Promise<ApiResponse<null>> {
    await this.productService.delete(id);

    return this.successResponse(null, 'Producto eliminado exitosamente');
  }

  /**
   * Búsqueda rápida de productos
   */
  @Get('search')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductSearchResult[]>>(200, 'Búsqueda realizada exitosamente')
  @Response<ApiResponse<null>>(400, 'Término de búsqueda inválido')
  public async searchProducts(
    @Query() q: string
  ): Promise<ApiResponse<ProductSearchResult[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const results = await this.productService.search(q, businessId);

    return this.successResponse(results, 'Búsqueda realizada exitosamente');
  }

  /**
   * Activar producto
   */
  @Put('{id}/activate')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto activado exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  public async activateProduct(@Path() id: number): Promise<ApiResponse<ProductResponse>> {
    const product = await this.productService.activate(id);

    return this.successResponse(product, 'Producto activado exitosamente');
  }

  /**
   * Desactivar producto
   */
  @Put('{id}/deactivate')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto desactivado exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  public async deactivateProduct(@Path() id: number): Promise<ApiResponse<ProductResponse>> {
    const product = await this.productService.deactivate(id);

    return this.successResponse(product, 'Producto desactivado exitosamente');
  }

  /**
   * Marcar producto como descontinuado
   */
  @Put('{id}/discontinue')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto marcado como descontinuado exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  public async discontinueProduct(@Path() id: number): Promise<ApiResponse<ProductResponse>> {
    const product = await this.productService.discontinue(id);

    return this.successResponse(product, 'Producto marcado como descontinuado exitosamente');
  }

  /**
   * Marcar producto como fuera de stock
   */
  @Put('{id}/out-of-stock')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse>>(200, 'Producto marcado como fuera de stock exitosamente')
  @Response<ApiResponse<null>>(404, 'Producto no encontrado')
  public async markOutOfStock(@Path() id: number): Promise<ApiResponse<ProductResponse>> {
    const product = await this.productService.markOutOfStock(id);

    return this.successResponse(product, 'Producto marcado como fuera de stock exitosamente');
  }

  /**
   * Obtener productos por categoría
   */
  @Get('category/{categoryId}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse[]>>(200, 'Productos por categoría obtenidos exitosamente')
  public async getProductsByCategory(
    @Path() categoryId: number
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const products = await this.productService.findByCategory(categoryId, businessId);

    return this.successResponse(products, 'Productos por categoría obtenidos exitosamente');
  }

  /**
   * Obtener productos por estado
   */
  @Get('status/{status}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse[]>>(200, 'Productos por estado obtenidos exitosamente')
  public async getProductsByStatus(
    @Path() status: string
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const products = await this.productService.findByStatus(status, businessId);

    return this.successResponse(products, 'Productos por estado obtenidos exitosamente');
  }

  /**
   * Obtener productos por marca
   */
  @Get('brand/{brand}')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse[]>>(200, 'Productos por marca obtenidos exitosamente')
  public async getProductsByBrand(
    @Path() brand: string
  ): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const products = await this.productService.findByBrand(brand, businessId);

    return this.successResponse(products, 'Productos por marca obtenidos exitosamente');
  }

  /**
   * Obtener productos con stock bajo
   */
  @Get('low-stock')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse[]>>(200, 'Productos con stock bajo obtenidos exitosamente')
  public async getProductsLowStock(): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const products = await this.productService.findLowStock(businessId);

    return this.successResponse(products, 'Productos con stock bajo obtenidos exitosamente');
  }

  /**
   * Obtener productos fuera de stock
   */
  @Get('out-of-stock')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductResponse[]>>(200, 'Productos fuera de stock obtenidos exitosamente')
  public async getProductsOutOfStock(): Promise<ApiResponse<ProductResponse[]>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const products = await this.productService.findOutOfStock(businessId);

    return this.successResponse(products, 'Productos fuera de stock obtenidos exitosamente');
  }

  /**
   * Obtener estadísticas de productos
   */
  @Get('stats')
  @Security('bearerAuth')
  @Response<ApiResponse<ProductStats>>(200, 'Estadísticas de productos obtenidas exitosamente')
  public async getProductStats(): Promise<ApiResponse<ProductStats>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const stats = await this.productService.getStats(businessId);

    return this.successResponse(stats, 'Estadísticas de productos obtenidas exitosamente');
  }

  /**
   * Validar si un SKU ya existe
   */
  @Get('validate/sku')
  @Security('bearerAuth')
  @Response<ApiResponse<{ exists: boolean }>>(200, 'Validación de SKU realizada exitosamente')
  public async validateSku(
    @Query() sku: string,
    @Query() excludeId?: number
  ): Promise<ApiResponse<{ exists: boolean }>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const exists = await this.productService.existsBySku(sku, businessId, excludeId);

    return this.successResponse({ exists }, 'Validación de SKU realizada exitosamente');
  }

  /**
   * Validar si un código de barras ya existe
   */
  @Get('validate/barcode')
  @Security('bearerAuth')
  @Response<ApiResponse<{ exists: boolean }>>(200, 'Validación de código de barras realizada exitosamente')
  public async validateBarcode(
    @Query() barcode: string,
    @Query() excludeId?: number
  ): Promise<ApiResponse<{ exists: boolean }>> {
    const businessId = 1; // TODO: Obtener desde el contexto de autenticación

    const exists = await this.productService.existsByBarcode(barcode, businessId, excludeId);

    return this.successResponse({ exists }, 'Validación de código de barras realizada exitosamente');
  }
}
