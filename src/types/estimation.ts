export const phaseValues = [
  "PROJECT_INTRODUCTION",
  "METHOD_SELECTION",
  "FUNCTION_POINT_COLLECTION",
  "USE_CASE_COLLECTION",
  "TECHNICAL_FACTORS_COLLECTION",
  "ENVIRONMENTAL_FACTORS_COLLECTION",
  "VALIDATION_PHASE",
  "CALCULATION_PHASE",
  "RESULT_GENERATION"
] as const;

export type Phase = (typeof phaseValues)[number];
export type EstimationMethod = "FP" | "UCP" | "BOTH";
export type Complexity = "simple" | "average" | "complex";

export type ComplexityCounts = Record<Complexity, number>;
export type FactorRatings = Record<string, number>;

export interface ProjectState {
  name?: string;
  description?: string;
  hourlyRate?: number;
  method?: EstimationMethod;
  currency?: string;
  country?: string;
  clientName?: string;
  status?: string;
  riskLevel?: string;
  sector?: string;
  teamSize?: number;
  vatRate?: number;
}

export interface FunctionPointState {
  externalInputs?: ComplexityCounts;
  externalOutputs?: ComplexityCounts;
  externalInquiries?: ComplexityCounts;
  internalLogicalFiles?: ComplexityCounts;
  externalInterfaceFiles?: ComplexityCounts;
  notApplicableConfirmed?: boolean;
}

export interface UseCasePointState {
  actors?: ComplexityCounts;
  useCases?: ComplexityCounts;
  notApplicableConfirmed?: boolean;
}

export interface TechnicalState {
  fpGsc?: FactorRatings;
  ucpTechnical?: FactorRatings;
}

export interface EnvironmentalState {
  ucpEnvironmental?: FactorRatings;
  notApplicableConfirmed?: boolean;
}

export interface EstimationState {
  phase: Phase;
  project: ProjectState;
  fp: FunctionPointState;
  ucp: UseCasePointState;
  technical: TechnicalState;
  environmental: EnvironmentalState;
  missingFields: string[];
  isComplete: boolean;
}

export interface WeightedRow {
  label: string;
  simple?: number;
  average?: number;
  complex?: number;
  weight?: number;
  rating?: number;
  weightedValue: number;
}

export interface FunctionPointResult {
  ufp: number;
  tdi: number;
  vaf: number;
  afp: number;
  effortHours: number;
  durationMonths: number;
  cost: number;
  componentRows: WeightedRow[];
  technicalRows: WeightedRow[];
}

export interface UseCasePointResult {
  uaw: number;
  uucw: number;
  uucp: number;
  technicalFactor: number;
  environmentalFactor: number;
  tcf: number;
  ecf: number;
  ucp: number;
  effortHours: number;
  durationMonths: number;
  cost: number;
  actorRows: WeightedRow[];
  useCaseRows: WeightedRow[];
  technicalRows: WeightedRow[];
  environmentalRows: WeightedRow[];
}

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_APPLICABLE";

export interface ConfidenceResult {
  level: ConfidenceLevel;
  differencePercent: number | null;
  basis: string;
}

export interface CalculationResult {
  method: EstimationMethod;
  fp: FunctionPointResult | null;
  ucp: UseCasePointResult | null;
  confidence: ConfidenceResult;
  generatedAt: string;
}

export interface ChatReply {
  phase: Phase;
  question: string;
  notice?: string;
  displayMessage?: string;
  calculations?: CalculationResult;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
