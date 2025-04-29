import {PrismaClient} from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('Connected to database')
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect()
}

export default prisma;
