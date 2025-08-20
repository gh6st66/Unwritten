

// Basic enums
export type Intent =
  | "CONFRONT" | "PERSUADE" | "DECEIVE" | "SNEAK" | "WITHSTAND" | "BARGAIN" | "AID" | "STUDY";
export type Trait = "AGG" | "WIS" | "CUN" | "AGG_WIS" | "AGG_CUN" | "WIS_CUN";
export type Disposition = "HONOR" | "COMPASSION" | "PRIDE" | "PRUDENCE" | "CURIOSITY";
export type MarkId =
  | "OATHBREAKER" | "LOYALIST" | "MERCIFUL" | "CRUEL" | "COWARD" | "BRAVE" | "TRICKSTER" | "STEADFAST";
export type EchoTag = "TOWN" | "NPC" | "RUMOR" | "SCAR" | "RITE" | "FLORA";
export type ItemId = string;
export type LocationId = string;

export type ConditionFn = (s: RunState) => boolean;
export type EffectFn = (s: RunState) => RunState;

export interface TimeCost {
  amount: number;
  unit: "minutes" | "hours" | "days";
}

export interface Resources {
  energy: number;   // 0..100
  clarity: number;  // 0..100
  will: number;     // 0..100
  maxEnergy: number;
  maxClarity: number;
  maxWill: number;
}
export interface TraitPool { AGG: number; WIS: number; CUN: number; AGG_WIS: number; AGG_CUN: number; WIS_CUN: number; }

export interface Mark {
  id: MarkId;
  tier: number;           // -3..+3, sign = reputation polarity
  xp: number;             // progress to next tier
  decaysPerRun: number;   // decay steps applied on new run
  hidden?: boolean;
}

export interface Claim {
  id: string;                       // e.g., "BETRAY_AN_ALLY"
  text: string;
  polarity: -1 | 1;                 // world wants this enacted (+1) or defied (-1)
  gravity: number;                  // 0..3; feeds tension & DC
}

export interface EncounterOption {
  id: string;
  label: string;                    // short UI text
  intent: Intent;
  baseDifficulty: number;           // 0..100
  baseCosts: Partial<Record<Trait | keyof Resources, number>>;
  tags?: string[];
  outcomes: OutcomeSpec[];          // success/fail branches
}

export interface OutcomeSpec {
  kind: "SUCCESS" | "FAIL" | "PARTIAL";
  resourceDelta?: Partial<Resources>;
  traitDelta?: Partial<TraitPool>;
  markEffects?: Array<{ id: MarkId; deltaTier?: number; deltaXp?: number }>;
  dispositionDelta?: Partial<Record<Disposition, number>>;
  echoSeeds?: EchoSeed[];           // candidates for future runs
  text: string;                  // ties to narrative content
}

export interface Encounter {
  id: string;
  title: string;
  summary: string;
  tensionMod?: number;
  options: EncounterOption[];
  location?: string;
  appearsIf?: any; // placeholder for conditions
}

export interface EchoSeed {
  tag: EchoTag;
  weight: number;                   // selection bias on collapse
  payload: Record<string, unknown>; // data to manifest later
  cooldownRuns?: number;            // min runs before re-draw
}

export interface EchoInstance {
  seedId: string;
  manifestedAtRun: number;
  effects: Array<{ injectEncounterId?: string; modifyTable?: string; worldDelta?: Record<string, unknown> }>;
}

export interface MaskState {
  worn: boolean;
  style: { strokes: number; symmetry: number; paletteKey: string };
  derivedFromMarks: Array<{ id: MarkId; weight: number }>;
}

export interface MaskAppearance {
    material: string;
    carvings: string[];
    pigments: string[];
    adornments: string[];
    signature: string;
}

export interface TimeState {
  minute: number;     // absolute minutes since run start
  day: number;        // floor(minute / 1440)
}

// Herbalist Compendium
export interface PlantEntry {
  id: string;
  name: string;
  discovered: boolean;
  insights: number;          // 0..N
  masteryLevel: number;      // floor(insights / threshold)
  passiveBonuses: Array<{ key: "rareFindRate" | "energyRegen" | "eventReroll"; value: number }>;
  artUrl?: string;
  lore?: string;
}

export interface LogMessage {
  id: string;
  text: string;
  timestamp: number;
}

export interface RunState {
  runId: string;
  rngSeed: string;
  claim: Claim;
  resources: Resources;
  traits: TraitPool;
  marks: Mark[];
  dispositions: Partial<Record<Disposition, number>>; // -100..100
  mask: MaskState;
  time: number; // absolute minutes since run start
  tension: number;    // 0..100
  locationId: LocationId;
  echoesActive: EchoInstance[];
  compendium: Record<string, PlantEntry>; // Herbalist's Compendium
  log: LogMessage[];
  inventory: Record<ItemId, number>;
  scars: string[];
  regions: Record<string, { prosperity: number; notoriety: number; stability: number; }>;
  leads: Record<ItemId, number>;
  generationIndex: number;
}

export interface LegacyState {
  echoesBank: EchoSeed[];
  markCarry: Array<{ id: MarkId; carriedTier: number }>;
  boons: string[];
  runsCompleted: number;
  compendiumProgress: Record<string, { insights: number }>; // Compendium persistence
}

// Utility Types
export type Brand<K, T> = K & { __brand: T };
export type BoonId = Brand<string, "BoonId">;

export interface BoonDef {
  id: BoonId;
  label: string;
  description: string;
  cost: number;
  rarity: "common" | "rare";
  applyEffect: (s: RunState) => RunState;
}

export interface FloraDef {
  id: ItemId;
  label: string;
  rarity: "common" | "uncommon" | "rare";
  regions: string[];
  notes?: string;
}

export interface LocationConnection {
  to: string;
  label: string;
  timeCost: TimeCost;
  willCost: number;
}

export interface LocationDef {
  id: string;
  name: string;
  description: string;
  connections: LocationConnection[];
}

// Added for procedural narrative generation
export type NarrativeMark =
  | "Betrayer" | "Savior" | "Outcast" | "Monster" | "Trickster" | "Oathbound" | "Witness";

export type NarrativeDisposition = "Aggression" | "Cunning" | "Wisdom";

export type NarrativeEchoTag = "HelpedTown" | "BurnedBridge" | "SparedEnemy" | "Unmasked" | "DebtUnpaid";

export interface PCState {
  marks: Partial<Record<NarrativeMark, number>>;          // 0..3
  disp: Partial<Record<NarrativeDisposition, number>>;    // 0..5
  echoes: NarrativeEchoTag[];
  maskTraits?: string[];
}

export interface WorldCtx {
  scene: "Gate" | "Market" | "Sanctum" | "Street" | "Cell";
  npcRole: "WatchCaptain" | "Merchant" | "Priest" | "Guard" | "Mob";
  tension: 0 | 1 | 2 | 3;
  recognition: "Unknown" | "Suspected" | "Known";
  seed: number;                                   // run/turn deterministic seed
}
