import { EffectFn, RunState } from "../core/types";
import { clamp } from "./math";

export function applyOptionEffects(s: RunState, effects: EffectFn[]): RunState {
  return effects.reduce((acc, fn) => fn(acc), s);
}

// Helpers for common mutations
export const bumpRegionProsperity = (regionId: string, amount: number): EffectFn => (s: RunState) => {
  const region = s.regions[regionId];
  if (!region) return s;
  const nextRegion = { ...region, prosperity: clamp(region.prosperity + amount, -100, 100) };
  return { ...s, regions: { ...s.regions, [regionId]: nextRegion } };
};

export const recordScar = (key: string): EffectFn => (s: RunState) => {
  if (s.scars.includes(key)) return s;
  return { ...s, scars: [...s.scars, key] };
};

export const addMarkByLabel = (label: string, strengthDelta: number): EffectFn => (s: RunState) => {
    // This function is now deprecated and will be removed.
    // Use the new `applyMark` system in `Marks.ts` instead.
    console.warn("addMarkByLabel is deprecated.");
    return s;
};

export const adjustDisposition = (key: string, delta: number): EffectFn => (s: RunState) => {
  const current = s.dispositions[key] ?? 0;
  const nextDispositions = { ...s.dispositions, [key]: current + delta };
  return { ...s, dispositions: nextDispositions };
};