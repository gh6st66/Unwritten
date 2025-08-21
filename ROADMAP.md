# Project Roadmap: The Ink-Stained Path
# Project Roadmap: The Unwritten (Narrative Redesign)

This document outlines the development plan to evolve the current prototype into a polished, feature-complete vertical slice. It is organized into high-level phases, each with a detailed checklist of low-level tasks and explicit milestones for playtesting and iteration.
This document outlines the development plan to evolve the game based on the new narrative-first design proposal.

---

## Phase 0: Prototype Spike (Pre-Production)
## Phase 1: Foundational Refactor (Current)

*Goal: Prove the core combat loop exists and works in the engine before sinking effort into polish or content.*
*Goal: Strip out the legacy combat systems and reshape the core application structure to support a purely narrative roguelike experience.*

### Task Order (Critical Path)

#### Turn & Flow Backbone
-   [ ] Implement a minimal turn manager (player → enemy → repeat).
-   [ ] End turn logic that hands control back and forth.

#### Card System Basics
-   [ ] Card data structure (cost, type, effect).
-   [ ] Draw → play → discard pipeline.
-   [ ] Very simple effects: deal damage, gain block.

#### Player & Enemy Entities
-   [ ] Placeholder player stats: HP, block, maybe 1 resource pool.
-   [ ] One test enemy with HP and 2–3 actions.
-   [ ] Enemy intent stub (even if it’s just “Attack next turn” text).

#### Run Structure Stub
-   [ ] Minimal encounter flow: single fight, then “Game Over” screen.
-   [ ] Restart loop.

#### Debug-Friendly UI
-   [ ] Text-based hand + play area (no animations).
-   [ ] Debug overlays for HP, block, and turn state.
-   [ ] Log window showing “Player played X, Enemy did Y.”

---

### ✅ Milestone 0: Prototype Validation

**Goal:** Confirm the bones are in place. Cards can be drawn, turns alternate, and one enemy can be defeated without the whole thing falling apart.

**Checkpoints:**
-   [ ] Can you play a full test fight from start to finish?
-   [ ] Do draw/play/discard and turn order work reliably?
-   [ ] Does the placeholder enemy respond correctly each turn?
-   [ ] Is restarting a run stable?

---

## Phase 1: Core Experience & "Game Feel" Polish

*This phase is about making every interaction satisfying and ensuring the core loop is intuitive and visually appealing.*

### UI/UX & Visual Polish (High Impact)
-   [ ] **Sound Design:** Implement sound effects for critical actions.
    -   [ ] Card draw, play, and discard sounds.
    -   [ ] Attack impacts (differentiate blocked vs. unblocked).
    -   [ ] Player/enemy damage sounds.
    -   [ ] UI clicks and turn transitions.
-   [ ] **Visual Effects (VFX):** Add simple, clean animations for clear feedback.
    -   [ ] Damage numbers that pop up and fade.
    -   [ ] A "block" icon that shatters when it absorbs damage.
    -   [ ] A subtle screen shake on heavy enemy attacks.
    -   [ ] Status effect application/expiration visuals.
-   [ ] **Health & Resource Animations:** Animate health bars and resource icons instead of snapping to new values.
-   [ ] **Tooltips & Hover Info:** Implement tooltips for status effects and card keywords (e.g., Scry, Exhaust) on both desktop (hover) and mobile (long-press).

### Gameplay & Clarity
-   [ ] **In-Run Status View:** Create a modal to summarize the character's current state:
    -   [ ] Display current Dispositions.
    -   [ ] List all active Marks and their severity grades.
    -   [ ] Show the current deck list.
-   [ ] **Enemy Targeting Indicator:** Add a visual indicator (arrow/highlight) for which enemy is being targeted by a card.

---

### ✅ Milestone 1: Core Loop & Game Feel Validation

**Goal:** Validate that the core combat loop is engaging, the UI is clear, and the game feels satisfying to play on a moment-to-moment basis *before* adding more complexity.

**Tasks:**
-   [ ] Package a stable build with all Phase 1 features.
-   [ ] Conduct internal playtests focusing on UI clarity, sound/VFX impact, and the "fun factor" of the basic combat.
-   [ ] Create a backlog of required tweaks based on feedback and iterate until the core loop feels solid.

---

## Phase 2: Content Expansion & Replayability

*This phase focuses on giving players reasons to come back by expanding the game's content and adding progression systems.*

### Content Expansion
-   [ ] **Add More "Vanilla" Content:**
    -   [ ] Add ~20 more cards with new mechanics.
    -   [ ] Create ~5 new enemies with unique action patterns.
    -   [ ] Author ~5 new static narrative events.
