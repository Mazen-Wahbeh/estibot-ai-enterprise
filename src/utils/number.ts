export function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function positiveNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function rating(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 && numeric <= 5 ? numeric : null;
}

export function nonNegativeInteger(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : null;
}

export function percentDifference(first: number, second: number): number {
  if (first === 0 && second === 0) {
    return 0;
  }
  const denominator = (Math.abs(first) + Math.abs(second)) / 2;
  return denominator === 0 ? 0 : Math.abs(first - second) / denominator * 100;
}
