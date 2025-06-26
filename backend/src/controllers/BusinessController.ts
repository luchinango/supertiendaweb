import {
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
  Response} from 'tsoa';
import { BasePaginationController } from './basePaginationController';
import businessService from '../services/businessService';
import { ValidationError, NotFoundError, ConflictError } from '../errors';
import {
  BusinessResponse,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessProductResponse,
  CreateBusinessProductRequest,
  UpdateBusinessProductRequest,
  ApiResponse,
  PaginatedApiResponse,
  ErrorResponse
} from '../types/api';
import {
  createSuccessResponse,
  ensureExists,
} from '../helpers';

@Route('businesses')
@Tags('Negocios')
export class BusinessController extends BasePaginationController {
  private businessService = businessService;

  constructor() {
    super();
  }

  /**
   * Obtener lista paginada de negocios
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<BusinessResponse>>(200, 'Lista de negocios obtenida exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de consulta inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getBusinesses(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
    @Query() businessType?: 'EMPRESA_UNIPERSONAL' | 'SOCIEDAD_ANONIMA' | 'SOCIEDAD_LIMITADA' | 'SOCIEDAD_COOPERATIVA' | 'EMPRESA_PUBLICA' | 'ORGANIZACION_NO_LUCRATIVA' | 'PERSONA_NATURAL',
    @Query() department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO'
  ): Promise<PaginatedApiResponse<BusinessResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit, search);

      const additionalFilters = {
        status,
        businessType,
        department,
      };

      const result = await this.businessService.getBusinesses(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Lista de negocios obtenida exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtener negocio por ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessResponse>>(200, 'Negocio obtenido exitosamente')
  @Response<ErrorResponse>(404, 'Negocio no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getBusinessById(@Path() id: number): Promise<ApiResponse<BusinessResponse>> {
    try {
      const business = await this.businessService.getById(id);
      const validatedBusiness = ensureExists(business, 'Negocio', id);

      return createSuccessResponse(validatedBusiness);
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
   * Crear nuevo negocio
   */
  @Post('/')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessResponse>>(201, 'Negocio creado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(409, 'NIT ya existe')
  public async createBusiness(@Body() businessData: CreateBusinessRequest): Promise<ApiResponse<BusinessResponse>> {
    try {
      const business = await this.businessService.create(businessData);

      this.setStatus(201);
      return createSuccessResponse(business, 'Negocio creado exitosamente');
    } catch (error) {
      if (error instanceof ValidationError) {
        this.setStatus(400);
        throw error;
      }
      if (error instanceof ConflictError) {
        this.setStatus(409);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Actualizar negocio
   */
  @Put('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessResponse>>(200, 'Negocio actualizado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio no encontrado')
  public async updateBusiness(
    @Path() id: number,
    @Body() businessData: UpdateBusinessRequest
  ): Promise<ApiResponse<BusinessResponse>> {
    try {
      const business = await this.businessService.update(id, businessData);
      const validatedBusiness = ensureExists(business, 'Negocio', id);

      return createSuccessResponse(validatedBusiness, 'Negocio actualizado exitosamente');
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
   * Eliminar negocio (soft delete)
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Negocio eliminado exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio no encontrado')
  public async deleteBusiness(@Path() id: number): Promise<ApiResponse<null>> {
    try {
      await this.businessService.delete(id);

      return createSuccessResponse(null, 'Negocio eliminado exitosamente');
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
   * Obtener productos de un negocio
   */
  @Get('{businessId}/products')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessProductResponse[]>>(200, 'Productos del negocio obtenidos exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio no encontrado')
  public async getBusinessProducts(@Path() businessId: number): Promise<ApiResponse<BusinessProductResponse[]>> {
    try {
      const products = await this.businessService.getBusinessProducts(businessId);

      const convertedProducts = products.map(product => ({
        ...product,
        customPrice: Number(product.customPrice),
        currentStock: Number(product.currentStock),
        reservedStock: Number(product.reservedStock),
        availableStock: Number(product.availableStock),
        product: product.product ? {
          ...product.product,
          sku: product.product.sku || undefined,
          barcode: product.product.barcode || undefined,
          brand: product.product.brand || undefined,
          model: product.product.model || undefined,
          unit: product.product.unit || undefined,
          weight: product.product.weight ? Number(product.product.weight) : undefined,
          dimensions: product.product.dimensions || undefined,
          costPrice: Number(product.product.costPrice),
          sellingPrice: Number(product.product.sellingPrice),
          taxType: product.product.taxType,
          taxRate: Number(product.product.taxRate),
          maxStock: product.product.maxStock || undefined,
          expiryDate: product.product.expiryDate?.toISOString() || undefined,
          createdAt: product.product.createdAt.toISOString(),
          updatedAt: product.product.updatedAt.toISOString(),
          deletedAt: product.product.deletedAt?.toISOString() || undefined,
          deletedBy: product.product.deletedBy || undefined,
          description: product.product.description || undefined,
          category: product.product.category ? {
            id: product.product.category.id,
            name: product.product.category.name,
            description: product.product.category.description || undefined,
          } : undefined,
        } : undefined,
      }));

      return {
        success: true,
        data: convertedProducts,
        timestamp: new Date().toISOString(),
      };
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
   * Agregar producto a un negocio
   */
  @Post('{businessId}/products')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessProductResponse>>(201, 'Producto agregado al negocio exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio o producto no encontrado')
  @Response<ErrorResponse>(409, 'Producto ya existe en el negocio')
  public async addProductToBusiness(
    @Path() businessId: number,
    @Body() productData: CreateBusinessProductRequest
  ): Promise<ApiResponse<BusinessProductResponse>> {
    try {
      const businessProduct = await this.businessService.addProductToBusiness(
        businessId,
        productData.productId,
        productData.customPrice
      );

      const convertedProduct = {
        ...businessProduct,
        customPrice: Number(businessProduct.customPrice),
        currentStock: Number(businessProduct.currentStock),
        reservedStock: Number(businessProduct.reservedStock),
        availableStock: Number(businessProduct.availableStock),
      };

      this.setStatus(201);
      return {
        success: true,
        data: convertedProduct,
        message: 'Producto agregado al negocio exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
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
  }

  /**
   * Actualizar producto de un negocio
   */
  @Put('{businessId}/products/{productId}')
  @Security('bearerAuth')
  @Response<ApiResponse<BusinessProductResponse>>(200, 'Producto del negocio actualizado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio o producto no encontrado')
  public async updateBusinessProduct(
    @Path() businessId: number,
    @Path() productId: number,
    @Body() productData: UpdateBusinessProductRequest
  ): Promise<ApiResponse<BusinessProductResponse>> {
    try {
      const businessProduct = await this.businessService.updateBusinessProduct(
        businessId,
        productId,
        productData
      );

      const convertedProduct = {
        ...businessProduct,
        customPrice: Number(businessProduct.customPrice),
        currentStock: Number(businessProduct.currentStock),
        reservedStock: Number(businessProduct.reservedStock),
        availableStock: Number(businessProduct.availableStock),
      };

      return {
        success: true,
        data: convertedProduct,
        message: 'Producto del negocio actualizado exitosamente',
        timestamp: new Date().toISOString(),
      };
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
   * Eliminar producto de un negocio
   */
  @Delete('{businessId}/products/{productId}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Producto removido del negocio exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Negocio o producto no encontrado')
  public async removeProductFromBusiness(
    @Path() businessId: number,
    @Path() productId: number
  ): Promise<ApiResponse<null>> {
    try {
      await this.businessService.removeProductFromBusiness(businessId, productId);

      return {
        success: true,
        data: null,
        message: 'Producto removido del negocio exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }
}
