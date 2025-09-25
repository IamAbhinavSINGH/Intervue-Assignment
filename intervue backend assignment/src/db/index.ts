import { PrismaClient } from '@prisma/client'
import config from '../config/config';

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton()

export default db;

if (config.nodeEnv !== 'production') globalThis.prismaGlobal = db;