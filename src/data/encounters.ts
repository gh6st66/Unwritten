import { EncounterDef, RunState } from "../core/types";
import { addMarkByLabel, adjustDisposition, bumpRegionProsperity, recordScar } from "../systems/mutation";
import { IntentKind } from "../systems/intent/IntentTypes";

// Basic conditions
const ifUnmasked = (s: RunState) => !s.identity.mask.wearing;

export const encounters: EncounterDef[] = [
  {
    id: "town_gate",
    title: "Gate of Ashvale",
    prose:
      "The watch captain’s eyes flick to your hands, then to your face. A murmur ripples along the wall. They know what you are.",
    options: [
      {
        id: "parley_mask_on",
        label: "Keep the mask on. Speak as a traveler.",
        timeCost: { amount: 2, unit: "hours" },
        intent: { kind: "PERSUADE" as IntentKind, successCap: 0.8 },
        onResolve: {
          PERSUADE_SUCCESS: [bumpRegionProsperity("ashvale", 2)],
          PERSUADE_FAIL: [bumpRegionProsperity("ashvale", -1)],
        },
      },
      {
        id: "reveal_and_resist",
        label: "Remove the mask and challenge the rumor you abandoned them.",
        requiresUnmasked: true,
        timeCost: { amount: 3, unit: "days" },
        intent: { kind: "DEFY" as IntentKind, riskDelta: 0.2 },
        resistClaimId: "ABANDONER",
        onResolve: {
            DEFY_SUCCESS: [bumpRegionProsperity("ashvale", 5)],
            DEFY_FAIL: [recordScar("ashvale:failed_defiance"), bumpRegionProsperity("ashvale", -5)],
        }
      },
      {
        id: "reveal_and_accept",
        label: "Remove the mask and accept the blame placed upon you.",
        requiresUnmasked: true,
        intent: { kind: "COMPLY" as IntentKind },
        acceptClaimId: "ABANDONER",
        onResolve: {
            COMPLY_SUCCESS: [recordScar("ashvale:stigma_abandoner")],
            COMPLY_FAIL: [recordScar("ashvale:stigma_abandoner")], // Failure or success, the scar is recorded
        }
      },
    ],
  },
  {
    id: "caravan_crisis",
    title: "The Stalled Caravan",
    prose:
      "Merchants argue in the dust. The road is blocked. Someone mentions the Inquisitors’ tithe doubles when 'the Unwritten' is near.",
    options: [
      {
        id: "work_the_road",
        label: "Help clear the road anonymously.",
        timeCost: { amount: 1, unit: "days" },
        effects: [bumpRegionProsperity("ashvale", 3)],
      },
      {
        id: "petition_inquisitors",
        label: "Reveal yourself and argue the tithe is unlawful.",
        requiresUnmasked: true,
        timeCost: { amount: 2, unit: "days" },
        effects: [
          (s) => {
            // Faction attitude shifts happen here in a fuller impl
            return s;
          },
        ],
      },
    ],
  },
];