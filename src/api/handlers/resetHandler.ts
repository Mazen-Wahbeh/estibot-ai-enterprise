import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import { resetState } from "@/database/jsonStore";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { type ApiHandler } from "@/api/http";

interface ResetPayload {
  state: EstimationState;
  reply: ChatReply;
}

export const resetHandler: ApiHandler = async (_req, res) => {
  const state = await resetState();
  res.status(200).json({
    ok: true,
    data: {
      state,
      reply: getCurrentPrompt(state)
    }
  } satisfies ApiResponse<ResetPayload>);
};
