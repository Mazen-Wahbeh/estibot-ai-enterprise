import { prisma } from "@/server/prisma";
import type { SessionUser } from "@/server/auth";

export async function audit(user: SessionUser, action: string, entity: string, entityId?: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenantId: user.tenantId,
      userId: user.id,
      action,
      entity,
      entityId,
      metadata: JSON.stringify(metadata)
    }
  });
}
