import {PrismaClient} from '../../prisma/generated'
import { AuthenticatedUser } from '../middlewares/authMiddleware';

declare global {
  namespace Express {
    interface Request {
      context: {
        prisma: PrismaClient;
      };
      user?: AuthenticatedUser;
    }
  }
}
