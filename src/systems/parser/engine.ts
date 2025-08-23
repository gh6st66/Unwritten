/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Player } from '../../game/types';
import { buildAliasMap, normalize } from './normalize';
import { parse } from './parse';
import { resolve as resolveIntent } from './resolve';
import type { Intent, Lexicon, ResolveResult, SceneIndex } from './types';

/**
 * The main engine for parsing and resolving player commands.
 * This class orchestrates the entire pipeline from raw string to a resolved intent or a graceful failure.
 */
export class ParserEngine {
  private intents: Intent[];
  private lexicon: Lexicon;
  private aliasMap: Map<string, string>;

  constructor(intents: Intent[], lexicon: Lexicon) {
    this.intents = intents;
    this.lexicon = lexicon;
    // Pre-build the alias map for faster normalization.
    this.aliasMap = buildAliasMap(lexicon);
  }

  /**
   * Processes a raw player command within a given scene context.
   * @param rawInput The raw string from the player.
   * @param scene The current scene's data.
   * @param player The current player state.
   * @returns A ResolveResult, which is either a successfully resolved action or a structured failure.
   */
  public resolve(rawInput: string, scene: SceneIndex, player: Player): ResolveResult {
    // 1. Normalize the input (lowercase, trim, handle aliases).
    const normalized = normalize(rawInput, this.aliasMap);

    // 2. Parse the normalized string into a structural representation.
    const parsed = parse(normalized);
    if (!parsed.verb && Object.keys(parsed.slots).length === 0) {
      return {
        ok: false,
        reason: 'empty_input',
        message: 'What do you want to do?',
      };
    }

    // 3. Resolve the parsed structure into a specific intent and bindings.
    const result = resolveIntent(parsed, scene, this.intents, this.lexicon, player);

    return result;
  }
}
