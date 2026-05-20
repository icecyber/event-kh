import { PrismaClient } from '@prisma/client'; console.log(new PrismaClient({ url: process.env.DATABASE_URL }));  
