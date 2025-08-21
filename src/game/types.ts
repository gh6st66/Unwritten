import { FactionDef, NPC, Region } from "../gen";

export type Phase =
  | "TITLE"
  | "SEED_SELECTION"
  | "WORLD_GEN"
  | "FORGE_MASK"
  | "CLAIM"
  | "LOADING"
  | "ENCOUNTER"
  | "RESOLVE"
  | "COLLAPSE";

export type ResourceId = "TIME" | "CLARITY" | "CURRENCY";

export type Resources = Record<ResourceId, number>;

export type WorldSeed = {
  id: string;
  title: string;
  description: string;
};

export type Claim = {
  id: string;
  text: string;           // e.g., "You betray allies."
  severity: 1 | 2 | 3;
  embrace: {
    label: string;
    description: string;
  };
  resist: {
    label: string;
    description: string;
  };
};

export type Mark = {
  id: string;             // reputation tag
  label: string;
  value: number;          // -3..+3
};

export type Mask = {
  name: string;
  description: string;
  imageUrl: string;
  grantedMarks: Mark[];
};

export type Player = {
  id: string;
  name: string;
  resources: Resources;
  marks: Mark[];
  mask: Mask | null;
};

export type Encounter = {
  id: string;
  prompt: string;         // what the player reads
  options: Array<{
    id: string;
    label: string;
    costs?: Partial<Resources>;
    effects?: Partial<Resources>;
    grantsMarks?: Mark[];
  }>;
  internalThoughtHint?: string; // short bracketed whisper
};

export type WorldData = {
  regions: Region[];
  factions: FactionDef[];
  npcs: NPC[];
};

export type GameScreen =
  | { kind: "TITLE" }
  | { kind: "SEED_SELECTION"; seeds: WorldSeed[] }
  | { kind: "FORGE_MASK"; seedTitle: string }
  | { kind: "CLAIM"; claim: Claim }
  | { kind: "LOADING"; message: string; context: 'ENCOUNTER' | 'MASK' | 'WORLD_GEN' }
  | { kind: "ENCOUNTER"; encounter: Encounter }
  | { kind: "RESOLVE"; summary: string }
  | { kind: "COLLAPSE"; reason: string };

export type GameEvent =
  | { type: "REQUEST_NEW_RUN" }
  | { type: "START_RUN"; seed: WorldSeed }
  | { type: "WORLD_GENERATED"; world: WorldData }
  | { type: "FORGE_MASK"; input: string }
  | { type: "MASK_FORGED"; mask: Mask }
  | { type: "ACCEPT_CLAIM"; claim: Claim; approach: 'embrace' | 'resist' }
  | { type: "GENERATE_ENCOUNTER" }
  | { type: "ENCOUNTER_LOADED"; encounter: Encounter }
  | { type: "GENERATION_FAILED"; error: string }
  | { type: "CHOOSE_OPTION"; encounterId: string; optionId: string }
  | { type: "ADVANCE"; to: Phase }
  | { type: "END_RUN"; reason: string }
  | { type: "LOAD_STATE"; snapshot: GameState }
  | { type: "RESET_GAME" };

export type GameState = {
  phase: Phase;
  player: Player;
  world: WorldData;
  screen: GameScreen;
  runId: string;
  activeClaim: Claim | null;
  activeSeed: WorldSeed | null;
  forgingInput: string | null;
  day: number;
};

// Lexicon System Types
export type RegionCode = "en-US" | "en-GB" | "en-CA" | "en-AU" | "ga-IE" | "fr-FR" | "es-ES" | "es-419" | "custom";
export type Affiliation =
  | "inquisition" | "clergy" | "bureaucracy" | "academy" | "guild" | "military" | "rural" | "urban" | "commoner" | "outlaw";

export interface SpeakerContext {
  locale: string;           // e.g., "en-US"
  region: RegionCode;       // coarse dialect selection
  affiliations: Affiliation[]; // ordered by strength: strongest first
  role?: string;            // freeform hint, e.g., "High Inquisitor", "Village Priest"
}