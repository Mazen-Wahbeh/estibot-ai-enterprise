import { promises as fs } from "fs";
import path from "path";
import type { EstimationState } from "@/types/estimation";
import { cloneState, initialState, sanitizeState } from "@/utils/state";

const dataDirectory = path.join(process.cwd(), "data");
const stateFile = path.join(dataDirectory, "estibot-state.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(stateFile);
  } catch {
    await writeState(initialState);
  }
}

export async function readState(): Promise<EstimationState> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    return sanitizeState(JSON.parse(raw));
  } catch {
    await writeState(initialState);
    return cloneState(initialState);
  }
}

export async function writeState(state: EstimationState): Promise<EstimationState> {
  await fs.mkdir(dataDirectory, { recursive: true });
  const clean = sanitizeState(state);
  await fs.writeFile(stateFile, `${JSON.stringify(clean, null, 2)}\n`, "utf8");
  return clean;
}

export async function resetState(): Promise<EstimationState> {
  return writeState(cloneState(initialState));
}
