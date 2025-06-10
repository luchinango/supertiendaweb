import {Request} from 'express';
import {PrismaClient} from '../../prisma/generated'

declare global {
  namespace Express {
    interface Request {
      context: {
        prisma: PrismaClient;
      };
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}
