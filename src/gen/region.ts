import { WorldContext, Region } from "./types";
import { makeRNG } from "./rng";

const BIOMES = ["forest", "desert", "tundra", "swamp", "mountains", "plains"];
const CLIMATES = ["temperate", "arid", "frigid", "tropical"];
const SYMBOLS = ["moon", "sun", "star", "sword", "shield", "crown", "tree", "river"];

export function generateRegion(ctx: WorldContext, index: number): Region {
  const rng = makeRNG(`${ctx.seed}:region:${index}`);
  const regionId = `region_${rng.int(1e9).toString(36)}`;
  
  const biome = rng.pick(BIOMES);
  const climate = rng.pick(CLIMATES);

  const factionsPresent = rng.shuffle(ctx.knownFactions)
    .slice(0, rng.int(2) + 2) // 2-3 factions
    .map(f => ({ id: f.id, influence: rng.int(100) }));

  return {
    id: regionId,
    name: `${rng.pick(["Veridian", "Crimson", "Golden", "Shadow"])} ${rng.pick(["Reach", "Expanse", "Vale", "Hold"])}`,
    biome,
    climate,
    symbols: rng.shuffle(SYMBOLS).slice(0, 2),
    travelCost: {
      time: 60 + rng.int(120),
      fatigue: 10 + rng.int(20),
    },
    factionsPresent,
    neighbors: [],
  };
}
