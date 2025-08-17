/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { EncounterDef, EnemyInstance, GameEventV1 } from '../core/types';
import EnemyDisplay from './EnemyDisplay';

interface EncounterViewProps {
  encounter: EncounterDef;
  enemies: EnemyInstance[];
  playerDialogue?: string;
  gameEvents: GameEventV1[];
  isLoading?: boolean;
}

const EncounterView: React.FC<EncounterViewProps> = ({ encounter, enemies, playerDialogue, gameEvents, isLoading }) => {
  return (
    <div className="encounter-view">
      <p className={`encounter-description ${isLoading ? 'loading' : ''}`}>{isLoading ? '' : encounter.description}</p>
      {playerDialogue && <p className="player-dialogue">"{playerDialogue}"</p>}
      <div className="enemy-container">
        {enemies.map(enemy => {
          const eventsForThisEnemy = gameEvents.filter(e => e.payload.targetId === enemy.instanceId);
          return <EnemyDisplay key={enemy.instanceId} enemy={enemy} gameEvents={eventsForThisEnemy} />
        })}
      </div>
    </div>
  );
};

export default EncounterView;