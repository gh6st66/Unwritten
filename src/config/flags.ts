/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Centralized feature flags to enable/disable game systems.
// This allows for clean quarantine of experimental or deprecated features.

export const FLAGS = {
  /** Enables the glossary view, accessible from the main menu. */
  glossary: false,

  /** Enables the character race system during origin story creation. */
  raceSystem: false,
} as const;
