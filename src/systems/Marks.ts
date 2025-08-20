import { MARK_DEFS } from "../data/marks";
import { MarkDef, MarkId, MarkState } from "../core/types";

// Get def with sanity checks
export function getMarkDef(id: MarkId): MarkDef {
  const def = MARK_DEFS[id];
  if (!def) throw new Error(`Unknown MarkDef: ${id}`);
  return def;
}

// Upsert/stack a mark
export function applyMark(
  marks: MarkState[],
  id: MarkId,
  runIndex: number,
  amount = 1
): MarkState[] {
  const def = getMarkDef(id);
  const next = [...marks];
  const idx = next.findIndex(m => m.id === id);
  
  if (idx >= 0) {
    const cur = next[idx];
    const intensity = Math.min(def.maxIntensity, cur.intensity + amount);
    if (intensity <= 0) {
      // Remove mark if intensity drops to 0 or below
      next.splice(idx, 1);
    } else {
      next[idx] = { ...cur, intensity, lastReinforcedRun: runIndex };
    }
  } else if (amount > 0) {
    next.push({
      id,
      intensity: Math.min(def.maxIntensity, amount),
      acquiredAtRun: runIndex,
      lastReinforcedRun: runIndex
    });
  }
  return next;
}

// Invert a mark using def.opposite, keeping intensity
export function invertMark(
  marks: MarkState[],
  id: MarkId,
  runIndex: number
): MarkState[] {
  const def = getMarkDef(id);
  if (!def.opposite) return marks;

  const opposite = getMarkDef(def.opposite);
  const srcIdx = marks.findIndex(m => m.id === id);
  if (srcIdx < 0) return marks;

  const src = marks[srcIdx];
  const keptIntensity = Math.min(opposite.maxIntensity, src.intensity);

  // Remove source
  const filtered = marks.filter(m => m.id !== id);
  
  // Apply the new opposite mark
  return applyMark(filtered, opposite.id, runIndex, keptIntensity);
}

// Decay marks across runs
export function decayMarks(
  marks: MarkState[],
  currentRunIndex: number,
  floor = 0
): MarkState[] {
  return marks
    .map(m => {
      const def = getMarkDef(m.id);
      const runsSince = Math.max(0, currentRunIndex - (m.lastReinforcedRun ?? m.acquiredAtRun));
      const decay = def.decayRatePerRun * runsSince;
      const nextIntensity = Math.max(floor, m.intensity - decay);
      return { ...m, intensity: nextIntensity };
    })
    .filter(m => m.intensity > 0);
}