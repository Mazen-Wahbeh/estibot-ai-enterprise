import type { Phase } from "@/types/estimation";

export const phaseOrder: Phase[] = [
  "PROJECT_INTRODUCTION",
  "METHOD_SELECTION",
  "FUNCTION_POINT_COLLECTION",
  "USE_CASE_COLLECTION",
  "TECHNICAL_FACTORS_COLLECTION",
  "ENVIRONMENTAL_FACTORS_COLLECTION",
  "VALIDATION_PHASE",
  "CALCULATION_PHASE",
  "RESULT_GENERATION"
];

export const phaseLabels: Record<Phase, string> = {
  PROJECT_INTRODUCTION: "Project Introduction",
  METHOD_SELECTION: "Method Selection",
  FUNCTION_POINT_COLLECTION: "Function Points",
  USE_CASE_COLLECTION: "Use Case Points",
  TECHNICAL_FACTORS_COLLECTION: "Technical Factors",
  ENVIRONMENTAL_FACTORS_COLLECTION: "Environmental Factors",
  VALIDATION_PHASE: "Validation",
  CALCULATION_PHASE: "Calculation",
  RESULT_GENERATION: "Results"
};

export function nextPhase(phase: Phase): Phase {
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[Math.min(index + 1, phaseOrder.length - 1)];
}

export function previousPhase(phase: Phase): Phase {
  const index = phaseOrder.indexOf(phase);
  return phaseOrder[Math.max(index - 1, 0)];
}
