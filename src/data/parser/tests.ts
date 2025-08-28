/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { IntentType } from "../../systems/parser/types";

export const parserTestCases: { input: string; expected: { intentId: string; intentType: IntentType } }[] = [
  // Social
  { input: "shout hello?", expected: { intentId: "vocalize", intentType: "SOCIAL" } },
  { input: "yell into the dark!", expected: { intentId: "vocalize", intentType: "SOCIAL" } },
  { input: "say nothing.", expected: { intentId: "vocalize", intentType: "SOCIAL" } },
  // Movement
  { input: "leave room", expected: { intentId: "move", intentType: "PHYSICAL" } },
  { input: "go n", expected: { intentId: "move", intentType: "PHYSICAL" } },
  { input: "north", expected: { intentId: "move", intentType: "PHYSICAL" } },
  { input: "enter sanctum", expected: { intentId: "move", intentType: "PHYSICAL" } },
  // Inspection
  { input: "approach forge", expected: { intentId: "inspect", intentType: "INTERNAL" } },
  { input: "look at blank mask", expected: { intentId: "inspect", intentType: "INTERNAL" } },
  { input: "l", expected: { intentId: "inspect", intentType: "INTERNAL" } }, // This should resolve to inspect in an empty context
  { input: "inspect old chest", expected: { intentId: "inspect", intentType: "INTERNAL" } },
  // Inventory
  { input: "take crucible", expected: { intentId: "take", intentType: "PHYSICAL" } },
  { input: "pick up the blank mask", expected: { intentId: "take", intentType: "PHYSICAL" } },
  // Note: 'drop' needs context from player inventory, which the test harness doesn't have.
  // We are testing that the intent is correctly identified.
  { input: "drop crucible", expected: { intentId: "drop", intentType: "PHYSICAL" } },
  { input: "inventory", expected: { intentId: "inventory", intentType: "INTERNAL" } },
  { input: "i", expected: { intentId: "inventory", intentType: "INTERNAL" } },
  // Object Interaction
  { input: "open old chest", expected: { intentId: "open_close", intentType: "PHYSICAL" } },
  { input: "close chest", expected: { intentId: "open_close", intentType: "PHYSICAL" } },
  // Note: 'unlock' test needs items in inventory.
  { input: "unlock old chest with forge key", expected: { intentId: "unlock", intentType: "PHYSICAL" } },
  { input: "search hearth", expected: { intentId: "search", intentType: "INTERNAL" } },
  { input: "break crucible", expected: { intentId: "destroy", intentType: "PHYSICAL" } },
  { input: "rest", expected: { intentId: "rest", intentType: "INTERNAL" } },
];