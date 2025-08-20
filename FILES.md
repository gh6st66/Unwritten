
# Application File System

This document provides an overview of the file structure for the "Unwritten" application, detailing the purpose of each file and directory in the new data-driven architecture.

## Root Directory

*   **`GDD.md`**: The formal Game Design Document, outlining the core loop, mechanics, and systems like Intents, Marks, and Echoes.
*   **`FILES.md`**: This file. A comprehensive guide to the project's file system.
*   **`ROADMAP.md`**: Outlines the development plan based on the narrative-first design.
*   **`index.html`**: The main entry point for the web application.
*   **`index.css`**: The main stylesheet for global styles, layout, and core UI elements.
*   **`index.tsx`**: The main TypeScript file that renders the React application into the DOM.
*   **`metadata.json`**: Configuration file for the application's metadata.
*   **`package.json`**: Defines project scripts and dependencies.
*   **`tsconfig.json`**: TypeScript compiler configuration.
*   **`.eslintrc.json`**: ESLint configuration.

## `src/` Directory

Contains all the application's source code.

### `src/ai/`

*   **`gemini.ts`**: A centralized service for all Gemini API interactions, specifically for generating procedural content like plant lore and illustrations for the Herbalist's Compendium.

### `src/components/`

Contains all React UI components.

*   **`App.tsx`**: The top-level component, managing view state (title, game, boons) and the run lifecycle.
*   **`Game.tsx`**: The main game screen component, structuring the HUD, encounter area, and side panels.
*   **`NarrativeEventView.tsx`**: Renders an encounter, including its prose and options, and handles previewing intents.
*   **`IntentPreview.tsx`**: Displays the calculated Chance, Cost, and Tension for a hovered choice.
*   ... and other UI components for modals, sidebars, etc.

### `src/context/`

*   **`RunContext.tsx`**: Provides the global state for a single game run (`RunState`). It contains the core logic for processing player choices, resolving intents, and mutating the game state.

### `src/core/`

Defines the core data structures, types, and fundamental, stateless game logic.

*   **`types.ts`**: The central file defining all core data structures and types. This is the single source of truth for the application's data model.
*   **`intent.ts`**: Contains the single, transparent formula for calculating the outcome preview of any given Intent.
*   **`marks.ts`**: Contains the logic for managing Marks, including applying XP, tiering up/down, and decay.
*   **`time.ts`**: Logic for managing the in-game clock, applying time costs, and triggering time-based events.
*   **`echoes.ts`**: Logic for scoring Echo Seeds at the end of a run and selecting which ones will manifest in the next.

### `src/data/`

Contains all static game data, now primarily in JSON format.

*   **`encounters/*.json`**: Individual encounter files, defining their text, options, and outcomes in a structured format.
*   **`tables/*.json`**: A set of tuning tables that drive the core game logic:
    *   `intent_defs.json`: Defines the primary traits and base tension for each Intent.
    *   `disposition_weights.json`: Defines how player Dispositions affect Intent success.
    *   `mark_affinities.json`: Defines how player Marks affect Intent success.
    *   `claim_intent_bias.json`: Defines how the active Journal Claim influences the difficulty of certain Intents.
    *   `curves.json`: Mathematical constants for tuning the main Intent formula.
    *   `time.json`: Defines time costs for various actions.
*   **`encounters.ts`**: A helper file that imports all encounter JSON files and exports them as a single array for easy use in the application.

### `src/startup/`

*   **`initialRun.ts`**: A function that creates the initial `RunState` for a new game, incorporating inherited marks and selected boons.

### `src/systems/`

Contains stateful game logic, systems, and services.

*   **`ForageEngine.ts`**, **`RestEngine.ts`**, **`TravelEngine.ts`**: Contain the logic for player-initiated actions from the `IntentBar`.
*   **`Persistence.ts`**: The persistence layer, handling saving and loading run legacy data to and from `localStorage`.
*   **`RunManager.ts`**: Orchestrates the run lifecycle, computing the seed for new runs and handling the "collapse" event.
*   ... other systems as needed.
