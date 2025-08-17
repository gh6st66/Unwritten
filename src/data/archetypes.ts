/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ArchetypeDef, PlayerBonusType } from '../core/types';

export const archetypeData: ArchetypeDef[] = [
  {
    id: 'brawler',
    name: 'The Brawler',
    description: 'A hardened warrior who solves problems with brute force. Starts with higher health.',
    bonuses: [
      { type: PlayerBonusType.MAX_HEALTH, value: 10, description: '+10 Max Health' }
    ],
    startingDeck: [
      'AGG_001', 'AGG_001', 'AGG_001', 'AGG_001', 
      'AGG_002', 'AGG_002', 'AGG_002', 
      'WIS_001',
      'CUN_001', 'CUN_001',
      'TACTICS_001',
    ],
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'A keen mind who outwits foes through careful planning. Begins each combat with extra resources.',
    bonuses: [
      { type: PlayerBonusType.START_COMBAT_WISDOM, value: 1, description: 'Start each combat with 1 Wisdom.' }
    ],
    startingDeck: [
      'AGG_001', 'AGG_001',
      'AGG_002',
      'WIS_001', 'WIS_001', 'WIS_001', 'WIS_001',
      'WIS_003',
      'CUN_002', 'CUN_002',
      'TACTICS_001',
    ],
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    description: 'A swift rogue who relies on speed and misdirection. Excels at drawing cards early.',
    bonuses: [
      { type: PlayerBonusType.FIRST_TURN_DRAW, value: 1, description: 'Draw 1 extra card on the first turn of each combat.' }
    ],
    startingDeck: [
        'AGG_001', 'AGG_001',
        'AGG_002',
        'WIS_001', 'WIS_001',
        'CUN_001', 'CUN_001', 'CUN_001', 'CUN_001',
        'CUN_002',
        'GUILE_001',
    ],
  },
];