import { describe, it, expect } from "vitest";
import { splitEffects, canApply, apply } from "../resourceEngine";
import { ActionOutcome, Effect, ResourceId, Resources } from "../../game/types";

const { TIME, CLARITY, CURRENCY } = ResourceId;

describe("Resource Engine", () => {
  const pool: Resources = { [TIME]: 5, [CLARITY]: 5, [CURRENCY]: 5 };

  describe("splitEffects", () => {
    it("correctly separates costs and gains", () => {
      const effects: Effect[] = [
        { resource: TIME, delta: -1 },
        { resource: CLARITY, delta: 2 },
        { resource: CURRENCY, delta: 0 },
      ];
      const { costs, gains } = splitEffects(effects);
      expect(costs).toEqual([{ resource: TIME, delta: -1 }]);
      expect(gains).toEqual([{ resource: CLARITY, delta: 2 }]);
    });
  });

  describe("canApply", () => {
    it("returns true for affordable actions", () => {
      const outcome: ActionOutcome = {
        id: "a1", label: "Test",
        effects: [{ resource: TIME, delta: -5 }],
      };
      expect(canApply(pool, outcome)).toBe(true);
    });

    it("returns false for unaffordable actions", () => {
      const outcome: ActionOutcome = {
        id: "a1", label: "Test",
        effects: [{ resource: TIME, delta: -6 }],
      };
      expect(canApply(pool, outcome)).toBe(false);
    });

    it("returns true if there are no costs", () => {
      const outcome: ActionOutcome = {
        id: "a1", label: "Test",
        effects: [{ resource: CLARITY, delta: 10 }],
      };
      expect(canApply(pool, outcome)).toBe(true);
    });
  });

  describe("apply", () => {
    it("correctly calculates the new resource pool", () => {
      const outcome: ActionOutcome = {
        id: "a1", label: "Test",
        effects: [
          { resource: TIME, delta: -2 },
          { resource: CLARITY, delta: 3 },
          { resource: CURRENCY, delta: -5 },
        ],
      };
      const newPool = apply(pool, outcome);
      expect(newPool).toEqual({ [TIME]: 3, [CLARITY]: 8, [CURRENCY]: 0 });
    });

    it("does not let resources drop below zero", () => {
      const outcome: ActionOutcome = {
        id: "a1", label: "Test",
        effects: [{ resource: TIME, delta: -100 }],
      };
      const newPool = apply(pool, outcome);
      expect(newPool[TIME]).toBe(0);
    });
  });
});