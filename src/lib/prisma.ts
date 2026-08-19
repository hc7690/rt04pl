import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Gunakan Turso (libsql) jika TURSO_DATABASE_URL tersedia,否则 pakai SQLite biasa
function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  
  if (tursoUrl) {
    // Production: gunakan Turso (libsql)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }
  
  // Development: gunakan SQLite biasa
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
