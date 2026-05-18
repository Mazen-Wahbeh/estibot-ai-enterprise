import { calculateConfidence } from "@/calculation-engine/confidence";
import { calculateFunctionPoints } from "@/calculation-engine/functionPoint";
import { calculateUseCasePoints } from "@/calculation-engine/useCasePoint";
import type { CalculationResult, EstimationState } from "@/types/estimation";

export function calculateEstimation(state: EstimationState): CalculationResult {
  const method = state.project.method;
  if (!method) {
    throw new Error("Estimation method is missing");
  }

  const fp = method === "FP" || method === "BOTH" ? calculateFunctionPoints(state) : null;
  const ucp = method === "UCP" || method === "BOTH" ? calculateUseCasePoints(state) : null;

  const invalid = [fp, ucp].some((result) => {
    if (!result) {
      return false;
    }
    return Object.values(result).some((value) => typeof value === "number" && !Number.isFinite(value));
  });

  if (invalid) {
    throw new Error("Calculation mismatch detected. Output blocked because one or more numeric results are invalid.");
  }

  return {
    method,
    fp,
    ucp,
    confidence: calculateConfidence(fp, ucp),
    generatedAt: new Date().toISOString()
  };
}
