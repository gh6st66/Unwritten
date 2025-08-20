

import { RunState, TimeState, Resources } from "./types";
import timeData from '../data/tables/time.js';

const MINUTES_PER_DAY = 1440;

export function advanceTime(state: RunState, minutes: number): RunState {
    const oldTime = state.time;
    const newTime = state.time + minutes;

    const oldHour = Math.floor(oldTime / 60);
    const newHour = Math.floor(newTime / 60);

    let resources = { ...state.resources };

    if (newHour > oldHour) {
        const hoursPassed = newHour - oldHour;
        resources.energy = Math.min(resources.maxEnergy, resources.energy + (timeData.regenPerHour.energy * hoursPassed));
        resources.clarity = Math.min(resources.maxClarity, resources.clarity + (timeData.regenPerHour.clarity * hoursPassed));
        resources.will = Math.min(resources.maxWill, resources.will + (timeData.regenPerHour.will * hoursPassed));
    }

    return {
        ...state,
        time: newTime,
        resources,
    };
}