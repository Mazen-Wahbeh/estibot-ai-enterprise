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
  sector: z.string().trim().min(2).max(80).default("GENERAL"),
  teamSize: z.number().int().min(1).max(500).default(1),
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

export const projectIdSchema = z.object({
  projectId: z.string().trim().min(1)
});

export const actualResultSchema = z.object({
  projectId: z.string().trim().min(1),
  actualEffortHours: z.number().positive().max(1000000),
  actualDurationMonths: z.number().positive().max(10000),
  actualCost: z.number().min(0).max(1000000000),
  notes: z.string().trim().max(1200).default("")
});

export const approvalRequestSchema = z.object({
  projectId: z.string().trim().min(1),
  comment: z.string().trim().max(1200).default("")
});

export const approvalReviewSchema = z.object({
  approvalId: z.string().trim().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().trim().max(1200).default("")
});

export const proposalGenerateSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(160).optional()
});

export const integrationSchema = z.object({
  provider: z.enum(["JIRA", "SLACK", "GITHUB", "CSV_EXPORT", "ERP", "WEBHOOK"]),
  status: z.enum(["READY", "CONNECTED", "PAUSED"]).default("READY"),
  configJson: z.string().trim().max(4000).default("{}")
});
