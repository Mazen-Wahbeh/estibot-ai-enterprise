import type { ApiResponse } from "@/types/estimation";
import { withPost, badRequest } from "@/api/http";
import { getAuthConfigurationError, setSessionCookie, verifyPassword, type SessionUser } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { loginSchema } from "@/server/schemas";
import { audit } from "@/server/audit";
import { enforcePublicRateLimit } from "@/server/security";

export default withPost(async (req, res) => {
  const configError = getAuthConfigurationError();
  if (configError) {
    res.status(500).json({ ok: false, error: configError } satisfies ApiResponse<never>);
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid login request.");
    return;
  }

  if (!enforcePublicRateLimit(req, res, "login", parsed.data.email, 10, 15 * 60 * 1000)) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { tenant: true }
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ ok: false, error: "Invalid email or password." } satisfies ApiResponse<never>);
    return;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenant.name,
    plan: user.tenant.plan
  };
  setSessionCookie(req, res, sessionUser);
  await audit(sessionUser, "LOGIN", "User", user.id);

  res.status(200).json({
    ok: true,
    data: { user: sessionUser }
  } satisfies ApiResponse<{ user: SessionUser }>);
});
