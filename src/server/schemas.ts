import { z } from "zod";

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
  hourlyRate: z.number().positive().max(10000).default(50)
});

export const chatSchema = z.object({
  message: z.string().trim().min(0).max(6000),
  projectId: z.string().trim().min(1).optional()
});

export const stateRequestSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  state: z.unknown().optional()
});
