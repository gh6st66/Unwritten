export type Weighted<T> = { value: T; w: number };

export interface PaletteDef {
  hues?: Weighted<string>[];
  finishes?: Weighted<"matte"|"gloss"|"lacquer"|"oxidized"|"gloss_pearl"|"raw">[];
}

export type MaskForm =
  | "full_face" | "half" | "jaw_hinged" | "visor_mirror" | "veil"
  | "lattice" | "headdress_totemic" | "stacked_layered" | "negative_space";

export type Material =
  | "wood" | "bone" | "antler" | "leather" | "reed_wicker" | "shell"
  | "clay" | "porcelain" | "glass_obsidian" | "bronze" | "iron"
  | "paper_lacquer" | "fungus_chitin" | "textile";

export type Motif =
  | "spiral_whorl" | "riverline" | "knotwork" | "constellation"
  | "scar_stitch" | "teeth_fang" | "leaf_vein" | "insect_carapace"
  | "geom_grid" | "cracked_glaze" | "eye_glyph" | "sunburst" | "smoke_plume";

export type Functionality =
  | "authority_badge" | "mourning" | "festival" | "intimidation"
  | "warding" | "ancestor_channel" | "plague_filter" | "trader_toll"
  | "speech_mod" | "legal_identity" | "stealth_secret" | "pilgrim_vow";

export type WearStyle =
  | "strapped" | "tied_veil" | "suspended_pendant" | "hair_pinned"
  | "shoulder_hung" | "hand_held" | "face_painted_negative";

export interface EvolutionRule {
  trigger: "centralize"|"decentralize"|"scarcity"|"migration"|"plague"|"war"|"golden_age"|"iconoclasm";
  effects: Partial<MaskSeed>;
  likelihood?: number; 
}

export interface FlavorSeed {
  tagline: string;
  imagery: string[];
  craft: string[];
  law: string[];
  ritual: string[];
  taboo: string[];
  voice: "bureaucratic"|"reverent"|"gritty"|"festive"|"hushed"|"martial";
}

export interface MaskSeed {
  id: string;
  drivers: string[];
  forms: Weighted<MaskForm>[];
  materials: Weighted<Material>[];
  motifs: Weighted<Motif>[];
  functions: Weighted<Functionality>[];
  wear: Weighted<WearStyle>[];
  palette: PaletteDef;
  legalStatus: Weighted<"sacred"|"common"|"state_standard"|"taboo">[];
  rituals: string[];
  evolution: EvolutionRule[];
  flavor?: FlavorSeed;
}

export type WorldFields = {
  water: number; metal: number; clay: number; wood: number;
  fungus: number; cold: number; dust: number; tide: number;
};

export type CulturalAxes = {
  centralization: number; piety: number; militarization: number;
  openness: number; prosperity: number; plaguePressure: number;
  iconoclasm: number;
};

export type RegionCtx = { worldSeed: number; x: number; y: number; era: number };

export type MaskBlueprint = {
  form: MaskForm; material: Material; motif: Motif; fn: Functionality;
  wear: WearStyle; color: string; finish: string;
  legal: "sacred"|"common"|"state_standard"|"taboo";
  ritual: string | null; share: number; nickname: string;
};

export type RegionCulture = {
  ctx: RegionCtx;
  fields: WorldFields;
  axes: CulturalAxes;
  baseSeeds: string[];
  legalMood: string;
  popular: MaskBlueprint[];
  blackMarket?: MaskBlueprint[];
  notes: string[];
};

export interface MaskDescription {
  title: string;
  summary: string;
  appearance: string;
  craftNotes: string;
  ritualUse?: string;
  legalNote?: string;
  sensory?: string;
  variantHook?: string;
  tags: string[];
}
