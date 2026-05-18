import { getCurrentField, processUserInput } from "@/ai-engine/stateMachine";
import { extractWithGroq, rewriteReplyWithGroq } from "@/services/groqService";
import type { ChatReply, EstimationState } from "@/types/estimation";

export async function runConversationTurn(state: EstimationState, message: string): Promise<{ state: EstimationState; reply: ChatReply }> {
  const field = getCurrentField(state);
  const groqExtraction = await extractWithGroq({
    fieldPath: field.path,
    fieldKind: field.kind,
    question: field.question,
    message,
    state
  });

  const canonicalMessage = groqExtraction?.canonical ?? message;
  const turn = processUserInput(state, canonicalMessage);
  const displayMessage = await rewriteReplyWithGroq({
    state: turn.state,
    deterministicReply: turn.reply,
    userMessage: message,
    canonicalMessage
  });

  return {
    state: turn.state,
    reply: displayMessage ? { ...turn.reply, displayMessage } : turn.reply
  };
}
