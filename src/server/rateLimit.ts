import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
import { isUnlimited, normalizePlan, planLimits } from "@/server/plans";
import type { SessionUser } from "@/server/auth";

const requestBuckets = new Map<string, number[]>();
const REQUEST_LIMIT = 60;
const WINDOW_MS = 60_000;

function monthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function enforceRequestRateLimit(req: NextApiRequest, res: NextApiResponse, user: SessionUser): boolean {
  const key = `${user.id}:${req.url ?? "api"}`;
  const now = Date.now();
  const recent = (requestBuckets.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= REQUEST_LIMIT) {
    res.status(429).json({
      ok: false,
      error: "Rate limit exceeded. Please wait a minute and try again."
    });
    requestBuckets.set(key, recent);
    return false;
  }
  recent.push(now);
  requestBuckets.set(key, recent);
  return true;
}

export async function logUsage(user: SessionUser, action: string): Promise<void> {
  await prisma.usageLog.create({
    data: {
      userId: user.id,
      tenantId: user.tenantId,
      action
    }
  });
}

export async function enforceMonthlyUsage(user: SessionUser, action: "estimation" | "pdf"): Promise<{ allowed: boolean; message?: string }> {
  const plan = normalizePlan(user.plan);
  const limits = planLimits[plan];
  const max = action === "estimation" ? limits.estimationsPerMonth : limits.pdfExportsPerMonth;
  if (isUnlimited(max)) {
    return { allowed: true };
  }

  const count = await prisma.usageLog.count({
    where: {
      tenantId: user.tenantId,
      action,
      createdAt: {
        gte: monthStart()
      }
    }
  });

  if (count >= (max ?? 0)) {
    return {
      allowed: false,
      message:
        action === "estimation"
          ? `Free plan limit reached: ${max} estimations per month. Upgrade to Pro for unlimited estimations.`
          : `Free plan limit reached: ${max} PDF export per month. Upgrade to Pro for full PDF exports.`
    };
  }

  return { allowed: true };
}
