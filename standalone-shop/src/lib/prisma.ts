import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolve the SQLite file to an absolute path so the database is found
 * regardless of the process working directory (Next.js, tsx scripts, etc.).
 * The Prisma CLI resolves `file:./dev.db` relative to the schema dir
 * (`prisma/`), so both the CLI and the runtime point at `<project>/prisma/dev.db`.
 */
function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./dev.db';
  const filePath = raw.replace(/^file:/, '');
  if (path.isAbsolute(filePath)) {
    return `file:${filePath}`;
  }
  return `file:${path.join(process.cwd(), 'prisma', path.basename(filePath))}`;
}

function createClient() {
  const adapter = new PrismaBetterSQLite3({ url: resolveDbUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
