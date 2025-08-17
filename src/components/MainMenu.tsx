/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import "../styles/mainMenu.css";
import { FLAGS } from "../config/flags";

type Props = {
  onNavigate: () => void;
};

export function MainMenu({ onNavigate }: Props) {
  return (
    <div className="main-menu-container">
      <h1 className="main-menu-title">Roguelike Card Game</h1>
      <nav className="main-menu">
        <button onClick={onNavigate}>Start Game</button>
        {/* The glossary is disabled via feature flags for hardening.
            This ensures it remains tree-shaken from production builds.
            To re-enable, set `glossary: true` in `src/config/flags.ts`.
        */}
        {FLAGS.glossary && (
            <button onClick={() => { /* Navigation logic for glossary would go here */ }}>
                Glossary
            </button>
        )}
      </nav>
    </div>
  );
}
