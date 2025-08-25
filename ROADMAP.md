# Unwritten - Project Roadmap & Progress Report

## Current Status (As of This Update)

Development has successfully completed the foundational phase of the project. The core technical architecture is now in place and is robust. This includes:

-   A solid core engine that cleanly manages game states.
-   A fully integrated natural language parser that serves as the primary player interface.
-   AI-powered procedural generation for the game's central artifacts (Masks) using the Google Gemini API.
-   A procedural generation pipeline for creating unique worlds and civilizations for each run.
-   The "Chronicle" persistence system, which successfully records key events from each run to local storage, laying the groundwork for the legacy/echo mechanics.

The initial gameplay loop is fully playable, from starting a new run and forging the first mask to interacting with the first scene via the parser. A major milestone has been reached in world interactivity with the implementation of stateful objects—items in the world can now have their properties permanently changed by player actions (e.g., unlocking a locked chest). The intent/effect system has been expanded to support more dynamic world interactions, including creating, destroying, and combining items via the parser, enabling simple crafting puzzles.

The team's current focus is on **Phase 2: Gameplay Loop & Content Expansion**. The immediate priority is to begin implementing the Echo system, where the Chronicle's records manifest as changes in subsequent runs.

---

## Phase 1: Core Systems & Parser Implementation (Complete)

*Goal: Build the foundational technology for a narrative-first, parser-driven roguelike.*

-   [x] **State Management:** Implemented a core engine to manage game flow (`TITLE`, `SCENE`, `COLLAPSE`).
-   [x] **Text Parser:** Built a data-driven text parser that resolves natural language commands into game intents.
-   [x] **World Generation:** Developed a procedural world and civilization generation system to create unique settings for each run.
-   [x] **AI Integration:** Integrated the Google Gemini API to power a unique, procedural mask forging system.
-   [x] **Persistence:** Created the Chronicle system to record key events from each run, establishing a foundation for legacy mechanics.

---

## Phase 2: Gameplay Loop & Content Expansion (Current)

*Goal: Flesh out the initial gameplay loop to be fully interactive and expand the world's content.*

### Systems Expansion
-   [x] **Basic Intent/Effect System:** The parser can now resolve intents that result in observable changes in the game state, including descriptive messages and player movement between scenes.
-   [x] **Player Inventory:** The `take`, `drop`, and `inventory` intents are fully functional, allowing for persistent item management.
-   [x] **Stateful World Objects:** The intent system can now modify the internal state of objects in the world (e.g., `locked: true` -> `false`), creating persistent changes within a run. The `unlock` and `open` intents serve as the primary example.
-   [x] **Full Intent/Effect System:** The parser now supports a full range of effects, including `create` (e.g., from searching), `destroy` (e.g., breaking an object), and `combine` (e.g., crafting from inventory), enabling more complex puzzles.
-   [ ] **Echo System (v1):** Begin realizing Echoes from the Chronicle. A significant choice recorded from one run should create a tangible change in a subsequent run (e.g., a new object in a scene, a modified description, or a unique NPC state).

### Content Expansion
-   [ ] **Content Pack 1:**
    -   [ ] Author 5+ new scenes with unique objects, exits, and challenges.
    -   [ ] Add 10+ new core intents to expand player agency (e.g., `talk_to`, `give`, `combine`).
    -   [ ] Massively expand the lexicon with hundreds of new synonyms to improve the parser's natural language understanding.

---

## Phase 3: Narrative & Character Systems

*Goal: Deepen the narrative experience with reactive characters and a central conflict that responds to player choice.*

-   [ ] **NPC Dialogue & Memory:** Implement the `ask_about` and `talk_to` intents. NPCs should have a basic memory of interactions and react to the player's visible Marks and the current world state.
-   [ ] **Journal & Claims System:** Fully integrate the `Claim` system into the gameplay loop. The player's actions should be measured against their chosen `embrace` or `resist` path, leading to meaningful narrative consequences and new events.
-   [ ] **Mask Mechanics:** Evolve masks from narrative items into mechanically significant artifacts. They could unlock new commands, change NPC reactions based on cultural context, or consume resources to activate powers.
-   [ ] **Narrative Cohesion Playtest:** Test the interaction between NPCs, the Journal, and Mask mechanics to ensure the core narrative loop is compelling.

---

## Phase 4: Polish & UX

*Goal: Refine the user experience, improve player guidance, and prepare for a polished vertical slice.*

-   [ ] **UI/UX Polish:**
    -   [ ] Design and implement a dedicated UI view for the player's status (Marks, inventory, active Claims).
    -   [ ] Add tooltips and other forms of contextual feedback to better explain game mechanics.
-   [ ] **Performance & Accessibility:** Ensure the application is performant across devices and adheres to accessibility standards (e.g., keyboard navigation, screen reader support, reduced motion).
-   [ ] **Sound Design:** Implement ambient soundscapes for scenes and satisfying UI sound effects for actions.
-   [ ] **Onboarding/Tutorial:** Create a dedicated starting scene that gracefully introduces new players to the text parser and the core concepts of the game.

---

## Milestones & Playtests

*Key checkpoints to ensure development stays aligned with design goals.*

-   **Milestone 1: Core Loop Validation** (Complete)
-   **Milestone 2: Parser + Inventory Expansion Check-in**
-   **Milestone 3: Echo Prototype Review**
-   **Milestone 4: Narrative Cohesion Playtest**
-   **Milestone 5: Vertical Slice Polish**