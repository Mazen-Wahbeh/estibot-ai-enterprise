import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  if (user.role !== "ADMIN") {
    res.status(403).json({ ok: false, error: "Admin access required." } satisfies ApiResponse<never>);
    return;
  }

  const [users, tenants, projects, estimations, usageLogs] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.project.count(),
    prisma.estimation.count(),
    prisma.usageLog.count()
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
      usageEvents: usageLogs,
      activeSessions,
      estimatedMonthlyRevenue: 0,
      systemHealth: "operational"
    }
  } satisfies ApiResponse<Record<string, number | string>>);
});
