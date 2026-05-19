import type { CalculationResult } from "@/types/estimation";
import { prisma } from "@/server/prisma";
import { findSectorTemplate } from "@/server/templates";

interface AnalyticsEstimation {
  id: string;
  version: number;
  method: string;
  results: string;
  createdAt: Date;
}

interface AnalyticsActual {
  actualEffortHours: number;
  actualDurationMonths: number;
  actualCost: number;
  notes: string;
  createdAt: Date;
}

interface AnalyticsProject {
  id: string;
  name: string;
  description: string;
  method: string;
  hourlyRate: number;
  currency: string;
  country: string;
  clientName: string | null;
  status: string;
  riskLevel: string;
  sector: string;
  teamSize: number;
  vatRate: number;
  createdAt: Date;
  updatedAt: Date;
  estimations: AnalyticsEstimation[];
  actuals: AnalyticsActual[];
}

export interface EstimateRange {
  low: number;
  mostLikely: number;
  high: number;
}

export interface MonteCarloSummary {
  iterations: number;
  p50Cost: number;
  p80Cost: number;
  p90Cost: number;
  p50DurationMonths: number;
  p80DurationMonths: number;
  p90DurationMonths: number;
}

export interface ProjectAnalytics {
  projectId: string;
  name: string;
  clientName: string | null;
  sector: string;
  sectorTemplate: ReturnType<typeof findSectorTemplate>;
  method: string;
  status: string;
  riskLevel: string;
  currency: string;
  country: string;
  teamSize: number;
  latestEstimate: {
    cost: number;
    effortHours: number;
    durationMonths: number;
    confidenceLevel: string;
    generatedAt: string | null;
  };
  estimateRange: EstimateRange;
  monteCarlo: MonteCarloSummary;
  methodComparison: Array<{ method: string; effortHours: number; cost: number; durationMonths: number }>;
  actuals: Array<AnalyticsActual & { accuracyDeltaPercent: number | null }>;
  accuracy: {
    hasActuals: boolean;
    costVariancePercent: number | null;
    effortVariancePercent: number | null;
    durationVariancePercent: number | null;
  };
  recommendations: string[];
}

