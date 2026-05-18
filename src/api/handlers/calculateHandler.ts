import { calculateEstimation } from "@/calculation-engine";
import { validateCalculationReadiness } from "@/ai-engine/validators";
import { readState, writeState } from "@/database/jsonStore";
import type { ApiResponse, CalculationResult, EstimationState } from "@/types/estimation";
import { badRequest, type ApiHandler } from "@/api/http";
import { getAllRequiredMissingFields } from "@/ai-engine/validators";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";

interface CalculationPayload {
  state: EstimationState;
  calculations: CalculationResult;
}

export const calculateHandler: ApiHandler = async (req, res) => {
  let state = await readState();
  if (req.body?.state !== undefined) {
    if (!hasStrictStateShape(req.body.state)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    state = sanitizeState(req.body.state);
  }

  const readiness = validateCalculationReadiness(state);
  if (!readiness.valid) {
    res.status(422).json({
      ok: false,
      error: readiness.error,
      data: {
        state: {
          ...state,
          missingFields: readiness.missingFields
        }
      }
    });
    return;
  }

  try {
    const calculations = calculateEstimation(state);
    const saved = await writeState({
      ...state,
      phase: "RESULT_GENERATION",
      missingFields: getAllRequiredMissingFields(state),
      isComplete: true
    });

    res.status(200).json({
      ok: true,
      data: {
        state: saved,
        calculations
      }
    } satisfies ApiResponse<CalculationPayload>);
  } catch (error) {
    console.error("Calculation mismatch blocked", error);
    res.status(422).json({
      ok: false,
      error: error instanceof Error ? error.message : "Calculation mismatch detected and output was blocked."
    } satisfies ApiResponse<never>);
  }
};
