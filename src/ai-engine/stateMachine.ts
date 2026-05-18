import { fpComponents, fpGscFactors, ucpEnvironmentalFactors, ucpTechnicalFactors } from "@/constants/factors";
import { nextPhase } from "@/constants/phases";
import { calculateEstimation } from "@/calculation-engine";
import type { ChatReply, ComplexityCounts, EstimationState, Phase } from "@/types/estimation";
import { cloneState, sanitizeState } from "@/utils/state";
import {
  extractAcknowledgement,
  extractConfirmation,
  extractCounts,
  extractMethod,
  extractPositiveNumber,
  extractRating,
  extractText,
  isCorrectionRequest
} from "@/ai-engine/extractor";
import {
  getAllRequiredMissingFields,
  isCountsComplete,
  isFactorComplete,
  methodUsesFp,
  methodUsesUcp,
  validateCalculationReadiness
} from "@/ai-engine/validators";

type FieldKind = "text" | "longText" | "positiveNumber" | "method" | "counts" | "rating" | "ack" | "confirm" | "calculate" | "done";

export interface FieldDescriptor {
  path: string;
  kind: FieldKind;
  question: string;
  notice?: string;
}

const phaseForPath: Array<[RegExp, Phase]> = [
  [/^project\.(name|description|hourlyRate)$/, "PROJECT_INTRODUCTION"],
  [/^project\.method$/, "METHOD_SELECTION"],
  [/^fp\./, "FUNCTION_POINT_COLLECTION"],
  [/^ucp\./, "USE_CASE_COLLECTION"],
  [/^technical\./, "TECHNICAL_FACTORS_COLLECTION"],
  [/^environmental\./, "ENVIRONMENTAL_FACTORS_COLLECTION"]
];

export function getPhaseForField(path: string): Phase {
  return phaseForPath.find(([pattern]) => pattern.test(path))?.[1] ?? "PROJECT_INTRODUCTION";
}

function methodLabel(state: EstimationState): string {
  return state.project.method ?? "the selected method";
}

