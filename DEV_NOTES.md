# Developer Notes: Roguelike Card Game

This document is for developers to track key architectural decisions, concepts, and future work for this project.

## Core Architecture

The application follows a modern React/TypeScript structure with a clear separation of concerns:

-   **`components/`**: Contains all React components responsible for rendering the UI. They should remain as stateless as possible, receiving data and callbacks as props.
-   **`systems/`**: Houses the core game logic, which is decoupled from the React view layer. This includes things like the `EffectSystem`, `DeckManager`, and `DataLoader`. This makes the logic easier to test and reason about.
-   **`hooks/`**: Custom React hooks that encapsulate complex state management and side effects (e.g., `useGameLoopManager`, `useResourcePools`).
-   **`data/`**: Static game data like card definitions, enemy stats, and events. This data is loaded into memory at startup by the `DataLoader`.
-   **`core/`**: TypeScript types, enums, and IDs that are shared across the entire application.

---

## Game Concept: "The Ink-Stained Path"

This is the narrative and thematic framework for the game.

### The World

The setting is the **Remnant Empire of Askara**, a once-great civilization now crumbling generations after a magical cataclysm known as **"The Great Silence."** The Silence didn't just break the world physically; it frayed the threads of causality, history, and memory.

-   **Truth is Malleable:** History is a collection of conflicting stories. Records are burnt, memories are unreliable, and ancient sites shift and change. In Askara, what is *believed* to be true, especially when proven by deeds, can have tangible power.
-   **Factions:** The primary factions are the **Inquisitors**, who seek to impose a single, dogmatic "Truth" on the world, and the various splinter groups (cults, scholar-collectives, rebel cells) who hoard their own versions of history.

### The Player's Role & Goal

The player is an **"Unwritten"**—an individual who has lost their memory, cast out from an Inquisitor's prison. They are a blank slate in a world obsessed with history and lineage.

-   **The Goal:** The player's journey is not just to survive, but to **write their own story**. They travel the Ink-Stained Path (the game map) towards the heart of the old empire, the Silent Capital. Their goal is either to find and reclaim their true past or to forge a new identity so powerful that it overwrites whatever came before.
-   **The Conflict:** The Inquisitors see the player as a threat—a blank page that could be filled with a "heretical" story. The player is constantly hunted, their emerging identity a challenge to the Inquisitors' rigid Truth.

### Tying Mechanics to Theme

This concept directly integrates our core game systems:

-   **Origin Story:** The "Inquisitor's Journal" is the world trying to impose a past on you. The burnt, fragmented accusations are the Inquisitors' "official story." Your choices are you actively "remembering" or "deciding" your own truth from these fragments. Your final "Seal" is the title of your story's prologue.
-   **Identity System (Dispositions & Marks):** This is the literal "ink" staining your soul. Each Mark and Disposition point is a tangible record of the story you are writing through your actions.
    -   A `MARK_KILLER` isn't just a game tag; it's a chapter you've written that makes you a killer in the eyes of the world.
    -   Your Dispositions (Forceful, Honorable, etc.) are the recurring themes of your personal narrative.
-   **Gemini API:** The AI is the voice of this fractured, reactive world.
    -   It narrates encounter descriptions based on the world's *perception* of your story (your Marks). A character "marked" as a `CHAINSCARRED` will be described differently by guards.
    -   It resolves dynamic events based on how your "story" (your Dispositions) intersects with the current situation. A "Forceful" character's story resolves a tense standoff differently than an "Honorable" one.
-   **Character Portability:** This concept fits perfectly. Exporting a character is like printing a "completed story." Importing that character into another player's world introduces them as a fixed "text"—an NPC whose personality and actions are defined by the story they have already written.

---

## Inquisitor System: Design Notes for Implementation

The Inquisitor is not a regular NPC. He functions as a narrative system that shapes the player’s story. His presence is primarily felt through Journal claims and, in rare cases, a trial event of mythic proportions.

### 1. Journal as Gameplay

The Inquisitor periodically writes a truth-claim about the player.

**Examples:**
*   “The Unwritten betrayed an ally.”
*   “The Unwritten is marked by cowardice.”

Once written, the claim becomes **active**:
*   NPCs react accordingly.
*   Encounter options may be added, removed, or costlier.
*   Combat/narrative modifiers can appear.

**Player agency:**
*   **Accept claim** → lean into the imposed past.
*   **Subvert claim** → disprove it by making opposing choices.

**Implementation detail:**
A claim is represented as an `EventModifier` tied to encounters.
*Example:*
*   Claim = `COWARD`.
*   Encounters gain cowardice-tagged options (“Flee immediately”).
*   Bravery options cost more, but choosing them removes/overwrites the claim.

### 2. Escalation Curve

*   **Early Game:** vague claims, mild modifiers.
*   **Mid Game:** sharper, restrictive claims (“TRAITOR OF KIN”).
*   **Late Game:** false claims that overwrite reality itself. The world enforces contradictory truths.

### 3. Rare Trial Encounter

