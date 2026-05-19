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

function stateForProject(project: Pick<Project, "name" | "description" | "method" | "hourlyRate" | "stateJson">): EstimationState {
  const state = parseState(project.stateJson);
  return {
    ...state,
    project: {
      ...state.project,
      name: state.project.name ?? project.name,
      description: state.project.description ?? project.description,
      method: (state.project.method ?? project.method) as EstimationMethod,
      hourlyRate: state.project.hourlyRate ?? project.hourlyRate
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
      stateJson: stringify(clean)
    }
  });

  return {
    project: updated,
    state: stateForProject(updated)
  };
}
