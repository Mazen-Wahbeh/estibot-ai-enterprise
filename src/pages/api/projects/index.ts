import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods, badRequest } from "@/api/http";
import { prisma } from "@/server/prisma";
import { projectCreateSchema } from "@/server/schemas";
import { initialState } from "@/utils/state";

export default withProtectedMethods(["GET", "POST"], async (req, res, user) => {
  if (req.method === "GET") {
    const projects = await prisma.project.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { updatedAt: "desc" },
      include: {
        estimations: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    res.status(200).json({
      ok: true,
      data: {
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          method: project.method,
          hourlyRate: project.hourlyRate,
          updatedAt: project.updatedAt.toISOString(),
          latestEstimationAt: project.estimations[0]?.createdAt.toISOString() ?? null
        }))
      }
    } satisfies ApiResponse<{ projects: Array<Record<string, unknown>> }>);
    return;
  }

  const parsed = projectCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid project request.");
    return;
  }

  const state = {
    ...initialState,
    project: parsed.data,
    missingFields: []
  };

  const project = await prisma.project.create({
    data: {
      tenantId: user.tenantId,
      ownerId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      method: parsed.data.method,
      hourlyRate: parsed.data.hourlyRate,
      stateJson: JSON.stringify(state)
    }
  });

  res.status(201).json({
    ok: true,
    data: {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        method: project.method,
        hourlyRate: project.hourlyRate,
        updatedAt: project.updatedAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ project: Record<string, unknown> }>);
});
