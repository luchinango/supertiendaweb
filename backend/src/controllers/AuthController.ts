import { Controller, Route, Post, Body, Response, Tags, Security, Request } from 'tsoa';
import { authService } from '../services/authService';
import { UnauthorizedError } from '../errors';
import { AuthResponse } from '../types/authTypes';
import { ApiResponse, ErrorResponse } from '../types/api';
import { createSuccessResponse } from '../helpers/responseHelpers';
import { Request as ExpressRequest } from 'express';

interface LoginRequestBody {
  username: string;
  password: string;
}

interface RefreshTokenRequestBody {
  refreshToken: string;
}

interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

@Route('auth')
@Tags('Autenticación')
export class AuthController extends Controller {

  /**
   * Iniciar sesión
   * @summary Autenticar usuario y obtener token JWT
   * @example body {
   *   "username": "admin",
   *   "password": "admin123"
   * }
   */
  @Post('login')
  @Response<ApiResponse<AuthResponse>>(200, 'Login exitoso')
  @Response<ErrorResponse>(401, 'Credenciales inválidas')
  @Response<ErrorResponse>(400, 'Datos requeridos faltantes')
  public async login(@Body() body: LoginRequestBody): Promise<ApiResponse<AuthResponse>> {
    try {
      const { username, password } = body;

      if (!username || !password) {
        this.setStatus(400);
        throw new Error('Usuario y contraseña son requeridos');
      }

      const authResponse = await authService.login(username, password);

      return createSuccessResponse(authResponse, 'Login exitoso');
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Renovar token de acceso
   * @summary Renovar token JWT usando refresh token
   */
  @Post('refresh')
  @Response<ApiResponse<any>>(200, 'Token renovado exitosamente')
  @Response<ErrorResponse>(401, 'Refresh token inválido')
  public async refreshToken(@Body() body: RefreshTokenRequestBody): Promise<ApiResponse<any>> {
    try {
      const { refreshToken } = body;

      if (!refreshToken) {
        this.setStatus(400);
        throw new Error('Token de actualización requerido');
      }

      const result = await authService.refreshAccessToken(refreshToken);
      return createSuccessResponse(result, 'Token renovado exitosamente');
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Cambiar contraseña
   * @summary Cambiar contraseña del usuario autenticado
   */
  @Post('change-password')
  @Security('bearerAuth')
  @Response<ApiResponse<any>>(200, 'Contraseña actualizada exitosamente')
  @Response<ErrorResponse>(401, 'No autorizado o contraseña actual incorrecta')
  @Response<ErrorResponse>(400, 'Datos requeridos faltantes')
  public async changePassword(
    @Body() body: ChangePasswordRequestBody,
    @Request() request: ExpressRequest
  ): Promise<ApiResponse<any>> {
    try {
      const { currentPassword, newPassword } = body;
      const userId = (request as any).user?.id;

      if (!userId) {
        this.setStatus(401);
        throw new UnauthorizedError('Usuario no autenticado');
      }

      if (!currentPassword || !newPassword) {
        this.setStatus(400);
        throw new Error('Contraseña actual y nueva contraseña son requeridas');
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      return createSuccessResponse(null, 'Contraseña actualizada exitosamente');
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Verificar token
   * @summary Verificar validez del token JWT
   */
  @Post('verify')
  @Security('bearerAuth')
  @Response<ApiResponse<any>>(200, 'Token válido')
  @Response<ErrorResponse>(401, 'Token inválido')
  public async verifyToken(@Request() request: ExpressRequest): Promise<ApiResponse<any>> {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        this.setStatus(401);
        throw new UnauthorizedError('Token no proporcionado');
      }

      const token = authHeader.split(' ')[1];
      const decoded = await authService.verifyToken(token);
      return createSuccessResponse({ valid: true, user: decoded }, 'Token válido');
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
        throw error;
      }
      this.setStatus(500);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Endpoint de prueba
   * @summary Endpoint simple para probar si TSOA funciona
   */
  @Post('test')
  @Response<any>(200, 'Prueba exitosa')
  public async test(@Body() body: any): Promise<any> {
    console.log('🧪 Test endpoint llamado con body:', body);
    return { status: 'success', message: 'Test endpoint funcionando', data: body };
  }
}