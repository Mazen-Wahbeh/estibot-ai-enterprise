import type { ApiResponse } from "@/types/estimation";
import { withMethods } from "@/api/http";
import { getSessionUser } from "@/server/auth";

export default withMethods(["GET"], async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Authentication required." } satisfies ApiResponse<never>);
    return;
  }
  res.status(200).json({ ok: true, data: { user } } satisfies ApiResponse<{ user: typeof user }>);
});
