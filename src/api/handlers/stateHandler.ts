import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import { loadProjectState, saveProjectState } from "@/server/projectStore";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { badRequest, type ProtectedApiHandler } from "@/api/http";
import { stateRequestSchema } from "@/server/schemas";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";

interface StatePayload {
  state: EstimationState;
  reply: ChatReply;
}

export const stateHandler: ProtectedApiHandler = async (req, res, user) => {
  const parsed = stateRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid state request.");
    return;
  }

  const { projectId, state: inputState } = parsed.data;

  if (inputState !== undefined) {
    if (!hasStrictStateShape(inputState)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    const { state } = await saveProjectState(user, sanitizeState(inputState), projectId);
    res.status(200).json({
      ok: true,
      data: {
        state,
        reply: getCurrentPrompt(state)
      }
    } satisfies ApiResponse<StatePayload>);
    return;
  }

  const { state } = await loadProjectState(user, projectId);
  res.status(200).json({
    ok: true,
    data: {
      state,
      reply: getCurrentPrompt(state)
    }
  } satisfies ApiResponse<StatePayload>);
};
