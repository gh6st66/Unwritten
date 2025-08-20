import { RunState } from "../core/types";
import { clamp } from "./math";
import { advanceTime } from "../core/time";

export type RestOutcome = {
    kind: "rested" | "recognized";
    log: string;
}

export function rest(s: RunState, hours: number): { next: RunState, outcome: RestOutcome[] } {
    let next = { ...s };
    const outcomes: RestOutcome[] = [];

    // 1. Advance time and restore resources (handled by advanceTime)
    next = advanceTime(next, hours * 60);
    
    outcomes.push({ kind: "rested", log: `You rest for ${hours} hours, restoring your faculties.` });

    // 2. Recognition Risk
    const regionId = next.locationId.split(":")[0] ?? "ashvale";
    const region = next.regions[regionId];
    if (region) {
        const recognitionBase = (next.mask.worn ? 1 : 10) + Math.max(0, region.notoriety) / 10;
        const recognitionChance = recognitionBase * (hours / 8); // More hours, more risk
        
        if (Math.random() * 100 < recognitionChance) {
            const nextRegions = {...next.regions};
            nextRegions[regionId] = {...region, notoriety: clamp(region.notoriety + 2, -100, 100)};
            next.regions = nextRegions;
            outcomes.push({ kind: "recognized", log: "Your rest was disturbed. You feel watched." });
        }
    }

    return { next, outcome: outcomes };
}