export function getCurrentField(state: EstimationState): FieldDescriptor {
  const method = state.project.method;

  if (state.phase === "PROJECT_INTRODUCTION") {
    if (!state.project.name?.trim()) {
      return {
        path: "project.name",
        kind: "text",
        question: "What is the project name?"
      };
    }
    if (!state.project.description?.trim()) {
      return {
        path: "project.description",
        kind: "longText",
        question: "Provide a concise project overview covering the main business goal."
      };
    }
    if (typeof state.project.hourlyRate !== "number" || state.project.hourlyRate <= 0) {
      return {
        path: "project.hourlyRate",
        kind: "positiveNumber",
        question: "What hourly rate should be used for cost estimation?"
      };
    }
  }

  if (state.phase === "METHOD_SELECTION") {
    if (!method) {
      return {
        path: "project.method",
        kind: "method",
        question: "Select the estimation method: FP, UCP, or BOTH?"
      };
    }
  }

  if (state.phase === "FUNCTION_POINT_COLLECTION") {
    if (!methodUsesFp(method)) {
      if (state.fp.notApplicableConfirmed) {
        return {
          path: "fp.complete",
          kind: "done",
          question: "Function Point collection phase is complete."
        };
      }
      return {
        path: "fp.notApplicableConfirmed",
        kind: "ack",
        question: `Function Point collection is not required for ${methodLabel(state)}. Type proceed to continue.`
      };
    }
    for (const component of fpComponents) {
      const counts = state.fp[component.key] as ComplexityCounts | undefined;
      if (!isCountsComplete(counts)) {
        return {
          path: `fp.${component.key}`,
          kind: "counts",
          question: `Provide ${component.label} counts as simple, average, complex. Example: simple 5, average 3, complex 1.`
        };
      }
    }
  }

  if (state.phase === "USE_CASE_COLLECTION") {
    if (!methodUsesUcp(method)) {
      if (state.ucp.notApplicableConfirmed) {
        return {
          path: "ucp.complete",
          kind: "done",
          question: "Use Case Point collection phase is complete."
        };
      }
      return {
        path: "ucp.notApplicableConfirmed",
        kind: "ack",
        question: `Use Case Point collection is not required for ${methodLabel(state)}. Type proceed to continue.`
      };
    }
    if (!isCountsComplete(state.ucp.actors)) {
      return {
        path: "ucp.actors",
        kind: "counts",
        question: "Provide actor counts as simple, average, complex. Example: simple 2, average 4, complex 1."
      };
    }
    if (!isCountsComplete(state.ucp.useCases)) {
      return {
        path: "ucp.useCases",
        kind: "counts",
        question: "Provide use case counts as simple, average, complex. Example: simple 4, average 8, complex 3."
      };
    }
  }

  if (state.phase === "TECHNICAL_FACTORS_COLLECTION") {
    if (methodUsesFp(method)) {
      for (const factor of fpGscFactors) {
        if (!isFactorComplete(state.technical.fpGsc, factor.id)) {
          return {
            path: `technical.fpGsc.${factor.id}`,
            kind: "rating",
            question: `Rate FP technical factor "${factor.label}" from 0 to 5.`
          };
        }
      }
    }
    if (methodUsesUcp(method)) {
      for (const factor of ucpTechnicalFactors) {
        if (!isFactorComplete(state.technical.ucpTechnical, factor.id)) {
          return {
            path: `technical.ucpTechnical.${factor.id}`,
            kind: "rating",
            question: `Rate UCP technical factor "${factor.label}" from 0 to 5.`
          };
        }
      }
    }
  }

  if (state.phase === "ENVIRONMENTAL_FACTORS_COLLECTION") {
    if (!methodUsesUcp(method)) {
      if (state.environmental.notApplicableConfirmed) {
        return {
          path: "environmental.complete",
          kind: "done",
          question: "Environmental factor collection phase is complete."
        };
      }
      return {
        path: "environmental.notApplicableConfirmed",
        kind: "ack",
        question: `Environmental factor collection is not required for ${methodLabel(state)}. Type proceed to continue.`
      };
    }
    for (const factor of ucpEnvironmentalFactors) {
      if (!isFactorComplete(state.environmental.ucpEnvironmental, factor.id)) {
        return {
          path: `environmental.ucpEnvironmental.${factor.id}`,
          kind: "rating",
          question: `Rate environmental factor "${factor.label}" from 0 to 5.`
        };
      }
    }
  }

  if (state.phase === "VALIDATION_PHASE") {
    const missingFields = getAllRequiredMissingFields(state);
    if (missingFields.length > 0) {
      const firstMissing = missingFields[0];
      return {
        path: firstMissing,
        kind: "text",
        notice: "Validation found an incomplete field.",
        question: `Provide a valid value for ${firstMissing}.`
      };
    }
    return {
      path: "validation.confirmed",
      kind: "confirm",
      question: "All required fields are present. Type confirm to enter the calculation phase."
    };
  }

  if (state.phase === "CALCULATION_PHASE") {
    return {
      path: "calculation.confirmed",
      kind: "calculate",
      question: "Validation is complete. Type calculate to run deterministic FP/UCP estimation."
    };
  }

  return {
    path: "result.ready",
    kind: "done",
    question: "Results are ready. Export the PDF report, reset the system, or describe one correction."
  };
}

function updateMissingFields(state: EstimationState): EstimationState {
  state.missingFields = getAllRequiredMissingFields(state);
  state.isComplete = state.phase === "RESULT_GENERATION" && state.missingFields.filter((field) => !field.endsWith("notApplicableConfirmed")).length === 0;
  return state;
}

function setCounts(state: EstimationState, path: string, value: ComplexityCounts): void {
  if (path.startsWith("fp.")) {
    const key = path.replace("fp.", "") as keyof typeof state.fp;
    state.fp[key] = value as never;
  }
  if (path === "ucp.actors") {
    state.ucp.actors = value;
  }
  if (path === "ucp.useCases") {
    state.ucp.useCases = value;
  }
}

