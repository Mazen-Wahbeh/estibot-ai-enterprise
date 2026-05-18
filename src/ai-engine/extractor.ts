import type { ComplexityCounts, EstimationMethod } from "@/types/estimation";
import { nonNegativeInteger, positiveNumber, rating } from "@/utils/number";

export interface ExtractionResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export function extractText(input: string, minimumLength = 1): ExtractionResult<string> {
  const cleaned = input.trim().replace(/^["']|["']$/g, "");
  if (cleaned.length < minimumLength) {
    return { ok: false, error: `Please provide at least ${minimumLength} characters.` };
  }
  return { ok: true, value: cleaned };
}

export function extractPositiveNumber(input: string): ExtractionResult<number> {
  const match = input.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  const value = match ? positiveNumber(match[0]) : null;
  if (value === null) {
    return { ok: false, error: "Please provide a positive numeric value." };
  }
  return { ok: true, value };
}

export function extractMethod(input: string): ExtractionResult<EstimationMethod> {
  const normalized = input.toLowerCase();
  if (/\b(both|combined|fp\s*\+\s*ucp|ucp\s*\+\s*fp)\b/.test(normalized)) {
    return { ok: true, value: "BOTH" };
  }
  if (/\b(function point|function points|fpa|fp)\b/.test(normalized)) {
    return { ok: true, value: "FP" };
  }
  if (/\b(use case|use-case|ucp|use case point|use case points)\b/.test(normalized)) {
    return { ok: true, value: "UCP" };
  }
  return { ok: false, error: "Please choose FP, UCP, or BOTH." };
}

export function extractCounts(input: string): ExtractionResult<ComplexityCounts> {
  const normalized = input.toLowerCase();
  const counts: Partial<ComplexityCounts> = {};
  const namedPattern = /(simple|average|complex)\s*[:=\-]?\s*(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = namedPattern.exec(normalized)) !== null) {
    const key = match[1] as keyof ComplexityCounts;
    const value = nonNegativeInteger(match[2]);
    if (value !== null) {
      counts[key] = value;
    }
  }

  if (counts.simple !== undefined && counts.average !== undefined && counts.complex !== undefined) {
    return {
      ok: true,
      value: {
        simple: counts.simple,
        average: counts.average,
        complex: counts.complex
      }
    };
  }

  const numericValues = normalized.match(/\d+/g)?.map((item) => Number(item)) ?? [];
  if (numericValues.length >= 3) {
    return {
      ok: true,
      value: {
        simple: numericValues[0],
        average: numericValues[1],
        complex: numericValues[2]
      }
    };
  }

  return {
    ok: false,
    error: "Provide three non-negative integers in simple, average, complex order."
  };
}

export function extractRating(input: string): ExtractionResult<number> {
  const match = input.match(/\b[0-5]\b/);
  const value = match ? rating(match[0]) : null;
  if (value === null) {
    return { ok: false, error: "Please provide one integer rating from 0 to 5." };
  }
  return { ok: true, value };
}

export function extractAcknowledgement(input: string): ExtractionResult<boolean> {
  if (/\b(proceed|continue|confirm|confirmed|yes|ok|okay|acknowledge)\b/i.test(input)) {
    return { ok: true, value: true };
  }
  return { ok: false, error: "Type proceed to continue through this phase." };
}

export function extractConfirmation(input: string): ExtractionResult<boolean> {
  if (/\b(confirm|confirmed|approve|approved|yes|run|calculate|proceed)\b/i.test(input)) {
    return { ok: true, value: true };
  }
  return { ok: false, error: "Type confirm to validate and continue, or describe one correction." };
}

export function isCorrectionRequest(input: string): boolean {
  return /\b(correct|correction|change|update|fix|replace|set)\b/i.test(input);
}