At key inflection points (once or twice per run), the Inquisitor appears in full as a boss-level narrative event.

**Trigger Conditions:**
*   Player holds conflicting Marks (e.g. MERCIFUL + KILLER).
*   Player resisted multiple Journal entries.
*   OR narrative progress passes a threshold.

**Event Structure:**

**Phase 1 – Summoning**
*   Player is pulled into a “mythic courtroom.”
*   Suspend normal gameplay systems.

**Phase 2 – Accusation**
*   Inquisitor states a formal claim.
```json
{
  "accusation": {
    "source": "inquisitor",
    "text": "From silence was born a false soul. This Unwritten has betrayed kin and history alike.",
    "claim": "TRAITOR"
  }
}
```

**Phase 3 – Exchange (Gemini API-driven)**
*   Dialogue duel with 3 rounds.
*   System sends:
    *   Current claim.
    *   Player’s Marks + recent choices.
    *   Trial tone instructions.
*   Gemini generates Inquisitor + juror arguments.
*   Player responses are generated by the event engine:
    *   Based on current Marks.
    *   Generic fallback: Defy, Submit, Paradox.
    *   Responses cost resources (Wisdom, Aggression, Cunning).

```json
{
  "exchange": {
    "engine": "gemini",
    "rounds": 3,
    "playerOptions": [
      { "type": "defy", "cost": { "wisdom": 2 }, "condition": { "mark": "LOYAL" } },
      { "type": "submit", "cost": { "none": true } },
      { "type": "paradox", "cost": { "cunning": 3 } }
    ]
  }
}
```

**Phase 4 – Resolution**
*   Outcome determined by narrative + resource spend.

*   **Vindication**
    *   Gain Mark: `SELF_WRITTEN` (legendary).
    *   Claim erased.
    *   Journal visibly destroyed.
*   **Condemnation**
    *   Gain Mark: `INQUISITOR_BRAND`.
    *   Claim becomes canon.
    *   NPCs/events permanently treat it as truth.
*   **Paradox**
    *   Gain Mark: `PARADOX_BORN`.
    *   Creates unstable outcomes (misfiring events, NPCs misremembering differently).

**Phase 5 – Aftermath**
*   World state changes retroactively.
*   Example: branded as “TRAITOR” → guild encounters default to hostile.

### 4. Key Design Principles

*   **Narrative-first:** The Inquisitor encounter is rare, cinematic, and systemically disruptive.
*   **Player Identity as Resource:** Victory/defeat isn’t about HP; it’s about which version of the story becomes dominant.
*   **Replayability:** Since exchanges are LLM-driven, no two trials play the same way.

This system makes the Inquisitor both a persistent narrative algorithm (via Journal claims) and a rare, unforgettable trial event that defines the run.

---

## Key Concepts

### 1. Gemini API Integration

The Gemini API is a cornerstone of the game's dynamic narrative experience. We use it in three key places:

1.  **Origin Story Generation (`generateOriginStory`)**: Creates a unique, multi-page journal for the player to define their character's backstory. This seeds the entire run with narrative context.
2.  **Dynamic Encounter Descriptions (`generateNarrative`)**: For encounters with a blank `description` field, Gemini generates a short, flavorful scene based on the player's current state (Dispositions, Marks, backstory). This makes repeated encounters feel fresh.
3.  **Dynamic Event Resolution (`resolveDynamicEvent`)**: For events marked with `dynamicResolution: true`, Gemini determines the outcome of a player's choice, generating narrative text and mechanical effects based on their character profile.

**Note on Prompts:** The quality of the prompts sent to Gemini is paramount. They are carefully engineered to provide context (player state, event details) and request a specific JSON output format to ensure reliable integration.

### 2. The Identity System (Dispositions & Marks)

This is the system that makes the world feel reactive to the player.

-   **Dispositions**: Broad, slow-changing personality traits (e.g., Forceful, Deceptive, Honorable). They represent the character's core nature and are adjusted by major choices.
-   **Marks**: Specific reputation tags or "badges" acquired from actions (e.g., `MARK_KILLER`, `MARK_MERCIFUL`, `MARK_CHAINSCARRED`). They are more numerous and dynamic than Dispositions and can unlock unique event options or cause NPCs to react differently. The definitions in `src/data/marks.ts` are highly detailed and drive many of the game's reactive systems.

### 3. Character Portability & Divergence (Philosophical Goal)

A core design philosophy is that a character should be primarily defined by their quantitative identity data—their Dispositions and Marks. This data-centric approach should allow for character portability.

-   **Portability**: It should be architecturally simple to export a snapshot of Player A's character state (`PlayerState`) and import it into Player B's game world as a new NPC.
-   **NPC Behavior**: This imported character would then act autonomously in Player B's world, with its behavior and dialogue choices (potentially driven by Gemini) guided by its established Dispositions and Marks.
-   **Divergence**: Once imported, the character is no longer controlled by Player A. It would live on in Player B's world, and its identity would diverge from the original as it experiences new events. Without frequent "alignment" updates from Player A's source character, this NPC would become a unique, independent version of the original.