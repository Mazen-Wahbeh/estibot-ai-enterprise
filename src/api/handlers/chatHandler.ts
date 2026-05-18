import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import { readState, writeState } from "@/database/jsonStore";
import { runConversationTurn } from "@/services/chatService";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { badRequest, type ApiHandler } from "@/api/http";

interface ChatPayload {
  state: EstimationState;
  reply: ChatReply;
}

export const chatHandler: ApiHandler = async (req, res) => {
  const message = req.body?.message;
  if (typeof message !== "string") {
    badRequest(res, "Request body must include a string message.");
    return;
  }

  const currentState = await readState();
  const turn = message.trim() ? await runConversationTurn(currentState, message) : { state: currentState, reply: getCurrentPrompt(currentState) };
  const saved = await writeState(turn.state);

  res.status(200).json({
    ok: true,
    data: {
      state: saved,
      reply: turn.reply
    }
  } satisfies ApiResponse<ChatPayload>);
};
