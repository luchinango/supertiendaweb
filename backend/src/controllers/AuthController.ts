import { Controller, Route, Post, Body, Response, Tags, Security, Request } from 'tsoa';
import { authService } from '../services/authService';
import { UnauthorizedError, ValidationError } from '../errors';
import { AuthResponse, VerifyTokenResponse } from '../types/authTypes';
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
    // Validar fuera del try genérico: un throw+setStatus(400) caía al catch y
    // reescribía a HTTP 500 (P2-C1.G2 — login sin username).
    const username = body?.username;
    const password = body?.password;
    if (!username || !password) {
      this.setStatus(400);
      throw new ValidationError('Usuario y contraseña son requeridos');
    }

    try {
      const authResponse = await authService.login(username, password);
      return createSuccessResponse(authResponse, 'Login exitoso');
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
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
   * Renovar token de acceso
   * @summary Renovar access token (y rotar refresh) usando un refresh token válido.
   * No acepta access tokens. No hay revocación server-side en esta versión.
   */
  @Post('refresh')
  @Response<ApiResponse<{ token: string; refreshToken: string }>>(200, 'Token renovado exitosamente')
  @Response<ErrorResponse>(401, 'Refresh token inválido')
  public async refreshToken(
    @Body() body: RefreshTokenRequestBody
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
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
   * Verificar token y obtener datos del usuario
   * @summary Verificar validez del token JWT y devolver datos completos del usuario
   */
  @Post('verify')
  @Security('bearerAuth')
  @Response<ApiResponse<VerifyTokenResponse>>(200, 'Token válido - datos del usuario obtenidos')
  @Response<ErrorResponse>(401, 'Token inválido')
  public async verifyToken(@Request() request: ExpressRequest): Promise<ApiResponse<VerifyTokenResponse>> {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        this.setStatus(401);
        throw new UnauthorizedError('Token no proporcionado');
      }

      const token = authHeader.split(' ')[1];
      const userData = await authService.getUserFromToken(token);
      return createSuccessResponse(userData, 'Token válido - datos del usuario obtenidos');
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