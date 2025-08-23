# Project Roadmap: Unwritten (Narrative Redesign)

This document outlines the development plan to evolve the game based on the new narrative-first design proposal.

---

## Phase 1: Foundational Refactor (Current)
## Phase 1: Foundational Refactor

*Goal: Strip out the legacy combat systems and reshape the core application structure to support a purely narrative roguelike experience.*

-   [x] **Remove Combat Systems:** Delete all combat-related components, hooks, data files, and UI styles.
-   [x] **Refactor Core Loop:** Update the main game state machine to handle only narrative events, skill checks, and rest sites.
-   [x] **Update Data Models:** Modify core types (`PlayerState`, `EncounterDef`) to remove combat-specific fields.
-   [x] **Adapt Encounters:** Convert all former combat encounters into narrative events.

---

## Phase 2: Implementing the Core Loop
## Phase 2: Implementing the Core Loop (Current)

*Goal: Build the essential mechanics of the new game loop as defined in the design document.*

-   [ ] **Journal System:** Implement the "Journal Writes" mechanic, where a run begins with an imposed "fate-claim" that acts as a central conflict.
-   [ ] **Mark Inversion:** Add the "Redemption" mechanic, allowing players to complete specific objectives to invert a negative Mark (e.g., `OATHBREAKER` -> `LOYALIST`).
-   [ ] **Run Collapse & Inheritance:**
    -   [ ] Implement the "Collapse" event that ends a run.
    -   [ ] Build the persistence layer that allows the next run to "Inherit" the Marks from the previous one.
    -   [ ] Implement the Mark "Decay" system, where inherited Marks weaken over several runs if not reinforced.
-   [x] **Journal System:** Implement the "Journal Writes" mechanic, where a run begins with an imposed "fate-claim" that acts as a central conflict.
-   [x] **Mark Inversion:** Add the "Redemption" mechanic, allowing players to complete specific objectives to invert a negative Mark (e.g., `OATHBREAKER` -> `LOYALIST`).
-   [x] **Run Collapse & Inheritance:**
    -   [x] Implement the "Collapse" event that ends a run.
    -   [x] Build the persistence layer that allows the next run to "Inherit" the Marks from the previous one.
    -   [x] Implement the Mark "Decay" system, where inherited Marks weaken over several runs if not reinforced.
-   [ ] **Time as a Resource:** Integrate a simple time mechanic where making choices at map nodes consumes time, progressing a global "Entropy" clock.

---

## Phase 3: World Systems & Antagonists

*Goal: Make the world feel alive and reactive by implementing the Mask, Echo, and Inquisitor systems.*

-   [ ] **Mask System:**
-   [ ] Add a "Mask" state to the player (on/off).
-   [ ] Create UI for toggling the mask.
-   [ ] Implement logic where removing the mask in social encounters triggers "Recognition" based on the player's active Marks, changing the event's outcome.
-   [ ] **Echo System (Persistence v1):**
-   [ ] Implement a basic "Echo" system where a significant choice in one run can change a map node in the next (e.g., aiding a village makes it a "Prosperous Village" node).
-   [ ] Design the first persistent NPC Echo, where an NPC from a past run can reappear with their state and memory intact.
-   [ ] **Inquisitor Encounters:**
-   [ ] Design and write the first Inquisitor narrative events.
-   [ ] These encounters should directly challenge the player's Marks and offer difficult choices related to the current "fate-claim".

---

## Phase 4: Polish & Content Expansion

*Goal: Flesh out the world, polish the user experience, and add more content to enhance replayability.*

-   [ ] **Content Pack 1:**
-   [ ] Add 10 new dynamic narrative events.
-   [ ] Create 5 new "Echo" patterns.
-   [ ] Write 3 new "fate-claims" for the Journal system.
-   [ ] **Mask Evolution:** Implement the visual evolution of the player's mask, where its appearance changes subtly based on the most dominant Marks.
-   [ ] **UI/UX Polish:**
-   [ ] Create a dedicated "Legacy" screen to show the history of past runs and their inherited Marks.
-   [ ] Add tooltips and better visual feedback for how Marks and the Journal are affecting choices.
-   [ ] **Sound Design:** Implement ambient soundscapes and UI sounds that reflect the narrative tone.
-   [ ] **Sound Design:** Implement ambient soundscapes and UI sounds that reflect the narrative tone.