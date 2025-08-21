import type { SpeakerContext } from "../../game/types";
import type { LexemeEntry, LexemeKey, LexemeRule } from "./types";
import enEntry from "../../data/lexicon/fateRecord.en.json";

const LEXEMES: Record<LexemeKey, LexemeEntry> = {
  fateRecord: enEntry as unknown as LexemeEntry
};

export function resolveLexeme(key: LexemeKey, ctx: SpeakerContext): string {
  const entry = LEXEMES[key];
  if (!entry) return key;

  // Candidate scoring
  const scored = entry.rules
    .map(r => ({ r, score: scoreRule(r, ctx) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.r.weight || 0) - (a.r.weight || 0));

  if (scored.length > 0) return scored[0].r.variant.term;

  // Fallbacks: locale root → "en" → hard default
  const root = (ctx.locale || "en").split("-")[0];
  if (entry.defaults[root]) return entry.defaults[root].term;
  if (entry.defaults["en"]) return entry.defaults["en"].term;
  return "Record";
}

function scoreRule(r: LexemeRule, ctx: SpeakerContext): number {
  let s = 0;
  if (r.match.affiliationsAny && intersects(r.match.affiliationsAny, ctx.affiliations)) s += 3;
  if (r.match.regionAny && r.match.regionAny.includes(ctx.region)) s += 2;
  if (r.match.localeStartsWith && r.match.localeStartsWith.some((p: string) => ctx.locale.startsWith(p))) s += 1;
  if (r.match.roleRegex && ctx.role && new RegExp(r.match.roleRegex, "i").test(ctx.role)) s += 2;
  return s + (r.weight ?? 0) * 0.01; // tiny tie-break
}

function intersects<A>(a: A[], b: A[] = []): boolean {
  return a.some(x => b.includes(x));
}