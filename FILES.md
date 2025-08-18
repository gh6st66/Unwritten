# Application File System

This document provides an overview of the file structure for the "Unwritten" application, detailing the purpose of each file and directory in the current narrative-first architecture.

## Root Directory

*   **`DEV_NOTES.md`**: The primary design proposal for the narrative-driven roguelike. It outlines the core loop and systems like Intents, Marks, and Echoes.
*   **`FILES.md`**: This file. A comprehensive guide to the project's file system.
*   **`ROADMAP.md`**: Outlines the development plan based on the new narrative-first design.
*   **`index.html`**: The main entry point for the web application.
*   **`index.css`**: The main stylesheet for global styles, layout, and core UI elements.
*   **`index.tsx`**: The main TypeScript file that renders the React application into the DOM.
*   **`metadata.json`**: Configuration file for the application's metadata.
*   **`package.json`**: Defines project scripts and dependencies.
*   **`tsconfig.json`**: TypeScript compiler configuration.
*   **`.eslintrc.json`**: ESLint configuration, including rules to prevent importing deprecated modules.

## `src/` Directory

Contains all the application's source code.

### `src/components/`

Contains all React UI components.

*   **`Game.tsx`**: The main component that structures the game screen, including the HUD, Intent Bar, encounter area, and side panels.
*   **`IntentBar.tsx`**: The UI for the player-driven "Intent" system, currently used for the "Forage" action.
*   **`IntentPreview.tsx`**: A component that displays the calculated chance, cost, and tension of a hovered-over narrative choice.
*   **`NarrativeEventView.tsx`**: Renders the UI for a narrative encounter, including the prose and the list of interactive options.

### `src/context/`

Manages global state using React Context.

*   **`RunContext.tsx`**: Provides the global state for a single game run (`RunState`). It contains the core logic for processing player choices and mutating the game state.

### `src/core/`

Defines the core data structures and types for the entire application.

*   **`types.ts`**: The central file defining all core data structures and types for the game. This is the single source of truth for the application's data model.

### `src/data/`

Contains static game data.

*   **`encounters.ts`**: Defines the data for all narrative events and encounters in the game.
*   **`flora.ts`**: A registry of all available plants for the foraging system.

### `src/startup/`

Contains logic for initializing the game state.

*   **`initialRun.ts`**: A function that creates and returns the initial `RunState` for a new game.

### `src/systems/`

Contains core game logic, systems, and services, independent of the UI.

*   **`ForageEngine.ts`**: Contains the logic for the "Forage" player intent, calculating outcomes based on time, risk, and player state.
*   **`JournalEngine.ts`**: Logic for processing Journal Claims, which allows the player to accept or resist fate, creating or modifying Marks.
*   **`MaskEngine.ts`**: Logic for deterministically generating the appearance of the player's Mask based on their current Marks.
*   **`math.ts`**: Utility functions for common mathematical operations (e.g., `clamp`).
*   **`mutation.ts`**: A set of helper functions (`EffectFn`) for safely and predictably mutating the `RunState`.
*   **`timeUtils.ts`**: Utility functions for managing in-game time, such as applying time costs and calculating resource refills.
*   **`intent/`**: This subdirectory contains the complete implementation of the Intent System.
    *   **`IntentTypes.ts`**: Defines the core TypeScript types and data models for the Intent System.
    -   **`IntentRegistry.ts`**: A central registry defining the properties of every available Intent (e.g., CONFRONT, DECEIVE).
    -   **`IntentEngine.ts`**: The core logic engine that scores and resolves player intents based on their character and the narrative context.

### `src/__tests__/`

Contains test files for the application.

*   **`smoke.test.ts`**: A simple test to ensure the application can initialize without errors.
*   **`systems/intent/__tests__/IntentEngine.test.ts`**: Unit tests for the core logic of the Intent System.
