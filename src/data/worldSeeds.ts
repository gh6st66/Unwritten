/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { WorldSeed, ResourceId } from "../game/types";

export const worldSeeds: WorldSeed[] = [
  {
    id: "seed_debt",
    title: "A Debt Unpaid",
    description: "The run begins with a heavy obligation, either material or spiritual. Themes of service, consequence, and impossible choices will be common.",
    tags: ["economic", "obligation", "intrigue"],
    initialPlayerMarkId: "indebted",
    resourceModifier: { [ResourceId.CURRENCY]: -10 },
    claimBias: ["betray", "forsake"],
  },
  {
    id: "seed_heresy",
    title: "A Whispered Heresy",
    description: "A forbidden truth has been uncovered. The run will involve hiding knowledge, seeking out hidden allies, and confronting dogmatic authority.",
    tags: ["secrecy", "dogma", "rebellion"],
    claimBias: ["reveal_secret", "ignite"],
  },
  {
    id: "seed_stranger",
    title: "An Unexpected Arrival",
    description: "A stranger's appearance has destabilized the region. Themes of suspicion, opportunity, and the impact of outsiders will shape the story.",
    tags: ["social", "intrigue", "change"],
    claimBias: ["betray", "ignite"],
  },
  {
    id: "seed_omen",
    title: "A Terrible Omen",
    description: "The heavens have declared a dark fate for this land. The run will be a struggle against prophecy, despair, and the opportunistic chaos that follows.",
    tags: ["supernatural", "fate", "survival"],
    claimBias: ["forsake"],
  },
  {
    id: "seed_truce",
    title: "A Fragile Truce",
    description: "Old rivals have agreed to a ceasefire, but tensions simmer beneath the surface. The run will involve navigating political intrigue, betrayal, and the delicate balance of power.",
    tags: ["political", "intrigue", "betrayal"],
    claimBias: ["betray", "reveal_secret"],
  }
];