import React from "react";
import { GameScreen } from "../game/types";

type Props = {
  screen: GameScreen;
  onAction: (id: string) => void;
  onAdvance: (to: "ENCOUNTER" | "COLLAPSE") => void;
};

export function ScreenRenderer({ screen, onAction, onAdvance }: Props) {
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
        <div className="p-4">
          <h2 className="text-xl font-semibold">The Journal Writes</h2>
          <p className="mt-2">{screen.claim.text}</p>
          <button className="mt-4 px-4 py-2 rounded border"
                  onClick={() => onAdvance("ENCOUNTER")}>
            Accept
          </button>
        </div>
      );
    case "ENCOUNTER":
      return (
        <div className="p-4 space-y-3">
          <p>{screen.encounter.prompt} <span className="opacity-70">{screen.encounter.internalThoughtHint}</span></p>
          <div className="space-y-2">
            {screen.encounter.options.map(o => (
              <button key={o.id}
                className="block w-full text-left px-4 py-2 rounded border"
                onClick={() => onAction(o.id)}>
                {o.label}
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
                  onClick={() => location.reload()}>
            Return to Title
          </button>
        </div>
      );
  }
}