export interface PortfolioAnalytics {
  totals: {
    projects: number;
    estimations: number;
    estimatedCost: number;
    estimatedEffortHours: number;
    estimatedDurationMonths: number;
    highRiskProjects: number;
    projectsWithActuals: number;
    averageAccuracyPercent: number | null;
  };
  bySector: Array<{ sector: string; projects: number; estimatedCost: number; highRiskProjects: number }>;
  byMethod: Array<{ method: string; projects: number; estimatedCost: number; estimatedEffortHours: number }>;
  monthlyTrend: Array<{ month: string; estimations: number; estimatedCost: number }>;
  topRisks: Array<{ projectId: string; name: string; riskLevel: string; estimateRange: EstimateRange }>;
  benchmarks: {
    averageHourlyRate: number;
    averageCostPerProject: number;
    averageCostPerTeamMember: number;
    portfolioConfidence: "HIGH" | "MEDIUM" | "LOW";
  };
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseCalculation(raw: string): CalculationResult | null {
  try {
    return JSON.parse(raw) as CalculationResult;
  } catch {
    return null;
  }
}

function latestCalculation(project: AnalyticsProject): CalculationResult | null {
  const latest = project.estimations[0];
  return latest ? parseCalculation(latest.results) : null;
}

function primaryMetric(calculation: CalculationResult | null): { cost: number; effortHours: number; durationMonths: number } {
  if (!calculation) {
    return { cost: 0, effortHours: 0, durationMonths: 0 };
  }

  if (calculation.fp && calculation.ucp) {
    return {
      cost: round((calculation.fp.cost + calculation.ucp.cost) / 2),
      effortHours: round((calculation.fp.effortHours + calculation.ucp.effortHours) / 2),
      durationMonths: round((calculation.fp.durationMonths + calculation.ucp.durationMonths) / 2)
    };
  }

  const single = calculation.fp ?? calculation.ucp;
  return {
    cost: single?.cost ?? 0,
    effortHours: single?.effortHours ?? 0,
    durationMonths: single?.durationMonths ?? 0
  };
}

function rangeFor(cost: number, riskLevel: string, confidenceLevel: string): EstimateRange {
  const riskSpread = riskLevel === "HIGH" ? 0.38 : riskLevel === "LOW" ? 0.12 : 0.22;
  const confidenceSpread = confidenceLevel === "LOW" ? 0.2 : confidenceLevel === "HIGH" ? -0.04 : 0;
  const spread = Math.max(0.08, riskSpread + confidenceSpread);
  return {
    low: round(cost * (1 - spread)),
    mostLikely: round(cost),
    high: round(cost * (1 + spread * 1.35))
  };
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function hashSeed(value: string): number {
  return value.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function monteCarlo(projectId: string, cost: number, durationMonths: number, riskLevel: string, confidenceLevel: string): MonteCarloSummary {
  const random = seededRandom(hashSeed(`${projectId}:${cost}:${riskLevel}:${confidenceLevel}`));
  const volatility = riskLevel === "HIGH" ? 0.36 : riskLevel === "LOW" ? 0.12 : 0.22;
  const confidencePenalty = confidenceLevel === "LOW" ? 0.12 : confidenceLevel === "HIGH" ? -0.04 : 0;
  const sigma = Math.max(0.08, volatility + confidencePenalty);
  const costSamples: number[] = [];
  const durationSamples: number[] = [];

  for (let index = 0; index < 500; index += 1) {
    const u1 = Math.max(random(), 0.0001);
    const u2 = random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const multiplier = Math.max(0.35, Math.min(2.4, 1 + normal * sigma));
    costSamples.push(cost * multiplier);
    durationSamples.push(durationMonths * Math.max(0.4, Math.min(2.2, 1 + normal * (sigma * 0.7))));
  }

  costSamples.sort((a, b) => a - b);
  durationSamples.sort((a, b) => a - b);

  const percentile = (values: number[], percent: number) => values[Math.min(values.length - 1, Math.floor(values.length * percent))] ?? 0;

  return {
    iterations: 500,
    p50Cost: round(percentile(costSamples, 0.5)),
    p80Cost: round(percentile(costSamples, 0.8)),
    p90Cost: round(percentile(costSamples, 0.9)),
    p50DurationMonths: round(percentile(durationSamples, 0.5)),
    p80DurationMonths: round(percentile(durationSamples, 0.8)),
    p90DurationMonths: round(percentile(durationSamples, 0.9))
  };
}

function variancePercent(actual: number, estimated: number): number | null {
  if (actual <= 0) {
    return null;
  }
  return round(((estimated - actual) / actual) * 100);
}

function recommendations(project: AnalyticsProject, calculation: CalculationResult | null, range: EstimateRange): string[] {
  const notes: string[] = [];
  const template = findSectorTemplate(project.sector);
  if (project.riskLevel === "HIGH") {
    notes.push("Add an approval checkpoint before proposal submission because this project is marked high risk.");
  }
  if (calculation?.confidence.level === "LOW") {
    notes.push("Run both FP and UCP calibration or review requirements because estimate confidence is low.");
  }
  if (project.teamSize < 3 && range.high > 50000) {
    notes.push("Review team capacity; the high estimate range may exceed a small delivery team's throughput.");
  }
  if (template.complianceNeeds.length > 0) {
    notes.push(`Include ${template.complianceNeeds.slice(0, 2).join(" and ")} in the commercial scope.`);
  }
  if (notes.length === 0) {
    notes.push("Estimate is commercially ready; keep actuals tracking enabled after delivery starts.");
  }
  return notes;
}

function methodComparison(calculation: CalculationResult | null): Array<{ method: string; effortHours: number; cost: number; durationMonths: number }> {
  if (!calculation) {
    return [];
  }
  return [
    calculation.fp
      ? { method: "FP", effortHours: calculation.fp.effortHours, cost: calculation.fp.cost, durationMonths: calculation.fp.durationMonths }
      : null,
    calculation.ucp
      ? { method: "UCP", effortHours: calculation.ucp.effortHours, cost: calculation.ucp.cost, durationMonths: calculation.ucp.durationMonths }
      : null
  ].filter((item): item is { method: string; effortHours: number; cost: number; durationMonths: number } => Boolean(item));
}

function buildProjectAnalytics(project: AnalyticsProject): ProjectAnalytics {
  const calculation = latestCalculation(project);
  const primary = primaryMetric(calculation);
  const confidenceLevel = calculation?.confidence.level ?? "NOT_APPLICABLE";
  const estimateRange = rangeFor(primary.cost, project.riskLevel, confidenceLevel);
  const actuals = project.actuals.map((actual) => ({
    ...actual,
    accuracyDeltaPercent: variancePercent(actual.actualCost, primary.cost)
  }));
  const latestActual = project.actuals[0];

  return {
    projectId: project.id,
    name: project.name,
    clientName: project.clientName,
    sector: project.sector,
    sectorTemplate: findSectorTemplate(project.sector),
    method: project.method,
    status: project.status,
    riskLevel: project.riskLevel,
    currency: project.currency,
    country: project.country,
    teamSize: project.teamSize,
    latestEstimate: {
      cost: primary.cost,
      effortHours: primary.effortHours,
      durationMonths: primary.durationMonths,
      confidenceLevel,
      generatedAt: calculation?.generatedAt ?? null
    },
    estimateRange,
    monteCarlo: monteCarlo(project.id, primary.cost, primary.durationMonths, project.riskLevel, confidenceLevel),
    methodComparison: methodComparison(calculation),
    actuals,
    accuracy: {
      hasActuals: Boolean(latestActual),
      costVariancePercent: latestActual ? variancePercent(latestActual.actualCost, primary.cost) : null,
      effortVariancePercent: latestActual ? variancePercent(latestActual.actualEffortHours, primary.effortHours) : null,
      durationVariancePercent: latestActual ? variancePercent(latestActual.actualDurationMonths, primary.durationMonths) : null
    },
    recommendations: recommendations(project, calculation, estimateRange)
  };
}

async function loadProjects(tenantId: string): Promise<AnalyticsProject[]> {
  return prisma.project.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
    include: {
      estimations: {
        orderBy: { createdAt: "desc" }
      },
      actuals: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function getProjectAnalytics(tenantId: string, projectId: string): Promise<ProjectAnalytics | null> {
  const project = await prisma.project.findFirst({
    where: { tenantId, id: projectId },
    include: {
      estimations: {
        orderBy: { createdAt: "desc" }
      },
      actuals: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
  return project ? buildProjectAnalytics(project) : null;
}

export async function getPortfolioAnalytics(tenantId: string): Promise<PortfolioAnalytics> {
  const projects = await loadProjects(tenantId);
  const projectAnalytics = projects.map(buildProjectAnalytics);
  const estimatedCost = projectAnalytics.reduce((sum, item) => sum + item.latestEstimate.cost, 0);
  const estimatedEffortHours = projectAnalytics.reduce((sum, item) => sum + item.latestEstimate.effortHours, 0);
  const estimatedDurationMonths = projectAnalytics.reduce((sum, item) => sum + item.latestEstimate.durationMonths, 0);
  const accuracyValues = projectAnalytics
    .map((item) => item.accuracy.costVariancePercent)
    .filter((item): item is number => item !== null)
    .map((item) => Math.abs(item));

  const bySector = Array.from(
    projectAnalytics.reduce((map, item) => {
      const current = map.get(item.sector) ?? { sector: item.sector, projects: 0, estimatedCost: 0, highRiskProjects: 0 };
      current.projects += 1;
      current.estimatedCost += item.latestEstimate.cost;
      current.highRiskProjects += item.riskLevel === "HIGH" ? 1 : 0;
      map.set(item.sector, current);
      return map;
    }, new Map<string, { sector: string; projects: number; estimatedCost: number; highRiskProjects: number }>())
  ).map(([, item]) => ({ ...item, estimatedCost: round(item.estimatedCost) }));

  const byMethod = Array.from(
    projectAnalytics.reduce((map, item) => {
      const current = map.get(item.method) ?? { method: item.method, projects: 0, estimatedCost: 0, estimatedEffortHours: 0 };
      current.projects += 1;
      current.estimatedCost += item.latestEstimate.cost;
      current.estimatedEffortHours += item.latestEstimate.effortHours;
      map.set(item.method, current);
      return map;
    }, new Map<string, { method: string; projects: number; estimatedCost: number; estimatedEffortHours: number }>())
  ).map(([, item]) => ({ ...item, estimatedCost: round(item.estimatedCost), estimatedEffortHours: round(item.estimatedEffortHours) }));

  const monthlyTrend = Array.from(
    projects.reduce((map, project) => {
      for (const estimation of project.estimations) {
        const calculation = parseCalculation(estimation.results);
        const metric = primaryMetric(calculation);
        const month = estimation.createdAt.toISOString().slice(0, 7);
        const current = map.get(month) ?? { month, estimations: 0, estimatedCost: 0 };
        current.estimations += 1;
        current.estimatedCost += metric.cost;
        map.set(month, current);
      }
      return map;
    }, new Map<string, { month: string; estimations: number; estimatedCost: number }>())
  )
    .map(([, item]) => ({ ...item, estimatedCost: round(item.estimatedCost) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const portfolioConfidence = projectAnalytics.some((item) => item.latestEstimate.confidenceLevel === "LOW" || item.riskLevel === "HIGH")
    ? "LOW"
    : projectAnalytics.some((item) => item.latestEstimate.confidenceLevel === "MEDIUM")
      ? "MEDIUM"
      : "HIGH";

  return {
    totals: {
      projects: projects.length,
      estimations: projects.reduce((sum, project) => sum + project.estimations.length, 0),
      estimatedCost: round(estimatedCost),
      estimatedEffortHours: round(estimatedEffortHours),
      estimatedDurationMonths: round(estimatedDurationMonths),
      highRiskProjects: projectAnalytics.filter((item) => item.riskLevel === "HIGH").length,
      projectsWithActuals: projectAnalytics.filter((item) => item.accuracy.hasActuals).length,
      averageAccuracyPercent: accuracyValues.length > 0 ? round(accuracyValues.reduce((sum, item) => sum + item, 0) / accuracyValues.length) : null
    },
    bySector,
    byMethod,
    monthlyTrend,
    topRisks: projectAnalytics
      .filter((item) => item.riskLevel === "HIGH" || item.latestEstimate.confidenceLevel === "LOW")
      .slice(0, 5)
      .map((item) => ({ projectId: item.projectId, name: item.name, riskLevel: item.riskLevel, estimateRange: item.estimateRange })),
    benchmarks: {
      averageHourlyRate: projects.length > 0 ? round(projects.reduce((sum, project) => sum + project.hourlyRate, 0) / projects.length) : 0,
      averageCostPerProject: projects.length > 0 ? round(estimatedCost / projects.length) : 0,
      averageCostPerTeamMember:
        projects.length > 0 ? round(estimatedCost / Math.max(1, projects.reduce((sum, project) => sum + project.teamSize, 0))) : 0,
      portfolioConfidence
    }
  };
}
