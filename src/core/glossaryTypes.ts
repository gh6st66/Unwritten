/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface GlossaryEntry {
  id: string;            // kebab-case unique id
  term: string;          // display term
  definition: string;    // plain text definition
  tags?: string[];       // optional tags (e.g., "combat", "systems")
}

export type GlossaryIndex = GlossaryEntry[];
