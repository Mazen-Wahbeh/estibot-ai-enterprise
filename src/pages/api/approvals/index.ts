import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  const approvals = await prisma.approval.findMany({
    where: {
      project: { tenantId: user.tenantId }
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          name: true,
          riskLevel: true,
          sector: true
        }
      }
    }
  });

  res.status(200).json({
    ok: true,
    data: {
      approvals: approvals.map((approval) => ({
        ...approval,
        createdAt: approval.createdAt.toISOString(),
        updatedAt: approval.updatedAt.toISOString()
      }))
    }
  } satisfies ApiResponse<{ approvals: Array<Record<string, unknown>> }>);
});
