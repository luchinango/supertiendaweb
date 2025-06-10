import {PrismaClient} from '../../prisma/generated'

declare global {
  namespace Express {
    interface Request {
      context: {
        prisma: PrismaClient;
      };
    }
  }
}