function setRating(state: EstimationState, path: string, value: number): void {
  const segments = path.split(".");
  if (segments[1] === "fpGsc") {
    state.technical.fpGsc = {
      ...(state.technical.fpGsc ?? {}),
      [segments[2]]: value
    };
  }
  if (segments[1] === "ucpTechnical") {
    state.technical.ucpTechnical = {
      ...(state.technical.ucpTechnical ?? {}),
      [segments[2]]: value
    };
  }
  if (segments[1] === "ucpEnvironmental") {
    state.environmental.ucpEnvironmental = {
      ...(state.environmental.ucpEnvironmental ?? {}),
      [segments[2]]: value
    };
  }
}

function applyValue(state: EstimationState, field: FieldDescriptor, message: string): { ok: boolean; error?: string } {
  switch (field.kind) {
    case "text": {
      const result = extractText(message, 2);
      if (!result.ok || !result.value) {
        return { ok: false, error: result.error };
      }
      if (field.path === "project.name") {
        state.project.name = result.value;
      }
      return { ok: true };
    }
    case "longText": {
      const result = extractText(message, 8);
      if (!result.ok || !result.value) {
        return { ok: false, error: result.error };
      }
      state.project.description = result.value;
      return { ok: true };
    }
    case "positiveNumber": {
      const result = extractPositiveNumber(message);
      if (!result.ok || result.value === undefined) {
        return { ok: false, error: result.error };
      }
      state.project.hourlyRate = result.value;
      return { ok: true };
    }
    case "method": {
      const result = extractMethod(message);
      if (!result.ok || !result.value) {
        return { ok: false, error: result.error };
      }
      if (state.project.method && state.project.method !== result.value) {
        state.fp = {};
        state.ucp = {};
        state.technical = {};
        state.environmental = {};
      }
      state.project.method = result.value;
      return { ok: true };
    }
    case "counts": {
      const result = extractCounts(message);
      if (!result.ok || !result.value) {
        return { ok: false, error: result.error };
      }
      setCounts(state, field.path, result.value);
      return { ok: true };
    }
    case "rating": {
      const result = extractRating(message);
      if (!result.ok || result.value === undefined) {
        return { ok: false, error: result.error };
      }
      setRating(state, field.path, result.value);
      return { ok: true };
    }
    case "ack": {
      const result = extractAcknowledgement(message);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      if (field.path === "fp.notApplicableConfirmed") {
        state.fp.notApplicableConfirmed = true;
      }
      if (field.path === "ucp.notApplicableConfirmed") {
        state.ucp.notApplicableConfirmed = true;
      }
      if (field.path === "environmental.notApplicableConfirmed") {
        state.environmental.notApplicableConfirmed = true;
      }
      return { ok: true };
    }
    case "confirm": {
      const result = extractConfirmation(message);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      state.phase = "CALCULATION_PHASE";
      return { ok: true };
    }
    case "calculate": {
      const result = extractConfirmation(message);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}

function phaseComplete(state: EstimationState): boolean {
  const field = getCurrentField(state);
  return field.kind === "confirm" || field.kind === "calculate" || field.kind === "done";
}

function advanceIfComplete(state: EstimationState, startingPhase: Phase): void {
  if (state.phase !== startingPhase) {
    return;
  }
  if (startingPhase === "VALIDATION_PHASE" || startingPhase === "CALCULATION_PHASE" || startingPhase === "RESULT_GENERATION") {
    return;
  }
  if (phaseComplete(state)) {
    state.phase = nextPhase(state.phase);
  }
}

function applyCorrection(state: EstimationState, message: string): { ok: boolean; notice: string } {
  const normalized = message.toLowerCase();

  if (/method/.test(normalized)) {
    const result = extractMethod(message);
    if (result.ok && result.value) {
      state.project.method = result.value;
      state.fp = {};
      state.ucp = {};
      state.technical = {};
      state.environmental = {};
      state.phase = "FUNCTION_POINT_COLLECTION";
      return { ok: true, notice: "Method corrected. Dependent estimation data was cleared for deterministic recalculation." };
    }
  }

  if (/hourly|rate|cost/.test(normalized)) {
    const result = extractPositiveNumber(message);
    if (result.ok && result.value !== undefined) {
      state.project.hourlyRate = result.value;
      state.phase = "VALIDATION_PHASE";
      return { ok: true, notice: "Hourly rate corrected." };
    }
  }

  if (/project.*name|name/.test(normalized)) {
    const result = extractText(message.replace(/^(change|update|set|correct|fix)\s+(the\s+)?(project\s+)?name\s+(to|as)?/i, ""), 2);
    if (result.ok && result.value) {
      state.project.name = result.value;
      state.phase = "VALIDATION_PHASE";
      return { ok: true, notice: "Project name corrected." };
    }
  }

  if (/description|overview/.test(normalized)) {
    const result = extractText(message.replace(/^(change|update|set|correct|fix)\s+(the\s+)?(project\s+)?(description|overview)\s+(to|as)?/i, ""), 8);
    if (result.ok && result.value) {
      state.project.description = result.value;
      state.phase = "VALIDATION_PHASE";
      return { ok: true, notice: "Project overview corrected." };
    }
  }

  return {
    ok: false,
    notice: "Correction request was detected but no supported field was identified."
  };
}

export function getCurrentPrompt(stateInput: EstimationState): ChatReply {
  const state = updateMissingFields(sanitizeState(stateInput));
  const field = getCurrentField(state);
  return {
    phase: state.phase,
    question: field.question,
    notice: field.notice
  };
}

export function processUserInput(stateInput: EstimationState, message: string): { state: EstimationState; reply: ChatReply } {
  const state = updateMissingFields(cloneState(sanitizeState(stateInput)));
  const trimmed = message.trim();

  if (!trimmed) {
    const prompt = getCurrentPrompt(state);
    return { state, reply: prompt };
  }

  if (isCorrectionRequest(trimmed) && (state.phase === "VALIDATION_PHASE" || state.phase === "CALCULATION_PHASE" || state.phase === "RESULT_GENERATION")) {
    const correction = applyCorrection(state, trimmed);
    updateMissingFields(state);
    const prompt = getCurrentPrompt(state);
    return {
      state,
      reply: {
        ...prompt,
        notice: correction.ok ? correction.notice : `${correction.notice} Which single field should be corrected?`
      }
    };
  }

  const startingPhase = state.phase;
  const field = getCurrentField(state);
  const applied = applyValue(state, field, trimmed);

  if (!applied.ok) {
    updateMissingFields(state);
    return {
      state,
      reply: {
        phase: state.phase,
        question: field.question,
        notice: applied.error
      }
    };
  }

  if (field.kind === "calculate") {
    const readiness = validateCalculationReadiness(state);
    if (!readiness.valid) {
      state.phase = "VALIDATION_PHASE";
      state.missingFields = readiness.missingFields;
      return {
        state,
        reply: {
          phase: state.phase,
          question: `Validation failed. Provide a valid value for ${readiness.missingFields[0]}.`,
          notice: readiness.error
        }
      };
    }
    const calculations = calculateEstimation(state);
    state.phase = "RESULT_GENERATION";
    updateMissingFields(state);
    state.isComplete = true;
    return {
      state,
      reply: {
        phase: state.phase,
        question: "Results are ready. Export the PDF report, reset the system, or describe one correction.",
        notice: "Deterministic calculation completed.",
        calculations
      }
    };
  }

  advanceIfComplete(state, startingPhase);
  updateMissingFields(state);

  const prompt = getCurrentPrompt(state);
  return {
    state,
    reply: {
      ...prompt,
      notice: field.kind === "confirm" ? "Validation accepted." : "Value stored."
    }
  };
}
