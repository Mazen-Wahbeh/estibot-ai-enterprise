import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import { readState, writeState } from "@/database/jsonStore";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { badRequest, type ApiHandler } from "@/api/http";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";

interface StatePayload {
  state: EstimationState;
  reply: ChatReply;
}

export const stateHandler: ApiHandler = async (req, res) => {
  if (req.body?.state !== undefined) {
    if (!hasStrictStateShape(req.body.state)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    const state = await writeState(sanitizeState(req.body.state));
    res.status(200).json({
      ok: true,
      data: {
        state,
        reply: getCurrentPrompt(state)
      }
    } satisfies ApiResponse<StatePayload>);
    return;
  }

  const state = await readState();
  res.status(200).json({
    ok: true,
    data: {
      state,
      reply: getCurrentPrompt(state)
    }
  } satisfies ApiResponse<StatePayload>);
};
