/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BoardState, PlayerState, PlayerBonusType } from '../core/types';
import { DeckManager } from './DeckManager';
import * as StatusSystem from './StatusSystem';

const HAND_SIZE = 5;

/**
 * Processes all state changes that occur at the beginning of the player's turn.
 * OOO: reset block -> draw cards -> process start-of-turn statuses
 * @param boardState The current board state.
 * @param deckManager The deck manager instance.
 * @returns The updated BoardState.
 */
export const onPlayerStart = (boardState: BoardState, deckManager: DeckManager): BoardState => {
    let newPlayerState = { ...boardState.playerState };

    // 1. Reset block
    newPlayerState.block = 0;

    // 2. Draw cards up to hand size
    let cardsToDraw = Math.max(0, HAND_SIZE - boardState.hand.length);

    if (boardState.turn === 1) {
        const drawBonus = boardState.playerState.bonuses?.find(b => b.type === PlayerBonusType.FIRST_TURN_DRAW);
        if (drawBonus) {
            cardsToDraw += drawBonus.value;
        }
    }

    deckManager.draw(cardsToDraw);
    const newHand = deckManager.getHand();
    
    // 3. Process start-of-turn statuses (if any)
    // newPlayerState = StatusSystem.processStartOfTurn(newPlayerState);

    return {
        ...boardState,
        playerState: newPlayerState,
        hand: newHand,
    };
};

/**
 * Processes all state changes that occur at the end of the player's turn.
 * OOO: discard hand -> tick status durations
 * @param boardState The current board state.
 * @param deckManager The deck manager instance.
 * @returns The updated BoardState.
 */
export const onPlayerEnd = (boardState: BoardState, deckManager: DeckManager): BoardState => {
    // 1. Discard hand
    deckManager.discardHand();
    const newHand = deckManager.getHand();

    // 2. Tick player status durations
    const playerAfterEffects = StatusSystem.processTurnEndEffects(boardState.playerState);
    
    return {
        ...boardState,
        playerState: playerAfterEffects,
        hand: newHand,
    };
};