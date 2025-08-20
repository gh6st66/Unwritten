import type { MaskBlueprint, RegionCulture, MaskSeed } from "./types";
import { hash3, mulberry32 } from "./rng";

export type ImagePromptSpec = {
  prompt: string;
  negative: string;
  aspect: "1:1"|"3:4"|"4:3";
  seed: number;        // deterministic from ctx
  guidance?: number;   // cfg or guidance scale
  steps?: number;      // sampler steps if your model uses them
  styleHints: string[];// for UI display/debug
};

const FORM_TOKENS: Record<string,string[]> = {
  full_face: ["full-face ceremonial mask", "frontal view"],
  half: ["half-mask covering eyes and nose"],
  jaw_hinged: ["jaw-hinged mask", "articulated lower jaw"],
  visor_mirror: ["visor mask with mirror slit"],
  veil: ["veil-draped mask"],
  lattice: ["open latticework face"],
  headdress_totemic: ["tall totemic headdress mask"],
  stacked_layered: ["layered plates construction"],
  negative_space: ["mask defined by negative-space cutouts"],
};

const MATERIAL_TOKENS: Record<string,string[]> = {
  wood: ["carved wood grain"],
  bone: ["scrimshawed bone"],
  antler: ["antler tine details"],
  leather: ["smoke-hardened leather"],
  reed_wicker: ["reed and wicker armature"],
  shell: ["shell inlays"],
  clay: ["matte clay body"],
  porcelain: ["thin porcelain body"],
  glass_obsidian: ["obsidian glass highlights"],
  bronze: ["hammered bronze plates"],
  iron: ["forged iron plates"],
  paper_lacquer: ["paper-laminate body", "lacquered surface"],
  fungus_chitin: ["grown chitin lattice"],
  textile: ["tight-weave textile elements"],
};

const MOTIF_TOKENS: Record<string,string> = {
  spiral_whorl: "spiral whorl motif",
  riverline: "river-line motif",
  knotwork: "interlaced knotwork",
  constellation: "constellation marks",
  scar_stitch: "visible stitch repairs",
  teeth_fang: "tooth and fang ornament",
  leaf_vein: "leaf-vein tracery",
  insect_carapace: "carapace ridges",
  geom_grid: "geometric grid",
  cracked_glaze: "cracked glaze pattern",
  eye_glyph: "eye glyph marks",
  sunburst: "sunburst radiance",
  smoke_plume: "smoke-plume lines",
};

const FINISH_TOKENS: Record<string,string> = {
  matte: "matte finish",
  gloss: "gloss finish",
  lacquer: "lacquer sheen",
  oxidized: "oxidized patina",
  raw: "raw untreated surface",
  gloss_pearl: "pearl gloss",
};

const FN_HOOKS: Record<string,string[]> = {
  intimidation: ["aggressive silhouette", "angular cheek plates"],
  warding: ["protective wards etched"],
  ancestor_channel: ["ancestral calm"],
  plague_filter: ["breather mesh detail", "filter vents"],
  trader_toll: ["seal marks and toll stamps"],
  speech_mod: ["slatted mouth grille"],
  legal_identity: ["registry stamp plate"],
  stealth_secret: ["subtle silhouette", "low-contrast patterning"],
  pilgrim_vow: ["pilgrim pendant cords"],
  mourning: ["subdued palette, quiet lines"],
  authority_badge: ["official insignia panel"],
  festival: ["vibrant colors", "dynamic shapes"],
};

const WEAR_TOKENS: Record<string,string> = {
  strapped: "leather head straps",
  tied_veil: "tied veil attachment",
  suspended_pendant: "pendant suspension",
  hair_pinned: "hair-pinned crown",
  shoulder_hung: "shoulder-hung when idle",
  hand_held: "hand-held mask",
  face_painted_negative: "face-paint negative around cutouts",
};

const STYLE_CANON = [
  "ink-and-watercolor illustration",
  "aged parchment background",
  "sepia tones with restrained indigo/ochre accents",
  "clean linework, subtle wash, high texture detail",
  "centered composition, studio lighting, no extra props"
];

const NEGATIVE_CANON = [
  "photograph", "photo", "3D render", "CGI", "neon", "cyberpunk",
  "samurai", "Venetian", "steampunk", "superhero", "plastic toy",
  "modern materials", "text, watermark, logo", "background clutter",
];

export function buildImagePrompt(
  bp: MaskBlueprint,
  culture: RegionCulture,
  seed: MaskSeed
): ImagePromptSpec {
  const s = hash3(culture.ctx.worldSeed, culture.ctx.x, culture.ctx.y) ^ culture.ctx.era;
  const rng = mulberry32(s);
  const aspect: "1:1"|"3:4"|"4:3" = bp.form === "headdress_totemic" ? "3:4" : "1:1";

  const styleHints: string[] = [];
  const bits: string[] = [];

  bits.push(...STYLE_CANON);

  bits.push(...(FORM_TOKENS[bp.form] ?? []));
  bits.push(...(MATERIAL_TOKENS[bp.material] ?? []));
  bits.push(MOTIF_TOKENS[bp.motif] ?? "");
  bits.push(WEAR_TOKENS[bp.wear] ?? "");
  bits.push(FINISH_TOKENS[bp.finish] ?? "");
  bits.push(`${bp.color} accents`);

  (FN_HOOKS[bp.fn] ?? []).forEach(t => bits.push(t));

  if (bp.legal === "state_standard") styleHints.push("uniform stamp panel", "precise geometry");
  if (bp.legal === "taboo") styleHints.push("subdued contrast", "hidden cutouts");

  const flavorImagery = seed.flavor?.imagery ?? [];
  if (flavorImagery.length) {
    for (let i=0;i<Math.min(2, flavorImagery.length); i++){
      const pick = flavorImagery[Math.floor(rng()*flavorImagery.length)];
      bits.push(pick);
      styleHints.push(pick);
    }
  }

  if (culture.axes.plaguePressure > 0.55) bits.push("hygienic veil logic, filter detail emphasized");
  if (culture.fields.dust > 0.6) bits.push("dust-softened edges");
  if (culture.fields.cold > 0.6) bits.push("chalk palette bias, glare control details");

  const prompt = bits.filter(Boolean).join(", ");
  const negative = NEGATIVE_CANON.join(", ");

  return {
    prompt,
    negative,
    aspect,
    seed: s,
    guidance: 6.5,
    steps: 28,
    styleHints
  };
}
