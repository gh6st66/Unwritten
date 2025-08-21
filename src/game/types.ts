import { World } from "../world/types";
import { Civilization } from "../civ/types";
import { ForgeTemplate, LearnedWord } from "../systems/maskforging/types";

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
  learnedWords: string[];
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
  | { kind: "FORGE_MASK"; seedTitle: string; forge: ForgeTemplate; learnedWords: LearnedWord[] }
  | { kind: "CLAIM"; claim: Claim }
  | { kind: "LOADING"; message: string; context: 'ENCOUNTER' | 'MASK' | 'WORLD_GEN' }
  | { kind: "ENCOUNTER"; encounter: Encounter; playerResources: Resources }
  | { kind: "RESOLVE"; summary: string }
  | { kind: "COLLAPSE"; reason: string };

export type GameEvent =
  | { type: "REQUEST_NEW_RUN" }
  | { type: "START_RUN"; seed: WorldSeed }
  | { type: "WORLD_GENERATED"; world: World; civs: Civilization[] }
  | { type: "FORGE_MASK"; wordId: string }
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
  activeForgeId: string | null;
  forgingInput: string | null;
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
