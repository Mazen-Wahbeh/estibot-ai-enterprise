import type { ApiResponse } from "@/types/estimation";
import { withPost, badRequest } from "@/api/http";
import { hashPassword, setSessionCookie, type SessionUser } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { planLimits } from "@/server/plans";
import { registerSchema } from "@/server/schemas";

export default withPost(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid registration request.");
    return;
  }

  const { email, password, organizationName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ ok: false, error: "An account already exists for this email." } satisfies ApiResponse<never>);
    return;
  }

  const existingUsers = await prisma.user.count();
  const passwordHash = await hashPassword(password);
  const tenantName = organizationName || `${email.split("@")[0]}'s Workspace`;

  const user = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
        plan: "FREE"
      }
    });
    await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: "FREE",
        status: "ACTIVE",
        limits: JSON.stringify(planLimits.FREE)
      }
    });
    return tx.user.create({
      data: {
        email,
        passwordHash,
        role: existingUsers === 0 ? "ADMIN" : "USER",
        tenantId: tenant.id
      },
      include: { tenant: true }
    });
  });

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenant.name,
    plan: user.tenant.plan
  };
  setSessionCookie(req, res, sessionUser);

  res.status(201).json({
    ok: true,
    data: { user: sessionUser }
  } satisfies ApiResponse<{ user: SessionUser }>);
});
