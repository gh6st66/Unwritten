import React, { useState } from "react";
import { useEngine } from "../game/engine";
import { ScreenRenderer } from "./ScreenRenderer";
import { GameState, Claim, WorldSeed, ResourceId, Lexeme } from "../game/types";
import { GlossaryView } from "./GlossaryView";
import { glossaryData } from "../data/glossary";
import { LoadingScreen } from "./LoadingScreen";
import TitleScreen from "./TitleScreen";
import { ChronicleHome } from "./chronicle/ChronicleHome";

export default function App() {
  const { state, send, canContinue, loadGame } = useEngine();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false);

  const onStartRun = (seed: WorldSeed) => {
    send({ type: 'START_RUN', seed });
  };

  const onCommitFirstMask = (lexeme: Lexeme) => send({ type: 'COMMIT_FIRST_MASK', lexeme });
  const onContinueAfterReveal = () => send({ type: 'CONTINUE_AFTER_REVEAL' });

  const onAdvance = (to: "ENCOUNTER" | "COLLAPSE") => {
    if (state.phase === "RESOLVE" && to === "ENCOUNTER") {
      send({ type: "GENERATE_ENCOUNTER" });
      return;
    }
    if (to === "COLLAPSE") send({ type: "END_RUN", reason: "Manual end." });
  };

  const onAcceptClaim = (claim: Claim, approach: 'embrace' | 'resist') => {
    if (state.phase === "CLAIM") {
      send({ type: "ACCEPT_CLAIM", claim, approach });
    }
  };

  const onAction = (optionId: string) => {
    if (state.screen.kind !== "ENCOUNTER") return;
    send({ type: "CHOOSE_OPTION", encounterId: state.screen.encounter.id, optionId });
  };
  
  const onReset = () => {
    send({ type: "RESET_GAME" });
  };

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
          version="0.2.1"
        />
        {showGlossary && <GlossaryView categories={glossaryData} onClose={() => setShowGlossary(false)} />}
        {showChronicle && <ChronicleHome onClose={() => setShowChronicle(false)} />}
      </>
    );
  }

  if (state.phase === "LOADING") {
    const message = state.screen.kind === 'LOADING' ? state.screen.message : 'The ink settles...';
    return <LoadingScreen message={message} />;
  }

  return (
    <div className="app-container">
      <Header state={state} />
      <ScreenRenderer
        screen={state.screen}
        player={state.player}
        onAction={onAction}
        onAdvance={onAdvance}
        onStartRun={onStartRun}
        onCommitFirstMask={onCommitFirstMask}
        onContinueAfterReveal={onContinueAfterReveal}
        onAcceptClaim={onAcceptClaim}
        onReset={onReset}
        onCloseTester={() => send({ type: 'CLOSE_TESTER' })}
      />
      <Footer onGlossaryOpen={() => setShowGlossary(true)} />
      {showGlossary && <GlossaryView categories={glossaryData} onClose={() => setShowGlossary(false)} />}
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

function Footer({ onGlossaryOpen }: { onGlossaryOpen: () => void }) {
  return (
    <div className="p-3 text-xs opacity-70 border-t flex justify-between items-center">
      <span>Unwritten • React + TS • Gemini-ready</span>
      <button className="glossary-toggle" onClick={onGlossaryOpen}>
        Glossary
      </button>
    </div>
  );
}