import {
  Controller,
  Get,
  Route,
  Tags,
  Security,
  Header,
  Query,
  Request,
  SuccessResponse,
  Response,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { CashRegisterStatus } from '../../generated';
import prisma from '../config/prisma';
import { requireAuthUser } from '../helpers/tenantContext';
import { ValidationError } from '../errors';
import { issueCashLease, publicLeaseFields } from '../services/CashLeaseService';
import {
  getCashSessionEnvelope,
  type CashSessionSummaryDto,
} from '../services/CashSessionService';

function readDeviceId(request: ExpressRequest, headerValue?: string): string {
  const fromHeader = headerValue || (request.headers['x-device-id'] as string | undefined);
  if (!fromHeader || !String(fromHeader).trim()) {
    throw new ValidationError('Header X-Device-Id es obligatorio');
  }
  const deviceId = String(fromHeader).trim();
  if (deviceId.length > 64) {
    throw new ValidationError('X-Device-Id excede 64 caracteres');
  }
  return deviceId;
}

export interface OpenCashRegisterDto {
  id: number;
  businessId: number;
  userId: number;
  deviceId: string;
  registerNumber: string;
  version: number;
  status: string;
  openingAmount: string;
  currentAmount: string;
  openingDate: string;
  notes: string | null;
  /** P2-C1.F1 — autorización offline firmada (expiresAt fijo desde openingDate; GET no renueva). */
  leaseId: string;
  leaseIssuedAt: string;
  leaseExpiresAt: string;
  cashLeaseToken: string;
}

export interface OpenCashRegisterResponse {
  open: OpenCashRegisterDto | null;
}

export interface CashSessionResponse {
  session: CashSessionSummaryDto | null;
  previousClosed?: CashSessionSummaryDto | null;
}

/**
 * Lectura mínima de caja OPEN del usuario+dispositivo autenticados.
 * Mutaciones: usar POST /sync/push (CASH_OPEN / CASH_CLOSE).
 */
@Route('cash-registers')
@Tags('Caja')
@Security('bearerAuth')
export class PosCashRegisterController extends Controller {
  /**
   * Resumen de jornada/caja del dispositivo (OPEN actual o última cerrada).
   * Opcional: ?cashRegisterId= para una caja concreta del mismo usuario/dispositivo.
   */
  @Get('session')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(401, 'No autenticado')
  @Response(403, 'Prohibido')
  @Response(404, 'No encontrado')
  public async getCashSession(
    @Request() request: ExpressRequest,
    @Header('X-Device-Id') xDeviceId?: string,
    @Query() cashRegisterId?: number
  ): Promise<CashSessionResponse> {
    const actor = requireAuthUser(request);
    const deviceId = readDeviceId(request, xDeviceId);
    return getCashSessionEnvelope(
      actor,
      deviceId,
      cashRegisterId != null ? Number(cashRegisterId) : null
    );
  }

  @Get('open')
  @SuccessResponse(200, 'OK')
  @Response(400, 'Validación')
  @Response(401, 'No autenticado')
  @Response(403, 'Prohibido')
  public async getOpenCashRegister(
    @Request() request: ExpressRequest,
    @Header('X-Device-Id') xDeviceId?: string
  ): Promise<OpenCashRegisterResponse> {
    const actor = requireAuthUser(request);
    const deviceId = readDeviceId(request, xDeviceId);

    const cash = await prisma.cashRegister.findFirst({
      where: {
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        status: CashRegisterStatus.OPEN,
        deletedAt: null,
      },
      orderBy: { id: 'desc' },
    });

    if (!cash) {
      return { open: null };
    }

    const lease = issueCashLease({
      businessId: cash.businessId,
      userId: cash.userId,
      deviceId: cash.deviceId,
      cashRegisterId: cash.id,
      openingDate: cash.openingDate,
    });
    const pub = publicLeaseFields(lease);

    return {
      open: {
        id: cash.id,
        businessId: cash.businessId,
        userId: cash.userId,
        deviceId: cash.deviceId,
        registerNumber: cash.registerNumber,
        version: cash.version,
        status: cash.status,
        openingAmount: cash.openingAmount.toFixed(2),
        currentAmount: cash.currentAmount.toFixed(2),
        openingDate: cash.openingDate.toISOString(),
        notes: cash.notes,
        leaseId: pub.leaseId,
        leaseIssuedAt: pub.leaseIssuedAt,
        leaseExpiresAt: pub.leaseExpiresAt,
        cashLeaseToken: pub.cashLeaseToken,
      },
    };
  }
}
