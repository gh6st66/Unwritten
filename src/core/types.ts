// Core narrative model for the Unwritten pivot.
// Single source of truth for runtime types.

import { IntentKind, TraitKey } from "../systems/intent/IntentTypes";

// --- UTILITY ---
export type Brand<K, T> = K & { __brand: T };

// --- CORE ID TYPES ---
export type Timestamp = number; // ms since epoch
export type RunId = string;
export type RegionId = string;
export type LocationId = string;
export type MarkId = string;
export type EchoId = string;
export type ClaimId = string;
export type ItemId = string;
export type EncounterId = string;
export type FactionId = Brand<string, "FactionId">;

// --- TIME & COST ---
export type TimeUnit = "hours" | "days" | "weeks";
export interface TimeCost {
  amount: number;
  unit: TimeUnit;
}

// --- NARRATIVE & WORLD ---
export interface JournalClaim {
  id: ClaimId;
  text: string;                 // “The Unwritten betrays an ally.”
  issuedAt: Timestamp;
  expiresAt?: Timestamp;        // optional deadline after which the claim cements automatically
  severity: "minor" | "major" | "existential";
}

// --- MARKS ---
export type MarkPolarity = "positive" | "negative";

export interface MarkDef {
  id: MarkId;
  name: string;
  polarity: MarkPolarity;
  opposite?: MarkId;        // OATHBREAKER -> LOYALIST
  maxIntensity: number;     // 1..N, caps stacking
  decayRatePerRun: number;  // how much intensity drops per run without reinforcement
}

export interface MarkState {
  id: MarkId;
  intensity: number;        // integer [0..maxIntensity]
  acquiredAtRun: number;    // run index when first seen
  lastReinforcedRun: number;// run index last time it was triggered/affirmed
}

export interface Echo {
  id: EchoId;
  originRunId: RunId;
  manifestation: "npc" | "faction" | "site" | "artifact";
  reference: string;            // e.g. NPC id, site id, artifact slug
  freshness: number;      // echo also fades over generations
  note?: string;
}

export interface MaskAppearance {
  material: "birch" | "oak" | "bone" | "lacquer" | "clay";
  carvings: string[];           // symbolic tags bound to marks/echoes
  pigments: string[];           // limited palette names
  adornments: string[];         // cords, feathers, nails, gilding
  signature: string;
}

export interface MaskState {
  wearing: boolean;
  appearance: MaskAppearance;
}

export interface RegionState {
  id: RegionId;
  prosperity: number;           // -100..+100, growth vs decay
  stability: number;            // -100..+100, governance/social order
  notoriety: number;            // how much the region cares about the Unwritten
  lastUpdatedAt: Timestamp;
}

export interface FactionState {
  id: FactionId;
  attitude: -100 | -50 | 0 | 25 | 50 | 75 | 100; // coarse for readability
  remembersMarks: Record<MarkId, number>;   // independent decay curve per faction
  requiresUnmasking?: boolean;  // rituals, courts, inquisitions
}

export interface WorldState {
  time: Timestamp;
  regions: Record<RegionId, RegionState>;
  factions: Record<FactionId, FactionState>;
  echoes: Record<EchoId, Echo>;
  scars: string[]; // e.g. "village:ashvale_abandoned@1680000000000"
}

export type PlayerMarks = MarkState[];
export type Dispositions = Record<string, number>;

export interface RunIdentity {
  runId: RunId;
  generationIndex: number;      // 0 for first known run
  marks: PlayerMarks;
  activeClaims: Record<ClaimId, JournalClaim>;
  mask: MaskState;
  dispositions: Dispositions;
}

export type ResourcePools = Partial<Record<TraitKey, number>>;

export interface Resources extends ResourcePools {
  energy: number;   // action stamina (refills in real time)
  clarity: number;  // wards against narrative pressure; gates resist checks
  will: number;     // long actions, rituals, travel
  maxEnergy: number;
  maxClarity: number;
  maxWill: number;
  nextEnergyAt: Timestamp;
  nextClarityAt: Timestamp;
  nextWillAt: Timestamp;
}

export interface InventoryItem {
  id: ItemId;
  label: string;
  qty: number;
}

export interface Inventory {
  items: Record<ItemId, InventoryItem>;
}

export interface FloraDef {
  id: ItemId;
  label: string;
  rarity: "common" | "uncommon" | "rare";
  regions: RegionId[];
  notes?: string;
}

export type ConditionFn = (s: RunState) => boolean;
export type EffectFn = (s: RunState) => RunState;

export interface OptionIntentMeta {
  kind: IntentKind;
  costMult?: Partial<Record<TraitKey, number>>;
  riskDelta?: number;
  subtletyDelta?: number;
  successCap?: number;
}

export interface EncounterOption {
  id: string;
  label: string;
  timeCost?: TimeCost;
  requiresUnmasked?: boolean;       // forces recognition moment
  resistClaimId?: ClaimId;          // attempt to resist this claim
  acceptClaimId?: ClaimId;          // willingly cement this claim
  invertsMarkId?: MarkId;           // attempt to invert this mark
  effects?: EffectFn[];             // world/identity mutations (legacy/simple)
  
  // New Intent System properties
  intent?: OptionIntentMeta;
  onResolve?: Record<string, any>;
}

export interface EncounterDef {
  id: EncounterId;
  title: string;
  prose: string;
  options: EncounterOption[];
  appearsIf?: ConditionFn[];
  oncePerRun?: boolean;
  location?: LocationId;
}

// --- RUN STATE ---
export interface RunState {
  identity: RunIdentity;
  world: WorldState;
  resources: Resources;
  location: LocationId;
  isAlive: boolean;
  inventory?: Inventory;
  leads?: Record<ItemId, number>; // 0..100 bonus to find chance from prior attempts
}

// --- RUN & LEGACY ---
export interface LegacyStateV1 {
  schemaVersion: 1;
  lastCompletedRun: number;    // run index that just ended
  carriedMarks: MarkState[];   // post-collapse, pre-next-run
}

export type LegacyState = LegacyStateV1;

export interface RunOutcome {
  reason: "defeat" | "entropy" | "choice" | "escape";
  summaryLog: string[];         // short lines for journal recap
  finalMarks: MarkState[];      // marks at collapse time
  runIndex: number;             // current run index
}

export interface NewRunSeed {
  runIndex: number;
  startingMarks: MarkState[]; // inherited + decayed
}