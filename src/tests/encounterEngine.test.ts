import { describe, it, expect } from "vitest";
import { demoSuggestion } from "../systems/encounters/EncounterEngine";
import { ENCOUNTER_SCHEMAS } from "../data/encounterSchemas";
import { NPCS_SAMPLE } from "../data/npcs.sample";
import { RunState } from "../systems/encounters/types";

describe("EncounterEngine", () => {
  it("produces deterministic suggestion for same seed/day", () => {
    const run: RunState = {
      seed: "run_abc",
      day: 3,
      playerMarks: ["upright"],
      region: "region_port",
      exposedFactions: ["faction_guild", "faction_watch"],
      notoriety: 25,
    };
    const e1 = demoSuggestion(run, ENCOUNTER_SCHEMAS, NPCS_SAMPLE)!;
    const e2 = demoSuggestion(run, ENCOUNTER_SCHEMAS, NPCS_SAMPLE)!;
    expect(e1).toBeDefined();
    expect(e2).toBeDefined();
    expect(e1.schemaId).toEqual(e2.schemaId);
    expect(e1.roles.instigator).toEqual(e2.roles.instigator);
  });
});
