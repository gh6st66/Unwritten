


import React, { useState, useCallback, useMemo } from "react";
import { RunProvider } from "../context/RunContext";
import { Game } from "./Game";
import { TitleScreen } from "./TitleScreen";
import { initialRun } from "../startup/initialRun";
import { RunState } from "../core/types";
import CollapseModal from "./CollapseModal";
import { loadLegacy, saveLegacy, clearLegacy } from "../systems/Persistence";

type View = "title" | "game" | "boon_selection";

type CollapseReason = "defeat" | "entropy" | "choice" | "escape";

type CollapseState = {
  open: boolean;
  summaryLog: string[];
  reason: CollapseReason;
};

export const App: React.FC = () => {
  const [view, setView] = useState<View>("title");
  const [runState, setRunState] = useState<RunState | null>(null);

  const [collapseState, setCollapseState] = useState<CollapseState>({
    open: false,
    summaryLog: [],
    reason: "choice",
  });

  const startNewGame = useCallback(() => {
    clearLegacy();
    const legacy = loadLegacy();
    const initialState = initialRun(legacy);
    setRunState(initialState);
    setView("game");
  }, []);

  const continueGame = useCallback(() => {
    setCollapseState({ open: false, summaryLog: [], reason: "choice" });
    const legacy = loadLegacy();
    const initialState = initialRun(legacy);
    setRunState(initialState);
    setView("game");
  }, []);


  const handleCollapse = useCallback((finalState: RunState, reason: CollapseReason = "choice") => {
    saveLegacy(finalState);
    setView("title"); // Temporarily switch to title to unmount the game view
    
    let summaryLog = ["Your path ends... for now."];
    if (reason === 'entropy') {
        summaryLog = ["Time runs out. The world solidifies, and your path fades into memory."];
    }
    
    setCollapseState({
      open: true,
      summaryLog,
      reason,
    });
  }, []);
  
  const renderView = () => {
    switch (view) {
      case "title":
        return <TitleScreen onStartGame={startNewGame} />;
      case "game":
        return runState ? (
          <RunProvider key={runState.runId} initial={runState} onCollapse={handleCollapse}>
            <Game />
          </RunProvider>
        ) : null;
      default:
        return <TitleScreen onStartGame={startNewGame} />;
    }
  }

  return (
    <>
      {renderView()}
      <CollapseModal
        open={collapseState.open}
        reason={collapseState.reason}
        summaryLog={collapseState.summaryLog}
        onContinue={continueGame}
      />
    </>
  );
};