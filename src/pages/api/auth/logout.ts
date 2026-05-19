import type { ApiResponse } from "@/types/estimation";
import { withPost } from "@/api/http";
import { clearSessionCookie } from "@/server/auth";

export default withPost(async (_req, res) => {
  clearSessionCookie(res);
  res.status(200).json({ ok: true, data: { loggedOut: true } } satisfies ApiResponse<{ loggedOut: boolean }>);
});
