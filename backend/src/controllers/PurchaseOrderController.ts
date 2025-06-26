import {
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Route,
  Tags,
  Path,
  Body,
  Query,
  Security,
  Response,
  Example,
  Request
} from 'tsoa';
import { BasePaginationController } from './basePaginationController';
import { DIContainer } from '../container/DIContainer';
import { IPurchaseOrderService } from '../interfaces/services/IPurchaseOrderService';
import {
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest
} from '../services/purchaseOrderService';
import {
  ApprovePurchaseOrderRequest,
  ApiResponse,
  PaginatedApiResponse,
  ErrorResponse
} from '../types/api';
import { PurchaseOrderStatus } from '../../prisma/generated';
import { createSuccessResponse } from '../helpers';
import { Request as ExpressRequest } from 'express';

@Route('purchase-orders')
@Tags('Órdenes de Compra')
export class PurchaseOrderController extends BasePaginationController {
  private purchaseOrderService: IPurchaseOrderService;

  constructor() {
    super();
    this.purchaseOrderService = DIContainer.getPurchaseOrderService();
  }

  /**
   * Obtiene una lista paginada de órdenes de compra con filtros opcionales
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<PurchaseOrderResponse>>(200, 'Lista de órdenes de compra obtenida exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de consulta inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getPurchaseOrders(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() search?: string,
    @Query() businessId?: number,
    @Query() status?: PurchaseOrderStatus,
    @Query() supplierId?: number
  ): Promise<PaginatedApiResponse<PurchaseOrderResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit, search);

      const additionalFilters = {
        businessId,
        status,
        supplierId
      };

      const result = await this.purchaseOrderService.findMany(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Lista de órdenes de compra obtenida exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtiene una orden de compra por su ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<PurchaseOrderResponse>>(200, 'Orden de compra obtenida exitosamente')
  @Response<ErrorResponse>(404, 'Orden de compra no encontrada')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getPurchaseOrderById(
    @Path() id: number
  ): Promise<ApiResponse<PurchaseOrderResponse>> {
    try {
      const purchaseOrder = await this.purchaseOrderService.findById(id);

      if (!purchaseOrder) {
        this.setStatus(404);
        throw new Error('Orden de compra no encontrada');
      }

      return createSuccessResponse(purchaseOrder, 'Orden de compra obtenida exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Crea una nueva orden de compra
   */
  @Post('/')
  @Security('bearerAuth')
  @Response<ApiResponse<PurchaseOrderResponse>>(201, 'Orden de compra creada exitosamente')
  @Response<ErrorResponse>(400, 'Datos de entrada inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(409, 'Número de orden ya existe')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async createPurchaseOrder(
    @Body() data: CreatePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> {
    try {
      const purchaseOrder = await this.purchaseOrderService.create(data);

      this.setStatus(201);
      return createSuccessResponse(purchaseOrder, 'Orden de compra creada exitosamente');
    } catch (error) {
      this.setStatus(400);
      throw error;
    }
  }

  /**
   * Actualiza una orden de compra por su ID
   */
  @Put('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<PurchaseOrderResponse>>(200, 'Orden de compra actualizada exitosamente')
  @Response<ErrorResponse>(400, 'Datos de entrada inválidos')
  @Response<ErrorResponse>(404, 'Orden de compra no encontrada')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async updatePurchaseOrder(
    @Path() id: number,
    @Body() data: UpdatePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> {
    try {
      const purchaseOrder = await this.purchaseOrderService.update(id, data);

      return createSuccessResponse(purchaseOrder, 'Orden de compra actualizada exitosamente');
    } catch (error) {
      this.setStatus(400);
      throw error;
    }
  }

  /**
   * Elimina una orden de compra por su ID
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Orden de compra eliminada exitosamente')
  @Response<ErrorResponse>(404, 'Orden de compra no encontrada')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async deletePurchaseOrder(
    @Path() id: number
  ): Promise<ApiResponse<null>> {
    try {
      await this.purchaseOrderService.delete(id);

      return createSuccessResponse(null, 'Orden de compra eliminada exitosamente');
    } catch (error) {
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Aprueba una orden de compra
   */
  @Patch('{id}/approve')
  @Security('bearerAuth')
  @Response<ApiResponse<PurchaseOrderResponse>>(200, 'Orden de compra aprobada exitosamente')
  @Response<ErrorResponse>(400, 'Datos de entrada inválidos')
  @Response<ErrorResponse>(404, 'Orden de compra no encontrada')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async approvePurchaseOrder(
    @Path() id: number,
    @Body() data: ApprovePurchaseOrderRequest
  ): Promise<ApiResponse<PurchaseOrderResponse>> {
    try {
      const purchaseOrder = await this.purchaseOrderService.approvePurchaseOrder(id, data.approvedBy);

      return createSuccessResponse(purchaseOrder, 'Orden de compra aprobada exitosamente');
    } catch (error) {
      this.setStatus(400);
      throw error;
    }
  }

  /**
   * Obtiene órdenes de compra por estado
   */
  @Get('status/{status}')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<PurchaseOrderResponse>>(200, 'Órdenes de compra obtenidas exitosamente')
  @Response<ErrorResponse>(400, 'Estado inválido')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getPurchaseOrdersByStatus(
    @Path() status: PurchaseOrderStatus,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() businessId?: number
  ): Promise<PaginatedApiResponse<PurchaseOrderResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit);

      const additionalFilters = {
        businessId,
        status
      };

      const result = await this.purchaseOrderService.findMany(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Órdenes de compra obtenidas exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtiene órdenes de compra por proveedor
   */
  @Get('supplier/{supplierId}')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<PurchaseOrderResponse>>(200, 'Órdenes de compra obtenidas exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getPurchaseOrdersBySupplier(
    @Path() supplierId: number,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() businessId?: number,
    @Query() status?: PurchaseOrderStatus
  ): Promise<PaginatedApiResponse<PurchaseOrderResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit);

      const additionalFilters = {
        businessId,
        status,
        supplierId
      };

      const result = await this.purchaseOrderService.findMany(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Órdenes de compra obtenidas exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtiene órdenes de compra por negocio
   */
  @Get('business/{businessId}')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<PurchaseOrderResponse>>(200, 'Órdenes de compra obtenidas exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getPurchaseOrdersByBusiness(
    @Path() businessId: number,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: PurchaseOrderStatus,
    @Query() supplierId?: number
  ): Promise<PaginatedApiResponse<PurchaseOrderResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit);

      const additionalFilters = {
        businessId,
        status,
        supplierId
      };

      const result = await this.purchaseOrderService.findMany(paginationParams, additionalFilters);

      return this.createPaginatedResponse(result, 'Órdenes de compra obtenidas exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }
}