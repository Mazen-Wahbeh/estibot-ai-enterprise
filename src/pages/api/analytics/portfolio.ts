import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { getPortfolioAnalytics, type PortfolioAnalytics } from "@/server/analytics";
import { audit } from "@/server/audit";

export default withProtectedMethods(["GET"], async (_req, res, user) => {
  const analytics = await getPortfolioAnalytics(user.tenantId);
  await audit(user, "VIEW_PORTFOLIO_ANALYTICS", "Analytics", user.tenantId, { projects: analytics.totals.projects });

  res.status(200).json({
    ok: true,
    data: { analytics }
  } satisfies ApiResponse<{ analytics: PortfolioAnalytics }>);
});
