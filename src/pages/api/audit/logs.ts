import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  const logs = await prisma.auditLog.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  res.status(200).json({
    ok: true,
    data: {
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString()
      }))
    }
  } satisfies ApiResponse<{ logs: Array<Record<string, string | null>> }>);
});
