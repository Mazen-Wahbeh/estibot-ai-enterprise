export const supportedCurrencies = ["USD", "SAR", "AED", "QAR", "KWD", "JOD", "EGP", "EUR", "GBP"] as const;
export const supportedCountries = ["GLOBAL", "SA", "AE", "QA", "KW", "JO", "EG", "US", "GB", "EU"] as const;
export const supportedLocales = ["en", "ar"] as const;
export const dataResidencyOptions = ["GLOBAL", "GCC", "EU", "US"] as const;

export type SupportedCurrency = (typeof supportedCurrencies)[number];
export type SupportedCountry = (typeof supportedCountries)[number];
export type SupportedLocale = (typeof supportedLocales)[number];

export const countryDefaults: Record<SupportedCountry, { currency: SupportedCurrency; vatRate: number; label: string }> = {
  GLOBAL: { currency: "USD", vatRate: 0, label: "Global" },
  SA: { currency: "SAR", vatRate: 15, label: "Saudi Arabia" },
  AE: { currency: "AED", vatRate: 5, label: "United Arab Emirates" },
  QA: { currency: "QAR", vatRate: 0, label: "Qatar" },
  KW: { currency: "KWD", vatRate: 0, label: "Kuwait" },
  JO: { currency: "JOD", vatRate: 16, label: "Jordan" },
  EG: { currency: "EGP", vatRate: 14, label: "Egypt" },
  US: { currency: "USD", vatRate: 0, label: "United States" },
  GB: { currency: "GBP", vatRate: 20, label: "United Kingdom" },
  EU: { currency: "EUR", vatRate: 20, label: "European Union" }
};

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}
