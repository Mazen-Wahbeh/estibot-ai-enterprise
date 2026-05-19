import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { getProjectAnalytics, type ProjectAnalytics } from "@/server/analytics";
import { projectIdSchema } from "@/server/schemas";
import { audit } from "@/server/audit";

export default withProtectedMethods(["GET"], async (req, res, user) => {
  const parsed = projectIdSchema.safeParse({
    projectId: Array.isArray(req.query.projectId) ? req.query.projectId[0] : req.query.projectId
  });
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Project id is required.");
    return;
  }

  const analytics = await getProjectAnalytics(user.tenantId, parsed.data.projectId);
  if (!analytics) {
    res.status(404).json({ ok: false, error: "Project not found." } satisfies ApiResponse<never>);
    return;
  }

  await audit(user, "VIEW_PROJECT_ANALYTICS", "Project", parsed.data.projectId, { confidence: analytics.latestEstimate.confidenceLevel });

  res.status(200).json({
    ok: true,
    data: { analytics }
  } satisfies ApiResponse<{ analytics: ProjectAnalytics }>);
});
