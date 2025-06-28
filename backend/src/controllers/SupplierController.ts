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
import { PaginationParams } from '../types/pagination';

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
   * Obtener lista de proveedores con paginación y filtros avanzados
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<SupplierResponse>>(200, 'Lista de proveedores obtenida exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de paginación inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getSuppliers(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc',
    @Query() status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    @Query() department?: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO',
    @Query() documentType?: 'NIT' | 'CI' | 'PASSPORT' | 'FOREIGN_ID',
    @Query() minCreditLimit?: number,
    @Query() maxCreditLimit?: number,
    @Query() minBalance?: number,
    @Query() maxBalance?: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<PaginatedApiResponse<SupplierResponse>> {
    try {
      const paginationParams: PaginationParams = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        search,
        sortBy,
        sortOrder
      };

      const effectiveBusinessId = this.getBusinessId(businessId, request!);

      const additionalFilters = {
        status,
        department,
        documentType,
        minCreditLimit,
        maxCreditLimit,
        minBalance,
        maxBalance,
        businessId: effectiveBusinessId
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
  public async getSupplierById(
    @Path() id: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.getSupplierById(id, effectiveBusinessId);
      const validatedSupplier = ensureExists(supplier, 'Proveedor', id);

      return this.createSuccessResponse(validatedSupplier, 'Proveedor obtenido exitosamente');
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
  public async createSupplier(
    @Body() supplierData: CreateSupplierRequestNew,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.createSupplier(supplierData, effectiveBusinessId);

      this.setStatus(201);
      return this.createSuccessResponse(supplier, 'Proveedor creado exitosamente');
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
    @Body() supplierData: UpdateSupplierRequest,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.updateSupplier(id, supplierData, effectiveBusinessId);

      return this.createSuccessResponse(supplier, 'Proveedor actualizado exitosamente');
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
  public async deleteSupplier(
    @Path() id: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<null>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      await this.supplierService.deleteSupplier(id, effectiveBusinessId);

      return this.createSuccessResponse(null, 'Proveedor eliminado exitosamente');
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
   * Buscar proveedores por término de búsqueda
   */
  @Get('search')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierSearchResult[]>>(200, 'Búsqueda de proveedores exitosa')
  @Response<ErrorResponse>(400, 'Parámetros de búsqueda inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async searchSuppliers(
    @Query() query: string,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierSearchResult[]>> {
    try {
      if (!query || query.trim().length === 0) {
        this.setStatus(400);
        throw new ValidationError('El término de búsqueda es requerido');
      }

      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const suppliers = await this.supplierService.searchSuppliers(query.trim(), effectiveBusinessId);

      return this.createSuccessResponse(suppliers, 'Búsqueda de proveedores exitosa');
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
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async activateSupplier(
    @Path() id: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.activateSupplier(id, effectiveBusinessId);

      return this.createSuccessResponse(supplier, 'Proveedor activado exitosamente');
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
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async deactivateSupplier(
    @Path() id: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.deactivateSupplier(id, effectiveBusinessId);

      return this.createSuccessResponse(supplier, 'Proveedor desactivado exitosamente');
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
  @Response<ErrorResponse>(404, 'Proveedor no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async suspendSupplier(
    @Path() id: number,
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const supplier = await this.supplierService.suspendSupplier(id, effectiveBusinessId);

      return this.createSuccessResponse(supplier, 'Proveedor suspendido exitosamente');
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
   * Obtener proveedores con deuda pendiente
   */
  @Get('with-debt')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse[]>>(200, 'Proveedores con deuda obtenidos exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSuppliersWithDebt(
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const suppliers = await this.supplierService.getSuppliersWithDebt(effectiveBusinessId);

      return this.createSuccessResponse(suppliers, 'Proveedores con deuda obtenidos exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de proveedores
   */
  @Get('stats')
  @Security('bearerAuth')
  @Response<ApiResponse<any>>(200, 'Estadísticas de proveedores obtenidas exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSupplierStats(
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<any>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const stats = await this.supplierService.getSupplierStats(effectiveBusinessId);

      return this.createSuccessResponse(stats, 'Estadísticas de proveedores obtenidas exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener proveedores por estado
   */
  @Get('by-status/{status}')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse[]>>(200, 'Proveedores por estado obtenidos exitosamente')
  @Response<ErrorResponse>(400, 'Estado inválido')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSuppliersByStatus(
    @Path() status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const suppliers = await this.supplierService.getSuppliersByStatus(status, effectiveBusinessId);

      return this.createSuccessResponse(suppliers, 'Proveedores por estado obtenidos exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener proveedores por departamento
   */
  @Get('by-department/{department}')
  @Security('bearerAuth')
  @Response<ApiResponse<SupplierResponse[]>>(200, 'Proveedores por departamento obtenidos exitosamente')
  @Response<ErrorResponse>(400, 'Departamento inválido')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getSuppliersByDepartment(
    @Path() department: 'LA_PAZ' | 'COCHABAMBA' | 'SANTA_CRUZ' | 'ORURO' | 'POTOSI' | 'CHUQUISACA' | 'TARIJA' | 'BENI' | 'PANDO',
    @Query() businessId?: number,
    @Request() request?: ExpressRequest
  ): Promise<ApiResponse<SupplierResponse[]>> {
    try {
      const effectiveBusinessId = this.getBusinessId(businessId, request!);
      const suppliers = await this.supplierService.getSuppliersByDepartment(department, effectiveBusinessId);

      return this.createSuccessResponse(suppliers, 'Proveedores por departamento obtenidos exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }
}
