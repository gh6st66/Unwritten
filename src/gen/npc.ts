import { makeRNG } from "./rng";
import type {
  RNG as RNGType,
  WorldContext,
  NPC,
  Disposition,
  MaskStyle,
  Mark,
} from "./types";

const ROLES = [
  "itinerant scribe","mask‑carver","road warden","salt broker",
  "oath‑keeper","bellfounder","ferryman","night archivist",
  "dust priest","ledger courier","oathbreaker in hiding",
] as const;

const TRAITS = [
  "smells of cedar and pitch","ink‑stained fingers","speaks in clipped ledger terms",
  "eyes reflect candlefire strangely","walks the long way around thresholds",
  "voice like wet paper tearing","keeps a travel mask hung at the hip",
  "laugh leaves no echo","boots always dry",
] as const;

const CONTRADICTIONS = [
  "preaches oaths yet avoids witnesses",
  "claims to hate masks but carves them nightly",
  "never lies aloud yet writes false margins",
  "collects debts but forgives at random",
] as const;

const RUMORS = [
  "once read a page that erased a village",
  "owes a favor to the Inquisitor",
  "traded a true name at a bridge of roots",
  "hid a sunken bell’s clapper under floorboards",
] as const;

const MATERIALS = ["wood","bone","lacquer","clay","bronze","paper"] as const;
const MOTIFS = ["wave","thorn","spiral","sun","comet","sigil"] as const;
const WEAR = ["pristine","hairline cracks","scorched","stitched"] as const;

function makeDisposition(rng: RNGType): Disposition {
  const roll = () => rng.int(-3, 3);
  return {
    mercy: roll(),
    candor: roll(),
    daring: roll(),
    loyalty: roll(),
  };
}

function maskStyle(rng: RNGType): MaskStyle {
  return {
    material: rng.pick(MATERIALS),
    motif: rng.pick(MOTIFS),
    wear: rng.pick(WEAR),
  };
}

function pickMarks(rng: RNGType): Mark[] {
  const base: Mark[] = [
    { id: `mark_${id(rng)}`, name: "Oath‑scar", kind: "reputation" },
    { id: `mark_${id(rng)}`, name: "Redacted Page", kind: "stain" },
    { id: `mark_${id(rng)}`, name: "Witnessed Deed", kind: "oath" },
  ];
  return rng.shuffle(base).slice(0, rng.int(0, 2));
}

// Optional: bias using echoes from prior runs.
function echoBias(rng: RNGType, echoes = [] as WorldContext["echoes"]): string[] {
  if (!echoes?.length) return [];
  const picked = rng.shuffle(echoes).slice(0, Math.min(2, echoes.length));
  return picked.map(e => e.tag);
}

export function generateNPC(ctx: WorldContext, idx = 0): NPC {
  const rng = makeRNG(`${ctx.seed}:npc:${idx}`);

  const role = rng.pick(ROLES);
  const disposition = makeDisposition(rng);
  const traits = rng.shuffle(TRAITS).slice(0, rng.int(2, 3));
  const marks = pickMarks(rng);
  const contradiction = rng.pick(CONTRADICTIONS);
  const rumor = rng.pick(RUMORS);
  const echoHooks = echoBias(rng, ctx.echoes);

  const maskChance = 0.7; // many cultures wear masks
  const mask = rng.next() < maskChance ? maskStyle(rng) : undefined;

  return {
    id: `npc_${id(rng)}`,
    name: generateName(rng),
    role,
    originRegion: ctx.knownRegions?.length
      ? (rng.pick(ctx.knownRegions).id as any)
      : undefined,
    faction: ctx.knownFactions?.length
      ? rng.pick(ctx.knownFactions).id
      : undefined,
    disposition,
    contradiction,
    mask,
    marks,
    traits,
    rumor,
    echoHooks,
  };
}

function generateName(rng: RNGType): string {
  const A = ["Ira","Moth","Fen","Kerr","Sable","Ori","Vell","Tarn","Ansel","Rue"];
  const B = ["wyn","line","jet","mar","thae","rill","quill","lace","holt","ver"];
  const byname = ["of the Margin","of Low Span","the Uncounted","of Root Bridge","the Soft‑Spoken"];
  return `${rng.pick(A)}${rng.pick(B)} ${rng.pick(byname)}`;
}

function id(rng: RNGType): string {
  return Math.floor(rng.next() * 1e9).toString(36);
}
