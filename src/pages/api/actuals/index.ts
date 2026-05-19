import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { actualResultSchema, projectIdSchema } from "@/server/schemas";

export default withProtectedMethods(["GET", "POST"], async (req, res, user) => {
  if (req.method === "GET") {
    const parsed = projectIdSchema.safeParse({
      projectId: Array.isArray(req.query.projectId) ? req.query.projectId[0] : req.query.projectId
    });
    if (!parsed.success) {
      badRequest(res, parsed.error.issues[0]?.message ?? "Project id is required.");
      return;
    }

    const actuals = await prisma.actualResult.findMany({
      where: {
        projectId: parsed.data.projectId,
        project: { tenantId: user.tenantId }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      ok: true,
      data: {
        actuals: actuals.map((actual) => ({
          ...actual,
          createdAt: actual.createdAt.toISOString()
        }))
      }
    } satisfies ApiResponse<{ actuals: Array<Record<string, unknown>> }>);
    return;
  }

  const parsed = actualResultSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid actual result.");
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, tenantId: user.tenantId }
  });
  if (!project) {
    res.status(404).json({ ok: false, error: "Project not found." } satisfies ApiResponse<never>);
    return;
  }

  const actual = await prisma.actualResult.create({
    data: parsed.data
  });

  await audit(user, "CREATE_ACTUAL_RESULT", "Project", project.id, {
    actualCost: actual.actualCost,
    actualEffortHours: actual.actualEffortHours
  });

  res.status(201).json({
    ok: true,
    data: {
      actual: {
        ...actual,
        createdAt: actual.createdAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ actual: Record<string, unknown> }>);
});
