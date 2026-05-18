import type { EstimationState } from "@/types/estimation";

export const stateKeys = [
  "phase",
  "project",
  "fp",
  "ucp",
  "technical",
  "environmental",
  "missingFields",
  "isComplete"
] as const;

export const initialState: EstimationState = {
  phase: "PROJECT_INTRODUCTION",
  project: {},
  fp: {},
  ucp: {},
  technical: {},
  environmental: {},
  missingFields: ["project.name"],
  isComplete: false
};

export function cloneState(state: EstimationState): EstimationState {
  return JSON.parse(JSON.stringify(state)) as EstimationState;
}

export function hasStrictStateShape(value: unknown): value is EstimationState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return keys.length === stateKeys.length && stateKeys.every((key) => keys.includes(key));
}

export function sanitizeState(value: unknown): EstimationState {
  if (!hasStrictStateShape(value)) {
    return cloneState(initialState);
  }
  const raw = value as EstimationState;
  return {
    phase: raw.phase,
    project: raw.project && typeof raw.project === "object" ? raw.project : {},
    fp: raw.fp && typeof raw.fp === "object" ? raw.fp : {},
    ucp: raw.ucp && typeof raw.ucp === "object" ? raw.ucp : {},
    technical: raw.technical && typeof raw.technical === "object" ? raw.technical : {},
    environmental: raw.environmental && typeof raw.environmental === "object" ? raw.environmental : {},
    missingFields: Array.isArray(raw.missingFields) ? raw.missingFields.filter((item) => typeof item === "string") : [],
    isComplete: Boolean(raw.isComplete)
  };
}
