import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const password = process.env.DB_PASSWORD;

if (!password) {
  throw new Error("Falta configurar DB_PASSWORD en el archivo .env");
}

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME ?? "BDCOMPUTEC",
  user: process.env.DB_USER ?? "sa",
  password,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
  },
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}