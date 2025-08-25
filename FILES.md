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
*   **`.eslintrc.json`**: ESLint configuration.

## `src/` Directory

Contains all the application's source code.

### `src/components/`

Contains all React UI components.

*   **`App.tsx`**: The top-level React component. It manages the view state and orchestrates the run lifecycle via the `useEngine` hook.
*   **`OptionDetail.tsx`**: Renders the costs and effects of a choice in the encounter view.
*   **`ScreenRenderer.tsx`**: A component that renders the correct UI for the current game phase (e.g., `OriginSelectionView`, `OmenView`, `SCENE`).
*   **`PlayerStatus.tsx`**: A UI component that displays the player's current inventory and active marks.
*   **`OriginSelectionView.tsx`**: UI for selecting the starting run conditions.
*   **`OmenView.tsx`**: UI for accepting the run's central prophecy.

### `src/game/`

Contains the core state machine and type definitions that run the game.

*   **`engine.ts`**: A React hook (`useEngine`) that manages the game's state transitions, handles side effects (like saving state and generating content), and provides the `state` and `send` functions to the UI.
*   **`stateMachine.ts`**: A pure reducer function that defines all valid state transitions in the game. It takes a state and an event and returns the new state. For player actions, it now acts as a simple dispatcher, delegating all logic to the interaction system.
*   **`types.ts`**: The central file defining all core data structures and types for the game's state machine, such as `Origin` and `Omen`.

### `src/data/`

Contains static game data.

*   **`omens.ts`**: Defines the data for Omens, the "fates" imposed on the player at the start of a run.
*   **`glossary.ts`**: Contains all terminology for the in-game glossary.
*   **`encounterSchemas.ts`**: Defines the structural patterns for dynamic encounters (e.g., "a shakedown," "an inspection").
*   **`npcs.sample.ts`**: A sample list of Non-Player Characters used by the encounter engine.
*   **`regions.ts`**: Defines the state of game regions, including their factions and socio-political tensions.
*   **`interactions.ts`**: The heart of the game's logic. This data file contains a complete, ordered list of rules that define what happens for every player action. It includes both highly specific contextual interactions and generic, fallback behaviors for all core intents (e.g., `take`, `inspect`, `drop`).

### `src/systems/`

Contains core game logic, systems, and services, independent of the UI.

*   **`EncounterGenerator.ts`**: The primary service for creating encounters. It uses the `encounters` engine to build a structural encounter and then uses the Gemini API to generate the narrative prose and player options.
*   **`OriginGenerator.ts`**: The service for generating the starting conditions (`Origins`) for a new run using the Gemini API.
*   **`encounters/`**: This subdirectory contains the complete data-driven encounter generation system.
    *   **`types.ts`**: Defines all core types for the system (NPCs, Regions, Factions, Tensions, Schemas, Rules).
    *   **`seededRng.ts`**: A deterministic random number generator.
    *   **`tension/TensionModel.ts`**: Logic for modeling the relationships between factions in a region.
    *   **`NpcIndex.ts`**: An indexed cache for fast NPC lookups.
    *   **`rules/Rulebook.ts`**: The engine for scoring and filtering encounter candidates based on the current game state.
    *   **`generators/EncounterSuggester.ts`**: The core generator that assembles a `StructuredEncounter` by selecting a schema and filling its roles with NPCs.
    *   **`EncounterEngine.ts`**: The top-level orchestrator that wires all the encounter subsystems together.

### `src/__tests__/`

Contains test files for the application.

*   **`smoke.test.ts`**: A simple test to ensure the application can initialize without errors.
*   **`encounterEngine.test.ts`**: Unit tests for the data-driven encounter engine to ensure deterministic generation.