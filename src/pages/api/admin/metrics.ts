import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";

type CountRow = { count: number | bigint };

function countValue(rows: CountRow[]): number {
  return Number(rows[0]?.count ?? 0);
}

async function rawCount(query: string): Promise<number> {
  return countValue(await prisma.$queryRawUnsafe<CountRow[]>(query));
}

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  if (user.role !== "ADMIN") {
    res.status(403).json({ ok: false, error: "Admin access required." } satisfies ApiResponse<never>);
    return;
  }

  const [users, tenants, projects, estimations, usageLogs, highRiskProjects, proposals, actuals, integrations, proTenants, enterpriseTenants] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.project.count(),
    prisma.estimation.count(),
    prisma.usageLog.count(),
    prisma.project.count({ where: { riskLevel: "HIGH" } }),
    rawCount('SELECT COUNT(*) as count FROM "Proposal"'),
    rawCount('SELECT COUNT(*) as count FROM "ActualResult"'),
    rawCount('SELECT COUNT(*) as count FROM "Integration" WHERE "status" = \'CONNECTED\''),
    prisma.tenant.count({ where: { plan: "PRO" } }),
    prisma.tenant.count({ where: { plan: "ENTERPRISE" } })
  ]);

  const activeSessions = await prisma.usageLog.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60)
      }
    }
  });

  res.status(200).json({
    ok: true,
    data: {
      totalUsers: users,
      totalTenants: tenants,
      totalProjects: projects,
      totalEstimations: estimations,
      highRiskProjects,
      generatedProposals: proposals,
      projectsWithActuals: actuals,
      connectedIntegrations: integrations,
      usageEvents: usageLogs,
      activeSessions,
      estimatedMonthlyRevenue: proTenants * 49 + enterpriseTenants * 299,
      systemHealth: "operational"
    }
  } satisfies ApiResponse<Record<string, number | string>>);
});
