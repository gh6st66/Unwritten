import { RunState, LocationId } from "../core/types";
import { advanceTime } from "../core/time";

export function travel(s: RunState, to: LocationId, willCost: number): { next: RunState, log: string } | { error: string } {
    const currentLocDef = s.world.regions.find(r => r.id === s.locationId);
    if (!currentLocDef) return { error: "Current location is invalid." };

    const connectionExists = currentLocDef.neighbors.includes(to);
    if (!connectionExists) return { error: "Invalid travel destination." };

    if ((s.resources.will ?? 0) < willCost) {
        return { error: "Not enough Will to travel." };
    }

    let next = { ...s };

    // 1. Apply costs
    next.resources = { ...next.resources, will: (next.resources.will ?? 0) - willCost };
    const minutes = currentLocDef.travelCost.time;
    next = advanceTime(next, minutes);

    // 2. Update location
    next.locationId = to;

    const destLocDef = s.world.regions.find(r => r.id === to);
    return { next, log: `You travel to ${destLocDef?.name ?? to}.` };
}