/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from "react";
import { GameState, GameScreen, Omen, Origin, Lexeme, Player, SceneObject } from "../game/types";
import { OriginSelectionView } from "./SeedSelectionView";
import { MaskRitual } from "../features/ritual/MaskRitual";
import { FIRST_MASK_RITUAL_TEMPLATE } from '../data/rituals';
import { LEXEMES_DATA } from '../data/lexemes';
import { LexemeTier } from '../types/lexeme';
import { MaskRevealView } from "./MaskRevealView";
import GenerationTester from "./GenerationTester";
import { ParserInput } from "./ParserInput";
import '../styles/parser.css';
import '../styles/narrativeLog.css';
import { OmenView } from "./ClaimView";
import { PlayerStatus } from "./PlayerStatus";
import { LiveRegion } from "./LiveRegion";
import { WorldPanel } from './WorldPanel';
import { RumorQueue } from './RumorQueue';
import { AudioManager } from "../systems/audio/AudioManager";

type Props = {
  screen: GameScreen;
  player: Player;
  state: GameState;
  onAttemptAction: (command: string) => void;
  onStartRun: (origin: Origin) => void;
  onCommitFirstMask: (lexeme: Lexeme) => void;
  onContinueAfterReveal: () => void;
  onAcceptOmen: (omen: Omen, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
  onCloseTester: () => void;
  audioManager: AudioManager;
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
    state,
    onAttemptAction,
    onStartRun, 
    onAcceptOmen, 
    onReset,
    onCommitFirstMask,
    onContinueAfterReveal,
    onCloseTester,
    audioManager,
  } = props;

  const [isParsing, setIsParsing] = useState(false);

  const handleParseSubmit = async (text: string) => {
    setIsParsing(true);
    onAttemptAction(text);
    setIsParsing(false);
  };

  const handleAcceptOmen = (approach: 'embrace' | 'resist') => {
    if (screen.kind === 'OMEN') {
      onAcceptOmen(screen.omen, approach);
    }
  };

  // Memoize the last log entry for the LiveRegion to prevent unnecessary announcements
  const lastLogEntry = useMemo(() => {
    if (screen.kind === 'SCENE' && screen.narrativeLog.length > 0) {
      return screen.narrativeLog[screen.narrativeLog.length - 1];
    }
    return '';
  }, [screen]);

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

      const biasedLexemes = state.activeOrigin?.lexemeBias
        ? allBasicLexemes.filter(lex => state.activeOrigin!.lexemeBias!.includes(lex.id))
        : allBasicLexemes;
      
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
      const isNewRun = state.day === 1 && screen.narrativeLog.length <= 2;

      return (
        <div className={sceneWrapperClasses.join(' ')}>
          {isNewRun && state.worldFacts.length > 0 && (
            <div className="new-run-banner">
              {state.worldFacts.map((fact, i) => <p key={i}>{fact}</p>)}
            </div>
          )}

          <LiveRegion message={lastLogEntry} />
          <div className="narrative-log">
            {screen.narrativeLog.map((line, index) => <p key={index} className="narrative-log-entry">{line}</p>)}
          </div>

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
          
          <div className="status-panels">
            <PlayerStatus state={state} />
            <WorldPanel state={state} />
          </div>

          <RumorQueue 
            commands={screen.suggestedCommands} 
            onCommandClick={handleParseSubmit} 
            disabled={isParsing} 
          />
          
          <ParserInput onSubmit={handleParseSubmit} disabled={isParsing} audioManager={audioManager} />
        </div>
      );
    }
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
    // The LOADING/TITLE/RESOLVE cases are handled by App.tsx or are obsolete and won't be passed here.
    case "LOADING":
    case "TITLE":
    case "RESOLVE":
        return null;
  }
}
