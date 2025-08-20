import { LineTemplate, ThoughtTemplate } from "./templates";
import { PCState, WorldCtx, NarrativeMark } from "../core/types";
import { mulberry32 } from "../util/rng";

const BASE_WEIGHT = 1;

function markWeights(pc: PCState): Record<NarrativeMark, number> {
  const out = {} as Record<NarrativeMark, number>;
  for (const [k, v] of Object.entries(pc.marks ?? {})) out[k as NarrativeMark] = v ?? 0;
  return out;
}

function passesAll(preds: (((i: any)=>boolean))[]|undefined, i: any) {
  return !preds || preds.every(p => p(i));
}

function scoreTemplate<T extends { weight?: number; when?: any[]; text: string }>(
  t: T,
  i: { pc: PCState; w: WorldCtx },
  pcMarkWeights: Record<NarrativeMark, number>
): number {
  let s = t.weight ?? BASE_WEIGHT;
  // small bonus if text references dominant mark keyword
  const tl = t.text.toLowerCase();
  for (const [m, w] of Object.entries(pcMarkWeights)) {
    if (w > 0 && tl.includes(m.toLowerCase())) s += 0.2 * w;
  }
  return s;
}

function weightedPick<T>(rng: () => number, items: { item: T; weight: number }[]): T {
  if (items.length === 0) return null as T;
  const total = items.reduce((a, b) => a + b.weight, 0);
  if (total <= 0) {
    return items[Math.floor(rng() * items.length)].item;
  }
  let r = rng() * total;
  for (const it of items) {
    if ((r -= it.weight) <= 0) return it.item;
  }
  return items[items.length - 1].item;
}

export function pickEncounterLine(pool: LineTemplate[], pc: PCState, w: WorldCtx): string {
  const i = { pc, w };
  const candidates = pool.filter(t => passesAll(t.when, i));
  const rng = mulberry32(w.seed ^ 0xA11CE);
  const scored = candidates.map(t => ({ item: t, weight: scoreTemplate(t, i, markWeights(pc)) }));
  return (scored.length ? weightedPick(rng, scored) : pool[0]).text;
}

function clampWords(s: string, n: number) {
  const parts = s.split(/\s+/);
  return parts.length <= n ? s : parts.slice(0, n).join(" ");
}

export function pickThought(pool: ThoughtTemplate[], pc: PCState, w: WorldCtx): string {
  const i = { pc, w };
  const rng = mulberry32((w.seed + 17) ^ 0xBEE5);
  
  // 1. Find all specific thoughts that match the context
  const specificCandidates = pool.filter(t => t.when && passesAll(t.when, i));

  let chosen: ThoughtTemplate | null = null;

  if (specificCandidates.length > 0) {
    // 2. If we have specific matches, pick from them
    const scored = specificCandidates.map(t => ({ item: t, weight: scoreTemplate(t, i, markWeights(pc)) }));
    chosen = weightedPick(rng, scored);
  } else {
    // 3. Otherwise, pick from the fallbacks (those without a `when` clause)
    const fallbacks = pool.filter(t => !t.when);
    if (fallbacks.length > 0) {
        const scoredFallbacks = fallbacks.map(t => ({ item: t, weight: scoreTemplate(t, i, markWeights(pc)) }));
        chosen = weightedPick(rng, scoredFallbacks);
    }
  }

  // Handle empty pools as a safety measure
  if (!chosen) {
      chosen = pool[pool.length - 1];
  }

  return chosen.maxWords ? clampWords(chosen.text, chosen.maxWords) : chosen.text;
}
