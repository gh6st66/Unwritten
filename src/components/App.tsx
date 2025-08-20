import React, { useState, useCallback, useMemo, useEffect } from "react";
import { RunProvider } from "../context/RunContext";
import { Game } from "./Game";
import { TitleScreen } from "./TitleScreen";
import { initialRun } from "../startup/initialRun";
import { CollapseTrigger, computeNewRunSeed, collapseRun } from "../systems/RunManager";
import { NewRunSeed, RunState } from "../core/types";
import CollapseModal from "./CollapseModal";

type CollapseState = {
  open: boolean;
  reason: "defeat" | "entropy" | "choice" | "escape";
  summaryLog: string[];
};

export const App: React.FC = () => {
  const [view, setView] = useState("title");
  const [runSeed, setRunSeed] = useState<NewRunSeed | null>(null);
  const [collapseState, setCollapseState] = useState<CollapseState>({
    open: false,
    reason: "defeat",
    summaryLog: [],
  });

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const orientation = screen.orientation as any;
        if (orientation && typeof orientation.lock === 'function') {
          await orientation.lock('portrait');
        }
      } catch (error) {
        console.error('Could not lock screen orientation:', error);
      }
    };

    lockOrientation();
  }, []);

  const startNewGame = useCallback(() => {
    // For a brand new game, clear any lingering legacy data.
    localStorage.removeItem("unwritten_legacy_v1");
    const firstSeed = computeNewRunSeed(1);
    setRunSeed(firstSeed);
    setView("game");
  }, []);

  const startNextRun = useCallback(() => {
    const nextRunIndex = (runSeed?.runIndex ?? 0) + 1;
    const nextSeed = computeNewRunSeed(nextRunIndex);
    setRunSeed(nextSeed);
    setCollapseState({ open: false, reason: "defeat", summaryLog: [] });
  }, [runSeed]);

  const handleCollapse = useCallback((finalState: RunState, trigger: CollapseTrigger) => {
    collapseRun(finalState, trigger);
    setCollapseState({
      open: true,
      reason: trigger.reason,
      summaryLog: trigger.summaryLog,
    });
  }, []);
  
  const initial = useMemo(() => (runSeed ? initialRun(runSeed) : null), [runSeed]);

  if (view === "title") {
    return <TitleScreen onStartGame={startNewGame} />;
  }

  return (
    <>
      {initial && (
        <RunProvider key={initial.identity.runId} initial={initial} onCollapse={handleCollapse}>
          <Game />
        </RunProvider>
      )}
      <CollapseModal
        open={collapseState.open}
        reason={collapseState.reason}
        summaryLog={collapseState.summaryLog}
        onContinue={startNextRun}
      />
    </>
  );
};