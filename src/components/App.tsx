import React from "react";
import { useEngine } from "../game/engine";
import { ScreenRenderer } from "./ScreenRenderer";
import { GameState } from "../game/types";

export default function App() {
  const { state, send } = useEngine();

  const onAdvance = (to: "ENCOUNTER" | "COLLAPSE") => {
    if (state.phase === "INTRO" && to === "ENCOUNTER") {
      send({ type: "START_RUN", seed: crypto.randomUUID() });
      return;
    }
    if (state.phase === "CLAIM" && to === "ENCOUNTER") {
      const claim = (state.screen.kind === "CLAIM") ? state.screen.claim : undefined;
      if (claim) send({ type: "ACCEPT_CLAIM", claim });
      return;
    }
    if (state.phase === "RESOLVE" && to === "ENCOUNTER") {
      send({ type: "GENERATE_ENCOUNTER" });
      return;
    }
    if (to === "COLLAPSE") send({ type: "END_RUN", reason: "Manual end." });
  };

  const onAction = (optionId: string) => {
    if (state.screen.kind !== "ENCOUNTER") return;
    send({ type: "CHOOSE_OPTION", encounterId: state.screen.encounter.id, optionId });
  };

  return (
    <div className="max-w-screen-sm mx-auto">
      <Header state={state} />
      <ScreenRenderer screen={state.screen} onAction={onAction} onAdvance={onAdvance} />
      <Footer />
    </div>
  );
}

function Header({ state }: { state: GameState }) {
  const r = state.player.resources;
  return (
    <div className="p-3 flex items-center justify-between border-b">
      <div className="font-semibold">Phase: {state.phase}</div>
      <div className="text-sm">
        TIME {r.TIME} · CLARITY {r.CLARITY} · COIN {r.CURRENCY}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="p-3 text-xs opacity-70 text-center border-t">
      Unwritten • React + TS • Gemini-ready
    </div>
  );
}
