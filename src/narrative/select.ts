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
  const total = items.reduce((a, b) => a + b.weight, 0);
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
  const candidates = pool.filter(t => passesAll(t.when, i));
  const rng = mulberry32((w.seed + 17) ^ 0xBEE5);
  const scored = candidates.map(t => ({ item: t, weight: scoreTemplate(t, i, markWeights(pc)) }));
  const chosen = (scored.length ? weightedPick(rng, scored) : pool[pool.length - 1]);
  return chosen.maxWords ? clampWords(chosen.text, chosen.maxWords) : chosen.text;
}