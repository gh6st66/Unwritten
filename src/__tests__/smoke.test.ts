import { it, expect } from 'vitest';
import { INITIAL } from '../game/stateMachine';

it("has a correct initial state", () => {
  const s = INITIAL;
  expect(s.phase).toBe('TITLE');
  expect(s.player.mask).toBe(null);
});
