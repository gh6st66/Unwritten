/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FactionDef } from '../core/types';

export const factionData: FactionDef[] = [
    {
      id: "FACTION_MERCHANTS_GUILD", name: "The Merchant's Guild",
      unlocks: [
        {threshold: 100, type: "ADD_CARD_TO_POOL", value: "MERCHANT_CARD_01"},
        {threshold: 500, type: "UNLOCK_ENCOUNTER", value: "MERCHANT_QUEST_01"}
      ]
    }
  ];
