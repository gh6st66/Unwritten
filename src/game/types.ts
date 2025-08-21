export type Phase =
  | "INTRO"
  | "CLAIM"
  | "LOADING"
  | "ENCOUNTER"
  | "RESOLVE"
  | "COLLAPSE";

export type ResourceId = "TIME" | "CLARITY" | "CURRENCY";

export type Resources = Record<ResourceId, number>;

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

export type Player = {
  id: string;
  name: string;
  resources: Resources;
  marks: Mark[];
  maskSeed?: string;      // for Gemini prompts
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

export type GameScreen =
  | { kind: "INTRO"; seed: string }
  | { kind: "CLAIM"; claim: Claim }
  | { kind: "LOADING"; message: string }
  | { kind: "ENCOUNTER"; encounter: Encounter }
  | { kind: "RESOLVE"; summary: string }
  | { kind: "COLLAPSE"; reason: string };

export type GameEvent =
  | { type: "START_RUN"; seed: string }
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
  screen: GameScreen;
  runId: string;
  activeClaim: Claim | null;
  day: number;
  region: string;
};