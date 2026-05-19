import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods, badRequest } from "@/api/http";
import { prisma } from "@/server/prisma";
import { projectCreateSchema } from "@/server/schemas";
import { initialState } from "@/utils/state";
import { audit } from "@/server/audit";

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
          currency: project.currency,
          country: project.country,
          clientName: project.clientName,
          status: project.status,
          riskLevel: project.riskLevel,
          sector: project.sector,
          teamSize: project.teamSize,
          vatRate: project.vatRate,
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
    phase: "FUNCTION_POINT_COLLECTION" as const,
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
      currency: parsed.data.currency,
      country: parsed.data.country,
      clientName: parsed.data.clientName,
      riskLevel: parsed.data.riskLevel,
      sector: parsed.data.sector,
      teamSize: parsed.data.teamSize,
      vatRate: parsed.data.vatRate,
      stateJson: JSON.stringify(state)
    }
  });
  await audit(user, "CREATE_PROJECT", "Project", project.id, { method: project.method, country: project.country, currency: project.currency });

  res.status(201).json({
    ok: true,
    data: {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        method: project.method,
        hourlyRate: project.hourlyRate,
        currency: project.currency,
        country: project.country,
        clientName: project.clientName,
        status: project.status,
        riskLevel: project.riskLevel,
        sector: project.sector,
        teamSize: project.teamSize,
        vatRate: project.vatRate,
        updatedAt: project.updatedAt.toISOString(),
        latestEstimationAt: null
      }
    }
  } satisfies ApiResponse<{ project: Record<string, unknown> }>);
});
