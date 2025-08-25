# Unwritten - Project Roadmap & Progress Report

## Current Status (As of This Update)

Development has successfully completed **Phase 2**, establishing a robust and extensible foundation for the game. The core technical architecture is feature-complete for the initial gameplay loop.

-   A clean, data-driven state engine manages all game logic.
-   A flexible natural language parser serves as the primary player interface.
-   AI-powered procedural generation for Masks (via Gemini API) is fully integrated.
-   The Chronicle system successfully records run history, and the Echo system now manifests that history as tangible changes in the world.

The team's current focus is shifting to **Phase 3: Narrative & Character Systems**, where we will build upon this strong foundation to create a deeply reactive and compelling narrative experience.

---

## Phase 1: Core Systems & Parser Implementation (Complete)

*Goal: Build the foundational technology for a narrative-first, parser-driven roguelike.*

-   [x] **State Management:** Implemented a core engine to manage game flow (`TITLE`, `SCENE`, `COLLAPSE`).
-   [x] **Text Parser:** Built a data-driven text parser that resolves natural language commands into game intents.
-   [x] **World Generation:** Developed a procedural world and civilization generation system.
-   [x] **AI Integration:** Integrated the Google Gemini API for the procedural mask forging system.
-   [x] **Persistence:** Created the Chronicle system to record key events from each run.

---

## Phase 2: Gameplay Loop & Content Expansion (Complete)

*Goal: Flesh out the initial gameplay loop to be fully interactive and expand the world's content.*

-   [x] **Full Intent/Effect System:** The parser now supports a full range of effects (`create`, `destroy`, `combine`), handled by a clean, data-driven interaction system.
-   [x] **Player Inventory:** `take`, `drop`, and `inventory` intents are fully functional.
-   [x] **Stateful World Objects:** Objects in the world can now have their internal state permanently modified by player actions within a run.
-   [x] **Echo System (v1):** Significant choices recorded in the Chronicle now create tangible changes in subsequent runs (e.g., destroyed objects leave rubble, past failures leave remnants).
-   [x] **Content Pack 1:** Added 5+ new scenes and 10+ new core intents to expand player agency.
-   [x] **UI/UX Polish (v1):** Implemented a dedicated Player Status view for inventory and marks, and improved scene rendering to show dynamic object states.

---

## Phase 3: Narrative & Character Systems (Current Focus)

*Goal: Deepen the narrative experience with reactive characters and a central conflict that responds to player choice.*

-   [ ] **NPC Dialogue & Memory:** Implement the `ask_about` and `talk_to` intents. NPCs should have a basic memory of interactions and react to the player's visible Marks and the current world state.
-   [ ] **Journal & Omen System:** Fully integrate the `Omen` system into the gameplay loop. The player's actions should be measured against their chosen `embrace` or `resist` path, leading to meaningful narrative consequences.
-   [ ] **Mask Mechanics:** Evolve masks from narrative items into mechanically significant artifacts that can unlock new commands or change NPC reactions.
-   [ ] **Echo System (v2):** Expand the system to include more dynamic Echoes, such as NPCs who remember past interactions or altered environmental descriptions based on the previous run's outcome.

---

## Phase 4: Polish & Onboarding

*Goal: Refine the user experience, improve player guidance, and prepare for a polished vertical slice.*

-   [ ] **Lexicon Expansion:** Continue to expand the lexicon with hundreds of new synonyms to improve the parser's natural language understanding.
-   [ ] **Performance & Accessibility:** Ensure the application is performant and adheres to accessibility standards.
-   [ ] **Sound Design:** Implement ambient soundscapes for scenes and satisfying UI sound effects for actions.
-   [ ] **Onboarding/Tutorial:** Create a dedicated starting scene that gracefully introduces new players to the text parser and core game concepts.