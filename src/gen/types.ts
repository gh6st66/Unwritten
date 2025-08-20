// Core world + NPC types for Unwritten

export type Id<T extends string> = `${T}_${string}`;

export interface RNG {
  next(): number;          // [0,1)
  int(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  weightPick<T>(items: readonly { item: T; w: number }[]): T;
  shuffle<T>(arr: readonly T[]): T[];
}

export interface Echo {
  tag: string;             // short key from prior runs
  weight?: number;         // influence on generation
}

export interface WorldContext {
  seed: string;
  epoch: "Dawn" | "Archive" | "Inquisition" | "Embers" | "Thaw";
  gravity: "Order" | "Flux";            // narrative gravity
  knownFactions: FactionDef[];
  knownRegions?: RegionSummary[];
  echoes?: Echo[];
}

export interface FactionDef {
  id: Id<"faction">;
  name: string;
  tier: 1 | 2 | 3;                      // local → continental
  ethos: string;                        // one‑line purpose
  methods: string[];                    // tactics or norms
  taboo?: string[];
  symbol?: string;
}

export interface Disposition {
  // Use your project’s sliders. Kept generic here.
  mercy: number;        // -3..+3
  candor: number;       // -3..+3
  daring: number;       // -3..+3
  loyalty: number;      // -3..+3
}

export interface Mark {
  id: Id<"mark">;
  name: string;
  kind: "reputation" | "oath" | "stain";
  note?: string;
}

export interface MaskStyle {
  material: string;          // wood, bone, lacquer, clay, bronze, paper
  motif: string;             // wave, thorn, spiral, sun, comet, sigil
  wear: string;              // pristine, hairline cracks, scorched, stitched
}

export interface NPC {
  id: Id<"npc">;
  name: string;
  role: string;              // vocation or social role
  originRegion?: Id<"region">;
  faction?: Id<"faction">;
  disposition: Disposition;
  contradiction?: string;    // tension between stated values and acts
  mask?: MaskStyle;
  marks: Mark[];
  traits: string[];          // concise physical or social tells
  rumor?: string;            // hook for encounters
  echoHooks?: string[];      // echoes that influenced this NPC
}

export interface Region {
  id: Id<"region">;
  name: string;
  biome: string;
  climate: string;
  symbols: string[];         // landmarks with meaning
  customs: string[];         // rituals, laws, greetings
  prohibitions: string[];    // taboos that matter
  factionsPresent: Id<"faction">[];
  tensions: string[];        // active frictions
  travelCost: {
    time: number;            // minutes in real time economy
    fatigue: number;         // your resource units
  };
  neighbors: Id<"region">[]; // optional graph links
}

export type RegionSummary = Pick<Region, "id" | "name" | "biome" | "climate">;
