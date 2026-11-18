import {
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Security,
  Body,
  Query,
  Header,
  Request,
  SuccessResponse,
  Response,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import prisma from '../config/prisma';
import { SyncService } from '../services/SyncService';
import { requireAuthUser } from '../helpers/tenantContext';
import { ValidationError } from '../errors';
import {
  SyncPushRequest,
  SyncPushResponse,
  SyncPullResponse,
} from '../types/syncTypes';

function readDeviceId(request: ExpressRequest, headerValue?: string): string {
  const fromHeader = headerValue || (request.headers['x-device-id'] as string | undefined);
  if (!fromHeader || !String(fromHeader).trim()) {
    throw new ValidationError('Header X-Device-Id es obligatorio');
  }
  return String(fromHeader).trim();
}

@Route('sync')
@Tags('Sincronización')
@Security('bearerAuth')
export class SyncController extends Controller {
  private syncService = new SyncService(prisma);

  /**
   * Empuja operaciones offline idempotentes (lote).
   * @param xDeviceId Identificador de dispositivo (auditoría; no autoriza)
   */
  @Post('push')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(401, 'No autenticado')
  @Response(403, 'Prohibido')
  public async push(
    @Body() body: SyncPushRequest,
    @Request() request: ExpressRequest,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<SyncPushResponse> {
    const actor = requireAuthUser(request);
    const deviceId = readDeviceId(request, xDeviceId);
    return this.syncService.push(actor, deviceId, body);
  }

  /**
   * Pull incremental con watermark de snapshot (sin pérdida de estado final).
   * @param xDeviceId Identificador de dispositivo (auditoría; no autoriza)
   */
  @Get('pull')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(401, 'No autenticado')
  @Response(403, 'Prohibido')
  public async pull(
    @Request() request: ExpressRequest,
    @Header('X-Device-Id') xDeviceId?: string,
    @Query() cursor?: string,
    @Query() limit?: number,
    @Query() streams?: string
  ): Promise<SyncPullResponse> {
    const actor = requireAuthUser(request);
    const deviceId = readDeviceId(request, xDeviceId);
    return this.syncService.pull(actor, deviceId, { cursor, limit, streams });
  }
}
