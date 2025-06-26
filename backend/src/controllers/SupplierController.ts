import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Query,
  Route,
  Tags,
  Security,
  Response,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import {
  CreateSupplierRequestNew,
  UpdateSupplierRequest,
  SupplierResponse,
  SupplierSearchResult
} from '../types/api';
import { ApiResponse, ErrorResponse, PaginatedApiResponse } from '../types/api';
import { BasePaginationController } from './basePaginationController';

import {
  createSuccessResponse,
  ensureExists,
} from '../helpers';
import { ValidationError, NotFoundError, ConflictError } from '../errors';
import { ISupplierService } from '../interfaces/services/ISupplierService';
import { container } from '../container/DIContainer';

@Route('suppliers')
@Tags('Proveedores')
export class SupplierController extends BasePaginationController {
  private supplierService: ISupplierService;

  constructor() {
    super();
    this.supplierService = container.getSupplierService();
  }

  /**
   * Obtener lista de proveedores con paginación estándar
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<SupplierResponse>>(200, 'Lista de proveedores obtenida exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de paginación inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getSuppliers(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc',
    @Query() status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    @Query() department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO',
    @Query() documentType?: 'NIT' | 'CI' | 'PASSPORT' | 'FOREIGN_ID',
    @Query() minCreditLimit?: number,
    @Query() maxCreditLimit?: number,
    @Query() minBalance?: number,
    @Query() maxBalance?: number
  ): Promise<PaginatedApiResponse<SupplierResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit, search, sortBy, sortOrder);

      const additionalFilters = {
        status,
        department,
        documentType,
        minCreditLimit,
        maxCreditLimit,
        minBalance,
        maxBalance,
      };

      const result = await this.supplierService.getSuppliers(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Lista de proveedores obtenida exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtener proveedor por ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(200, 'Proveedor obtenido exitosamente')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSupplierById(@Path() id: number): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.getSupplierById(id);
      const validatedSupplier = ensureExists(supplier, 'Proveedor', id);

      return createSuccessResponse(validatedSupplier);
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
   * Crear nuevo proveedor
   */
  @Post('/')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(201, 'Proveedor creado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(409, 'Código o documento ya existe')
  public async createSupplier(@Body() supplierData: CreateSupplierRequestNew): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.createSupplier(supplierData);

      this.setStatus(201);
      return createSuccessResponse(supplier, 'Proveedor creado exitosamente');
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
   * Actualizar proveedor
   */
  @Put('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(200, 'Proveedor actualizado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  @Response<ErrorResponse>(409, 'Código o documento ya existe')
  public async updateSupplier(
    @Path() id: number,
    @Body() supplierData: UpdateSupplierRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.updateSupplier(id, supplierData);

      return createSuccessResponse(supplier, 'Proveedor actualizado exitosamente');
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.setStatus(404);
        throw error;
      }
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
   * Eliminar proveedor (soft delete)
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Proveedor eliminado exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  public async deleteSupplier(@Path() id: number): Promise<ApiResponse<null>> {
    try {
      await this.supplierService.deleteSupplier(id);

      return createSuccessResponse(null, 'Proveedor eliminado exitosamente');
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
   * Buscar proveedores
   */
  @Get('search')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierSearchResult[]>>(200, 'Búsqueda realizada exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de búsqueda inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async searchSuppliers(
    @Query() query: string,
    @Query() businessId?: number
  ): Promise<ApiResponse<SupplierSearchResult[]>> {
    try {
      const results = await this.supplierService.searchSuppliers(query, businessId);

      return createSuccessResponse(results, 'Búsqueda realizada exitosamente');
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
   * Activar proveedor
   */
  @Put('{id}/activate')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(200, 'Proveedor activado exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  public async activateSupplier(@Path() id: number): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.activateSupplier(id);

      return createSuccessResponse(supplier, 'Proveedor activado exitosamente');
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
   * Desactivar proveedor
   */
  @Put('{id}/deactivate')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(200, 'Proveedor desactivado exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  public async deactivateSupplier(@Path() id: number): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.deactivateSupplier(id);

      return createSuccessResponse(supplier, 'Proveedor desactivado exitosamente');
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
   * Suspender proveedor
   */
  @Put('{id}/suspend')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse>>(200, 'Proveedor suspendido exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  public async suspendSupplier(@Path() id: number): Promise<ApiResponse<SupplierResponse>> {
    try {
      const supplier = await this.supplierService.suspendSupplier(id);

      return createSuccessResponse(supplier, 'Proveedor suspendido exitosamente');
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
   * Obtener proveedores con deuda
   */
  @Get('with-debt')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse[]>>(200, 'Proveedores con deuda obtenidos exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSuppliersWithDebt(
    @Query() businessId?: number

  ): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const suppliers = await this.supplierService.getSuppliersWithDebt(businessId);

      return createSuccessResponse(suppliers, 'Proveedores con deuda obtenidos exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }
}
