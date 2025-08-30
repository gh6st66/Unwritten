import React, { useState, useEffect, useMemo, useRef } from "react";
import { useEngine } from "../game/engine";
import { GameState, Omen, Origin, ResourceId, Lexeme } from "../game/types";
import { GlossaryView } from "./GlossView";
import { glossaryData } from "../data/glossary";
import { LoadingScreen } from "./LoadingScreen";
import TitleScreen from "./TitleScreen";
import { ChronicleHome } from "./chronicle/ChronicleHome";
import { Game } from "./Game";
import { GameStatusOverlay } from "./GameStatusOverlay";
import { InGameChronicle } from "./InGameChronicle";
import CollapseModal from "./CollapseModal";
import { RumorTicker } from "./RumorTicker";
import { AudioManager } from "../systems/audio/AudioManager";
import { getChronicleData } from "../systems/chronicle";

export default function App() {
  const { state, send, canContinue, loadGame } = useEngine();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false);
  const [showInGameChronicle, setShowInGameChronicle] = useState(false);
  const [isEchoing, setIsEchoing] = useState(false);
  
  const audioManager = useMemo(() => new AudioManager(), []);
  const prevStateRef = useRef<GameState>();

  // Main audio controller effect
  useEffect(() => {
    const prevState = prevStateRef.current;
    if (prevState) {
      // --- Trigger one-shot UI sounds based on state changes ---
      const currentScreen = state.screen;
      const prevScreen = prevState.screen;

      // 1. Parser success/failure
      if (currentScreen.kind === 'SCENE' && prevScreen.kind === 'SCENE' && currentScreen.narrativeLog.length > prevScreen.narrativeLog.length) {
        const lastEntry = currentScreen.narrativeLog[currentScreen.narrativeLog.length - 1];
        const isFailureMessage = [
          "I don't know how to", "Nothing happens.", "You can't do that here.", 
          "That doesn't make sense.", "You don't see any", "You are not carrying"
        ].some(failMsg => lastEntry.startsWith(failMsg));

        if (isFailureMessage) {
          audioManager.playUI('parser_fail');
        } else {
          audioManager.playUI('parser_success');
        }
      }

      // 2. Resource/Mark/Echo changes
      if (state.player.marks.length > prevState.player.marks.length) {
        audioManager.playUI('mark_gain');
      }
      if (state.player.resources[ResourceId.CLARITY] < prevState.player.resources[ResourceId.CLARITY]) {
        audioManager.playUI('clarity_loss');
      }
      if (state.lastEchoTimestamp > prevState.lastEchoTimestamp) {
        audioManager.playUI('echo_created');
      }
    }

    // --- Update persistent ambient sounds ---
    if (state.phase === 'SCENE' && state.currentSceneId) {
      const scene = SCENES[state.currentSceneId];
      // FIX: Add a guard to ensure the scene exists in the local SCENES constant before accessing its properties.
      if (scene) {
        audioManager.setAmbient(scene.tags || [], state.accord.stability);
      }
    } else {
      audioManager.stop('ambient1');
      audioManager.stop('ambient2');
      audioManager.stop('drone');
    }
    
    // --- Update Echo layer on new run ---
    // FIX: The phase 'WORLD_GENERATED' does not exist. The correct phase to check for after world generation is 'FIRST_MASK_FORGE'.
    if (state.phase === 'FIRST_MASK_FORGE' && prevState?.phase !== 'FIRST_MASK_FORGE') {
        const chronicle = getChronicleData();
        const echoEvents = chronicle.events.filter(e => e.type === 'ACCORD_DELTA_APPLIED').map(e => (e as any).intentId);
        audioManager.setEchoLayer(echoEvents);
    }


    prevStateRef.current = state;
  }, [state, audioManager]);


  useEffect(() => {
    if (state.lastEchoTimestamp > 0) {
        const now = Date.now();
        if (now - state.lastEchoTimestamp < 100) {
            setIsEchoing(true);
            const timer = setTimeout(() => setIsEchoing(false), 1500);
            return () => clearTimeout(timer);
        }
    }
  }, [state.lastEchoTimestamp]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }
      if (event.key.toLowerCase() === 'g') setShowGlossary(g => !g);
      if (event.key.toLowerCase() === 'c') {
         state.phase === 'TITLE' ? setShowChronicle(c => !c) : setShowInGameChronicle(c => !c);
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
    <div className={`app-container ${isEchoing ? 'echo-ripple' : ''}`}>
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
        audioManager={audioManager}
      />
      <Footer 
        onGlossaryOpen={() => setShowGlossary(true)} 
        onChronicleOpen={() => state.phase === 'SCENE' ? setShowInGameChronicle(true) : setShowChronicle(true)}
        rumors={state.rumors}
      />
      {showGlossary && <GlossaryView categories={glossaryData} onClose={() => setShowGlossary(false)} />}
      {showChronicle && <ChronicleHome onClose={() => setShowChronicle(false)} />}
      {showInGameChronicle && <InGameChronicle onClose={() => setShowInGameChronicle(false)} />}
      <GameStatusOverlay state={state} onToggleChronicle={() => state.phase === 'SCENE' ? setShowInGameChronicle(c => !c) : setShowChronicle(c => !c)} onToggleGlossary={() => setShowGlossary(g => !g)} />
      <CollapseModal 
        open={!!collapseScreen}
        reason={collapseScreen ? collapseScreen.reason : 'choice'}
        summaryLog={collapseScreen ? collapseScreen.summaryLog : []}
        onContinue={() => send({type: 'RETURN_TO_TITLE'})}
      />
    </div>
  );
}

// Dummy SCENES for audio context lookup
const SCENES: Record<string, { tags?: string[] }> = {
  "mountain_forge": { "tags": ["forge_site", "cavern"] },
  "ridge_path": { "tags": ["outdoors"] },
  "sanctum": { "tags": ["ruin", "sacred"] },
  "singing_hollow": { "tags": ["cavern", "sacred"] },
  "shifting_ravine": { "tags": ["outdoors", "dangerous"] },
  "forgotten_shrine": { "tags": ["sacred", "ruin"] },
  "stormbreak_plateau": { "tags": ["outdoors", "mountain", "dangerous"] },
  "moonlit_garden": { "tags": ["sacred"] }
};


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

function Footer({ onGlossaryOpen, onChronicleOpen, rumors }: { onGlossaryOpen: () => void; onChronicleOpen: () => void; rumors: {text: string, id: string}[] }) {
  return (
    <div className="p-3 text-xs opacity-70 border-t flex justify-between items-center">
      <RumorTicker rumors={rumors} />
      <div style={{display: 'flex', gap: '1rem', flexShrink: 0, paddingLeft: '1rem'}}>
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
