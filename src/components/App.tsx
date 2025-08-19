import React, { useState, useCallback } from "react";
import { RunProvider } from "../context/RunContext";
import { Game } from "./Game";
import { TitleScreen } from "./TitleScreen";
import { initialRun } from "../startup/initialRun";

export const App: React.FC = () => {
  const [view, setView] = useState("title");

  const startGame = useCallback(() => {
    setView("game");
  }, []);

  if (view === "title") {
    return <TitleScreen onStartGame={startGame} />;
  }

  return (
    <RunProvider initial={initialRun()}>
      <Game />
    </RunProvider>
  );
};
