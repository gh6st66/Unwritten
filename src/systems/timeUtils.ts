import { RunState, TimeCost } from "../core/types";
import { advanceTime } from "../core/time";

export const now = () => Date.now();

export function timeCostToMinutes(cost: TimeCost): number {
  switch (cost.unit) {
    case "minutes": return cost.amount;
    case "hours": return cost.amount * 60;
    case "days": return cost.amount * 24 * 60;
  }
}

export function applyTimeCost(s: RunState, cost: TimeCost): RunState {
  const minutes = timeCostToMinutes(cost);
  return advanceTime(s, minutes);
}