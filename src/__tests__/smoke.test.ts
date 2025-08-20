

// @ts-nocheck
import { initialRun } from "../startup/initialRun";
import { encounters } from "../data/encounters";

it("boots run and lists encounters", () => {
  const s = initialRun(null);
  expect(Array.isArray(encounters)).toBe(true);
  expect(encounters.length).toBeGreaterThan(0);
  expect(s.mask.worn).toBe(true);
});