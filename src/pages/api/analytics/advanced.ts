import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { audit } from "@/server/audit";
import { getAdvancedPortfolioAnalytics, getAdvancedProjectAnalytics, type AdvancedPortfolioAnalytics, type AdvancedProjectAnalytics } from "@/server/advancedAnalytics";
import { projectIdSchema } from "@/server/schemas";

export default withProtectedMethods(["GET"], async (req, res, user) => {
  const rawProjectId = Array.isArray(req.query.projectId) ? req.query.projectId[0] : req.query.projectId;

  if (rawProjectId) {
    const parsed = projectIdSchema.safeParse({ projectId: rawProjectId });
    if (!parsed.success) {
      badRequest(res, parsed.error.issues[0]?.message ?? "Project id is required.");
      return;
    }

    const analytics = await getAdvancedProjectAnalytics(user.tenantId, parsed.data.projectId);
    if (!analytics) {
      res.status(404).json({ ok: false, error: "Project not found." } satisfies ApiResponse<never>);
      return;
    }

    await audit(user, "VIEW_ADVANCED_ANALYTICS", "Project", parsed.data.projectId, { riskScore: analytics.risk.score });
    res.status(200).json({ ok: true, data: { analytics } } satisfies ApiResponse<{ analytics: AdvancedProjectAnalytics }>);
    return;
  }

  const analytics = await getAdvancedPortfolioAnalytics(user.tenantId);
  await audit(user, "VIEW_ADVANCED_PORTFOLIO_ANALYTICS", "Analytics", user.tenantId, { projects: analytics.projects.length });
  res.status(200).json({ ok: true, data: { analytics } } satisfies ApiResponse<{ analytics: AdvancedPortfolioAnalytics }>);
});
