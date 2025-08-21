import React from "react";
import { GameScreen, Claim } from "../game/types";
import { OptionDetail } from "./OptionDetail";

type Props = {
  screen: GameScreen;
  onAction: (id: string) => void;
  onAdvance: (to: "ENCOUNTER" | "COLLAPSE") => void;
  onAcceptClaim: (claim: Claim, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
};

export function ScreenRenderer({ screen, onAction, onAdvance, onAcceptClaim, onReset }: Props) {
  switch (screen.kind) {
    case "INTRO":
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold">The Unwritten</h1>
          <button className="mt-4 px-4 py-2 rounded bg-black text-white"
                  onClick={() => onAdvance("ENCOUNTER")}>
            New Run
          </button>
        </div>
      );
    case "CLAIM":
      return (
        <div className="p-4 text-center">
          <h2 className="text-sm font-semibold opacity-70">A FATE IS INSCRIBED</h2>
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
    case "LOADING":
      return (
        <div className="p-4 flex justify-center items-center h-48">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="opacity-70">{screen.message}</p>
          </div>
        </div>
      );
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
  }
}