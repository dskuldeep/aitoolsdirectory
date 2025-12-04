import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production, ensure we don't create multiple instances
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}

// Handle connection cleanup on serverless
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Only disconnect on process exit in production
  const disconnect = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignore disconnect errors
    }
  }
  
  process.on('beforeExit', disconnect)
  process.on('SIGINT', disconnect)
  process.on('SIGTERM', disconnect)
}

