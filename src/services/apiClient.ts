import type { ApiResponse, CalculationResult, ChatReply, EstimationState } from "@/types/estimation";

export interface StatePayload {
  state: EstimationState;
  reply: ChatReply;
}

export type ChatPayload = StatePayload;

export interface CalculationPayload {
  state: EstimationState;
  calculations: CalculationResult;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJson<T>(url: string, body: unknown, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as ApiResponse<T>;
      if (!response.ok || !payload.ok || payload.data === undefined) {
        throw new Error(payload.error ?? `Request failed with status ${response.status}`);
      }
      return payload.data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(350 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network request failed.");
}

export function fetchState(): Promise<StatePayload> {
  return postJson<StatePayload>("/api/state", {});
}

export function sendChatMessage(message: string): Promise<ChatPayload> {
  return postJson<ChatPayload>("/api/chat", { message });
}

export function calculateCurrentState(state: EstimationState): Promise<CalculationPayload> {
  return postJson<CalculationPayload>("/api/calculate", { state });
}

export function resetSystem(): Promise<StatePayload> {
  return postJson<StatePayload>("/api/reset", {});
}

export async function exportPdf(state: EstimationState): Promise<Blob> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "PDF export failed.");
      }
      return await response.blob();
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await wait(350 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("PDF export failed.");
}
