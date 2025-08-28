/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ParserEngine } from '../systems/parser/engine';
import { INTENTS, LEXICON, SCENES } from '../data/parser/content';
import { parserTestCases } from '../data/parser/tests';
import { Player, ResourceId } from '../game/types';
import { createInventory } from '../systems/inventory';

// Mock context required for the resolver to function outside the game loop.
const mockScene = SCENES['mountain_forge'];
const mockPlayer: Player = {
  id: "p1",
  name: "Tester",
  maskTag: 'HERALD',
  resources: { [ResourceId.TIME]: 6, [ResourceId.CLARITY]: 3, [ResourceId.CURRENCY]: 0 },
  marks: [],
  mask: null,
  unlockedLexemes: [],
  flags: new Set(),
  inventory: createInventory(),
};

/**
 * Runs the parser against a set of canonical test cases and logs the results.
 */
export function runParserTests() {
  const parser = new ParserEngine(INTENTS, LEXICON);
  let passed = 0;
  let failed = 0;

  console.log("Running parser validation tests...");

  parserTestCases.forEach((tc, idx) => {
    // We pass the full, raw input to the engine, which handles normalization internally.
    const result = parser.resolve(tc.input, mockScene, mockPlayer);

    const matchId = result.ok && result.intent_id === tc.expected.intentId;
    const matchType = result.ok && result.intentType === tc.expected.intentType;

    if (matchId && matchType) {
      console.log(`✅ [${idx}] "${tc.input}" → ${result.intent_id}/${result.intentType}`);
      passed++;
    } else {
      const got = result.ok ? `${result.intent_id}/${result.intentType}` : `FAIL: ${result.reason}`;
      const expected = `${tc.expected.intentId}/${tc.expected.intentType}`;
      console.error(
        `❌ [${idx}] "${tc.input}" → got ${got}, expected ${expected}`
      );
      failed++;
    }
  });

  console.log(`\nParser Test Results: ${passed} passed, ${failed} failed.`);
  
  // Exit with a non-zero code if any tests failed, for CI/CD environments.
  if (failed > 0) {
    // `process.exit` is not available in all JavaScript environments (e.g., the browser).
    // Throwing an error is a more universal way to signal a script failure.
    throw new Error(`Parser test run failed with ${failed} failures.`);
  }
}

// Execute the tests when the script is run directly.
runParserTests();