import { CulturalAxes, MaskBlueprint, MaskSeed, RegionCtx, RegionCulture, WorldFields } from "./types";
import { mulberry32, hash3 } from "./rng";
import { wPick, wMerge, wAdd } from "./weights";
import { seedLibrary } from "./seedLibrary";
import { computeFields, computeAxes } from "./fields";
import { nicknameFromDrivers } from "./names";

function chooseSeeds(ctx: RegionCtx, n=2): MaskSeed[] {
  const rng = mulberry32(hash3(ctx.worldSeed, ctx.x, ctx.y) ^ ctx.era);
  const picks: MaskSeed[] = [];
  for (let i=0;i<n;i++){
    picks.push(seedLibrary[Math.floor(rng()*seedLibrary.length)]);
  }
  return picks;
}

function adjustByFields(seed: MaskSeed, f: WorldFields): MaskSeed {
  const s = structuredClone(seed) as MaskSeed;
  if (f.metal < 0.35) s.materials = wAdd(s.materials, -2, m => m === "bronze" || m === "iron");
  if (f.metal > 0.65) s.materials = wAdd(s.materials, +1, m => m === "bronze" || m === "iron");
  if (f.wood > 0.6) s.materials = wAdd(s.materials, +1, m => m === "wood" || m === "reed_wicker");
  if (f.fungus > 0.6) s.materials = wAdd(s.materials, +2, m => m === "fungus_chitin");
  if (f.clay  > 0.6) s.materials = wAdd(s.materials, +1, m => m === "clay" || m === "porcelain");
  if (f.dust  > 0.6) s.forms     = wAdd(s.forms, +1, f=> f==="veil");
  if (f.cold  > 0.6) s.forms     = wAdd(s.forms, +1, f=> f==="visor_mirror" || f==="half");
  if (f.tide  > 0.6) s.materials = wAdd(s.materials, +1, m => m === "shell" || m === "porcelain");
  if (f.water > 0.6) s.motifs    = wAdd(s.motifs, +1, m => m === "riverline" || m === "constellation");
  return s;
}

function applyAxes(seed: MaskSeed, a: CulturalAxes): MaskSeed {
  const s = structuredClone(seed) as MaskSeed;
  s.legalStatus = wAdd(s.legalStatus, (a.centralization-0.5)*4, l => l === "state_standard");
  s.legalStatus = wAdd(s.legalStatus, (0.5-a.centralization)*2, l => l === "common");
  s.functions = wAdd(s.functions, (a.centralization-0.5)*2, f => f === "legal_identity" || f === "authority_badge");
  s.functions = wAdd(s.functions, (0.5-a.centralization)*2, f => f === "festival");
  s.legalStatus = wAdd(s.legalStatus, (a.piety-0.5)*3, l => l === "sacred");
  s.functions   = wAdd(s.functions, (a.piety-0.5)*2, f => f === "pilgrim_vow" || f === "mourning");
  s.forms       = wAdd(s.forms, (a.piety-0.5)*1, f => f === "negative_space" || f === "veil");
  s.functions = wAdd(s.functions, (a.militarization-0.5)*3, f => f === "intimidation" || f === "warding");
  s.forms     = wAdd(s.forms, (a.militarization-0.5)*2, f => f === "jaw_hinged" || f==="full_face");
  s.materials = wAdd(s.materials, (a.militarization-0.5)*2, m => m === "iron" || m === "leather");
  s.motifs = wAdd(s.motifs, (a.openness-0.5)*2, m => m === "knotwork" || m === "spiral_whorl" || m === "constellation");
  s.functions = wAdd(s.functions, (a.openness-0.5)*2, f => f === "trader_toll" || f === "festival");

  if (a.prosperity > 0.6) {
    s.materials = wAdd(s.materials, +1, m => m === "porcelain" || m === "glass_obsidian" || m === "bronze");
    s.palette.finishes = (s.palette.finishes ?? []).map(p => p.value==="gloss" || p.value==="gloss_pearl" ? {...p, w:p.w+1}:p);
  } else if (a.prosperity < 0.4) {
    s.materials = wAdd(s.materials, +1, m => m === "wood" || m === "paper_lacquer" || m === "reed_wicker");
    s.palette.finishes = (s.palette.finishes ?? []).map(p => p.value==="matte" ? {...p, w:p.w+1}:p);
  }

  if (a.plaguePressure > 0.55) {
    s.forms     = wAdd(s.forms, +2, f => f==="veil" || f==="visor_mirror");
    s.functions = wAdd(s.functions, +2, f => f==="plague_filter" || f==="warding");
  }

  if (a.iconoclasm > 0.6) {
    s.legalStatus = wAdd(s.legalStatus, +2, l => l==="taboo");
    s.forms       = wAdd(s.forms, +1, f => f==="negative_space");
  }
  return s;
}

