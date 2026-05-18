import { complexities, ucpActorWeights, ucpEnvironmentalFactors, ucpTechnicalFactors, ucpUseCaseWeights } from "@/constants/factors";
import type { ComplexityCounts, EstimationState, UseCasePointResult, WeightedRow } from "@/types/estimation";
import { round } from "@/utils/number";

function complexityRows(label: string, counts: ComplexityCounts, weights: ComplexityCounts): WeightedRow[] {
  return complexities.map((complexity) => ({
    label: `${label} - ${complexity}`,
    rating: counts[complexity],
    weight: weights[complexity],
    weightedValue: counts[complexity] * weights[complexity]
  }));
}

export function calculateUseCasePoints(state: EstimationState): UseCasePointResult {
  if (!state.ucp.actors) {
    throw new Error("Missing UCP actor counts");
  }
  if (!state.ucp.useCases) {
    throw new Error("Missing UCP use case counts");
  }

  const actorRows = complexityRows("Actors", state.ucp.actors, ucpActorWeights);
  const useCaseRows = complexityRows("Use Cases", state.ucp.useCases, ucpUseCaseWeights);
  const uaw = actorRows.reduce((total, row) => total + row.weightedValue, 0);
  const uucw = useCaseRows.reduce((total, row) => total + row.weightedValue, 0);
  const uucp = uaw + uucw;

  const technicalRatings = state.technical.ucpTechnical ?? {};
  const technicalRows: WeightedRow[] = ucpTechnicalFactors.map((factor) => {
    const value = technicalRatings[factor.id];
    if (typeof value !== "number") {
      throw new Error(`Missing UCP technical factor: ${factor.label}`);
    }
    return {
      label: factor.label,
      rating: value,
      weight: factor.weight,
      weightedValue: value * factor.weight
    };
  });

  const environmentalRatings = state.environmental.ucpEnvironmental ?? {};
  const environmentalRows: WeightedRow[] = ucpEnvironmentalFactors.map((factor) => {
    const value = environmentalRatings[factor.id];
    if (typeof value !== "number") {
      throw new Error(`Missing UCP environmental factor: ${factor.label}`);
    }
    return {
      label: factor.label,
      rating: value,
      weight: factor.weight,
      weightedValue: value * factor.weight
    };
  });

  const technicalFactor = technicalRows.reduce((total, row) => total + row.weightedValue, 0);
  const environmentalFactor = environmentalRows.reduce((total, row) => total + row.weightedValue, 0);
  const tcf = 0.6 + 0.01 * technicalFactor;
  const ecf = 1.4 - 0.03 * environmentalFactor;
  const ucp = uucp * tcf * ecf;
  const effortHours = ucp * 20;
  const durationMonths = effortHours / 160;
  const cost = effortHours * (state.project.hourlyRate ?? 0);

  return {
    uaw: round(uaw),
    uucw: round(uucw),
    uucp: round(uucp),
    technicalFactor: round(technicalFactor),
    environmentalFactor: round(environmentalFactor),
    tcf: round(tcf, 4),
    ecf: round(ecf, 4),
    ucp: round(ucp),
    effortHours: round(effortHours),
    durationMonths: round(durationMonths),
    cost: round(cost),
    actorRows,
    useCaseRows,
    technicalRows,
    environmentalRows
  };
}
