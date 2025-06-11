import prisma from '../config/prisma';
import {CashRegisterStatus} from '../../prisma/generated';

export class CashRegisterService {
  async getOpenCashRegister(businessId: number, userId: number) {
    return await prisma.cashRegister.findFirst({
      where: {
        businessId,
        userId,
        status: CashRegisterStatus.OPEN
      }
    });
  }
}

export const cashRegisterService = new CashRegisterService();
