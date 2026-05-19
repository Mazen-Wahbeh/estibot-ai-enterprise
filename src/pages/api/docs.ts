import type { ApiResponse } from "@/types/estimation";
import { withProtectedMethods } from "@/api/http";
import { documentationMeta, documentationSections, launchChecklist, releaseNotes } from "@/content/platformDocumentation";

export default withProtectedMethods(["GET"], async (_req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      meta: documentationMeta,
      sections: documentationSections,
      launchChecklist,
      releaseNotes
    }
  } satisfies ApiResponse<{
    meta: typeof documentationMeta;
    sections: typeof documentationSections;
    launchChecklist: typeof launchChecklist;
    releaseNotes: typeof releaseNotes;
  }>);
});
