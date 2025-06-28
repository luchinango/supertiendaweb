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
} from 'tsoa';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/api';
import { ApiResponse, ErrorResponse, PaginatedApiResponse } from '../types/api';
import { BasePaginationController } from './basePaginationController';
import {
  mapPaginatedUsersToResponse,
  mapUserToUserResponse,
} from '../mappers';
import {
  createSuccessResponse,
  ensureExists,
} from '../helpers';
import { ValidationError, NotFoundError } from '../errors';
import { IUserService } from '../interfaces/services/IUserService';
import { container } from '../container/DIContainer';

@Route('users')
@Tags('Usuarios')
export class UserController extends BasePaginationController {
  private userService: IUserService;

  constructor() {
    super();
    this.userService = container.getUserService();
  }

  /**
   * Obtener lista de usuarios con paginación estándar
   */
  @Get('/')
  @Security('bearerAuth')
  @Response<PaginatedApiResponse<UserResponse>>(200, 'Lista de usuarios obtenida exitosamente')
  @Response<ErrorResponse>(400, 'Parámetros de paginación inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(500, 'Error interno del servidor')
  public async getUsers(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() sortBy?: string,
    @Query() sortOrder?: 'asc' | 'desc',
    @Query() status?: string,
    @Query() roleId?: number,
    @Query() businessId?: number
  ): Promise<PaginatedApiResponse<UserResponse>> {
    try {
      const paginationParams = this.validatePagination(page, limit, search, sortBy, sortOrder);

      const additionalFilters = {
        status,
        roleId,
        businessId,
      };

      const result = await this.userService.findMany(paginationParams, additionalFilters);
      const mappedResult = mapPaginatedUsersToResponse(result);

      return this.createPaginatedResponse(mappedResult, 'Lista de usuarios obtenida exitosamente');
    } catch (error) {
      return this.handlePaginationError(error);
    }
  }

  /**
   * Obtener usuario por ID
   */
  @Get('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<UserResponse>>(200, 'Usuario obtenido exitosamente')
  @Response<ErrorResponse>(404, 'Usuario no encontrado')
  @Response<ErrorResponse>(401, 'No autorizado')
  public async getUserById(@Path() id: number): Promise<ApiResponse<UserResponse>> {
    try {
      const user = await this.userService.getUserById(id);
      const validatedUser = ensureExists(user, 'Usuario', id);

      return createSuccessResponse(mapUserToUserResponse(validatedUser));
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
   * Crear nuevo usuario
   */
  @Post('/')
  @Security('bearerAuth')
  @Response<ApiResponse<UserResponse>>(201, 'Usuario creado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(409, 'Usuario ya existe')
  public async createUser(@Body() userData: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
    try {
      const user = await this.userService.createUser(userData);

      this.setStatus(201);
      return createSuccessResponse(
        mapUserToUserResponse(user),
        'Usuario creado exitosamente'
      );
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
   * Actualizar usuario
   */
  @Put('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<UserResponse>>(200, 'Usuario actualizado exitosamente')
  @Response<ErrorResponse>(400, 'Datos inválidos')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Usuario no encontrado')
  public async updateUser(
    @Path() id: number,
    @Body() userData: UpdateUserRequest
  ): Promise<ApiResponse<UserResponse>> {
    try {
      const user = await this.userService.updateUser(id, userData);
      const validatedUser = ensureExists(user, 'Usuario', id);

      return createSuccessResponse(
        mapUserToUserResponse(validatedUser),
        'Usuario actualizado exitosamente'
      );
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
   * Eliminar usuario
   */
  @Delete('{id}')
  @Security('bearerAuth')
  @Response<ApiResponse<null>>(200, 'Usuario eliminado exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado')
  @Response<ErrorResponse>(404, 'Usuario no encontrado')
  public async deleteUser(@Path() id: number): Promise<ApiResponse<null>> {
    try {
      await this.userService.deleteUser(id);

      return createSuccessResponse(null, 'Usuario eliminado exitosamente');
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
