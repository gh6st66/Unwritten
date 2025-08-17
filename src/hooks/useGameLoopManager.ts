/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useMemo } from 'react';
import { Phase, EnemyInstance, EncounterDef, GameStatus, BoardState, Discipline, PlayerState, StatusType, PlayerBonusType, GameEventV1 } from '../core/types';
import { getEnemyById } from '../systems/DataLoader';
import { DeckManager } from '../systems/DeckManager';
import { computeMultiplier } from '../systems/AdvantageSystem';
import * as StatusSystem from '../systems/StatusSystem';
import * as TurnHooks from '../systems/TurnHooks';

interface UseGameLoopManagerProps {
  onCombatEnd: (result: GameStatus.VICTORY | GameStatus.DEFEAT) => void;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useGameLoopManager = ({ onCombatEnd }: UseGameLoopManagerProps) => {
  const [encounter, setEncounter] = useState<EncounterDef | null>(null);

  const determineEnemyIntents = useCallback((currentEnemies: EnemyInstance[]): EnemyInstance[] => {
    return currentEnemies.map(enemy => {
      if (enemy.def.actions.length > 0) {
        const action = enemy.def.actions[Math.floor(Math.random() * enemy.def.actions.length)];
        return { ...enemy, currentIntent: { action, target: 'PLAYER' } };
      }
      return enemy;
    });
  }, []);
  
  const initialize = useCallback((encounterDef: EncounterDef, deckManager: DeckManager, playerState: PlayerState) => {
    const initialEncounter = encounterDef;
    let initialBoardState: BoardState = {
      playerState: { ...playerState, block: 0, statusEffects: [] }, // Reset transient combat state
      enemies: [],
      hand: [],
      phase: Phase.PLAYER_START,
      turn: 1,
    }

    if (initialEncounter) {
        setEncounter(initialEncounter);
        const enemyInstances = (initialEncounter.enemies || []).map((enemyId): EnemyInstance | null => {
            const enemyDef = getEnemyById(enemyId);
            if (enemyDef) {
                return {
                    def: enemyDef,
                    instanceId: crypto.randomUUID(),
                    currentHealth: enemyDef.maxHealth,
                    currentIntent: null,
                    statusEffects: [],
                };
            }
            return null;
        }).filter((e): e is EnemyInstance => e !== null);

        initialBoardState.enemies = enemyInstances;
    }

    // Run the first phase transition to draw cards and set intents
    initialBoardState = TurnHooks.onPlayerStart(initialBoardState, deckManager);
    initialBoardState.enemies = determineEnemyIntents(initialBoardState.enemies);
    initialBoardState.phase = Phase.PLAYER_MAIN;

    return { initialBoardState, encounter: initialEncounter };
  }, [determineEnemyIntents]);


  const advancePhase = useCallback(async (
    currentBoardState: BoardState,
    deckManager: DeckManager
  ): Promise<{ boardState: BoardState, events: GameEventV1[] }> => {
    let nextState = {...currentBoardState};
    const events: GameEventV1[] = [];

    if (nextState.phase === Phase.PLAYER_MAIN) {
        // --- PLAYER_END ---
        nextState = TurnHooks.onPlayerEnd(nextState, deckManager);
        
        // --- ENEMY_START ---
        // Intents are already set at the start of the player's turn.
        // This is where you might trigger enemy start-of-turn statuses.
        nextState.phase = Phase.ENEMY_START;
        await delay(500);
        
        // --- ENEMY_MAIN ---
        nextState.phase = Phase.ENEMY_MAIN;
        let totalDamage = 0;
        
        const playerStateBeforeDamage = { ...nextState.playerState };

        nextState.enemies.forEach(enemy => {
            if (enemy.currentIntent?.action.type === 'ATTACK' && enemy.currentIntent.action.value) {
                const advantageMultiplier = computeMultiplier(enemy.def.discipline, Discipline.NONE);
                const strengthBonus = StatusSystem.getStatusValue(enemy, StatusType.STRENGTH);
                const vulnerableMultiplier = StatusSystem.getStatusValue(nextState.playerState, StatusType.VULNERABLE) > 0 ? 1.5 : 1;

                totalDamage += Math.round((enemy.currentIntent.action.value + strengthBonus) * advantageMultiplier * vulnerableMultiplier);
            }
            if (enemy.currentIntent?.action.type === 'DEBUFF') {
                const statusToApply = StatusType.VULNERABLE; // Placeholder for more complex debuffs
                const duration = 1;

                const oldStatus = nextState.playerState.statusEffects.find(s => s.type === statusToApply);
                nextState.playerState = StatusSystem.applyStatus(nextState.playerState, statusToApply, duration);
                const newStatus = nextState.playerState.statusEffects.find(s => s.type === statusToApply);

                if (newStatus && (!oldStatus || newStatus.duration > oldStatus.duration)) {
                    events.push({ v: 1, type: 'STATUS_APPLY', payload: { targetId: 'PLAYER', statusType: statusToApply } });
                }
            }
        });

        const blockAbsorbed = Math.min(playerStateBeforeDamage.block, totalDamage);
        const damageAfterBlock = totalDamage - blockAbsorbed;
        const newHealth = Math.max(0, playerStateBeforeDamage.currentHealth - damageAfterBlock);

        if (blockAbsorbed > 0) {
            events.push({ v: 1, type: 'BLOCK_SHATTER', payload: { targetId: 'PLAYER', direction: { x: 0, y: -1 }, amount: blockAbsorbed } });
        }

        if (damageAfterBlock > 0) {
            events.push({ v: 1, type: 'DAMAGE', payload: { targetId: 'PLAYER', amount: damageAfterBlock } });
        }

        nextState.playerState = { ...nextState.playerState, currentHealth: newHealth };

        if (newHealth <= 0) {
            onCombatEnd(GameStatus.DEFEAT);
            return {
                boardState: {
                    ...nextState,
                    playerState: { ...nextState.playerState, currentHealth: 0, block: 0 },
                    hand: [],
                },
                events,
            };
        }
        
        await delay(1000);
        
        // --- ENEMY_END ---
        nextState.phase = Phase.ENEMY_END;
        nextState.enemies = nextState.enemies.map(e => StatusSystem.processTurnEndEffects(e));
        await delay(500);

        // --- PLAYER_START (New Turn) ---
        nextState.turn += 1;
        nextState = TurnHooks.onPlayerStart(nextState, deckManager);
        nextState.enemies = determineEnemyIntents(nextState.enemies);
        nextState.phase = Phase.PLAYER_MAIN;

        return { boardState: nextState, events };
    }

    return { boardState: currentBoardState, events };
  }, [onCombatEnd, determineEnemyIntents]);

  return useMemo(() => ({
    encounter,
    initialize,
    advancePhase,
  }), [encounter, initialize, advancePhase]);
};
