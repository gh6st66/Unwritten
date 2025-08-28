/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { describe, it, expect } from 'vitest';
import { updateOmenWeights } from '../omen';
import { INITIAL_OMEN_WEIGHTS } from '../../data/omen/initial';
import { OmenWeights } from '../types';

describe('Omen System', () => {
  describe('updateOmenWeights', () => {
    it('should increase the chosen tag value after a CHOICE action', () => {
      const nextWeights = updateOmenWeights(INITIAL_OMEN_WEIGHTS, { type: 'CHOICE', tag: 'embrace' });
      expect(nextWeights.values.embrace).toBeGreaterThan(INITIAL_OMEN_WEIGHTS.values.embrace);
      expect(nextWeights.values.resist).toBeLessThan(INITIAL_OMEN_WEIGHTS.values.resist);
    });

    it('should correctly normalize values to sum to 1', () => {
      const nextWeights = updateOmenWeights(INITIAL_OMEN_WEIGHTS, { type: 'CHOICE', tag: 'embrace' });
      const sum = nextWeights.values.embrace + nextWeights.values.resist + nextWeights.values.mixed;
      expect(sum).toBeCloseTo(1.0);
    });

    it('should apply decay to all values', () => {
        // First, push a value way up
        const choiceWeights = updateOmenWeights(INITIAL_OMEN_WEIGHTS, { type: 'CHOICE', tag: 'embrace', weight: 0.4 });
        expect(choiceWeights.values.embrace).toBeGreaterThan(0.8);
        
        // Then, apply a neutral decay action (simulated by a miss)
        const decayedWeights = updateOmenWeights(choiceWeights, { type: 'MISS', winningTag: 'mixed' });
        
        // The high value should decay towards 0.5
        expect(decayedWeights.values.embrace).toBeLessThan(choiceWeights.values.embrace);
        expect(decayedWeights.values.embrace).toBeGreaterThan(0.5);
    });

    it('should trigger the pity system after enough misses', () => {
        let weights: OmenWeights = { ...INITIAL_OMEN_WEIGHTS };
        const pityRule = weights.pity?.resist;
        expect(pityRule).toBeDefined();

        // The floor for 'resist' starts low
        expect(weights.floors.resist).toBe(0.05);

        // Simulate N-1 misses for the 'resist' tag
        for(let i=0; i < pityRule!.misses - 1; i++) {
            weights = updateOmenWeights(weights, {type: 'MISS', winningTag: 'embrace'});
        }
        
        // The floor should not have changed yet
        expect(weights.floors.resist).toBe(0.05);
        expect(weights.missCounters.resist).toBe(pityRule!.misses - 1);
        
        // The final miss that triggers pity
        weights = updateOmenWeights(weights, {type: 'MISS', winningTag: 'embrace'});

        // The floor should now be boosted
        expect(weights.floors.resist).toBe(0.05 + pityRule!.floorBoost);
        // The miss counter should be reset
        expect(weights.missCounters.resist).toBe(0);
    });
  });
});
