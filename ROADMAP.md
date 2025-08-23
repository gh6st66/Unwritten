# Project Roadmap: Unwritten

This document outlines the development plan to evolve the game from its current foundation into a feature-complete vertical slice.

---

## Phase 1: Core Systems & Parser Implementation (Complete)

*Goal: Build the foundational technology for a narrative-first, parser-driven roguelike.*

-   [x] **State Management:** Implemented a core state machine to manage game flow (`TITLE`, `SCENE`, `COLLAPSE`).
-   [x] **Text Parser:** Built a data-driven text parser that resolves natural language commands into game intents.
-   [x] **World Generation:** Developed a procedural world and civilization generation system to create unique settings for each run.
-   [x] **AI Integration:** Integrated the Google Gemini API to power a unique, procedural mask forging system.
-   [x] **Persistence:** Created the Chronicle system to record key events from each run, establishing a foundation for legacy mechanics.

---

## Phase 2: Gameplay Loop & Content Expansion (Current)

*Goal: Flesh out the initial gameplay loop to be fully interactive and expand the world's content.*

-   [ ] **Full Intent/Effect System:** Implement the full range of parser effects (`create`, `destroy`, `state` changes) to make the world more dynamic and interactive.
-   [ ] **Player Inventory:** Add a basic player inventory system to properly manage `take` and `drop` actions and track key items.
-   [ ] **Content Pack 1:**
    -   [ ] Author 5+ new scenes with unique objects, exits, and challenges.
    -   [ ] Add 10+ new core intents to expand player agency (e.g., `talk_to`, `give`, `combine`).
    -   [ ] Massively expand the lexicon with hundreds of new synonyms to improve the parser's natural language understanding.
-   [ ] **Echo System (v1):** Begin realizing Echoes from the Chronicle. A significant choice recorded from one run should create a tangible change in a subsequent run (e.g., a new object in a scene, a modified description, or a unique NPC state).

---

## Phase 3: Narrative & Character Systems

*Goal: Deepen the narrative experience with reactive characters and a central conflict that responds to player choice.*

-   [ ] **NPC Dialogue & Memory:** Implement the `ask_about` and `talk_to` intents. NPCs should have a basic memory of interactions and react to the player's visible Marks and the current world state.
-   [ ] **Journal & Claims System:** Fully integrate the `Claim` system into the gameplay loop. The player's actions should be measured against their chosen `embrace` or `resist` path, leading to meaningful narrative consequences and new events.
-   [ ] **Mask Mechanics:** Evolve masks from narrative items into mechanically significant artifacts. They could unlock new commands, change NPC reactions based on cultural context, or consume resources to activate powers.

---

## Phase 4: Polish & UX

*Goal: Refine the user experience, improve player guidance, and prepare for a polished vertical slice.*

-   [ ] **UI/UX Polish:**
    -   [ ] Design and implement a dedicated UI view for the player's status (Marks, inventory, active Claims).
    -   [ ] Add tooltips and other forms of contextual feedback to better explain game mechanics.
-   [ ] **Sound Design:** Implement ambient soundscapes for scenes and satisfying UI sound effects for actions.
-   [ ] **Onboarding/Tutorial:** Create a dedicated starting scene that gracefully introduces new players to the text parser and the core concepts of the game.
