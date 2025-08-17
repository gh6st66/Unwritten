/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardInstance, CardDef } from '../core/types';
import { getCardById } from './DataLoader';

/**
 * Manages the state of the player's deck, including draw, discard, and hand piles.
 * This class uses immutable patterns to ensure predictable state updates in React.
 */
export class DeckManager {
    private drawPile: CardInstance[] = [];
    private hand: CardInstance[] = [];
    private discardPile: CardInstance[] = [];

    constructor(cardIds: string[]) {
        const initialDeck = cardIds.map(id => {
            const def = getCardById(id);
            if (!def) {
                console.error(`Card with id "${id}" not found!`);
                return null;
            }
            return this.createCardInstance(def);
        }).filter((instance): instance is CardInstance => instance !== null);

        this.drawPile = this.shuffle([...initialDeck]);
    }

    private createCardInstance(def: CardDef): CardInstance {
        return {
            def,
            instanceId: crypto.randomUUID(),
        };
    }

    // Fisher-Yates shuffle algorithm that returns a new array
    private shuffle(array: CardInstance[]): CardInstance[] {
        const shuffled = [...array];
        let currentIndex = shuffled.length;
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }
        return shuffled;
    }

    private reshuffle(): void {
        if (this.discardPile.length === 0) return;
        this.drawPile = this.shuffle([...this.discardPile]);
        this.discardPile = [];
    }

    // --- Public API ---

    public getHand = (): CardInstance[] => this.hand;
    public getDrawPile = (): CardInstance[] => this.drawPile;
    public getDiscardPile = (): CardInstance[] => this.discardPile;

    /**
     * Draws a specified number of cards. This method mutates the internal state
     * of the manager and does not return the drawn cards directly. Call getHand()
     * afterwards to get the updated hand.
     * @param amount The number of cards to draw.
     */
    public draw(amount: number): void {
        const newHand = [...this.hand];
        let currentDrawPile = [...this.drawPile];

        for (let i = 0; i < amount; i++) {
            if (currentDrawPile.length === 0) {
                if (this.discardPile.length === 0) break; // No cards left anywhere
                currentDrawPile = this.shuffle([...this.discardPile]);
                this.discardPile = [];
            }
            
            const nextCard = currentDrawPile.pop();
            if (nextCard) {
                newHand.push(nextCard);
            }
        }
        this.drawPile = currentDrawPile;
        this.hand = newHand;
    }

    /**
     * Discards a specific card from the hand by its instanceId.
     * @param instanceId The unique ID of the card instance to discard.
     */
    public discard(instanceId: string): void {
        const cardIndex = this.hand.findIndex(c => c.instanceId === instanceId);
        if (cardIndex >= 0) {
            const cardToDiscard = this.hand[cardIndex];
            // Create new arrays, ensuring immutability
            this.hand = [...this.hand.slice(0, cardIndex), ...this.hand.slice(cardIndex + 1)];
            this.discardPile = [...this.discardPile, cardToDiscard];
        }
    }

    /**
     * Discards the entire hand.
     */
    public discardHand(): void {
        if (this.hand.length === 0) return;
        this.discardPile = [...this.discardPile, ...this.hand];
        this.hand = [];
    }
}