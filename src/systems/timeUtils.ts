import { RunState, TimeCost } from "../core/types";

export const now = () => Date.now();

export function ms(unit: "hours" | "days" | "weeks", amount: number) {
  const H = 3600_000;
  if (unit === "hours") return amount * H;
  if (unit === "days") return amount * 24 * H;
  return amount * 7 * 24 * H;
}

export function applyTimeCost(s: RunState, cost: TimeCost): RunState {
  const delta = ms(cost.unit, cost.amount);
  const time = s.world.time + delta;
  return { ...s, world: { ...s.world, time } };
}

export function refillTick(s: RunState, at: number): RunState {
  const dt = Math.max(0, at - s.world.time);
  if (dt === 0) return s;
  const regenPerHour = { energy: 3, clarity: 1, will: 1 };
  const hours = dt / 3600_000;

  const energy = Math.min(s.resources.maxEnergy, s.resources.energy + regenPerHour.energy * hours);
  const clarity = Math.min(s.resources.maxClarity, s.resources.clarity + regenPerHour.clarity * hours);
  const will = Math.min(s.resources.maxWill, s.resources.will + regenPerHour.will * hours);

  return {
    ...s,
    world: { ...s.world, time: at },
    resources: {
      ...s.resources,
      energy,
      clarity,
      will,
      nextEnergyAt: at + 3600_000 / regenPerHour.energy,
      nextClarityAt: at + 3600_000 / regenPerHour.clarity,
      nextWillAt: at + 3600_000 / regenPerHour.will,
    },
  };
}
