/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Derives a deterministic seed string from multiple parts.
 * The game uses more complex hashing upstream; this is a simple concatenator.
 * @param parts An array of strings to join into a seed.
 * @returns A single seed string.
 */
export function deriveSeed(parts: string[]): string {
  return parts.join("|");
}
