import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, TriangleAlert, UserRound } from "lucide-react";
import { useEstimation } from "@/hooks/useEstimation";
import type { ChatMessage } from "@/state/EstimationContext";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const Icon = isUser ? UserRound : isSystem ? TriangleAlert : Bot;

  return (
    <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isSystem ? "bg-accent-100 text-accent-700" : "bg-ink text-white"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
      <div
        className={`max-w-[82%] whitespace-pre-line rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser ? "bg-accent-700 text-white" : isSystem ? "border border-accent-100 bg-accent-50 text-accent-700" : "border border-line bg-white text-ink"
        }`}
      >
        {message.content}
      </div>
      {isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-700 text-white">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
    </article>
  );
}

export function ChatPanel() {
  const { messages, sendMessage, loading, reply, error } = useEstimation();
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) {
      return;
    }
    setValue("");
    await sendMessage(message);
  };

  return (
    <section className="flex h-[calc(100vh-2.5rem)] min-h-[520px] max-h-[760px] flex-col rounded-lg border border-line bg-panel shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">EstiBot AI Enterprise</h1>
          <p className="text-sm text-accent-600">{reply?.phase ?? "PROJECT_INTRODUCTION"}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-accent-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Processing
          </div>
        ) : null}
        <div ref={scrollRef} />
      </div>

      {error ? <div className="mx-5 mb-3 rounded-md border border-accent-100 bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</div> : null}

      <form onSubmit={onSubmit} className="border-t border-line bg-white p-4">
        <label className="sr-only" htmlFor="chat-message">
          Message
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id="chat-message"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Answer the current EstiBot question"
            className="min-h-[52px] flex-1 resize-none rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-accent-600/70 focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-accent-700 text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-line disabled:text-accent-600"
            aria-label="Send message"
            title="Send"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </form>
    </section>
  );
}
