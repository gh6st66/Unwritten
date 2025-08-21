import { WorldContext, NPC, Disposition } from "./types";
import { makeRNG } from "./rng";

const FIRST_NAMES = ["Anya", "Bram", "Cora", "Darian", "Elara", "Finn", "Gwen", "Hale"];
const LAST_NAMES = ["Stonehand", "Swiftwater", "Blackwood", "Ironhide", "Silvermane"];
const ROLES = ["merchant", "guard", "artisan", "scholar", "thief", "noble"];
const DISPOSITIONS: Disposition[] = ["friendly", "neutral", "hostile", "scheming"];

export function generateNPC(ctx: WorldContext, index: number): NPC {
  const rng = makeRNG(`${ctx.seed}:npc:${index}`);
  const npcId = `npc_${rng.int(1e9).toString(36)}`;
  
  const region = ctx.knownRegions ? rng.pick(ctx.knownRegions) : null;
  const factionPool = ctx.knownFactions;
  const faction = factionPool.length > 0 && rng.next() > 0.3 ? rng.pick(factionPool) : undefined;

  return {
    id: npcId,
    name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
    age: 20 + rng.int(40),
    role: rng.pick(ROLES),
    factionId: faction?.id,
    regionId: region?.id ?? 'orphan_region',
    disposition: rng.pick(DISPOSITIONS),
    marks: [],
    maskStyle: {
      strokes: rng.int(10),
      symmetry: rng.int(10),
      paletteKey: "base",
    },
  };
}
