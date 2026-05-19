import type { ApiResponse } from "@/types/estimation";
import { badRequest, withProtectedPost } from "@/api/http";
import { audit } from "@/server/audit";
import { prisma } from "@/server/prisma";
import { approvalReviewSchema } from "@/server/schemas";

export default withProtectedPost(async (req, res, user) => {
  const parsed = approvalReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid approval review.");
    return;
  }

  const approval = await prisma.approval.findFirst({
    where: {
      id: parsed.data.approvalId,
      project: { tenantId: user.tenantId }
    }
  });
  if (!approval) {
    res.status(404).json({ ok: false, error: "Approval not found." } satisfies ApiResponse<never>);
    return;
  }

  const updated = await prisma.approval.update({
    where: { id: approval.id },
    data: {
      status: parsed.data.status,
      reviewedById: user.id,
      comment: parsed.data.comment
    }
  });

  await audit(user, "REVIEW_APPROVAL", "Project", updated.projectId, { approvalId: updated.id, status: updated.status });

  res.status(200).json({
    ok: true,
    data: {
      approval: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      }
    }
  } satisfies ApiResponse<{ approval: Record<string, unknown> }>);
});
