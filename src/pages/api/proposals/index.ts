import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { prisma } from "@/server/prisma";
import { projectIdSchema } from "@/server/schemas";

export default withProtectedMethods(["GET"], async (req, res, user) => {
  const parsed = projectIdSchema.safeParse({
    projectId: Array.isArray(req.query.projectId) ? req.query.projectId[0] : req.query.projectId
  });
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Project id is required.");
    return;
  }

  const proposals = await prisma.proposal.findMany({
    where: {
      projectId: parsed.data.projectId,
      project: { tenantId: user.tenantId }
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    ok: true,
    data: {
      proposals: proposals.map((proposal) => ({
        ...proposal,
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString()
      }))
    }
  } satisfies ApiResponse<{ proposals: Array<Record<string, unknown>> }>);
});
