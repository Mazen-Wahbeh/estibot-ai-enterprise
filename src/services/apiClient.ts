import type { ApiResponse, CalculationResult, ChatReply, EstimationState } from "@/types/estimation";
import type { SessionUser } from "@/server/auth";

export interface StatePayload {
  state: EstimationState;
  reply: ChatReply;
}

export type ChatPayload = StatePayload;

export interface CalculationPayload {
  state: EstimationState;
  calculations: CalculationResult;
}

export interface AuthPayload {
  user: SessionUser;
}

export interface ProjectSummary {
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
  updatedAt: string;
  latestEstimationAt: string | null;
}

export interface TenantSettings {
  name: string;
  plan: string;
  locale: string;
  currency: string;
  country: string;
  dataResidency: string;
  vatRate: number;
  reportBrand: string;
}

export interface UsagePayload {
  plan: string;
  limits: {
    estimationsPerMonth: number | null;
    pdfExportsPerMonth: number | null;
    analytics: string;
    apiAccess: boolean;
    teamSeats: number | null;
  };
  usage: {
    estimations: number;
    pdfExports: number;
    chats: number;
    projects: number;
    cycleStart: string;
  };
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string;
  createdAt: string;
}

export interface SectorTemplate {
  id: string;
  name: string;
  regionFit: string;
  defaultMethod: "FP" | "UCP" | "BOTH";
  suggestedHourlyRate: number;
  riskProfile: "LOW" | "MEDIUM" | "HIGH";
  complianceNeeds: string[];
  estimationAssumptions: string[];
  deliveryRisks: string[];
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
  topRisks: Array<{ projectId: string; name: string; riskLevel: string; estimateRange: { low: number; mostLikely: number; high: number } }>;
  benchmarks: {
    averageHourlyRate: number;
    averageCostPerProject: number;
    averageCostPerTeamMember: number;
    portfolioConfidence: "HIGH" | "MEDIUM" | "LOW";
  };
}

export interface ProjectAnalytics {
  projectId: string;
  name: string;
  clientName: string | null;
  sector: string;
  sectorTemplate: SectorTemplate;
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
  estimateRange: { low: number; mostLikely: number; high: number };
  monteCarlo: {
    iterations: number;
    p50Cost: number;
    p80Cost: number;
    p90Cost: number;
    p50DurationMonths: number;
    p80DurationMonths: number;
    p90DurationMonths: number;
  };
  methodComparison: Array<{ method: string; effortHours: number; cost: number; durationMonths: number }>;
  actuals: Array<{ actualEffortHours: number; actualDurationMonths: number; actualCost: number; notes: string; createdAt: string; accuracyDeltaPercent: number | null }>;
  accuracy: {
    hasActuals: boolean;
    costVariancePercent: number | null;
    effortVariancePercent: number | null;
    durationVariancePercent: number | null;
  };
  recommendations: string[];
}

export interface ActualResult {
  id: string;
  projectId: string;
  actualEffortHours: number;
  actualDurationMonths: number;
  actualCost: number;
  notes: string;
  createdAt: string;
}

