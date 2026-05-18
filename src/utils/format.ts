export function formatCurrency(value: number | undefined): string {
  return `$${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number | undefined, digits = 2): string {
  return (value ?? 0).toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function titleCase(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
