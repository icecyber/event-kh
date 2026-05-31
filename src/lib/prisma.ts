import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Force module cache invalidation to reload newly generated Prisma models (e.g. Appointment, Notification)

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
