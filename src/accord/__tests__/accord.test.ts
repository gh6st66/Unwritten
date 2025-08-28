/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { describe, it, expect } from 'vitest';
import { GameState } from '../../game/types';
import { applyDelta, evaluateCondition, handleIntent } from '../accord';
import { INITIAL } from '../../game/stateMachine';
import { EngineDelta, IntentCtx } from '../types';

describe('Accord System', () => {
  describe('evaluateCondition (DSL Interpreter)', () => {
    const mockState: GameState = {
      ...INITIAL,
      npcs: {
        ...INITIAL.npcs,
        'ELDER_ANAH': {
          ...INITIAL.npcs['ELDER_ANAH'],
          recognition: { trust: 25, fear: 10, awe: 0 },
        },
      },
    };

    it('should correctly evaluate a `>` condition that is true', () => {
      const condition = "npc('ELDER_ANAH').recognition.trust > 20";
      expect(evaluateCondition(condition, mockState)).toBe(true);
    });

    it('should correctly evaluate a `>` condition that is false', () => {
      const condition = "npc('ELDER_ANAH').recognition.trust > 30";
      expect(evaluateCondition(condition, mockState)).toBe(false);
    });

    it('should correctly evaluate a `<` condition that is true', () => {
      const condition = "npc('ELDER_ANAH').recognition.fear < 15";
      expect(evaluateCondition(condition, mockState)).toBe(true);
    });

    it('should return false for invalid syntax', () => {
      const condition = "npc('ELDER_ANAH').trust > 20"; // Invalid path
      expect(evaluateCondition(condition, mockState)).toBe(false);
    });

    it('should return false for non-existent NPC', () => {
      const condition = "npc('UNKNOWN_NPC').recognition.trust > 0";
      expect(evaluateCondition(condition, mockState)).toBe(false);
    });
  });

  describe('applyDelta', () => {
    it('should correctly apply a recognition delta', () => {
      const delta: EngineDelta = {
        recognition: [{ npcId: 'ELDER_ANAH', trust: 10, fear: -5 }],
      };
      const nextState = applyDelta(INITIAL, delta);
      expect(nextState.npcs['ELDER_ANAH'].recognition.trust).toBe(10);
      expect(nextState.npcs['ELDER_ANAH'].recognition.fear).toBe(-5);
    });

    it('should correctly apply an accord delta', () => {
      const delta: EngineDelta = {
        accord: { stability: -15 },
      };
      const nextState = applyDelta(INITIAL, delta);
      expect(nextState.accord.stability).toBe(-15);
    });

    it('should not mutate the original state', () => {
      const delta: EngineDelta = { accord: { stability: 10 } };
      applyDelta(INITIAL, delta);
      expect(INITIAL.accord.stability).toBe(0);
    });
  });

  describe('handleIntent', () => {
    it('should generate a delta for a known intent', () => {
        const ctx: IntentCtx = {
            intentId: 'OATH_SWEAR',
            actorId: 'p1',
            mask: 'HERALD',
            sceneId: 'test_scene',
            bindings: { object: 'ELDER_ANAH' }
        };
        const delta = handleIntent(ctx, INITIAL);
        expect(delta.recognition?.[0]?.trust).toBeGreaterThan(0);
        expect(delta.accord?.stability).toBeGreaterThan(0);
    });

    it('should return a default delta for an unknown intent', () => {
        const ctx: IntentCtx = {
            intentId: 'UNKNOWN_INTENT',
            actorId: 'p1',
            mask: 'HERALD',
            sceneId: 'test_scene',
            bindings: {}
        };
        const delta = handleIntent(ctx, INITIAL);
        expect(delta.lineId).toBe('ACTION_DEFAULT');
        expect(delta.recognition).toBeUndefined();
    });
  });
});
