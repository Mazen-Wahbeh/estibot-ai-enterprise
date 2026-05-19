import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { type ProtectedApiHandler } from "@/api/http";
import { saveProjectState } from "@/server/projectStore";
import { initialState } from "@/utils/state";
import { stateRequestSchema } from "@/server/schemas";

interface ResetPayload {
  state: EstimationState;
  reply: ChatReply;
}

export const resetHandler: ProtectedApiHandler = async (req, res, user) => {
  const parsed = stateRequestSchema.safeParse(req.body ?? {});
  const projectId = parsed.success ? parsed.data.projectId : undefined;
  const { state } = await saveProjectState(user, initialState, projectId);
  res.status(200).json({
    ok: true,
    data: {
      state,
      reply: getCurrentPrompt(state)
    }
  } satisfies ApiResponse<ResetPayload>);
};
