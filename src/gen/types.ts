export type Disposition = "friendly" | "neutral" | "hostile" | "scheming";
export type Mark = { id: string; tier: number; };
export type MaskStyle = { strokes: number; symmetry: number; paletteKey: string; };

export interface FactionDef { 
  id: string; 
  name: string; 
  tier: number; 
  ethos: string; 
  methods: string[]; 
}

export interface RegionSummary { 
  id: string; 
  name: string; 
  biome: string; 
  climate: string; 
}

export interface WorldContext {
  seed: string;
  epoch: string;
  gravity: string;
  knownFactions: FactionDef[];
  knownRegions?: RegionSummary[];
  echoes?: { tag: string }[];
}

export interface Region {
  id: string;
  name: string;
  biome: string;
  climate: string;
  symbols: string[];
  travelCost: { time: number; fatigue: number; };
  factionsPresent: { id: string; influence: number; }[];
  neighbors: string[];
}

export interface NPC {
  id: string;
  name: string;
  age: number;
  role: string;
  factionId?: string;
  regionId: string;
  disposition: Disposition;
  marks: Mark[];
  maskStyle: MaskStyle;
}
