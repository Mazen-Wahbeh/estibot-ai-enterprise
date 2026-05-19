import type { CalculationResult } from "@/types/estimation";
import { prisma } from "@/server/prisma";
import { findSectorTemplate } from "@/server/templates";

interface EstimationRow {
  id: string;
  version: number;
  method: string;
  results: string;
  createdAt: Date;
}

interface ActualRow {
  actualEffortHours: number;
  actualDurationMonths: number;
  actualCost: number;
  createdAt: Date;
}

interface ProjectRow {
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
  estimations: EstimationRow[];
  actuals: ActualRow[];
}

export interface CocomoAnalysis {
  estimatedKloc: number;
  effortPersonMonths: number;
  effortHours: number;
  durationMonths: number;
  cost: number;
  exponent: number;
  effortAdjustmentFactor: number;
  mode: "organic" | "semi-detached" | "embedded";
}

export interface CosmicAnalysis {
  approximateCfp: number;
  dataMovements: {
    entries: number;
    exits: number;
    reads: number;
    writes: number;
  };
  effortHours: number;
  durationMonths: number;
  cost: number;
  domainFit: "business-app" | "real-time" | "hybrid";
}

export interface ProfitabilityAnalysis {
  deliveryCost: number;
  contingencyReserve: number;
  recommendedPrice: number;
  vatAmount: number;
  totalClientPrice: number;
  grossMarginPercent: number;
  breakEvenHourlyRate: number;
}

export interface RiskAnalysis {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  drivers: string[];
}

export interface CapacityAnalysis {
  requiredFte: number;
  availableTeamSize: number;
  capacityCoveragePercent: number;
  deliveryMonthsAtCurrentTeam: number;
  recommendation: string;
}

