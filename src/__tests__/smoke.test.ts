// @ts-nocheck
import { initialRun } from "../startup/initialRun";

it("boots run state", () => {
  const s = initialRun();
  expect(s.identity.mask.wearing).toBe(true);
});