export interface ProposalRecord {
  id: string;
  projectId: string;
  title: string;
  contentJson: string;
  content?: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationRecord {
  id: string | null;
  tenantId: string;
  provider: string;
  status: string;
  configJson: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApprovalRecord {
  id: string;
  projectId: string;
  status: string;
  requestedById: string;
  reviewedById: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    name: string;
    riskLevel: string;
    sector: string;
  };
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJson<T>(url: string, body: unknown, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as ApiResponse<T>;
      if (!response.ok || !payload.ok || payload.data === undefined) {
        throw new Error(payload.error ?? `Request failed with status ${response.status}`);
      }
      return payload.data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(350 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network request failed.");
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }
  return payload.data;
}

export function getCurrentUser(): Promise<AuthPayload> {
  return getJson<AuthPayload>("/api/auth/me");
}

export function login(email: string, password: string): Promise<AuthPayload> {
  return postJson<AuthPayload>("/api/auth/login", { email, password }, 0);
}

export function register(email: string, password: string, organizationName?: string): Promise<AuthPayload> {
  return postJson<AuthPayload>("/api/auth/register", { email, password, organizationName }, 0);
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return postJson<{ loggedOut: boolean }>("/api/auth/logout", {}, 0);
}

export function fetchProjects(): Promise<{ projects: ProjectSummary[] }> {
  return getJson<{ projects: ProjectSummary[] }>("/api/projects");
}

export function createProject(input: {
  name: string;
  description: string;
  method: "FP" | "UCP" | "BOTH";
  hourlyRate: number;
  currency: string;
  country: string;
  clientName?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  sector: string;
  teamSize: number;
  vatRate: number;
}): Promise<{ project: ProjectSummary }> {
  return postJson<{ project: ProjectSummary }>("/api/projects", input, 0);
}

export function fetchAdminMetrics(): Promise<Record<string, number | string>> {
  return getJson<Record<string, number | string>>("/api/admin/metrics");
}

export function fetchTenantSettings(): Promise<{ settings: TenantSettings }> {
  return getJson<{ settings: TenantSettings }>("/api/settings");
}

export function saveTenantSettings(settings: Omit<TenantSettings, "plan">): Promise<{ settings: TenantSettings }> {
  return postJson<{ settings: TenantSettings }>("/api/settings", settings, 0);
}

export function fetchUsage(): Promise<UsagePayload> {
  return getJson<UsagePayload>("/api/billing/usage");
}

export function fetchAuditLogs(): Promise<{ logs: AuditEntry[] }> {
  return getJson<{ logs: AuditEntry[] }>("/api/audit/logs");
}

export function fetchPortfolioAnalytics(): Promise<{ analytics: PortfolioAnalytics }> {
  return getJson<{ analytics: PortfolioAnalytics }>("/api/analytics/portfolio");
}

export function fetchProjectAnalytics(projectId: string): Promise<{ analytics: ProjectAnalytics }> {
  return getJson<{ analytics: ProjectAnalytics }>(`/api/analytics/project?projectId=${encodeURIComponent(projectId)}`);
}

export function fetchTemplates(): Promise<{ templates: SectorTemplate[] }> {
  return getJson<{ templates: SectorTemplate[] }>("/api/templates");
}

export function saveActualResult(input: {
  projectId: string;
  actualEffortHours: number;
  actualDurationMonths: number;
  actualCost: number;
  notes?: string;
}): Promise<{ actual: ActualResult }> {
  return postJson<{ actual: ActualResult }>("/api/actuals", input, 0);
}

export function generateProposal(projectId: string, title?: string): Promise<{ proposal: ProposalRecord }> {
  return postJson<{ proposal: ProposalRecord }>("/api/proposals/generate", { projectId, title }, 0);
}

export function fetchProposals(projectId: string): Promise<{ proposals: ProposalRecord[] }> {
  return getJson<{ proposals: ProposalRecord[] }>(`/api/proposals?projectId=${encodeURIComponent(projectId)}`);
}

export function fetchIntegrations(): Promise<{ integrations: IntegrationRecord[] }> {
  return getJson<{ integrations: IntegrationRecord[] }>("/api/integrations");
}

export function saveIntegration(input: {
  provider: "JIRA" | "SLACK" | "GITHUB" | "CSV_EXPORT" | "ERP" | "WEBHOOK";
  status: "READY" | "CONNECTED" | "PAUSED";
  configJson: string;
}): Promise<{ integration: IntegrationRecord }> {
  return postJson<{ integration: IntegrationRecord }>("/api/integrations", input, 0);
}

export function requestApproval(projectId: string, comment = ""): Promise<{ approval: Record<string, unknown> }> {
  return postJson<{ approval: Record<string, unknown> }>("/api/approvals/request", { projectId, comment }, 0);
}

export function fetchApprovals(): Promise<{ approvals: ApprovalRecord[] }> {
  return getJson<{ approvals: ApprovalRecord[] }>("/api/approvals");
}

export function reviewApproval(approvalId: string, status: "APPROVED" | "REJECTED", comment = ""): Promise<{ approval: ApprovalRecord }> {
  return postJson<{ approval: ApprovalRecord }>("/api/approvals/review", { approvalId, status, comment }, 0);
}

export function fetchHealth(): Promise<Record<string, number | string>> {
  return getJson<Record<string, number | string>>("/api/health");
}

export function fetchState(): Promise<StatePayload> {
  return postJson<StatePayload>("/api/state", {});
}

export function sendChatMessage(message: string): Promise<ChatPayload> {
  return postJson<ChatPayload>("/api/chat", { message });
}

export function calculateCurrentState(state: EstimationState): Promise<CalculationPayload> {
  return postJson<CalculationPayload>("/api/calculate", { state });
}

export function resetSystem(): Promise<StatePayload> {
  return postJson<StatePayload>("/api/reset", {});
}

export async function exportPdf(state: EstimationState): Promise<Blob> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "PDF export failed.");
      }
      return await response.blob();
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await wait(350 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("PDF export failed.");
}
