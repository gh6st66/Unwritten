import { generateRegion } from "./region";
import { generateNPC } from "./npc";
import { WorldContext, FactionDef } from "./types";

const factions: FactionDef[] = [
  { id: "faction_ledgers", name: "Ledgers of Dawn", tier: 2, ethos: "Tally the living and the lost", methods: ["audits","oaths"], taboo: ["unwitnessed deals"], symbol: "sun‑ledger" },
  { id: "faction_mourners", name: "Mourners’ Guild", tier: 1, ethos: "Keep the blanks for the dead", methods: ["vigils","processions"], symbol: "black page" },
  { id: "faction_ferrymen", name: "Ferrymen of the Upstream", tier: 2, ethos: "Cross what should not cross", methods: ["tolls","seals"], symbol: "reversed current" },
];

const ctx: WorldContext = {
  seed: "unwritten-demo",
  epoch: "Inquisition",
  gravity: "Order",
  knownFactions: factions,
  echoes: [{ tag: "betrayal" }, { tag: "forged‑oath" }],
};

const r0 = generateRegion(ctx, 0);
const r1 = generateRegion(ctx, 1);
const ctxWithRegions = { ...ctx, knownRegions: [r0, r1] };

console.log("--- Generated Region ---");
console.log(r0);
console.log("\n--- Generated NPCs ---");
console.log(generateNPC(ctxWithRegions, 0));
console.log(generateNPC(ctxWithRegions, 1));
