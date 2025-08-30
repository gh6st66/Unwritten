import React, { useState, useEffect } from "react";
import { useEngine } from "../game/engine";
import { GameState, Omen, Origin, ResourceId, Lexeme } from "../game/types";
import { GlossaryView } from "./GlossaryView";
import { glossaryData } from "../data/glossary";
import { LoadingScreen } from "./LoadingScreen";
import TitleScreen from "./TitleScreen";
import { ChronicleHome } from "./chronicle/ChronicleHome";
import { Game } from "./Game";
import { GameStatusOverlay } from "./GameStatusOverlay";
import { InGameChronicle } from "./InGameChronicle";
import CollapseModal from "./CollapseModal";

export default function App() {
  const { state, send, canContinue, loadGame } = useEngine();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false);
  const [showInGameChronicle, setShowInGameChronicle] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts from firing when typing in an input field
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (event.key.toLowerCase() === 'g') {
        setShowGlossary(g => !g);
      }
      if (event.key.toLowerCase() === 'c') {
         state.phase === 'TITLE' ? setShowChronicle(c => !c) : setShowInGameChronicle(c => !c);
      }
       if (event.key.toLowerCase() === 'h') {
        if (state.phase === 'SCENE') {
            setShowInGameChronicle(c => !c);
        }
    }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.phase]);

  const onStartRun = (origin: Origin) => send({ type: 'START_RUN', origin });
  const onCommitFirstMask = (lexeme: Lexeme) => send({ type: 'COMMIT_FIRST_MASK', lexeme });
  const onContinueAfterReveal = () => send({ type: 'CONTINUE_AFTER_REVEAL' });
  const onAcceptOmen = (omen: Omen, approach: 'embrace' | 'resist') => send({ type: "ACCEPT_OMEN", omen, approach });
  const onAttemptAction = (command: string) => send({ type: 'ATTEMPT_ACTION', rawCommand: command });
  const onReset = () => send({ type: "RESET_GAME" });

  if (state.phase === "TITLE") {
    return (
      <>
        <TitleScreen
          onNewRun={() => send({ type: "REQUEST_NEW_RUN" })}
          onContinue={loadGame}
          canContinue={canContinue}
          onOpenGlossary={() => setShowGlossary(true)}
          onOpenChronicle={() => setShowChronicle(true)}
          onOpenSettings={() => alert("Settings are not yet implemented.")}
          onOpenTester={() => send({ type: 'OPEN_TESTER' })}
          version="0.3.1"
        />
        {showGlossary && <GlossaryView categories={glossaryData} onClose={() => setShowGlossary(false)} />}
        {showChronicle && <ChronicleHome onClose={() => setShowChronicle(false)} />}
        <GameStatusOverlay state={state} onToggleChronicle={() => setShowChronicle(c => !c)} onToggleGlossary={() => setShowGlossary(g => !g)} />
      </>
    );
  }

  if (state.phase === "LOADING") {
    const message = state.screen.kind === 'LOADING' ? state.screen.message : 'The ink settles...';
    return <LoadingScreen message={message} />;
  }
  
  const collapseScreen = state.phase === 'COLLAPSE' && state.screen.kind === 'COLLAPSE' ? state.screen : null;

  return (
    <div className="app-container">
      <Header state={state} />
      <Game
        state={state}
        onStartRun={onStartRun}
        onCommitFirstMask={onCommitFirstMask}
        onContinueAfterReveal={onContinueAfterReveal}
        onAcceptOmen={onAcceptOmen}
        onAttemptAction={onAttemptAction}
        onReset={onReset}
        onCloseTester={() => send({ type: 'CLOSE_TESTER' })}
      />
      <Footer onGlossaryOpen={() => setShowGlossary(true)} onChronicleOpen={() => state.phase === 'SCENE' ? setShowInGameChronicle(true) : setShowChronicle(true)} />
      {showGlossary && <GlossaryView categories={glossaryData} onClose={() => setShowGlossary(false)} />}
      {showChronicle && <ChronicleHome onClose={() => setShowChronicle(false)} />}
      {showInGameChronicle && <InGameChronicle onClose={() => setShowInGameChronicle(false)} />}
      <GameStatusOverlay state={state} onToggleChronicle={() => state.phase === 'SCENE' ? setShowInGameChronicle(c => !c) : setShowChronicle(c => !c)} onToggleGlossary={() => setShowGlossary(g => !g)} />
      {/* FIX: Use the narrowed 'collapseScreen' variable to safely access props and fix type errors. */}
      <CollapseModal 
        open={!!collapseScreen}
        reason={collapseScreen ? collapseScreen.reason : 'choice'}
        summaryLog={collapseScreen ? collapseScreen.summaryLog : []}
        onContinue={() => send({type: 'RETURN_TO_TITLE'})}
      />
    </div>
  );
}

function Header({ state }: { state: GameState }) {
  const r = state.player.resources;
  const maskName = state.player.mask?.name;
  
  if (state.phase === 'GENERATION_TESTER') {
    return (
      <div className="p-3 flex items-center justify-between border-b">
        <div className="font-semibold">Generation Tester</div>
        <div className="text-sm">Developer Tools</div>
      </div>
    );
  }

  return (
    <div className="p-3 flex items-center justify-between border-b">
      <div className="font-semibold">{maskName ? `The ${maskName}` : `Phase: ${state.phase}`}</div>
      <div className="text-sm">
        TIME {r[ResourceId.TIME]} · CLARITY {r[ResourceId.CLARITY]} · COIN {r[ResourceId.CURRENCY]}
      </div>
    </div>
  );
}

function Footer({ onGlossaryOpen, onChronicleOpen }: { onGlossaryOpen: () => void; onChronicleOpen: () => void; }) {
  return (
    <div className="p-3 text-xs opacity-70 border-t flex justify-between items-center">
      <span>Unwritten • History (h)</span>
      <div style={{display: 'flex', gap: '1rem'}}>
        <button className="glossary-toggle" onClick={onChronicleOpen}>
          Chronicle (c)
        </button>
        <button className="glossary-toggle" onClick={onGlossaryOpen}>
          Glossary (g)
        </button>
      </div>
    </div>
  );
}