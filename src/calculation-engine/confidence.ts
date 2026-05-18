import type { ConfidenceResult, FunctionPointResult, UseCasePointResult } from "@/types/estimation";
import { percentDifference, round } from "@/utils/number";

export function calculateConfidence(fp: FunctionPointResult | null, ucp: UseCasePointResult | null): ConfidenceResult {
  if (!fp || !ucp) {
    return {
      level: "NOT_APPLICABLE",
      differencePercent: null,
      basis: "Confidence comparison requires both FP and UCP results."
    };
  }

  const difference = percentDifference(fp.effortHours, ucp.effortHours);
  if (difference < 15) {
    return {
      level: "HIGH",
      differencePercent: round(difference),
      basis: "FP and UCP effort estimates differ by less than 15%."
    };
  }
  if (difference <= 35) {
    return {
      level: "MEDIUM",
      differencePercent: round(difference),
      basis: "FP and UCP effort estimates differ between 15% and 35%."
    };
  }
  return {
    level: "LOW",
    differencePercent: round(difference),
    basis: "FP and UCP effort estimates differ by more than 35%."
  };
}
