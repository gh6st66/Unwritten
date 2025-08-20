import { MaskAppearance, RunState } from "../core/types";

// Deterministic but slowly evolving signature derived from marks
export function deriveMaskAppearance(s: RunState): MaskAppearance {
  const markKeys = Object.values(s.marks).sort((a, b) => b.tier - a.tier).map(m => m.id);
  const seed = markKeys.join("|") || "blank";
  // Extremely simple “hash” → use to pick variants
  const sum = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const materials: MaskAppearance["material"][] = ["birch", "oak", "bone", "lacquer", "clay"];
  const pigments = ["sienna", "ashes", "indigo", "ochre"];
  const adornments = ["cord", "feather", "nail", "gilt"];

  return {
    material: materials[sum % materials.length],
    carvings: markKeys.slice(0, 3),
    pigments: [pigments[sum % pigments.length]],
    adornments: [adornments[(sum >> 3) % adornments.length]],
    signature: String(sum % 10_000),
  };
}