import { RunState, LocationId } from "../core/types";
import { timeCostToMinutes } from "./timeUtils";
import { LOCATIONS } from "../data/locations";
import { advanceTime } from "../core/time";

export function travel(s: RunState, to: LocationId, willCost: number): { next: RunState, log: string } | { error: string } {
    const currentLocDef = LOCATIONS[s.locationId];
    if (!currentLocDef) return { error: "Current location is invalid." };

    const connection = currentLocDef.connections.find(c => c.to === to);
    if (!connection) return { error: "Invalid travel destination." };

    if ((s.resources.will ?? 0) < willCost) {
        return { error: "Not enough Will to travel." };
    }

    let next = { ...s };

    // 1. Apply costs
    next.resources = { ...next.resources, will: (next.resources.will ?? 0) - willCost };
    const minutes = timeCostToMinutes(connection.timeCost);
    next = advanceTime(next, minutes);

    // 2. Update location
    next.locationId = to;

    return { next, log: `You travel to ${LOCATIONS[to]?.name ?? to}.` };
}