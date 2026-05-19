import { z } from "zod";
import { dataResidencyOptions, supportedCountries, supportedCurrencies, supportedLocales } from "@/server/market";

export const emailSchema = z.string().trim().email().max(160).transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(120),
  organizationName: z.string().trim().min(2).max(80).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(120)
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(8).max(2000),
  method: z.enum(["FP", "UCP", "BOTH"]).default("BOTH"),
  hourlyRate: z.number().positive().max(10000).default(50),
  currency: z.enum(supportedCurrencies).default("USD"),
  country: z.enum(supportedCountries).default("GLOBAL"),
  clientName: z.string().trim().max(120).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  vatRate: z.number().min(0).max(100).default(0)
});

export const chatSchema = z.object({
  message: z.string().trim().min(0).max(6000),
  projectId: z.string().trim().min(1).optional()
});

export const stateRequestSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  state: z.unknown().optional()
});

export const tenantSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  locale: z.enum(supportedLocales),
  currency: z.enum(supportedCurrencies),
  country: z.enum(supportedCountries),
  dataResidency: z.enum(dataResidencyOptions),
  vatRate: z.number().min(0).max(100),
  reportBrand: z.string().trim().min(2).max(100)
});
