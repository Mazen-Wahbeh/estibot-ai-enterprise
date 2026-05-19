import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";

export default withProtectedMethods(["GET"], async (_req, res) => {
  const [users, tenants, projects, estimations] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.project.count(),
    prisma.estimation.count()
  ]);

  res.status(200).json({
    ok: true,
    data: {
      status: "operational",
      checkedAt: new Date().toISOString(),
      database: "reachable",
      users,
      tenants,
      projects,
      estimations
    }
  } satisfies ApiResponse<Record<string, number | string>>);
});
