import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedMethods } from "@/api/http";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { integrationSchema } from "@/server/schemas";

const defaultIntegrations = ["JIRA", "SLACK", "GITHUB", "CSV_EXPORT", "ERP", "WEBHOOK"] as const;

export default withProtectedMethods(["GET", "POST"], async (req, res, user) => {
  if (req.method === "GET") {
    const integrations = await prisma.integration.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { provider: "asc" }
    });
    const configured = new Map(integrations.map((integration) => [integration.provider, integration]));

    res.status(200).json({
      ok: true,
      data: {
        integrations: defaultIntegrations.map((provider) => {
          const integration = configured.get(provider);
          return integration
            ? {
                ...integration,
                createdAt: integration.createdAt.toISOString(),
                updatedAt: integration.updatedAt.toISOString()
              }
            : {
                id: null,
                tenantId: user.tenantId,
                provider,
                status: "READY",
                configJson: "{}",
                createdAt: null,
                updatedAt: null
              };
        })
      }
    } satisfies ApiResponse<{ integrations: Array<Record<string, unknown>> }>);
    return;
  }

  const parsed = integrationSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid integration request.");
    return;
  }

  try {
    JSON.parse(parsed.data.configJson);
  } catch {
    badRequest(res, "Integration config must be valid JSON.");
    return;
  }

  const integration = await prisma.integration.upsert({
    where: {
      tenantId_provider: {
        tenantId: user.tenantId,
        provider: parsed.data.provider
      }
    },
    update: {
      status: parsed.data.status,
      configJson: parsed.data.configJson
    },
    create: {
      tenantId: user.tenantId,
      provider: parsed.data.provider,
      status: parsed.data.status,
      configJson: parsed.data.configJson
    }
  });

  await audit(user, "UPSERT_INTEGRATION", "Integration", integration.id, { provider: integration.provider, status: integration.status });

  res.status(200).json({
    ok: true,
    data: {
      integration: {
        ...integration,
        createdAt: integration.createdAt.toISOString(),
        updatedAt: integration.updatedAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ integration: Record<string, unknown> }>);
});
