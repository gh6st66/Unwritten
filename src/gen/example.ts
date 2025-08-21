import { generateRegion } from "./region";
import { generateNPC } from "./npc";
import { WorldContext, FactionDef } from "./types";

function runExample() {
    console.log("--- Running Procedural Generation Example ---");

    const factions: FactionDef[] = [
        { id: "f_guild", name: "Merchant's Guild", tier: 2, ethos: "Profit", methods: ["trade", "contracts"] },
        { id: "f_watch", name: "City Watch", tier: 2, ethos: "Order", methods: ["patrols", "investigation"] },
    ];

    const worldCtx: WorldContext = {
        seed: "my-test-seed-123",
        epoch: "The Gilded Age",
        gravity: "Commerce",
        knownFactions: factions,
    };

    console.log("Generating Regions...");
    const regions = Array.from({ length: 2 }, (_, i) => generateRegion(worldCtx, i));
    console.log(JSON.stringify(regions, null, 2));
    
    const worldCtxWithRegions: WorldContext = {
        ...worldCtx,
        knownRegions: regions.map(r => ({id: r.id, name: r.name, biome: r.biome, climate: r.climate}))
    };

    console.log("\nGenerating NPCs...");
    const npcs = Array.from({ length: 4 }, (_, i) => generateNPC(worldCtxWithRegions, i));
    console.log(JSON.stringify(npcs, null, 2));

    console.log("--- Example Complete ---");
}

// To run this, you could import and call it from a debug component or a test file.
// runExample();
