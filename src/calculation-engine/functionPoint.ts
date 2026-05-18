import { fpComponents, fpGscFactors } from "@/constants/factors";
import type { ComplexityCounts, EstimationState, FunctionPointResult, WeightedRow } from "@/types/estimation";
import { round } from "@/utils/number";

function componentScore(counts: ComplexityCounts, weights: ComplexityCounts): number {
  return counts.simple * weights.simple + counts.average * weights.average + counts.complex * weights.complex;
}

export function calculateFunctionPoints(state: EstimationState): FunctionPointResult {
  const componentRows: WeightedRow[] = fpComponents.map((component) => {
    const counts = state.fp[component.key] as ComplexityCounts | undefined;
    if (!counts) {
      throw new Error(`Missing Function Point component: ${component.label}`);
    }
    return {
      label: component.label,
      simple: counts.simple,
      average: counts.average,
      complex: counts.complex,
      weightedValue: componentScore(counts, component.weights)
    };
  });

  const ufp = componentRows.reduce((total, row) => total + row.weightedValue, 0);
  const fpRatings = state.technical.fpGsc ?? {};
  const technicalRows: WeightedRow[] = fpGscFactors.map((factor) => {
    const value = fpRatings[factor.id];
    if (typeof value !== "number") {
      throw new Error(`Missing FP technical factor: ${factor.label}`);
    }
    return {
      label: factor.label,
      rating: value,
      weight: 1,
      weightedValue: value
    };
  });

  const tdi = technicalRows.reduce((total, row) => total + row.weightedValue, 0);
  const vaf = 0.65 + 0.01 * tdi;
  const afp = ufp * vaf;
  const hourlyRate = state.project.hourlyRate ?? 0;
  const effortHours = afp * 8;
  const durationMonths = effortHours / 160;
  const cost = effortHours * hourlyRate;

  return {
    ufp: round(ufp),
    tdi: round(tdi),
    vaf: round(vaf, 4),
    afp: round(afp),
    effortHours: round(effortHours),
    durationMonths: round(durationMonths),
    cost: round(cost),
    componentRows,
    technicalRows
  };
}
