// @ts-nocheck
import { scoreIntent, resolveIntent } from "../IntentEngine";
import { INTENTS } from "../IntentRegistry";
import { RunState } from "../../../core/types";

const dummyRunState = {
  resources: { AGG: 3, WIS: 2, CUN: 2, AW: 1, AC: 1, WC: 1 },
  identity: { dispositions: {} }
} as RunState;


it("higher trait fitness yields higher chance", () => {
    const lowPlayer = { resources: { AGG: 5 }, identity: {} } as RunState;
    const low = scoreIntent("SNEAK", { runState: lowPlayer });
    const hi  = scoreIntent("SNEAK", { runState: dummyRunState });
    expect(hi.chance).toBeGreaterThan(low.chance);
});

it("claim pressure penalizes DEFY, boosts COMPLY", () => {
    const defyLow = scoreIntent("DEFY", { runState: dummyRunState, claimPressure: 0 });
    const defyHi  = scoreIntent("DEFY", { runState: dummyRunState, claimPressure: 1 });
    expect(defyHi.chance).toBeLessThan(defyLow.chance);

    const complyLow = scoreIntent("COMPLY", { runState: dummyRunState, claimPressure: 0 });
    const complyHi  = scoreIntent("COMPLY", { runState: dummyRunState, claimPressure: 1 });
    expect(complyHi.chance).toBeGreaterThan(complyLow.chance);
});

it("resolveIntent returns deterministic with stubbed RNG", () => {
    const rng = () => 0.0; // always succeed
    const out = resolveIntent("RECON", { runState: dummyRunState }, rng);
    expect(out.succeeded).toBe(true);
});
