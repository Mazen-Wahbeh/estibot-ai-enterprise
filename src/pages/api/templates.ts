import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { sectorTemplates, type SectorTemplate } from "@/server/templates";

export default withProtectedMethods(["GET"], async (_req, res) => {
  res.status(200).json({
    ok: true,
    data: { templates: sectorTemplates }
  } satisfies ApiResponse<{ templates: SectorTemplate[] }>);
});
