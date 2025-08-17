/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardInstance, GameStateUpdate, BoardState, EventType, EncounterDef, EffectDef, EffectContext, EffectType, StatusType, Discipline, PlayerState, EventOption, Dispositions, PlayerMarks, MarkId, GameEventV1 } from '../core/types';
import { DeckManager } from './DeckManager';
import { generateNarrative } from './GeminiService';
import { computeMultiplier } from './AdvantageSystem';
import * as StatusSystem from './StatusSystem';
import { getMarkById } from './DataLoader';
import * as id from './identity';

/**
 * Applies a set of effects, disposition adjustments, and new marks to a player state.
 * @param effects An array of EffectDefs to apply.
 * @param dispositionAdjustments Optional character disposition adjustments.
 * @param marksToAdd Optional array of Mark IDs to add to the player.
 * @param playerState The current state of the player.
 * @returns A `GameStateUpdate` object with the results of the effects.
 */
export const applyNarrativeOutcome = (effects: EffectDef[], dispositionAdjustments: Partial<Dispositions> | undefined, marksToAdd: MarkId[] | undefined, playerState: PlayerState): GameStateUpdate => {
    const update: GameStateUpdate = {};
    let newPlayerState: PlayerState = { ...playerState }; // Create a mutable copy
    const resourceGains: { aggression?: number; wisdom?: number; cunning?: number } = {};

    for (const effect of effects) {
        switch (effect.type) {
            case EffectType.LOSE_HEALTH:
                if (effect.value) {
                    newPlayerState.currentHealth = Math.max(0, newPlayerState.currentHealth - effect.value);
                }
                break;
            
            case EffectType.GAIN_TEMP_RESOURCE:
                if (effect.params && effect.params.length === 2) {
                    const resourceType = effect.params[0] as 'aggression' | 'wisdom' | 'cunning';
                    const amount = parseInt(effect.params[1], 10);
                    if (resourceType && !isNaN(amount)) {
                        resourceGains[resourceType] = (resourceGains[resourceType] || 0) + amount;
                    }
                }
                break;
            
            case EffectType.ADD_MARK:
                if (effect.params && effect.params.length > 0) {
                    const marksFromEffect = effect.params as MarkId[];
                    marksToAdd = [...(marksToAdd || []), ...marksFromEffect];
                }
                break;

            // Note: Other effect types from narrative events could be handled here.
            default:
                console.warn(`Unhandled narrative effect type: ${effect.type}`);
                break;
        }
    }

    if (dispositionAdjustments) {
        for (const [key, value] of Object.entries(dispositionAdjustments)) {
            id.disp.bump(newPlayerState, key as any, value || 0);
        }
    }

    if (marksToAdd) {
        for (const markId of marksToAdd) {
            id.marks.addStack(newPlayerState, markId);
        }
    }

    update.playerState = newPlayerState;
    if (Object.keys(resourceGains).length > 0) {
        update.resources = resourceGains;
    }

    return update;
}

/**
 * Processes the entire lifecycle of a card being played, calculating all resulting
 * state changes and returning them in a single update object. This ensures that
 * all consequences of a card play are handled in a single, atomic update.
 *
 * @param card The card instance being played.
 * @param deckManager The player's deck manager instance.
 * @param boardState The current state of the entire game board.
 * @param encounter The current encounter definition for context.
 * @returns A promise that resolves to a `GameStateUpdate` object.
 */
