/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from "react";
import { GameScreen, Omen, Origin, Lexeme, Player, SceneObject } from "../game/types";
import { OriginSelectionView } from "./OriginSelectionView";
import { MaskRitual } from "../features/ritual/MaskRitual";
import { FIRST_MASK_RITUAL_TEMPLATE } from '../data/rituals';
import { LEXEMES_DATA } from '../data/lexemes';
import { LexemeTier } from '../types/lexeme';
import { MaskRevealView } from "./MaskRevealView";
import GenerationTester from "./GenerationTester";
import { ParserInput } from "./ParserInput";
import '../styles/parser.css';
import { OmenView } from "./OmenView";
import { PlayerStatus } from "./PlayerStatus";

type Props = {
  screen: GameScreen;
  player: Player;
  activeOrigin: Origin | null;
  onAttemptAction: (command: string) => void;
  onAdvance: (to: "SCENE" | "COLLAPSE") => void;
  onStartRun: (origin: Origin) => void;
  onCommitFirstMask: (lexeme: Lexeme) => void;
  onContinueAfterReveal: () => void;
  onAcceptOmen: (omen: Omen, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
  onCloseTester: () => void;
};

/**
 * Creates a descriptive string for a scene object based on its current state.
 * e.g., "an old chest (locked, closed)"
 */
function formatObjectDescription(object: SceneObject): React.ReactNode {
    const states = [];
    if (object.state?.moved === true) states.push('moved');
    if (object.state?.locked === true) states.push('locked');
    if (object.state?.open === true) states.push('open');
    else if (object.state?.open === false && (object.tags.includes('openable') || object.tags.includes('container'))) {
      states.push('closed');
    }

    // Echo indicator
    if (object.tags.includes('echo')) {
        return (
            <span className="scene-object-item">
                {object.name}
                <span className="scene-object-state" title="An echo from a past run">§</span>
            </span>
        );
    }

    if (states.length > 0) {
        return (
            <span className="scene-object-item">
                {object.name}
                <span className="scene-object-state">({states.join(', ')})</span>
            </span>
        );
    }
    return <span className="scene-object-item">{object.name}</span>;
}


export function ScreenRenderer(props: Props) {
  const { 
    screen, 
    player,
    activeOrigin,
    onAttemptAction,
    onAdvance, 
    onStartRun, 
    onAcceptOmen, 
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

  const handleAcceptOmen = (approach: 'embrace' | 'resist') => {
    if (screen.kind === 'OMEN') {
      onAcceptOmen(screen.omen, approach);
    }
  };

  switch (screen.kind) {
    case "GENERATION_TESTER":
      return <GenerationTester onClose={onCloseTester} />;
    case "ORIGIN_SELECTION":
      return (
        <OriginSelectionView 
          origins={screen.origins} 
          onSelect={onStartRun} 
        />
      );
    case "FIRST_MASK_FORGE": {
      const allBasicLexemes = LEXEMES_DATA.filter(lex => 
        player.unlockedLexemes.includes(lex.id) && lex.tier === LexemeTier.Basic
      );

      const biasedLexemes = activeOrigin?.lexemeBias
        ? allBasicLexemes.filter(lex => activeOrigin.lexemeBias!.includes(lex.id))
        : allBasicLexemes;
      
      // Fallback in case the bias results in an empty list (e.g., bad data)
      const availableLexemes = biasedLexemes.length > 0 ? biasedLexemes : allBasicLexemes;

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
    case "OMEN": {
      return (
        <OmenView
          omen={screen.omen}
          onAccept={handleAcceptOmen}
        />
      );
    }
    case "SCENE": {
      const sceneWrapperClasses = ["p-4", "space-y-3"];
      if (screen.isHallucinating) {
        sceneWrapperClasses.push("hallucinating");
      }
      return (
        <div className={sceneWrapperClasses.join(' ')}>
          <p>{screen.description}</p>

          {screen.objects.length > 0 && (
            <div className="scene-objects-list">
              <h3 className="scene-objects-list-title">You see:</h3>
              <ul className="scene-objects-list-items">
                {screen.objects.map((obj, i) => (
                    <li key={obj.id}>
                      {formatObjectDescription(obj)}
                      {i < screen.objects.length - 1 ? ', ' : '.'}
                    </li>
                ))}
              </ul>
            </div>
          )}
          
          <PlayerStatus player={player} />
          
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
    }
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