import { calculateEstimation } from "@/calculation-engine";
import { validateCalculationReadiness } from "@/ai-engine/validators";
import { loadProjectState, saveProjectState } from "@/server/projectStore";
import type { ApiResponse, CalculationResult, EstimationState } from "@/types/estimation";
import { badRequest, type ProtectedApiHandler } from "@/api/http";
import { getAllRequiredMissingFields } from "@/ai-engine/validators";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";
import { prisma } from "@/server/prisma";
import { enforceMonthlyUsage, logUsage } from "@/server/rateLimit";
import { stateRequestSchema } from "@/server/schemas";

interface CalculationPayload {
  state: EstimationState;
  calculations: CalculationResult;
}

export const calculateHandler: ProtectedApiHandler = async (req, res, user) => {
  const limit = await enforceMonthlyUsage(user, "estimation");
  if (!limit.allowed) {
    res.status(402).json({ ok: false, error: limit.message } satisfies ApiResponse<never>);
    return;
  }

  const parsed = stateRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid calculation request.");
    return;
  }

  const { projectId, state: inputState } = parsed.data;
  const loaded = await loadProjectState(user, projectId);
  let state = loaded.state;

  if (inputState !== undefined) {
    if (!hasStrictStateShape(inputState)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    state = sanitizeState(inputState);
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
    const { project, state: saved } = await saveProjectState(user, {
      ...state,
      phase: "RESULT_GENERATION",
      missingFields: getAllRequiredMissingFields(state),
      isComplete: true
    }, loaded.project.id);

    await prisma.estimation.create({
      data: {
        projectId: project.id,
        fpData: JSON.stringify(saved.fp),
        ucpData: JSON.stringify(saved.ucp),
        results: JSON.stringify(calculations)
      }
    });
    await logUsage(user, "estimation");

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
