/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { IntentType } from "../../systems/parser/types";

export const parserTestCases: { input: string; expected: { intentId: string; intentType: IntentType } }[] = [
  {
    input: "shout hello?",
    expected: { intentId: "vocalize", intentType: "SOCIAL" }
  },
  {
    input: "yell into the dark!",
    expected: { intentId: "vocalize", intentType: "SOCIAL" }
  },
  {
    input: "say nothing.",
    expected: { intentId: "vocalize", intentType: "SOCIAL" }
  },
  {
    input: "leave room",
    expected: { intentId: "move", intentType: "PHYSICAL" }
  },
  {
    input: "approach forge",
    expected: { intentId: "inspect", intentType: "INTERNAL" }
  }
];
