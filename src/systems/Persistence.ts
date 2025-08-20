
import { LegacyState, RunState } from "../core/types";
import { scoreEchoes } from "../core/echoes";

const STORAGE_KEY = "unwritten_legacy_v2";

export function saveLegacy(finalState: RunState): void {
  const previousLegacy = loadLegacy() ?? {
    echoesBank: [],
    markCarry: [],
    boons: [],
    runsCompleted: 0,
    compendiumProgress: {},
  };

  const newEchoSeeds = scoreEchoes(finalState);

  const nextLegacy: LegacyState = {
    echoesBank: [...previousLegacy.echoesBank, ...newEchoSeeds], // Simple accumulation for now
    markCarry: finalState.marks.map(m => ({ id: m.id, carriedTier: m.tier })),
    boons: previousLegacy.boons,
    runsCompleted: previousLegacy.runsCompleted + 1,
    compendiumProgress: { ...previousLegacy.compendiumProgress /* merge progress */},
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLegacy));
  } catch (e) {
    console.error("Failed to save legacy:", e);
  }
}

export function loadLegacy(): LegacyState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LegacyState;
    // Basic schema check could go here
    return parsed;
  } catch {
    console.error("Failed to parse legacy data.");
    return null;
  }
}

export function clearLegacy(): void {
  localStorage.removeItem(STORAGE_KEY);
}
