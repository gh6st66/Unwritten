import React from "react";
import { GameScreen, Claim, WorldSeed, SpeakerContext } from "../game/types";
import { OptionDetail } from "./OptionDetail";
import { SeedSelectionView } from "./SeedSelectionView";
import { MaskForgingView } from "./MaskForgingView";
import { resolveLexeme } from "../systems/lexicon/resolveLexeme";

type Props = {
  screen: GameScreen;
  onAction: (id: string) => void;
  onAdvance: (to: "ENCOUNTER" | "COLLAPSE") => void;
  onStartRun: (seed: WorldSeed) => void;
  onForgeMask: (input: string) => void;
  onAcceptClaim: (claim: Claim, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
  onGlossaryOpen: () => void;
};

export function ScreenRenderer(props: Props) {
  const { screen, onAction, onAdvance, onStartRun, onForgeMask, onAcceptClaim, onReset, onGlossaryOpen } = props;

  switch (screen.kind) {
    case "INTRO":
      return (
        <SeedSelectionView 
          seeds={screen.seeds} 
          onSelect={onStartRun} 
          onGlossaryOpen={onGlossaryOpen}
        />
      );
    case "FORGE_MASK":
      return (
        <MaskForgingView
          seedTitle={screen.seedTitle}
          onForge={onForgeMask}
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
    case "ENCOUNTER":
      return (
        <div className="p-4 space-y-3">
          <p>{screen.encounter.prompt} <span className="opacity-70">{screen.encounter.internalThoughtHint}</span></p>
          <div className="space-y-2">
            {screen.encounter.options.map(o => (
              <button key={o.id}
                className="option-button"
                onClick={() => onAction(o.id)}>
                <span className="option-label">{o.label}</span>
                <OptionDetail costs={o.costs} effects={o.effects} grantsMarks={o.grantsMarks} />
              </button>
            ))}
          </div>
        </div>
      );
    case "RESOLVE":
      return (
        <div className="p-4">
          <p>{screen.summary}</p>
          <button className="mt-4 px-4 py-2 rounded border"
                  onClick={() => onAdvance("ENCOUNTER")}>
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
    // The LOADING case is now handled by a full-screen component in App.tsx
    // and will not be passed to ScreenRenderer.
    case "LOADING":
        return null;
  }
}