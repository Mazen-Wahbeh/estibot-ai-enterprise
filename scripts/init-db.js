const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) {
      continue;
    }
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

async function execute(statement) {
  try {
    await prisma.$executeRawUnsafe(statement);
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    if (!/duplicate column name|already exists/i.test(message)) {
      throw error;
    }
  }
}

const statements = [
  `CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "country" TEXT NOT NULL DEFAULT 'GLOBAL',
    "dataResidency" TEXT NOT NULL DEFAULT 'GLOBAL',
    "vatRate" REAL NOT NULL DEFAULT 0,
    "reportBrand" TEXT NOT NULL DEFAULT 'EstiBot AI SaaS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "country" TEXT NOT NULL DEFAULT 'GLOBAL',
    "clientName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sector" TEXT NOT NULL DEFAULT 'GENERAL',
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "vatRate" REAL NOT NULL DEFAULT 0,
    "stateJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Estimation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "method" TEXT NOT NULL DEFAULT 'BOTH',
    "fpData" TEXT NOT NULL,
    "ucpData" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Estimation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "UsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "limits" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "ActualResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "actualEffortHours" REAL NOT NULL,
    "actualDurationMonths" REAL NOT NULL,
    "actualCost" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActualResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Approval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "configJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "Project_tenantId_idx" ON "Project"("tenantId")`,
  `CREATE INDEX IF NOT EXISTS "Project_ownerId_idx" ON "Project"("ownerId")`,
  `CREATE INDEX IF NOT EXISTS "Estimation_projectId_idx" ON "Estimation"("projectId")`,
  `CREATE INDEX IF NOT EXISTS "UsageLog_userId_createdAt_idx" ON "UsageLog"("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "UsageLog_tenantId_createdAt_idx" ON "UsageLog"("tenantId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Subscription_tenantId_idx" ON "Subscription"("tenantId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "ActualResult_projectId_createdAt_idx" ON "ActualResult"("projectId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Approval_projectId_status_idx" ON "Approval"("projectId", "status")`,
  `CREATE INDEX IF NOT EXISTS "Proposal_projectId_createdAt_idx" ON "Proposal"("projectId", "createdAt")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Integration_tenantId_provider_key" ON "Integration"("tenantId", "provider")`,
  `CREATE INDEX IF NOT EXISTS "Integration_tenantId_idx" ON "Integration"("tenantId")`
];

const alterStatements = [
  `ALTER TABLE "Tenant" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en'`,
  `ALTER TABLE "Tenant" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD'`,
  `ALTER TABLE "Tenant" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'GLOBAL'`,
  `ALTER TABLE "Tenant" ADD COLUMN "dataResidency" TEXT NOT NULL DEFAULT 'GLOBAL'`,
  `ALTER TABLE "Tenant" ADD COLUMN "vatRate" REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE "Tenant" ADD COLUMN "reportBrand" TEXT NOT NULL DEFAULT 'EstiBot AI SaaS'`,
  `ALTER TABLE "Project" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD'`,
  `ALTER TABLE "Project" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'GLOBAL'`,
  `ALTER TABLE "Project" ADD COLUMN "clientName" TEXT`,
  `ALTER TABLE "Project" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT'`,
  `ALTER TABLE "Project" ADD COLUMN "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM'`,
  `ALTER TABLE "Project" ADD COLUMN "sector" TEXT NOT NULL DEFAULT 'GENERAL'`,
  `ALTER TABLE "Project" ADD COLUMN "teamSize" INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE "Project" ADD COLUMN "vatRate" REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE "Estimation" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE "Estimation" ADD COLUMN "method" TEXT NOT NULL DEFAULT 'BOTH'`
];

async function main() {
  for (const statement of statements) {
    await execute(statement);
  }
  for (const statement of alterStatements) {
    await execute(statement);
  }
  console.log("Database tables are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
