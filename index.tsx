
import React from "react";
import { createRoot } from "react-dom/client";
import { RunProvider } from "./src/context/RunContext";
import { Game } from "./src/components/Game";
import { initialRun } from "./src/startup/initialRun";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <RunProvider initial={initialRun()}>
      <Game />
    </RunProvider>
  </React.StrictMode>
);
