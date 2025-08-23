import { World } from "../world/types";
import { Civilization } from "../civ/types";
import { Lexeme } from "../types/lexeme";

export type { Lexeme };

export type Phase =
  | "TITLE"
  | "SEED_SELECTION"
  | "WORLD_GEN"
  | "FIRST_MASK_FORGE"
  | "MASK_REVEAL"
  | "CLAIM"
  | "LOADING"
  | "ENCOUNTER"
  | "RESOLVE"
  | "COLLAPSE"
  | "GENERATION_TESTER";

export enum ResourceId {
  TIME = "TIME",
  CLARITY = "CLARITY",
  CURRENCY = "COIN",
}

export type Resources = Record<ResourceId, number>;

export type Effect = {
  resource: ResourceId;
  delta: number;
};

export type ActionOutcome = {
  id: string;
  label: string;
  effects: Effect[];
  grantsMarks?: Mark[];
};

export type WorldSeed = {
  id: string;
  title: string;
  description: string;
};

export type Claim = {
  id: string;
  text: string;
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
  id: string;
  label: string;
  value: number;
};

export type MaskStyle = { strokes: number; symmetry: number; paletteKey: string; };

export type Mask = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  grantedMarks: Mark[];
  themeOfFate: Record<string, number>;
};

export type Player = {
  id: string;
  name: string;
  resources: Resources;
  marks: Mark[];
  mask: Mask | null;
  unlockedLexemes: string[]; // Lexeme IDs
};

export type Encounter = {
  id: string;
  prompt: string;
  options: ActionOutcome[];
  internalThoughtHint?: string;
};

export type WorldData = {
  world: World | null;
  civs: Civilization[];
};

export type GameScreen =
  | { kind: "TITLE" }
  | { kind: "SEED_SELECTION"; seeds: WorldSeed[] }
  | { kind: "FIRST_MASK_FORGE" }
  | { kind: "MASK_REVEAL"; mask: Mask }
  | { kind: "CLAIM"; claim: Claim }
  | { kind: "LOADING"; message: string; context: 'ENCOUNTER' | 'MASK' | 'WORLD_GEN' }
  | { kind: "ENCOUNTER"; encounter: Encounter; playerResources: Resources }
  | { kind: "RESOLVE"; summary: string }
  | { kind: "COLLAPSE"; reason: string }
  | { kind: "GENERATION_TESTER" };

export type GameEvent =
  | { type: "REQUEST_NEW_RUN" }
  | { type: "START_RUN"; seed: WorldSeed }
  | { type: "WORLD_GENERATED"; world: World; civs: Civilization[] }
  | { type: "COMMIT_FIRST_MASK"; lexeme: Lexeme }
  | { type: "MASK_FORGED"; mask: Mask }
  | { type: "CONTINUE_AFTER_REVEAL" }
  | { type: "ACCEPT_CLAIM"; claim: Claim; approach: 'embrace' | 'resist' }
  | { type: "GENERATE_ENCOUNTER" }
  | { type: "ENCOUNTER_LOADED"; encounter: Encounter }
  | { type: "GENERATION_FAILED"; error: string }
  | { type: "CHOOSE_OPTION"; encounterId: string; optionId: string }
  | { type: "ADVANCE"; to: Phase }
  | { type: "END_RUN"; reason: string }
  | { type: "LOAD_STATE"; snapshot: GameState }
  | { type: "RESET_GAME" }
  | { type: "OPEN_TESTER" }
  | { type: "CLOSE_TESTER" };

export type GameState = {
  phase: Phase;
  player: Player;
  world: WorldData;
  screen: GameScreen;
  runId: string;
  activeClaim: Claim | null;
  activeSeed: WorldSeed | null;
  firstMaskLexeme: Lexeme | null;
  day: number;
};

// Lexicon System Types
export type RegionCode = "en-US" | "en-GB" | "en-CA" | "en-AU" | "ga-IE" | "fr-FR" | "es-ES" | "es-419" | "custom";
export type Affiliation =
  | "inquisition" | "clergy" | "bureaucracy" | "academy" | "guild" | "military" | "rural" | "urban" | "commoner" | "outlaw";

export interface SpeakerContext {
  locale: string;
  region: RegionCode;
  affiliations: Affiliation[];
  role?: string;
}

// Generation Tester Types
export type MaskSpec = {
  material: string;
  forge: string;
  intent: "Aggression" | "Wisdom" | "Cunning";
  word: string;
  condition: string;
  motif: string;
  aura: string;
  presentation: string;
};

export type ThemeOfFate = {
  id: string;
  label: string;
};

export type TesterMask = {
  name: string;
  description: string;
  grantedMarks: Mark[];
  themeOfFate?: ThemeOfFate;
  imagePrompt: string;
  textPrompt: string;
  spec: MaskSpec;
  imageUrl?: string;
  error?: string;
};