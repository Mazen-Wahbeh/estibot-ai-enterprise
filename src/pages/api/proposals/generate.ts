import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedPost } from "@/api/http";
import { getProjectAnalytics } from "@/server/analytics";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { proposalGenerateSchema } from "@/server/schemas";

export default withProtectedPost(async (req, res, user) => {
  const parsed = proposalGenerateSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid proposal request.");
    return;
  }

  const analytics = await getProjectAnalytics(user.tenantId, parsed.data.projectId);
  if (!analytics) {
    res.status(404).json({ ok: false, error: "Project not found." } satisfies ApiResponse<never>);
    return;
  }

  const content = {
    executiveSummary: `${analytics.name} is estimated using ${analytics.method} with ${analytics.latestEstimate.confidenceLevel} confidence.`,
    clientName: analytics.clientName,
    sector: analytics.sectorTemplate.name,
    assumptions: analytics.sectorTemplate.estimationAssumptions,
    compliance: analytics.sectorTemplate.complianceNeeds,
    risks: analytics.sectorTemplate.deliveryRisks,
    estimate: {
      currency: analytics.currency,
      effortHours: analytics.latestEstimate.effortHours,
      durationMonths: analytics.latestEstimate.durationMonths,
      costRange: analytics.estimateRange,
      monteCarlo: analytics.monteCarlo
    },
    recommendations: analytics.recommendations,
    nextSteps: ["Confirm scope boundary", "Approve estimate range", "Attach delivery timeline", "Convert proposal to contract/SOW"]
  };

  const proposal = await prisma.proposal.create({
    data: {
      projectId: analytics.projectId,
      title: parsed.data.title ?? `${analytics.name} commercial proposal`,
      contentJson: JSON.stringify(content)
    }
  });

  await audit(user, "GENERATE_PROPOSAL", "Project", analytics.projectId, { proposalId: proposal.id });

  res.status(201).json({
    ok: true,
    data: {
      proposal: {
        ...proposal,
        content,
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ proposal: Record<string, unknown> }>);
});
