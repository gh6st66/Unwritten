import { describe, it, expect } from "vitest";
import { generateRegion, generateNPC, WorldContext, FactionDef } from "..";

const FACTIONS_MOCK: FactionDef[] = [{ id: "f1", name: "Ledger", tier: 1, ethos: "Count", methods: ["audits"] }];

const CTX_MOCK: WorldContext = {
  seed: "test-context",
  epoch: "Inquisition",
  gravity: "Order",
  knownFactions: FACTIONS_MOCK,
};

describe("procedural generation", () => {
    it("generates region with expected fields", () => {
        const r = generateRegion(CTX_MOCK, 0);
        expect(r.id).toMatch(/^region_/);
        expect(r.travelCost.time).toBeGreaterThan(0);
        expect(r.symbols.length).toBeGreaterThan(0);
        expect(r.factionsPresent.length).toBeGreaterThan(0);
    });

    it("generates npc with expected fields", () => {
        const region = generateRegion(CTX_MOCK, 0);
        const ctxWithRegion: WorldContext = {
            ...CTX_MOCK,
            knownRegions: [{ id: region.id, name: region.name, biome: region.biome, climate: region.climate }]
        };
        const npc = generateNPC(ctxWithRegion, 0);
        expect(npc.id).toMatch(/^npc_/);
        expect(npc.disposition).toBeDefined();
        expect(npc.regionId).toBe(region.id);
    });

    it("generates deterministic regions", () => {
        const r1 = generateRegion(CTX_MOCK, 0);
        const r2 = generateRegion(CTX_MOCK, 0);
        expect(r1).toEqual(r2);
    });

    it("generates deterministic npcs", () => {
        const npc1 = generateNPC(CTX_MOCK, 0);
        const npc2 = generateNPC(CTX_MOCK, 0);
        expect(npc1).toEqual(npc2);
    });
});
