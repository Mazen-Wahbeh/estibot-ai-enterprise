import { getCurrentPrompt } from "@/ai-engine/stateMachine";
import { loadProjectState, saveProjectState } from "@/server/projectStore";
import { runConversationTurn } from "@/services/chatService";
import type { ApiResponse, ChatReply, EstimationState } from "@/types/estimation";
import { badRequest, type ProtectedApiHandler } from "@/api/http";
import { chatSchema } from "@/server/schemas";
import { logUsage } from "@/server/rateLimit";

interface ChatPayload {
  state: EstimationState;
  reply: ChatReply;
}

export const chatHandler: ProtectedApiHandler = async (req, res, user) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid chat request.");
    return;
  }

  const { message, projectId } = parsed.data;
  const { state: currentState } = await loadProjectState(user, projectId);
  const turn = message.trim() ? await runConversationTurn(currentState, message) : { state: currentState, reply: getCurrentPrompt(currentState) };
  const { state: saved } = await saveProjectState(user, turn.state, projectId);
  await logUsage(user, "chat");

  res.status(200).json({
    ok: true,
    data: {
      state: saved,
      reply: turn.reply
    }
  } satisfies ApiResponse<ChatPayload>);
};
