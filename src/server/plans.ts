export type SaaSPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  estimationsPerMonth: number | null;
  pdfExportsPerMonth: number | null;
  analytics: "basic" | "full" | "advanced";
  apiAccess: boolean;
  teamSeats: number | null;
}

export const planLimits: Record<SaaSPlan, PlanLimits> = {
  FREE: {
    estimationsPerMonth: 3,
    pdfExportsPerMonth: 1,
    analytics: "basic",
    apiAccess: false,
    teamSeats: 1
  },
  PRO: {
    estimationsPerMonth: null,
    pdfExportsPerMonth: null,
    analytics: "full",
    apiAccess: false,
    teamSeats: 1
  },
  ENTERPRISE: {
    estimationsPerMonth: null,
    pdfExportsPerMonth: null,
    analytics: "advanced",
    apiAccess: true,
    teamSeats: null
  }
};

export function normalizePlan(plan: string | null | undefined): SaaSPlan {
  if (plan === "PRO" || plan === "ENTERPRISE") {
    return plan;
  }
  return "FREE";
}

export function isUnlimited(value: number | null): boolean {
  return value === null;
}