export const processCardPlay = async (
    card: CardInstance,
    deckManager: DeckManager,
    boardState: BoardState,
    encounter: EncounterDef | null,
): Promise<GameStateUpdate> => {
    const update: GameStateUpdate = {};
    const events: GameEventV1[] = [];
    const currentEventType = boardState.enemies.length > 0 ? EventType.COMBAT : EventType.NARRATIVE;

    // Create mutable copies of state to modify within this function
    let newPlayerState = { ...boardState.playerState, statusEffects: [...boardState.playerState.statusEffects] };
    let newEnemies = boardState.enemies.map(e => ({...e, statusEffects: [...e.statusEffects]}));
    let cardsToDraw = 0;
    const resourceGains: { aggression?: number; wisdom?: number; cunning?: number } = {};

    // --- 1. Resolve all effects of the card ---
    for (const effect of card.def.effects) {
        if (effect.context.toString() !== 'ANY' && effect.context.toString() !== currentEventType.toString()) {
            continue;
        }

        switch (effect.type) {
            case 'DEAL_DAMAGE': {
                if (newEnemies.length > 0 && effect.value) {
                    const target = newEnemies.find(e => e.currentHealth > 0);
                    if (target) {
                        const advantageMultiplier = computeMultiplier(card.def.discipline, target.def.discipline);
                        const vulnerableMultiplier = StatusSystem.getStatusValue(target, StatusType.VULNERABLE) > 0 ? 1.5 : 1.0;
                        const strengthBonus = StatusSystem.getStatusValue(newPlayerState, StatusType.STRENGTH);
                        
                        const totalDamage = Math.round((effect.value + strengthBonus) * advantageMultiplier * vulnerableMultiplier);
                        
                        target.currentHealth = Math.max(0, target.currentHealth - totalDamage);
                        events.push({ v: 1, type: 'DAMAGE', payload: { targetId: target.instanceId, amount: totalDamage } });
                    }
                }
                break;
            }
      
            case 'GAIN_BLOCK': {
                if (effect.value) {
                    newPlayerState.block += effect.value;
                }
                break;
            }

            case 'APPLY_STATUS': {
                if (effect.params && effect.params.length >= 2) {
                    const targetType = effect.params[0]; // 'SELF' or 'TARGET'
                    const status = effect.params[1] as StatusType;
                    const duration = effect.params[2] ? parseInt(effect.params[2], 10) : (effect.value || 1);
                    
                    if (targetType === 'SELF') {
                        const oldStatus = newPlayerState.statusEffects.find(s => s.type === status);
                        newPlayerState = StatusSystem.applyStatus(newPlayerState, status, duration);
                        const newStatus = newPlayerState.statusEffects.find(s => s.type === status);
                        if (newStatus && (!oldStatus || newStatus.duration > oldStatus.duration)) {
                            events.push({ v: 1, type: 'STATUS_APPLY', payload: { targetId: 'PLAYER', statusType: status } });
                        }
                    } else if (targetType === 'TARGET') {
                        const target = newEnemies.find(e => e.currentHealth > 0);
                        if(target){
                            const targetIndex = newEnemies.findIndex(e => e.instanceId === target.instanceId);
                            if (targetIndex > -1) {
                                const oldStatus = target.statusEffects.find(s => s.type === status);
                                newEnemies[targetIndex] = StatusSystem.applyStatus(target, status, duration);
                                const newStatus = newEnemies[targetIndex].statusEffects.find(s => s.type === status);
                                if (newStatus && (!oldStatus || newStatus.duration > oldStatus.duration)) {
                                    events.push({ v: 1, type: 'STATUS_APPLY', payload: { targetId: target.instanceId, statusType: status } });
                                }
                            }
                        }
                    }
                }
                break;
            }

            case 'DRAW_CARDS': {
                if (effect.value) {
                    cardsToDraw += effect.value;
                }
                break;
            }
      
            case 'GAIN_TEMP_RESOURCE': {
                if (effect.params && effect.params.length === 2) {
                    const resourceType = effect.params[0] as 'aggression' | 'wisdom' | 'cunning';
                    const amount = parseInt(effect.params[1], 10);
                    if (resourceType && !isNaN(amount)) {
                        resourceGains[resourceType] = (resourceGains[resourceType] || 0) + amount;
                    }
                }
                break;
            }

            case 'TRIGGER_AI_NARRATIVE': {
                const enemyNames = boardState.enemies.map(e => e.def.name).join(', ') || 'no one';
                const context = encounter
                    ? `The current encounter is "${encounter.name}: ${encounter.description}". I am facing: ${enemyNames}.`
                    : 'I am in a tense situation.';

                const prompt = `
In a gritty, low-fantasy world, I'm a hero in the middle of a challenge.
I just played a card named "${card.def.name}".
My current situation: ${context}
Describe what happens next. Generate a short, flavorful outcome (2-3 sentences) that reflects the card's name and the situation. Be creative and dynamic.`;
                update.narrativeText = await generateNarrative(prompt);
                break;
            }

            default:
                console.warn(`Unhandled effect type: ${effect.type}`);
                break;
        }
    }

    // --- 2. Apply state changes to the update object ---
    update.playerState = newPlayerState;
    // Filter out any enemies that were defeated
    update.enemies = newEnemies.filter(e => e.currentHealth > 0);
    if (Object.keys(resourceGains).length > 0) {
        update.resources = resourceGains;
    }
    update.events = events;

    // --- 3. Update the deck state ---
    // First, discard the card that was played.
    deckManager.discard(card.instanceId);
    // Then, draw any cards queued up by card effects.
    if (cardsToDraw > 0) {
        deckManager.draw(cardsToDraw);
    }
    // Finally, get the resulting hand state for the UI update.
    update.hand = deckManager.getHand();

    return update;
};

/**
 * Processes the "Default Strike" action.
 * @param boardState The current state of the entire game board.
 * @returns A promise that resolves to a `GameStateUpdate` object.
 */
export const processDefaultAction = async (boardState: BoardState): Promise<GameStateUpdate> => {
    const update: GameStateUpdate = {};
    const events: GameEventV1[] = [];
    let newEnemies = boardState.enemies.map(e => ({...e}));

    const effect: EffectDef = {
        context: EffectContext.COMBAT,
        type: EffectType.DEAL_DAMAGE,
        value: 1,
    };

    if (newEnemies.length > 0 && effect.value) {
        const target = newEnemies.find(e => e.currentHealth > 0);
        if (target) {
            const advantageMultiplier = computeMultiplier(Discipline.NONE, target.def.discipline);
            const vulnerableMultiplier = StatusSystem.getStatusValue(target, StatusType.VULNERABLE) > 0 ? 1.5 : 1.0;
            const totalDamage = Math.round(effect.value * advantageMultiplier * vulnerableMultiplier);
            target.currentHealth = Math.max(0, target.currentHealth - totalDamage);
            events.push({ v: 1, type: 'DAMAGE', payload: { targetId: target.instanceId, amount: totalDamage } });
        }
    }

    update.enemies = newEnemies.filter(e => e.currentHealth > 0);
    update.playerState = boardState.playerState; // No change to player
    update.events = events;

    return update;
}
