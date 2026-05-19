import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { normalizePlan, planLimits } from "@/server/plans";
import { prisma } from "@/server/prisma";

function monthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  const plan = normalizePlan(user.plan);
  const limits = planLimits[plan];
  const start = monthStart();
  const [estimations, pdfExports, chats, projects] = await Promise.all([
    prisma.usageLog.count({ where: { tenantId: user.tenantId, action: "estimation", createdAt: { gte: start } } }),
    prisma.usageLog.count({ where: { tenantId: user.tenantId, action: "pdf", createdAt: { gte: start } } }),
    prisma.usageLog.count({ where: { tenantId: user.tenantId, action: "chat", createdAt: { gte: start } } }),
    prisma.project.count({ where: { tenantId: user.tenantId } })
  ]);

  res.status(200).json({
    ok: true,
    data: {
      plan,
      limits,
      usage: {
        estimations,
        pdfExports,
        chats,
        projects,
        cycleStart: start.toISOString()
      }
    }
  } satisfies ApiResponse<Record<string, unknown>>);
});
