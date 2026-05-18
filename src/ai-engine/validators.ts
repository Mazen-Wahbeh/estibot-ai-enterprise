import { fpComponents, fpGscFactors, ucpEnvironmentalFactors, ucpTechnicalFactors } from "@/constants/factors";
import type { ComplexityCounts, EstimationMethod, EstimationState } from "@/types/estimation";
import { nonNegativeInteger, positiveNumber, rating } from "@/utils/number";

export function methodUsesFp(method?: EstimationMethod): boolean {
  return method === "FP" || method === "BOTH";
}

export function methodUsesUcp(method?: EstimationMethod): boolean {
  return method === "UCP" || method === "BOTH";
}

export function isCountsComplete(counts: ComplexityCounts | undefined): counts is ComplexityCounts {
  return Boolean(
    counts &&
      nonNegativeInteger(counts.simple) !== null &&
      nonNegativeInteger(counts.average) !== null &&
      nonNegativeInteger(counts.complex) !== null
  );
}

export function isFactorComplete(collection: Record<string, number> | undefined, id: string): boolean {
  return rating(collection?.[id]) !== null;
}

export function getAllRequiredMissingFields(state: EstimationState): string[] {
  const missing: string[] = [];

  if (!state.project.name?.trim()) {
    missing.push("project.name");
  }
  if (!state.project.description?.trim()) {
    missing.push("project.description");
  }
  if (positiveNumber(state.project.hourlyRate) === null) {
    missing.push("project.hourlyRate");
  }
  if (!state.project.method) {
    missing.push("project.method");
    return missing;
  }

  if (methodUsesFp(state.project.method)) {
    fpComponents.forEach((component) => {
      if (!isCountsComplete(state.fp[component.key])) {
        missing.push(`fp.${component.key}`);
      }
    });
    fpGscFactors.forEach((factor) => {
      if (!isFactorComplete(state.technical.fpGsc, factor.id)) {
        missing.push(`technical.fpGsc.${factor.id}`);
      }
    });
  } else if (!state.fp.notApplicableConfirmed) {
    missing.push("fp.notApplicableConfirmed");
  }

  if (methodUsesUcp(state.project.method)) {
    if (!isCountsComplete(state.ucp.actors)) {
      missing.push("ucp.actors");
    }
    if (!isCountsComplete(state.ucp.useCases)) {
      missing.push("ucp.useCases");
    }
    ucpTechnicalFactors.forEach((factor) => {
      if (!isFactorComplete(state.technical.ucpTechnical, factor.id)) {
        missing.push(`technical.ucpTechnical.${factor.id}`);
      }
    });
    ucpEnvironmentalFactors.forEach((factor) => {
      if (!isFactorComplete(state.environmental.ucpEnvironmental, factor.id)) {
        missing.push(`environmental.ucpEnvironmental.${factor.id}`);
      }
    });
  } else {
    if (!state.ucp.notApplicableConfirmed) {
      missing.push("ucp.notApplicableConfirmed");
    }
    if (!state.environmental.notApplicableConfirmed) {
      missing.push("environmental.notApplicableConfirmed");
    }
  }

  return missing;
}

export function getCalculationMissingFields(state: EstimationState): string[] {
  return getAllRequiredMissingFields(state).filter((field) => !field.endsWith("notApplicableConfirmed"));
}

export function validateCalculationReadiness(state: EstimationState): { valid: boolean; missingFields: string[]; error?: string } {
  const missingFields = getCalculationMissingFields(state);
  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
      error: `Missing required calculation fields: ${missingFields.join(", ")}`
    };
  }

  if (!state.project.method) {
    return {
      valid: false,
      missingFields: ["project.method"],
      error: "Project estimation method is missing."
    };
  }

  if (positiveNumber(state.project.hourlyRate) === null) {
    return {
      valid: false,
      missingFields: ["project.hourlyRate"],
      error: "Hourly rate must be a positive number."
    };
  }

  return { valid: true, missingFields: [] };
}
