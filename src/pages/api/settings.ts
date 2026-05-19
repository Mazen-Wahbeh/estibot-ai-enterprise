import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { tenantSettingsSchema } from "@/server/schemas";

export default withProtectedMethods(["GET", "POST"], async (req, res, user) => {
  if (req.method === "GET") {
    const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: user.tenantId } });
    res.status(200).json({
      ok: true,
      data: {
        settings: {
          name: tenant.name,
          plan: tenant.plan,
          locale: tenant.locale,
          currency: tenant.currency,
          country: tenant.country,
          dataResidency: tenant.dataResidency,
          vatRate: tenant.vatRate,
          reportBrand: tenant.reportBrand
        }
      }
    } satisfies ApiResponse<{ settings: Record<string, string | number> }>);
    return;
  }

  const parsed = tenantSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid tenant settings.");
    return;
  }

  const tenant = await prisma.tenant.update({
    where: { id: user.tenantId },
    data: parsed.data
  });
  await audit(user, "UPDATE_SETTINGS", "Tenant", tenant.id, parsed.data);

  res.status(200).json({
    ok: true,
    data: {
      settings: {
        name: tenant.name,
        plan: tenant.plan,
        locale: tenant.locale,
        currency: tenant.currency,
        country: tenant.country,
        dataResidency: tenant.dataResidency,
        vatRate: tenant.vatRate,
        reportBrand: tenant.reportBrand
      }
    }
  } satisfies ApiResponse<{ settings: Record<string, string | number> }>);
});
