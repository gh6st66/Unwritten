
import React, { useState, useCallback, useMemo } from "react";
import { RunProvider } from "../context/RunContext";
import { Game } from "./Game";
import { TitleScreen } from "./TitleScreen";
import { initialRun } from "../startup/initialRun";
import { RunState } from "../core/types";
import CollapseModal from "./CollapseModal";
import { loadLegacy, saveLegacy, clearLegacy } from "../systems/Persistence";

type View = "title" | "game" | "boon_selection";

type CollapseState = {
  open: boolean;
  summaryLog: string[];
};

export const App: React.FC = () => {
  const [view, setView] = useState<View>("title");
  const [runState, setRunState] = useState<RunState | null>(null);

  const [collapseState, setCollapseState] = useState<CollapseState>({
    open: false,
    summaryLog: [],
  });

  const startNewGame = useCallback(() => {
    clearLegacy();
    const legacy = loadLegacy();
    const initialState = initialRun(legacy);
    setRunState(initialState);
    setView("game");
  }, []);

  const continueGame = useCallback(() => {
    setCollapseState({ open: false, summaryLog: [] });
    const legacy = loadLegacy();
    const initialState = initialRun(legacy);
    setRunState(initialState);
    setView("game");
  }, []);


  const handleCollapse = useCallback((finalState: RunState) => {
    saveLegacy(finalState);
    setView("title"); // Temporarily switch to title to unmount the game view
    setCollapseState({
      open: true,
      summaryLog: ["Your path ends... for now."], // Placeholder log
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
        reason={"choice"} // placeholder
        summaryLog={collapseState.summaryLog}
        onContinue={continueGame}
      />
    </>
  );
};