-   [ ] **Introduce New Node Types:**
    -   [ ] **Elite Encounters:** Add `ELITE` map nodes with tougher combats and superior rewards (e.g., choice of three Rare cards).
    -   [ ] **Rest Site:** Add `REST` map nodes with a choice to either `Heal` (recover HP) or `Upgrade` (improve a card).

### Metagame & Progression
-   [ ] **Post-Run Summary Screen:** Show a summary after a run ends (victory or defeat) detailing floors cleared, final character state, etc.
-   [ ] **Unlock System:** Implement a simple unlock mechanism.
    -   [ ] Example: Defeating the first boss for the first time unlocks a new pool of 10 cards and 3 new events that can appear in future runs.
    -   [ ] Tie unlocks to achievements (e.g., "Win a run with the 'Shadow' seal").
-   [x] **Remove Combat Systems:** Delete all combat-related components, hooks, data files, and UI styles.
-   [x] **Refactor Core Loop:** Update the main game state machine to handle only narrative events, skill checks, and rest sites.
-   [x] **Update Data Models:** Modify core types (`PlayerState`, `EncounterDef`) to remove combat-specific fields.
-   [x] **Adapt Encounters:** Convert all former combat encounters into narrative events.

---

### ✅ Milestone 2: Content & Replayability Check-in
## Phase 2: Implementing the Core Loop

**Goal:** Ensure new content adds meaningful variety and that the early progression arc feels rewarding.
*Goal: Build the essential mechanics of the new game loop as defined in the design document.*

**Tasks:**
-   [ ] Conduct playtests focusing on the balance of new cards, enemies, and node types.
-   [ ] Assess if the difficulty curve feels right across the first several floors.
-   [ ] Gather feedback on the post-run summary and the appeal of the unlock system.
-   [ ] **Journal System:** Implement the "Journal Writes" mechanic, where a run begins with an imposed "fate-claim" that acts as a central conflict.
-   [ ] **Mark Inversion:** Add the "Redemption" mechanic, allowing players to complete specific objectives to invert a negative Mark (e.g., `OATHBREAKER` -> `LOYALIST`).
-   [ ] **Run Collapse & Inheritance:**
    -   [ ] Implement the "Collapse" event that ends a run.
    -   [ ] Build the persistence layer that allows the next run to "Inherit" the Marks from the previous one.
    -   [ ] Implement the Mark "Decay" system, where inherited Marks weaken over several runs if not reinforced.
-   [ ] **Time as a Resource:** Integrate a simple time mechanic where making choices at map nodes consumes time, progressing a global "Entropy" clock.

---

### ⚙️ Architectural Milestone 2.5: State Management Refactor
## Phase 3: World Systems & Antagonists

*Goal: Proactively address the growing complexity of `Game.tsx` by refactoring state management before Phase 3. This ensures the codebase remains maintainable as we add major new systems.*
*Goal: Make the world feel alive and reactive by implementing the Mask, Echo, and Inquisitor systems.*

**Tasks:**
-   [ ] **Create `RunContext`:** Implement a new React Context to manage the top-level `runState` (player, deck, map).
-   [ ] **Migrate State:** Move the `runState` logic from `Game.tsx` into the new context provider. Consider using `useReducer` for complex state transitions.
-   [ ] **Refactor Consumers:** Update child components (`MapView`, `EncounterView`, etc.) to consume data from `RunContext` instead of receiving it via props.
-   [ ] **Validate:** Ensure the game is fully functional after the refactor with no regressions.
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

## Phase 3: Implementing the Antagonist - Narrative Gravity

*This is the core feature implementation phase, bringing the game's unique antagonist to life. This follows the spec in `DEV_NOTES.md`.*

### Foundational Systems
-   [ ] **`narrativeGravity.ts`:** Implement the core engine to compute "pull" and "severity" based on player identity.
-   [ ] **`journal.ts`:** Create the living journal system with APIs to log actual, skewed, and fabricated entries.
-   [ ] **`perception.ts`:** Build the system to track local and global perception, including the witness ledger.
-   [ ] **Extend `identity.ts`:** Add required helpers for nudging dispositions and managing marks.
-   [ ] **Update `encounters.ts` Schema:** Add `worldMemory` and `gravityImpacts` fields to the `EncounterDef` type.

---

### ✅ Milestone 3: Narrative Gravity System Prototype Review

**Goal:** Validate that the core mechanics of Narrative Gravity are understandable and thematically interesting to players, even in a rough, prototype state, before committing to full UI and content implementation.

