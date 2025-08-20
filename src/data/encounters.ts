import { EncounterDef, RunState, MarkId } from "../core/types";
import { addMarkByLabel, adjustDisposition, bumpRegionProsperity, recordScar } from "../systems/mutation";
import { IntentKind } from "../systems/intent/IntentTypes";
import { hasMark, hasScar, notHasScar } from "../core/conditions";

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
  // New chain for OATHBREAKER mark
  {
    id: "elders_request",
    title: "The Elder's Request",
    prose: "An elder of a secluded community, hearing of your passage, asks you to swear an oath: protect a sacred grove from encroaching woodcutters until the next solstice. They offer a simple charm as payment.",
    appearsIf: [notHasScar("elder_promise_made")], // only appears once
    options: [
      {
        id: "accept_oath",
        label: "Swear the oath. Your word is your bond.",
        intent: { kind: "ALTRUIST" as IntentKind },
        onResolve: {
          ALTRUIST_SUCCESS: [recordScar("elder_promise_made")],
        },
      },
      {
        id: "refuse_oath",
        label: "Refuse. You have your own path to walk.",
        intent: { kind: "DEFLECT" as IntentKind },
        onResolve: {
            // No scar recorded, this chain ends here for this run.
        },
      },
    ],
  },
  {
    id: "promise_comes_due",
    title: "The Promise Comes Due",
    prose: "Weeks later, you find the woodcutters at the edge of the sacred grove. They are desperate, claiming their families will starve without the timber. They offer you a share of their profits if you look the other way.",
    appearsIf: [hasScar("elder_promise_made"), notHasScar("promise_resolved")],
    options: [
      {
        id: "break_promise",
        label: "Accept their offer and break your oath. Survival comes first.",
        intent: { kind: "OPPORTUNIST" as IntentKind },
        acceptClaimId: "OATHBREAKER",
        onResolve: {
          OPPORTUNIST_SUCCESS: [recordScar("promise_resolved")],
        },
      },
      {
        id: "keep_promise",
        label: "Uphold your oath. Drive the woodcutters away.",
        intent: { kind: "CONFRONT" as IntentKind, riskDelta: 0.1 },
        resistClaimId: "OATHBREAKER",
        onResolve: {
          CONFRONT_SUCCESS: [recordScar("promise_resolved")],
        },
      },
    ],
  },
  {
    id: "chance_for_redemption",
    title: "A Chance for Redemption",
    prose: "You encounter a lone Inquisitor, wounded and cornered by beasts. They recognize you, the Oathbreaker. 'My life is forfeit,' they rasp, 'but my missive must reach the capital. Swear you will deliver it, and my order may see you in a new light.'",
    appearsIf: [hasMark("OATHBREAKER")],
    oncePerRun: true,
    options: [
      {
        id: "accept_redemption_oath",
        label: "Take the missive and swear to see it delivered.",
        timeCost: { amount: 5, unit: "days" },
        intent: { kind: "SACRIFICE" as IntentKind },
        invertsMarkId: "OATHBREAKER",
        onResolve: {
          SACRIFICE_SUCCESS: [adjustDisposition("HONOR", 2)],
          SACRIFICE_FAIL: [adjustDisposition("HONOR", -1)],
        }
      },
      {
        id: "ignore_plea",
        label: "Leave the Inquisitor to their fate. Their kind are no friends of yours.",
        intent: { kind: "DEFLECT" as IntentKind },
      }
    ]
  }
];