import { LegacyState, LegacyStateV1, RunOutcome } from "../core/types";

const STORAGE_KEY = "unwritten_legacy_v1";

function toLegacy(outcome: RunOutcome): LegacyStateV1 {
  return {
    schemaVersion: 1,
    lastCompletedRun: outcome.runIndex,
    carriedMarks: outcome.finalMarks
  };
}

export function saveRunOutcome(outcome: RunOutcome): void {
  const legacy = toLegacy(outcome);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  } catch (e) {
    console.error("Failed to save run outcome:", e);
  }
}

export function loadLegacy(): LegacyState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LegacyState;
    if (parsed.schemaVersion !== 1) {
      console.warn("Legacy data is from an old version. Starting fresh.");
      return null;
    }
    return parsed;
  } catch {
    console.error("Failed to parse legacy data.");
    return null;
  }
}

export function clearLegacy(): void {
  localStorage.removeItem(STORAGE_KEY);
}