# Unwritten - Project Roadmap & Progress Report

## Current Status (As of This Update)

Development has successfully established a robust and extensible foundation for the game. The core technical architecture for a deeply systemic, narrative-driven experience is now in place.

-   A clean, data-driven state engine manages all game logic via declarative `EngineDelta` updates.
-   The "Shattered Accord" system provides a powerful framework for micro-reactivity, tracking NPC recognition and world stability.
-   The Conflict Beat scheduler allows for emergent, state-driven narrative events.
-   A flexible natural language parser with a rich lexicon serves as the primary player interface.
-   NPCs have a memory of interactions and can respond dynamically to player choices.

The team's current focus is shifting to **Phase 4: Narrative Deepening & Content**, where we will build upon this strong foundation to create a deeply reactive and compelling narrative experience.

---

## Phase 1: Core Systems & Parser Implementation (Complete)

*Goal: Build the foundational technology for a narrative-first, parser-driven roguerike.*

-   [x] **State Management:** Implemented a core engine to manage game flow (`TITLE`, `SCENE`, `COLLAPSE`).
-   [x] **Text Parser:** Built a data-driven text parser that resolves natural language commands into game intents.
-   [x] **AI Integration:** Integrated the Google Gemini API for procedural mask forging.
-   [x] **Persistence:** Created the Chronicle system to record key events from each run.
-   [x] **World Generation:** Developed a procedural world and civilization generation system.

---

## Phase 2: Shattered Accord & Micro-Reactivity (Complete)

*Goal: Implement the core systemic layer for world and character reactivity.*

-   [x] **Accord Engine:** Built the core engine for processing intents and applying declarative `EngineDelta` updates to game state.
-   [x] **Systemic Intents:** Integrated new social verbs (`swear`, `renounce`, `ally`, `betray`) into the parser and engine.
-   [x] **NPC Recognition:** NPCs now track `trust` and `fear` based on player actions and mask choice.
-   [x] **Variant Text System:** The UI now uses a data-driven system to select narrative text based on the current game state (Accord, NPC recognition).
-   [x] **UI Refactor:** Replaced the legacy encounter UI with a parser-driven narrative log.

---

## Phase 3: Dynamic World Systems (Complete)

*Goal: Add advanced systems for emergent narrative structure and character interaction.*

-   [x] **NPC Dialogue & Memory:** Implemented the `ask_about` and `talk_to` intents. NPCs now have a basic memory of interactions within a run.
-   [x] **Conflict Beat System:** Implemented a robust, data-driven scheduler for triggering major narrative events (Beats) based on world state, player location, and time.
-   [x] **Effect Router:** Created a pure, data-driven system for resolving the consequences of Beats, such as pushing rumors or creating Echoes.
-   [x] **Echo System (v1):** The `markEcho` effect is fully integrated, allowing key events to be recorded in the Chronicle for persistence across runs.

---

## Phase 4: Narrative Deepening & Content (Current Focus)

*Goal: Leverage the completed systems to build a richer, more compelling player experience.*

-   [ ] **Journal & Omen System:** Expand the Omen system to track the player's `embrace` or `resist` path throughout a run, influencing which Conflict Beats are scheduled and how NPCs react.
-   [ ] **Mask Mechanics:** Evolve masks from narrative items into mechanically significant artifacts. Wearing a specific mask could unlock new commands, alter dialogue options, or be required to resolve certain Beats.
-   [ ] **Echo System (v2):** Implement the bootstrap phase where Echoes from the Chronicle create tangible changes in the next run (e.g., altered scenes, modified NPC dispositions, new factions).
-   [ ] **Content Pack 2:** Author a new suite of Conflict Beats, add more NPCs with detailed dialogue trees, and expand the variant text library to increase reactivity.

---

## Phase 5: Polish & Onboarding

*Goal: Refine the user experience, improve player guidance, and prepare for a polished vertical slice.*

-   [ ] **Lexicon Expansion:** Continue to expand the lexicon with hundreds of new synonyms to improve the parser's natural language understanding.
-   [ ] **UI/UX Polish:** Implement the `RumorTicker` UI and improve visual feedback for how the Accord, Beats, and Echoes are affecting the world.
-   [ ] **Sound Design:** Implement ambient soundscapes for scenes and satisfying UI sound effects for actions.
-   [ ] **Onboarding/Tutorial:** Create a dedicated starting scene that gracefully introduces new players to the text parser and core game concepts.
