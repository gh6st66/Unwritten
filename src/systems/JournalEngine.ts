import { RunState, ClaimId, Mark, MarkStrength, MarkId } from "../core/types";
import { clamp } from "./math";

const markStrengthStepDown = (m: Mark): MarkStrength => (m.strength > 1 ? (m.strength - 1) as MarkStrength : 1);

export function journalAccept(s: RunState, claimId: ClaimId): RunState {
  // Cement claim into a Mark (create or refresh)
  const label = claimId.toUpperCase(); // simple mapping; real impl would map claim->mark
  const existing = Object.values(s.identity.marks).find(m => m.id === claimId);
  const now = s.world.time;
  const mark: Mark = existing
    ? { ...existing, strength: 3, lastRefreshedAt: now }
    : { id: claimId as MarkId, label, strength: 3, createdAt: now, lastRefreshedAt: now };
  return {
    ...s,
    identity: {
      ...s.identity,
      marks: { ...s.identity.marks, [mark.id]: mark },
      activeClaims: Object.fromEntries(Object.entries(s.identity.activeClaims).filter(([id]) => id !== claimId)),
    },
  };
}

export function journalResist(s: RunState, claimId: ClaimId): RunState {
  // Successful resist: either remove the claim or weaken an existing mark
  const existing = s.identity.marks[claimId as MarkId];
  const nextMarks = { ...s.identity.marks };
  if (existing) nextMarks[claimId as MarkId] = { ...existing, strength: markStrengthStepDown(existing), lastRefreshedAt: s.world.time };
  return {
    ...s,
    identity: {
      ...s.identity,
      marks: nextMarks,
      activeClaims: Object.fromEntries(Object.entries(s.identity.activeClaims).filter(([id]) => id !== claimId)),
    },
  };
}

// Simple notoriety bump on unmask; factions/regions react elsewhere.
export function onUnmasked(s: RunState): RunState {
  const regions = { ...s.world.regions };
  for (const r of Object.values(regions)) {
    r.notoriety = clamp(r.notoriety + 5, -100, 100);
    r.lastUpdatedAt = s.world.time;
  }
  return { ...s, world: { ...s.world, regions } };
}