**Tasks:**
-   [ ] Create a test build where the effects of Narrative Gravity are visible (e.g., via a debug overlay or simplified journal text).
-   [ ] Test specifically: Do players understand *why* an option is locked? Does the "World Remembers" concept make sense? Is it intriguing or just confusing?
-   [ ] Iterate on the core logic and feedback presentation based on findings.

---

### Gameplay Integration & UI
-   [ ] **Event Resolution Pipeline:** Integrate the Narrative Gravity check into the event resolution flow.
    -   `Player Action -> Record Witnesses -> Log World Memory -> Compute Gravity -> Apply Drift -> Check Thresholds`
-   [ ] **Update Event Data:** Go through existing encounters and add appropriate `worldMemory` templates and `gravityImpacts`.
-   [ ] **Implement Correction Quests:**
    -   [ ] Create the system for spawning `Correction Quests` from journal entries.
    -   [ ] Author the first two quest patterns (e.g., `ALLY_OF_THIEVES`, `FAMINE_BRINGER`).
-   [ ] **Implement Echo Encounters:**
    -   [ ] Create the `echo.ts` system to generate an `EchoSpec` based on gravity output.
    -   [ ] Design the first Echo encounter as a boss fight triggered by high narrative gravity.
-   [ ] **Journal Screen UI:**
    -   [ ] Build the UI to list all journal entries with the "What You Did" vs. "What the World Remembers" diff view.
    -   [ ] Wire up player actions (Erase, Forge, Start Correction) with cost previews.
-   [ ] **Encounter Recap Widget & UI Updates:**
    -   [ ] Implement the post-event recap summary.
    -   [ ] Visually flag disabled and "Correction attempt" options in the UI.

---

### ✅ Milestone 4: Vertical Slice Playtest

**Goal:** Test the complete game loop with the full Narrative Gravity system to ensure all pieces create a cohesive, compelling, and understandable experience.

**Tasks:**
-   [ ] Conduct extensive internal and "friends and family" playtests on the feature-complete vertical slice.
-   [ ] Gather feedback on the entire experience: origin story, core combat, map progression, and the full narrative gravity loop (journal, echos, quests).
-   [ ] Identify major balancing issues, confusing UI elements, and narrative disconnects.
-   [ ] Use this feedback to create the final polish and bug-fixing backlog for Phase 4.

---

## Phase 4: Final Polish & Onboarding

*This phase is about making the game approachable for new players and adding the final layer of professional sheen based on feedback from the vertical slice playtest.*

### Gemini API Enhancements
-   [ ] **Dynamic Card Upgrades:** At a Rest Site, use Gemini to generate a unique name and flavor text for an upgraded card.
-   [ ] **Generated Curses/Boons:** In certain events, use Gemini to generate a temporary "curse" or "boon" with a narrative effect that lasts for 1-3 encounters.

### Quality of Life & Settings
-   [ ] **Settings Menu:** Add a simple settings modal with:
    -   [ ] Volume controls (Master, SFX).
    -   [ ] "Reduced Motion" toggle.
-   [ ] **Tutorialization:**
    -   [ ] Make the very first encounter a guided tutorial fight.
    -   [ ] Use pop-up tooltips to explain core concepts as they appear for the first time (enemy intent, playing a card, ending the turn).

---
## Phase 4: Polish & Content Expansion

## A Note on Iteration
*Goal: Flesh out the world, polish the user experience, and add more content to enhance replayability.*

This roadmap is a living document. The milestones are not just checkboxes; they are gates. If a playtest reveals a fundamental problem with a system (e.g., Narrative Gravity is confusing, the core combat is boring), we must be prepared to pause forward momentum on the roadmap and allocate time to address that feedback. A well-polished but flawed game is still flawed. This iterative process is key to our success.
-   [ ] **Content Pack 1:**
    -   [ ] Add 10 new dynamic narrative events.
    -   [ ] Create 5 new "Echo" patterns.
    -   [ ] Write 3 new "fate-claims" for the Journal system.
-   [ ] **Mask Evolution:** Implement the visual evolution of the player's mask, where its appearance changes subtly based on the most dominant Marks.
-   [ ] **UI/UX Polish:**
    -   [ ] Create a dedicated "Legacy" screen to show the history of past runs and their inherited Marks.
    -   [ ] Add tooltips and better visual feedback for how Marks and the Journal are affecting choices.
-   [ ] **Sound Design:** Implement ambient soundscapes and UI sounds that reflect the narrative tone.