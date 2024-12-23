import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    let prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = (globalThis as typeof globalThis & { prisma?: ReturnType<typeof prismaClientSingleton> }).prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
    (globalThis as typeof globalThis & { prisma?: ReturnType<typeof prismaClientSingleton> }).prisma = prisma
}

export { prisma }