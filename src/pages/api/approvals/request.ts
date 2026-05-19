import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedPost } from "@/api/http";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { approvalRequestSchema } from "@/server/schemas";

export default withProtectedPost(async (req, res, user) => {
  const parsed = approvalRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid approval request.");
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, tenantId: user.tenantId }
  });
  if (!project) {
    res.status(404).json({ ok: false, error: "Project not found." } satisfies ApiResponse<never>);
    return;
  }

  const approval = await prisma.approval.create({
    data: {
      projectId: project.id,
      requestedById: user.id,
      comment: parsed.data.comment
    }
  });

  await audit(user, "REQUEST_APPROVAL", "Project", project.id, { approvalId: approval.id });

  res.status(201).json({
    ok: true,
    data: {
      approval: {
        ...approval,
        createdAt: approval.createdAt.toISOString(),
        updatedAt: approval.updatedAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ approval: Record<string, unknown> }>);
});
