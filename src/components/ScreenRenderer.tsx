/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from "react";
import { GameScreen, Claim, WorldSeed, SpeakerContext, Lexeme, Player, ActionOutcome } from "../game/types";
import { SeedSelectionView } from "./SeedSelectionView";
import { resolveLexeme } from "../systems/lexicon/resolveLexeme";
import { MaskRitual } from "../features/ritual/MaskRitual";
import { FIRST_MASK_RITUAL_TEMPLATE } from '../data/rituals';
import { LEXEMES_DATA } from '../data/lexemes';
import { LexemeTier } from '../types/lexeme';
import { MaskRevealView } from "./MaskRevealView";
import GenerationTester from "./GenerationTester";
import { ParserInput } from "./ParserInput";
import '../styles/parser.css';

type Props = {
  screen: GameScreen;
  player: Player;
  onAttemptAction: (command: string) => void;
  onAdvance: (to: "SCENE" | "COLLAPSE") => void;
  onStartRun: (seed: WorldSeed) => void;
  onCommitFirstMask: (lexeme: Lexeme) => void;
  onContinueAfterReveal: () => void;
  onAcceptClaim: (claim: Claim, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
  onCloseTester: () => void;
};

export function ScreenRenderer(props: Props) {
  const { 
    screen, 
    player,
    onAttemptAction,
    onAdvance, 
    onStartRun, 
    onAcceptClaim, 
    onReset,
    onCommitFirstMask,
    onContinueAfterReveal,
    onCloseTester,
  } = props;

  const [isParsing, setIsParsing] = useState(false); // UI lock during action resolution

  const handleParseSubmit = async (text: string) => {
    setIsParsing(true);
    onAttemptAction(text);
    // In the new model, the state machine will handle the result and update the screen.
    // We can probably remove the async nature and local parsing state here soon.
    setIsParsing(false);
  };

  switch (screen.kind) {
    case "GENERATION_TESTER":
      return <GenerationTester onClose={onCloseTester} />;
    case "SEED_SELECTION":
      return (
        <SeedSelectionView 
          seeds={screen.seeds} 
          onSelect={onStartRun} 
        />
      );
    case "FIRST_MASK_FORGE": {
      const availableLexemes = LEXEMES_DATA.filter(lex => 
        player.unlockedLexemes.includes(lex.id) && lex.tier === LexemeTier.Basic
      );
      return (
        <MaskRitual
          template={FIRST_MASK_RITUAL_TEMPLATE}
          lexemes={availableLexemes}
          onCommit={onCommitFirstMask}
        />
      );
    }
    case "MASK_REVEAL":
      return (
        <MaskRevealView
          mask={screen.mask}
          onContinue={onContinueAfterReveal}
        />
      );
    case "CLAIM": {
      const journalContext: SpeakerContext = {
        locale: 'en-US',
        region: 'en-US',
        affiliations: ['bureaucracy', 'clergy'], // Journal as a formal, mythic entity
        role: 'Chronicler'
      };
      const journalTerm = resolveLexeme('fateRecord', journalContext);

      return (
        <div className="p-4 text-center">
          <h2 className="text-sm font-semibold opacity-70">The {journalTerm} Writes:</h2>
          <p className="mt-4 text-xl">"{screen.claim.text}"</p>
          <div className="mt-6 space-y-3">
            <button className="option-button text-left"
                    onClick={() => onAcceptClaim(screen.claim, 'embrace')}>
              <div className="flex-grow">
                <div>{screen.claim.embrace.label}</div>
                <div className="text-xs opacity-70">{screen.claim.embrace.description}</div>
              </div>
            </button>
            <button className="option-button text-left"
                    onClick={() => onAcceptClaim(screen.claim, 'resist')}>
              <div className="flex-grow">
                <div>{screen.claim.resist.label}</div>
                <div className="text-xs opacity-70">{screen.claim.resist.description}</div>
              </div>
            </button>
          </div>
        </div>
      );
    }
    case "SCENE":
      return (
        <div className="p-4 space-y-3">
          <p>{screen.prompt}</p>
          
          <ParserInput onSubmit={handleParseSubmit} disabled={isParsing} />

          <div className="parser-response-area" aria-live="polite">
            {screen.lastActionResponse}
          </div>

          {screen.suggestedCommands && screen.suggestedCommands.length > 0 && (
            <div className="suggestions-container">
              <span className="suggestions-label">Suggestions:</span>
              {screen.suggestedCommands.map((cmd, i) => (
                <button
                  key={`${cmd}-${i}`}
                  className="suggestion-chip"
                  onClick={() => handleParseSubmit(cmd)}
                  disabled={isParsing}
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    case "RESOLVE":
      return (
        <div className="p-4">
          <p>{screen.summary}</p>
          <button className="mt-4 px-4 py-2 rounded border"
                  onClick={() => onAdvance("SCENE")}>
            Continue
          </button>
        </div>
      );
    case "COLLAPSE":
      return (
        <div className="p-4">
          <h2 className="text-xl font-semibold">Collapse</h2>
          <p className="mt-2">{screen.reason}</p>
          <button className="mt-4 px-4 py-2 rounded border"
                  onClick={onReset}>
            Return to Title
          </button>
        </div>
      );
    // The LOADING/TITLE cases are handled by App.tsx and won't be passed here.
    case "LOADING":
    case "TITLE":
        return null;
  }
}