// @ts-nocheck
import { generateNarrative } from "../generate";
import { PCState, WorldCtx } from "../../core/types";

test("deterministic by seed", () => {
  const pc: PCState = { marks: { Betrayer: 2 }, disp: { Cunning: 4 }, echoes: [] };
  const w: WorldCtx = { scene: "Gate", npcRole: "WatchCaptain", tension: 2, recognition: "Known", seed: 1234 };
  const a = generateNarrative(pc, w);
  const b = generateNarrative(pc, { ...w });
  expect(a).toBe(b);
});

test("internal thought responds to dominant mark", () => {
  const pc: PCState = { marks: { Savior: 3 }, disp: {}, echoes: [] };
  const w: WorldCtx = { scene: "Gate", npcRole: "WatchCaptain", tension: 2, recognition: "Known", seed: 55 };
  const out = generateNarrative(pc, w);
  expect(out).toMatch(/\[.*\]/);
});