function evolvePerEra(ctx: RegionCtx, seed: MaskSeed, axes: CulturalAxes): MaskSeed {
  const rng = mulberry32(hash3(ctx.worldSeed ^ 991, ctx.x ^ 313, ctx.y ^ 727) + ctx.era);
  let s = structuredClone(seed) as MaskSeed;
  for(const rule of seed.evolution){
    const base = rule.likelihood ?? 0.2;
    const bump =
      (rule.trigger==="centralize"  ? axes.centralization :
       rule.trigger==="decentralize"? 1-axes.centralization :
       rule.trigger==="plague"      ? axes.plaguePressure :
       rule.trigger==="war"         ? axes.militarization :
       rule.trigger==="golden_age"  ? axes.prosperity :
       rule.trigger==="iconoclasm"  ? axes.iconoclasm :
       rule.trigger==="migration"   ? axes.openness : 0.5) - 0.5;

    const chance = Math.min(1, Math.max(0, base + bump*0.5));
    if (rng() < chance) {
      const e = rule.effects;
      if (e.forms)     s.forms     = s.forms.concat(e.forms as any);
      if (e.materials) s.materials = s.materials.concat(e.materials as any);
      if (e.motifs)    s.motifs    = s.motifs.concat(e.motifs as any);
      if (e.functions) s.functions = s.functions.concat(e.functions as any);
      if (e.wear)      s.wear      = s.wear.concat(e.wear as any);
      if (e.palette)   s.palette   = { ...s.palette, ...e.palette };
      if (e.legalStatus) s.legalStatus = s.legalStatus.concat(e.legalStatus as any);
      if (e.rituals)   s.rituals   = [...s.rituals, ...e.rituals];
    }
  }
  return s;
}

export async function generateRegionCulture(ctx: RegionCtx): Promise<RegionCulture> {
  const rng = mulberry32(hash3(ctx.worldSeed, ctx.x, ctx.y) + ctx.era*17);
  const fields = computeFields(ctx);
  const axes   = computeAxes(ctx);

  const seedCount = axes.openness > 0.65 ? 3 : 2;
  const baseSeeds = chooseSeeds(ctx, seedCount);

  let merged = baseSeeds
    .map(s => adjustByFields(s, fields))
    .map(s => applyAxes(s, axes))
    .map(s => evolvePerEra(ctx, s, axes))
    .reduce((acc, s, i) => i===0 ? s : ({
      ...s,
      forms:      wMerge(acc.forms, s.forms, 1, 1),
      materials:  wMerge(acc.materials, s.materials, 1, 1),
      motifs:     wMerge(acc.motifs, s.motifs, 1, 1),
      functions:  wMerge(acc.functions, s.functions, 1, 1),
      wear:       wMerge(acc.wear, s.wear, 1, 1),
      palette:    { hues: wMerge(acc.palette.hues??[], s.palette.hues??[]), finishes: wMerge(acc.palette.finishes??[], s.palette.finishes??[]) },
      legalStatus:wMerge(acc.legalStatus, s.legalStatus, 1, 1),
      rituals:    Array.from(new Set([...(acc.rituals||[]), ...(s.rituals||[])])),
      drivers:    Array.from(new Set([...(acc.drivers||[]), ...(s.drivers||[])])),
      id: `${acc.id}+${s.id}`,
      evolution:  []
    }));

  const N = 5 + Math.floor(rng()*3);
  const picks: MaskBlueprint[] = [];
  let remaining = 1.0;

  for (let i=0;i<N;i++){
    const color = wPick(rng, merged.palette.hues ?? [{value:"umber",w:1}]);
    const finish = wPick(rng, merged.palette.finishes ?? [{value:"matte",w:1}]);
    const bp: MaskBlueprint = {
      form:     wPick(rng, merged.forms),
      material: wPick(rng, merged.materials),
      motif:    wPick(rng, merged.motifs),
      fn:       wPick(rng, merged.functions),
      wear:     wPick(rng, merged.wear),
      color, finish,
      legal:    wPick(rng, merged.legalStatus),
      ritual:   (merged.rituals && merged.rituals.length) ? merged.rituals[Math.floor(rng()*merged.rituals.length)] : null,
      share:    i===N-1 ? remaining : Math.max(0.05, Math.min(0.3, (rng()*0.25))),
      nickname: nicknameFromDrivers(rng, merged.drivers),
    };
    remaining -= bp.share;
    if (remaining < 0) remaining = 0;
    picks.push(bp);
  }

  const blackMarket = axes.iconoclasm > 0.55
    ? picks.filter(p=> p.legal==="taboo" || p.fn==="stealth_secret").map(p=> ({...p, share: p.share*0.3, nickname: `Hidden ${p.nickname}`}))
    : undefined;

  const legalMood =
    axes.centralization > 0.65 ? "Uniform registry masks are enforced." :
    axes.iconoclasm     > 0.60 ? "Masks are restricted; underground styles circulate." :
    axes.piety          > 0.60 ? "Ritual authority sets the tone." :
    "Mixed norms with local discretion.";

  const notes: string[] = [];
  if (fields.water > 0.7) notes.push("River courts validate guild masks.");
  if (fields.cold  > 0.7) notes.push("Glare visors and chalk palettes are common.");
  if (fields.dust  > 0.7) notes.push("Veils double as dust filters.");
  if (axes.openness> 0.7) notes.push("Motifs borrow freely from travelers.");
  if (axes.prosperity<0.35) notes.push("Scarcity favors wicker, paper and wood.");
  if (axes.prosperity>0.7) notes.push("Porcelain and gloss are status markers.");

  return {
    ctx, fields, axes,
    baseSeeds: baseSeeds.map(s=>s.id),
    legalMood,
    popular: picks.sort((a,b) => b.share - a.share),
    blackMarket,
    notes
  };
}
