

import { RunState, ItemId } from "../core/types";
import { clamp } from "./math";
import { flora } from "../data/flora";
import { advanceTime } from "../core/time";

export type ForageParams = {
  itemId: ItemId;
  hours: number;    // 1..8
  unmaskOnStart: boolean; // player chose to take mask off
};

export type ForageOutcome = 
  | { kind: "found"; itemId: ItemId; qty: number; log: string }
  | { kind: "lead"; itemId: ItemId; lead: number; log: string }
  | { kind: "fail"; log: string }
  | { kind: "recognized"; log: string };

export function forage(s: RunState, p: ForageParams): { next: RunState; outcome: ForageOutcome[] } {
  let next = { ...s };

  // Advance time
  next = advanceTime(next, p.hours * 60);

  // Optional reveal
  if (p.unmaskOnStart && next.mask.worn) {
    next.mask.worn = false; // recognition risk now applies
  }

  // Base find odds from region prosperity/stability
  const regionId = next.locationId.split(":")[0] ?? "ashvale";
  const region = next.regions[regionId];
  const prosperity = region?.prosperity ?? 0;
  const stability = region?.stability ?? 0;

  // Hours matter, leads help, rarity mod comes from a simple table
  const rarityMod: Record<string, number> = { common: 40, uncommon: 20, rare: 8 };
  const floraDef = flora.find(f => f.id === p.itemId);
  const itemRarity = floraDef?.rarity ?? 'common';

  const hoursMod = clamp(p.hours * 6, 6, 60);
  const leadBonus = clamp((next.leads?.[p.itemId] ?? 0), 0, 100);

  let findChance = clamp(
    rarityMod[itemRarity] + hoursMod + Math.floor(prosperity / 4) + Math.floor(stability / 8) + leadBonus,
    5, 95
  );

  // Recognition chance if unmasked or patrols are high
  const recognitionBase = (next.mask.worn ? 2 : 18) + Math.max(0, region?.notoriety ?? 0) / 10;

  const roll = () => Math.random() * 100;
  const outcomes: ForageOutcome[] = [];

  const rFind = roll();
  if (rFind < findChance) {
    // Found 1–2 based on hours
    const qty = p.hours >= 4 ? 2 : 1;
    const inv = { ...next.inventory };
    inv[p.itemId] = (inv[p.itemId] ?? 0) + qty;
    next.inventory = inv;

    // small prosperity uptick
    if (region) {
        const nextRegions = {...next.regions};
        nextRegions[regionId] = {...region, prosperity: clamp(region.prosperity + 1, -100, 100) };
        next.regions = nextRegions;
    }

    outcomes.push({ kind: "found", itemId: p.itemId, qty, log: `You find ${qty} × ${pretty(p.itemId)}.` });
    // improve future leads slightly even on success (better routes)
    next.leads = { ...next.leads, [p.itemId]: clamp((next.leads?.[p.itemId] ?? 0) + 5, 0, 100) };
  } else {
    // No luck; create/raise a lead for next time
    const gained = p.hours >= 4 ? 15 : 8;
    next.leads = { ...next.leads, [p.itemId]: clamp((next.leads?.[p.itemId] ?? 0) + gained, 0, 100) };
    outcomes.push({ kind: "lead", itemId: p.itemId, lead: gained, log: "You don’t find it, but you note likely spots." });
  }

  // Recognition check if unmasked or region is hot
  const rRec = roll();
  if (rRec < recognitionBase) {
    // global notoriety nudge as rumor spreads
    if (region) {
        const nextRegions = {...next.regions};
        nextRegions[regionId] = {...region, notoriety: clamp(region.notoriety + 3, -100, 100)};
        next.regions = nextRegions;
    }
    outcomes.push({ kind: "recognized", log: "A patrol clocks you; whispers ripple down the road." });
  }

  return { next, outcome: outcomes };
}

function pretty(id: string) {
  return id.split(":")[1]?.replace(/^\w/, c => c.toUpperCase()).replace(/-/g, " ") ?? id;
}