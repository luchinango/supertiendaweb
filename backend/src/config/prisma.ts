import {PrismaClient} from '../../prisma/generated'

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database successfully')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Database disconnection error:', error)
  }
}

export default prisma;
