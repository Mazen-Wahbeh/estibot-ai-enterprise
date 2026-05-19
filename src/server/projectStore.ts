import type { Project } from "@prisma/client";
import type { EstimationState, EstimationMethod } from "@/types/estimation";
import { initialState, sanitizeState } from "@/utils/state";
import { prisma } from "@/server/prisma";
import type { SessionUser } from "@/server/auth";

function stringify(value: unknown): string {
  return JSON.stringify(value);
}

function parseState(raw: string): EstimationState {
  try {
    return sanitizeState(JSON.parse(raw));
  } catch {
    return initialState;
  }
}

function stateForProject(
  project: Pick<Project, "name" | "description" | "method" | "hourlyRate" | "currency" | "country" | "clientName" | "status" | "riskLevel" | "sector" | "teamSize" | "vatRate" | "stateJson">
): EstimationState {
  const state = parseState(project.stateJson);
  return {
    ...state,
    project: {
      ...state.project,
      name: state.project.name ?? project.name,
      description: state.project.description ?? project.description,
      method: (state.project.method ?? project.method) as EstimationMethod,
      hourlyRate: state.project.hourlyRate ?? project.hourlyRate,
      currency: state.project.currency ?? project.currency,
      country: state.project.country ?? project.country,
      clientName: state.project.clientName ?? project.clientName ?? undefined,
      status: state.project.status ?? project.status,
      riskLevel: state.project.riskLevel ?? project.riskLevel,
      sector: state.project.sector ?? project.sector,
      teamSize: state.project.teamSize ?? project.teamSize,
      vatRate: state.project.vatRate ?? project.vatRate
    }
  };
}

export async function ensureDefaultProject(user: SessionUser): Promise<Project> {
  const existing = await prisma.project.findFirst({
    where: { tenantId: user.tenantId },
    orderBy: { updatedAt: "desc" }
  });

  if (existing) {
    return existing;
  }

  return prisma.project.create({
    data: {
      tenantId: user.tenantId,
      ownerId: user.id,
      name: "Draft Estimation",
      description: "Draft software project estimation session.",
      method: "BOTH",
      hourlyRate: 50,
      currency: "USD",
      country: "GLOBAL",
      sector: "GENERAL",
      teamSize: 1,
      vatRate: 0,
      stateJson: stringify(initialState)
    }
  });
}

export async function getTenantProject(user: SessionUser, projectId?: string): Promise<Project> {
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: user.tenantId
      }
    });
    if (project) {
      return project;
    }
  }

  return ensureDefaultProject(user);
}

export async function loadProjectState(user: SessionUser, projectId?: string): Promise<{ project: Project; state: EstimationState }> {
  const project = await getTenantProject(user, projectId);
  return {
    project,
    state: stateForProject(project)
  };
}

export async function saveProjectState(user: SessionUser, state: EstimationState, projectId?: string): Promise<{ project: Project; state: EstimationState }> {
  const project = await getTenantProject(user, projectId);
  const clean = sanitizeState(state);
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      name: clean.project.name?.trim() || project.name,
      description: clean.project.description?.trim() || project.description,
      method: clean.project.method ?? project.method,
      hourlyRate: clean.project.hourlyRate ?? project.hourlyRate,
      currency: clean.project.currency ?? project.currency,
      country: clean.project.country ?? project.country,
      clientName: clean.project.clientName ?? project.clientName,
      status: clean.project.status ?? project.status,
      riskLevel: clean.project.riskLevel ?? project.riskLevel,
      sector: clean.project.sector ?? project.sector,
      teamSize: clean.project.teamSize ?? project.teamSize,
      vatRate: clean.project.vatRate ?? project.vatRate,
      stateJson: stringify(clean)
    }
  });

  return {
    project: updated,
    state: stateForProject(updated)
  };
}
