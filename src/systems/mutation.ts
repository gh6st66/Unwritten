import { EffectFn, RunState } from "../core/types";
import { clamp } from "./math";

export function applyOptionEffects(s: RunState, effects: EffectFn[]): RunState {
  return effects.reduce((acc, fn) => fn(acc), s);
}

// Helpers for common mutations
export const bumpRegionProsperity = (regionId: string, amount: number): EffectFn => (s: RunState) => {
  const region = s.world.regions[regionId];
  if (!region) return s;
  const next = { ...region, prosperity: clamp(region.prosperity + amount, -100, 100), lastUpdatedAt: s.world.time };
  return { ...s, world: { ...s.world, regions: { ...s.world.regions, [regionId]: next } } };
};

export const recordScar = (key: string): EffectFn => (s: RunState) => {
  if (s.world.scars.includes(key)) return s;
  return { ...s, world: { ...s.world, scars: [...s.world.scars, key] } };
};

export const addMarkByLabel = (label: string, strengthDelta: number): EffectFn => (s: RunState) => {
    // This function is now deprecated and will be removed.
    // Use the new `applyMark` system in `Marks.ts` instead.
    console.warn("addMarkByLabel is deprecated.");
    return s;
};

export const adjustDisposition = (key: string, delta: number): EffectFn => (s: RunState) => {
  const current = s.identity.dispositions[key] ?? 0;
  const nextDispositions = { ...s.identity.dispositions, [key]: current + delta };
  return { ...s, identity: { ...s.identity, dispositions: nextDispositions } };
};