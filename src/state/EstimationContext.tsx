import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { calculateCurrentState, exportPdf, fetchState, resetSystem, sendChatMessage } from "@/services/apiClient";
import type { CalculationResult, ChatReply, EstimationState } from "@/types/estimation";
import { initialState } from "@/utils/state";

export interface ChatMessage {
  id: string;
  role: "engine" | "user" | "system";
  content: string;
  timestamp: string;
}

interface EstimationContextValue {
  state: EstimationState;
  reply: ChatReply | null;
  calculations: CalculationResult | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  refreshState: () => Promise<void>;
  runCalculation: () => Promise<void>;
  downloadPdf: () => Promise<void>;
  reset: () => Promise<void>;
}

export const EstimationContext = createContext<EstimationContextValue | null>(null);

function messageId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: messageId(),
    role,
    content,
    timestamp: new Date().toISOString()
  };
}

function saveMessages(messages: ChatMessage[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("estibot.messages", JSON.stringify(messages.slice(-80)));
  }
}

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem("estibot.messages");
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function EstimationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EstimationState>(initialState);
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [calculations, setCalculations] = useState<CalculationResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      const next = [...current, message];
      saveMessages(next);
      return next;
    });
  }, []);

  const refreshState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchState();
      setState(payload.state);
      setReply(payload.reply);
      const savedMessages = loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        const initial = [makeMessage("engine", payload.reply.question)];
        setMessages(initial);
        saveMessages(initial);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load state.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const sendMessage = useCallback(
    async (message: string) => {
      const clean = message.trim();
      if (!clean || loading) {
        return;
      }
      setLoading(true);
      setError(null);
      addMessage(makeMessage("user", clean));
      try {
        const payload = await sendChatMessage(clean);
        setState(payload.state);
        setReply(payload.reply);
        if (payload.reply.calculations) {
          setCalculations(payload.reply.calculations);
        }
        const responseText = payload.reply.displayMessage ?? (payload.reply.notice ? `${payload.reply.notice}\n\n${payload.reply.question}` : payload.reply.question);
        addMessage(makeMessage("engine", responseText));
      } catch (requestError) {
        const messageText = requestError instanceof Error ? requestError.message : "Message failed.";
        setError(messageText);
        addMessage(makeMessage("system", messageText));
      } finally {
        setLoading(false);
      }
    },
    [addMessage, loading]
  );

  const runCalculation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await calculateCurrentState(state);
      setState(payload.state);
      setCalculations(payload.calculations);
      addMessage(makeMessage("engine", "Deterministic calculation completed. Results are available in the analytics dashboard."));
    } catch (requestError) {
      const messageText = requestError instanceof Error ? requestError.message : "Calculation failed.";
      setError(messageText);
      addMessage(makeMessage("system", messageText));
    } finally {
      setLoading(false);
    }
  }, [addMessage, state]);

  const downloadPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportPdf(state);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${state.project.name ?? "estibot"}-estimation.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      const messageText = requestError instanceof Error ? requestError.message : "PDF export failed.";
      setError(messageText);
      addMessage(makeMessage("system", messageText));
    } finally {
      setLoading(false);
    }
  }, [addMessage, state]);

  const reset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await resetSystem();
      setState(payload.state);
      setReply(payload.reply);
      setCalculations(null);
      const next = [makeMessage("engine", payload.reply.question)];
      setMessages(next);
      saveMessages(next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      state,
      reply,
      calculations,
      messages,
      loading,
      error,
      sendMessage,
      refreshState,
      runCalculation,
      downloadPdf,
      reset
    }),
    [calculations, downloadPdf, error, loading, messages, refreshState, reply, reset, runCalculation, sendMessage, state]
  );

  return <EstimationContext.Provider value={value}>{children}</EstimationContext.Provider>;
}
