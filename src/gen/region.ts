import { makeRNG } from "./rng";
import type { RNG as RNGType, WorldContext, Region, FactionDef } from "./types";

// Lightweight tables. Replace/extend in data files later.
const BIOMES = [
  "salt flats","steppe","floodplain","thorn forest","black pine ridge",
  "dolmen coast","mist fen","basalt shelf","paperwood grove","red clay terraces",
] as const;

const CLIMATES = [
  "arid with sudden storms","temperate with long autumns","humid and wind‑torn",
  "cold and bright","wet with ground fogs","dry highland air",
] as const;

const SYMBOLS = [
  "standing stones in a spiral","bridge of roots","sunken bell tower",
  "field of masks on poles","river that flows uphill at dusk",
  "glass dunes that sing","the bookbinder’s mile marker",
] as const;

const CUSTOMS = [
  "greet by showing the inside of the wrist",
  "do not name a newborn until first snowfall",
  "offer three grains of salt before bargaining",
  "wear travel masks at crossings",
  "read laws aloud at sunrise",
  "leave a page blank for the dead",
] as const;

const TABOOS = [
  "breaking bread after sunset",
  "speaking true names in public",
  "stepping on thresholds",
  "writing without witnesses",
  "touching unmasked faces",
] as const;

const TENSIONS = [
  "tax levies enforced by itinerant scribes",
  "mask‑theft blamed on outsiders",
  "faction rivalry over river rites",
  "oath‑debt uprisings in the hamlets",
  "Inquisitorial audits against local customs",
] as const;

function travelCostFor(biome: string): Region["travelCost"] {
  // Integrate with your real‑time economy: tune numbers later.
  switch (biome) {
    case "mist fen": return { time: 18, fatigue: 2 };
    case "salt flats": return { time: 8, fatigue: 1 };
    case "black pine ridge": return { time: 16, fatigue: 2 };
    default: return { time: 12, fatigue: 1 };
  }
}

function nameRegion(rng: RNGType, biome: string, symbol: string): string {
  const heads = ["The", "Old", "Low", "High", "Last", "Hidden"];
  const tails = ["Reach","Cant","Fold","Span","Ledger","Margin","Crossing"];
  const motif = symbol.split(" ")[0]; // crude anchor
  return `${rng.pick(heads)} ${motif} ${rng.pick(tails)}`;
}

export function generateRegion(ctx: WorldContext, idx = 0): Region {
  const rng = makeRNG(`${ctx.seed}:region:${idx}`);
  const biome = rng.pick(BIOMES);
  const climate = rng.pick(CLIMATES);
  const symbols = rng.shuffle(SYMBOLS).slice(0, rng.int(2, 3));
  const customs = rng.shuffle(CUSTOMS).slice(0, rng.int(2, 3));
  const prohibitions = rng.shuffle(TABOOS).slice(0, rng.int(1, 2));
  const tensions = rng.shuffle(TENSIONS).slice(0, rng.int(1, 3));
  const name = nameRegion(rng, biome, symbols[0]);
  const factions = chooseFactions(rng, ctx.knownFactions);

  return {
    id: `region_${cryptoId(rng)}`,
    name,
    biome,
    climate,
    symbols,
    customs,
    prohibitions,
    factionsPresent: factions.map(f => f.id),
    tensions,
    travelCost: travelCostFor(biome),
    neighbors: [], // wire up later when building a graph
  };
}

function chooseFactions(rng: RNGType, pool: FactionDef[]): FactionDef[] {
  if (!pool?.length) return [];
  const count = Math.min(3, Math.max(1, Math.round(rng.int(1, 3))));
  return rng.shuffle(pool).slice(0, count);
}

function cryptoId(rng: RNGType): string {
  return Math.floor(rng.next() * 1e9).toString(36);
}
