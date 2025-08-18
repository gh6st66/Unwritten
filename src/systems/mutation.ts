import { EffectFn, RunState, Mark, MarkId } from "../core/types";
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
  const existing = Object.values(s.identity.marks).find(m => m.label.toUpperCase() === label.toUpperCase());
  const now = s.world.time;
  
  if (existing) {
    const nextStrength = clamp(existing.strength + strengthDelta, 1, 3) as Mark["strength"];
    const updatedMark: Mark = { ...existing, strength: nextStrength, lastRefreshedAt: now };
    return { ...s, identity: { ...s.identity, marks: { ...s.identity.marks, [existing.id]: updatedMark }}};
  } else {
    const id = label.toUpperCase() as MarkId;
    const newMark: Mark = {
      id,
      label,
      strength: clamp(strengthDelta, 1, 3) as Mark["strength"],
      createdAt: now,
      lastRefreshedAt: now,
    };
    return { ...s, identity: { ...s.identity, marks: { ...s.identity.marks, [id]: newMark }}};
  }
};

export const adjustDisposition = (key: string, delta: number): EffectFn => (s: RunState) => {
  const current = s.identity.dispositions[key] ?? 0;
  const nextDispositions = { ...s.identity.dispositions, [key]: current + delta };
  return { ...s, identity: { ...s.identity, dispositions: nextDispositions } };
};