export interface VolatilityAnalysis {
  versionCount: number;
  costChangePercent: number;
  effortChangePercent: number;
  methodChanges: number;
  volatilityIndex: number;
  scopeCreepLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface EvmAnalysis {
  available: boolean;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  costVariance: number;
  scheduleVariance: number;
  cpi: number;
  spi: number;
  estimateAtCompletion: number;
  status: "NO_ACTUALS" | "ON_TRACK" | "WATCH" | "OFF_TRACK";
}

export interface BenchmarkAnalysis {
  sectorAverageCost: number;
  sectorAverageEffortHours: number;
  portfolioAverageCost: number;
  costVsSectorPercent: number;
  effortVsSectorPercent: number;
  sampleSize: number;
}

export interface AdvancedProjectAnalytics {
  projectId: string;
  name: string;
  currency: string;
  sector: string;
  method: string;
  baseline: {
    cost: number;
    effortHours: number;
    durationMonths: number;
    confidenceLevel: string;
  };
  cocomo: CocomoAnalysis;
  cosmic: CosmicAnalysis;
  profitability: ProfitabilityAnalysis;
  risk: RiskAnalysis;
  capacity: CapacityAnalysis;
  volatility: VolatilityAnalysis;
  evm: EvmAnalysis;
  benchmark: BenchmarkAnalysis;
  executiveSignals: string[];
}

export interface AdvancedPortfolioAnalytics {
  projects: AdvancedProjectAnalytics[];
  totals: {
    averageRiskScore: number;
    criticalProjects: number;
    averageMarginPercent: number;
    totalRecommendedPipeline: number;
    averageCapacityCoveragePercent: number;
    projectsWithEvm: number;
  };
}

function round(value: number, digits = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
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

function primaryMetric(calculation: CalculationResult | null): { cost: number; effortHours: number; durationMonths: number; size: number; confidenceLevel: string } {
  if (!calculation) {
    return { cost: 0, effortHours: 0, durationMonths: 0, size: 0, confidenceLevel: "NOT_APPLICABLE" };
  }
  if (calculation.fp && calculation.ucp) {
    return {
      cost: round((calculation.fp.cost + calculation.ucp.cost) / 2),
      effortHours: round((calculation.fp.effortHours + calculation.ucp.effortHours) / 2),
      durationMonths: round((calculation.fp.durationMonths + calculation.ucp.durationMonths) / 2),
      size: round((calculation.fp.afp + calculation.ucp.ucp) / 2),
      confidenceLevel: calculation.confidence.level
    };
  }
  if (calculation.fp) {
    return {
      cost: calculation.fp.cost,
      effortHours: calculation.fp.effortHours,
      durationMonths: calculation.fp.durationMonths,
      size: calculation.fp.afp,
      confidenceLevel: calculation.confidence.level
    };
  }
  if (calculation.ucp) {
    return {
      cost: calculation.ucp.cost,
      effortHours: calculation.ucp.effortHours,
      durationMonths: calculation.ucp.durationMonths,
      size: calculation.ucp.ucp,
      confidenceLevel: calculation.confidence.level
    };
  }
  return { cost: 0, effortHours: 0, durationMonths: 0, size: 0, confidenceLevel: calculation.confidence.level };
}

function latestCalculation(project: ProjectRow): CalculationResult | null {
  return project.estimations[0] ? parseCalculation(project.estimations[0].results) : null;
}

function riskMultiplier(project: ProjectRow): number {
  return project.riskLevel === "HIGH" ? 1.25 : project.riskLevel === "LOW" ? 0.92 : 1.08;
}

function sectorMultiplier(sector: string): number {
  const template = findSectorTemplate(sector);
  return template.riskProfile === "HIGH" ? 1.18 : template.riskProfile === "LOW" ? 0.95 : 1.06;
}

function cocomo(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>): CocomoAnalysis {
  const estimatedKloc = Math.max(0.5, (baseline.size * 53) / 1000);
  const mode = project.riskLevel === "HIGH" ? "embedded" : project.teamSize >= 6 ? "semi-detached" : "organic";
  const scaleFactors = {
    organic: 14,
    "semi-detached": 18,
    embedded: 24
  };
  const exponent = 0.91 + scaleFactors[mode] / 100;
  const effortAdjustmentFactor = round(riskMultiplier(project) * sectorMultiplier(project.sector) * (project.teamSize <= 2 ? 1.12 : 1), 3);
  const effortPersonMonths = round(2.94 * estimatedKloc ** exponent * effortAdjustmentFactor);
  const effortHours = round(effortPersonMonths * 152);
  const durationMonths = round(3.67 * effortPersonMonths ** (0.28 + 0.2 * (exponent - 0.91)));
  return {
    estimatedKloc: round(estimatedKloc),
    effortPersonMonths,
    effortHours,
    durationMonths,
    cost: round(effortHours * project.hourlyRate),
    exponent: round(exponent, 3),
    effortAdjustmentFactor,
    mode
  };
}

function cosmic(project: ProjectRow, calculation: CalculationResult | null, baseline: ReturnType<typeof primaryMetric>): CosmicAnalysis {
  const fp = calculation?.fp;
  const ucp = calculation?.ucp;
  const entries = Math.max(1, Math.round((fp?.componentRows[0]?.weightedValue ?? baseline.size * 0.2) / 4));
  const exits = Math.max(1, Math.round((fp?.componentRows[1]?.weightedValue ?? baseline.size * 0.22) / 5));
  const reads = Math.max(1, Math.round(((fp?.componentRows[3]?.weightedValue ?? baseline.size * 0.28) + (ucp?.uaw ?? 0)) / 7));
  const writes = Math.max(1, Math.round(((fp?.componentRows[4]?.weightedValue ?? baseline.size * 0.12) + (ucp?.uucw ?? 0)) / 8));
  const approximateCfp = entries + exits + reads + writes;
  const domainFit = project.sector === "LOGISTICS" || project.sector === "FINTECH" ? "hybrid" : project.riskLevel === "HIGH" ? "real-time" : "business-app";
  const hoursPerCfp = domainFit === "real-time" ? 9 : domainFit === "hybrid" ? 7.5 : 6;
  const effortHours = round(approximateCfp * hoursPerCfp * riskMultiplier(project));
  return {
    approximateCfp,
    dataMovements: { entries, exits, reads, writes },
    effortHours,
    durationMonths: round(effortHours / Math.max(120, project.teamSize * 130)),
    cost: round(effortHours * project.hourlyRate),
    domainFit
  };
}

function profitability(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>, risk: RiskAnalysis): ProfitabilityAnalysis {
  const contingencyPercent = risk.level === "CRITICAL" ? 0.35 : risk.level === "HIGH" ? 0.25 : risk.level === "MEDIUM" ? 0.16 : 0.1;
  const targetMarginPercent = project.sector === "FINTECH" || project.sector === "GOVERNMENT" ? 0.38 : 0.32;
  const deliveryCost = baseline.cost;
  const contingencyReserve = round(deliveryCost * contingencyPercent);
  const recommendedPrice = round((deliveryCost + contingencyReserve) / (1 - targetMarginPercent));
  const vatAmount = round(recommendedPrice * (project.vatRate / 100));
  const totalClientPrice = round(recommendedPrice + vatAmount);
  const grossMarginPercent = recommendedPrice > 0 ? round(((recommendedPrice - deliveryCost - contingencyReserve) / recommendedPrice) * 100) : 0;
  return {
    deliveryCost,
    contingencyReserve,
    recommendedPrice,
    vatAmount,
    totalClientPrice,
    grossMarginPercent,
    breakEvenHourlyRate: baseline.effortHours > 0 ? round((deliveryCost + contingencyReserve) / baseline.effortHours) : 0
  };
}

function risk(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>, calculation: CalculationResult | null, versionCount: number): RiskAnalysis {
  const drivers: string[] = [];
  let score = project.riskLevel === "HIGH" ? 48 : project.riskLevel === "MEDIUM" ? 28 : 14;
  const template = findSectorTemplate(project.sector);
  if (template.riskProfile === "HIGH") {
    score += 14;
    drivers.push(`${template.name} has elevated compliance and delivery risk.`);
  }
  if (baseline.confidenceLevel === "LOW") {
    score += 18;
    drivers.push("FP/UCP agreement is low, so the estimate needs review.");
  }
  if (project.teamSize <= 2 && baseline.effortHours > 300) {
    score += 10;
    drivers.push("Team size is small compared with estimated effort.");
  }
  if (versionCount >= 3) {
    score += 8;
    drivers.push("Multiple estimate versions indicate requirements movement.");
  }
  if (!calculation?.fp || !calculation.ucp) {
    score += 7;
    drivers.push("Only one sizing method is available; add the second method for stronger confidence.");
  }
  if (drivers.length === 0) {
    drivers.push("No major risk driver detected from current estimation data.");
  }
  const finalScore = Math.min(100, round(score));
  return {
    score: finalScore,
    level: finalScore >= 80 ? "CRITICAL" : finalScore >= 60 ? "HIGH" : finalScore >= 35 ? "MEDIUM" : "LOW",
    drivers
  };
}

function capacity(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>): CapacityAnalysis {
  const safeMonthlyHoursPerPerson = 130;
  const requiredFte = baseline.durationMonths > 0 ? round(baseline.effortHours / (baseline.durationMonths * safeMonthlyHoursPerPerson)) : 0;
  const availableTeamSize = project.teamSize;
  const capacityCoveragePercent = requiredFte > 0 ? round((availableTeamSize / requiredFte) * 100) : 100;
  const deliveryMonthsAtCurrentTeam = availableTeamSize > 0 ? round(baseline.effortHours / (availableTeamSize * safeMonthlyHoursPerPerson)) : 0;
  return {
    requiredFte,
    availableTeamSize,
    capacityCoveragePercent,
    deliveryMonthsAtCurrentTeam,
    recommendation:
      capacityCoveragePercent >= 110
        ? "Capacity is healthy for the current estimate."
        : capacityCoveragePercent >= 80
          ? "Capacity is tight; protect scope and avoid parallel commitments."
          : "Add capacity, reduce scope, or extend the schedule before committing."
  };
}

function volatility(project: ProjectRow): VolatilityAnalysis {
  const ordered = [...project.estimations].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const first = primaryMetric(ordered[0] ? parseCalculation(ordered[0].results) : null);
  const latest = primaryMetric(ordered[ordered.length - 1] ? parseCalculation(ordered[ordered.length - 1].results) : null);
  const methodChanges = ordered.reduce((count, item, index) => (index > 0 && item.method !== ordered[index - 1].method ? count + 1 : count), 0);
  const costChangePercent = first.cost > 0 ? round(((latest.cost - first.cost) / first.cost) * 100) : 0;
  const effortChangePercent = first.effortHours > 0 ? round(((latest.effortHours - first.effortHours) / first.effortHours) * 100) : 0;
  const volatilityIndex = Math.min(100, round(Math.abs(costChangePercent) * 0.45 + Math.abs(effortChangePercent) * 0.35 + ordered.length * 4 + methodChanges * 8));
  return {
    versionCount: ordered.length,
    costChangePercent,
    effortChangePercent,
    methodChanges,
    volatilityIndex,
    scopeCreepLevel: volatilityIndex >= 55 ? "HIGH" : volatilityIndex >= 25 ? "MEDIUM" : "LOW"
  };
}

function evm(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>): EvmAnalysis {
  const actual = project.actuals[0];
  if (!actual) {
    return {
      available: false,
      plannedValue: baseline.cost,
      earnedValue: 0,
      actualCost: 0,
      costVariance: 0,
      scheduleVariance: 0,
      cpi: 0,
      spi: 0,
      estimateAtCompletion: baseline.cost,
      status: "NO_ACTUALS"
    };
  }
  const plannedValue = baseline.cost;
  const earnedValue = baseline.cost;
  const actualCost = actual.actualCost;
  const cpi = actualCost > 0 ? round(earnedValue / actualCost, 3) : 0;
  const spi = actual.actualDurationMonths > 0 ? round(baseline.durationMonths / actual.actualDurationMonths, 3) : 0;
  const estimateAtCompletion = cpi > 0 ? round(plannedValue / cpi) : plannedValue;
  const status = cpi >= 0.95 && spi >= 0.95 ? "ON_TRACK" : cpi >= 0.85 && spi >= 0.85 ? "WATCH" : "OFF_TRACK";
  return {
    available: true,
    plannedValue,
    earnedValue,
    actualCost,
    costVariance: round(earnedValue - actualCost),
    scheduleVariance: round(baseline.durationMonths - actual.actualDurationMonths),
    cpi,
    spi,
    estimateAtCompletion,
    status
  };
}

function benchmark(project: ProjectRow, baseline: ReturnType<typeof primaryMetric>, allProjects: ProjectRow[]): BenchmarkAnalysis {
  const metrics = allProjects.map((item) => ({ project: item, metric: primaryMetric(latestCalculation(item)) })).filter((item) => item.metric.cost > 0);
  const sectorMetrics = metrics.filter((item) => item.project.sector === project.sector);
  const average = (values: number[]) => (values.length > 0 ? values.reduce((sum, item) => sum + item, 0) / values.length : 0);
  const sectorAverageCost = average(sectorMetrics.map((item) => item.metric.cost));
  const sectorAverageEffortHours = average(sectorMetrics.map((item) => item.metric.effortHours));
  const portfolioAverageCost = average(metrics.map((item) => item.metric.cost));
  return {
    sectorAverageCost: round(sectorAverageCost),
    sectorAverageEffortHours: round(sectorAverageEffortHours),
    portfolioAverageCost: round(portfolioAverageCost),
    costVsSectorPercent: sectorAverageCost > 0 ? round(((baseline.cost - sectorAverageCost) / sectorAverageCost) * 100) : 0,
    effortVsSectorPercent: sectorAverageEffortHours > 0 ? round(((baseline.effortHours - sectorAverageEffortHours) / sectorAverageEffortHours) * 100) : 0,
    sampleSize: sectorMetrics.length
  };
}

function signals(advanced: Omit<AdvancedProjectAnalytics, "executiveSignals">): string[] {
  const output: string[] = [];
  if (advanced.risk.level === "CRITICAL" || advanced.risk.level === "HIGH") {
    output.push("Require approval before proposal release.");
  }
  if (advanced.capacity.capacityCoveragePercent < 80) {
    output.push("Current team capacity is below the recommended coverage threshold.");
  }
  if (advanced.profitability.grossMarginPercent < 25) {
    output.push("Commercial margin is low; revise price, scope, or contingency.");
  }
  if (advanced.volatility.scopeCreepLevel === "HIGH") {
    output.push("Scope movement is high; freeze assumptions before signing.");
  }
  if (advanced.evm.status === "OFF_TRACK") {
    output.push("Actual delivery data indicates cost or schedule drift.");
  }
  if (output.length === 0) {
    output.push("Project is commercially healthy based on available advanced analytics.");
  }
  return output;
}

function buildAdvanced(project: ProjectRow, allProjects: ProjectRow[]): AdvancedProjectAnalytics {
  const calculation = latestCalculation(project);
  const baseline = primaryMetric(calculation);
  const volatilityResult = volatility(project);
  const riskResult = risk(project, baseline, calculation, volatilityResult.versionCount);
  const partial = {
    projectId: project.id,
    name: project.name,
    currency: project.currency,
    sector: project.sector,
    method: project.method,
    baseline: {
      cost: baseline.cost,
      effortHours: baseline.effortHours,
      durationMonths: baseline.durationMonths,
      confidenceLevel: baseline.confidenceLevel
    },
    cocomo: cocomo(project, baseline),
    cosmic: cosmic(project, calculation, baseline),
    profitability: profitability(project, baseline, riskResult),
    risk: riskResult,
    capacity: capacity(project, baseline),
    volatility: volatilityResult,
    evm: evm(project, baseline),
    benchmark: benchmark(project, baseline, allProjects)
  };
  return {
    ...partial,
    executiveSignals: signals(partial)
  };
}

async function loadTenantProjects(tenantId: string): Promise<ProjectRow[]> {
  return prisma.project.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
    include: {
      estimations: { orderBy: { createdAt: "desc" } },
      actuals: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function getAdvancedProjectAnalytics(tenantId: string, projectId: string): Promise<AdvancedProjectAnalytics | null> {
  const projects = await loadTenantProjects(tenantId);
  const project = projects.find((item) => item.id === projectId);
  return project ? buildAdvanced(project, projects) : null;
}

export async function getAdvancedPortfolioAnalytics(tenantId: string): Promise<AdvancedPortfolioAnalytics> {
  const projects = await loadTenantProjects(tenantId);
  const analytics = projects.map((project) => buildAdvanced(project, projects));
  const average = (values: number[]) => (values.length > 0 ? values.reduce((sum, item) => sum + item, 0) / values.length : 0);
  return {
    projects: analytics,
    totals: {
      averageRiskScore: round(average(analytics.map((item) => item.risk.score))),
      criticalProjects: analytics.filter((item) => item.risk.level === "CRITICAL").length,
      averageMarginPercent: round(average(analytics.map((item) => item.profitability.grossMarginPercent))),
      totalRecommendedPipeline: round(analytics.reduce((sum, item) => sum + item.profitability.totalClientPrice, 0)),
      averageCapacityCoveragePercent: round(average(analytics.map((item) => item.capacity.capacityCoveragePercent))),
      projectsWithEvm: analytics.filter((item) => item.evm.available).length
    }
  };
}
