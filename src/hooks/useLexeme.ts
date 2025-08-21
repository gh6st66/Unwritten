import { useMemo } from "react";
import { resolveLexeme } from "../systems/lexicon/resolveLexeme";
import type { SpeakerContext } from "../game/types";
import type { LexemeKey } from "../systems/lexicon/types";

export function useLexeme(key: LexemeKey, speaker: SpeakerContext) {
  return useMemo(() => resolveLexeme(key, speaker), [key, speaker.locale, speaker.region, JSON.stringify(speaker.affiliations), speaker.role]);
}