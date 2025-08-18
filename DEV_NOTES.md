# Proposal: Redesign of The Unwritten Core Systems

## Overview

This proposal formalizes recent design revisions to The Unwritten. The game pivots from combat-driven systems toward a narrative roguelike RPG, where conflict arises from time pressure, narrative gravity, and inherited reputation.

The Unwritten is now framed as a balancing archetype in the world’s cosmology, universally recognized and mythologized. Masks, marks, echoes, and world persistence create a layered system of legacy and consequence.

At the heart of the game is the **Run Loop**—a repeatable cycle that structures every life of the Unwritten and every roguelike run.

## Core Loop (The Life of the Unwritten)

1.  **The Journal Writes** — a fate-claim is imposed on the player (“You betray allies”).
2.  **Choice Point** — the player must resist or enact the claim through narrative actions, using the Intent System.
3.  **Marks** — reputation scars are set, inherited, or inverted based on the outcomes.
4.  **Echoes** — consequences manifest in the world (NPCs, factions, ruins).
5.  **Entropy / Growth Outcome** — cities, factions, and the world tilt toward ruin or prosperity.
6.  **Collapse** — the Unwritten inevitably ends; a new vessel rises with inherited scars and a shifting world.

That is a rogelike run: clean, thematic, and infinitely repeatable.

## Core Systems

### 1. Conflict Resolution via the Intent System

Traditional combat is eliminated. Conflict and choice are now resolved through a transparent, narrative-driven **Intent System**. Instead of choosing an attack, the player declares their *approach* to a situation, and the system calculates the potential outcomes based on their character's identity.

This system is built on several key components:

*   **Intents:** A set of defined player approaches to a problem, such as `CONFRONT`, `DECEIVE`, `PERSUADE`, or `DEFY`. Each encounter option is now linked to a specific Intent.
*   **Traits:** The character's core attributes that power Intents. These are the primary resources spent to take action:
    *   `AGG` (Aggression)
    *   `WIS` (Wisdom)
    *   `CUN` (Cunning)
    *   Hybrid traits (`AW`, `AC`, `WC`) for more complex actions.
*   **Intent Vector:** The mathematical "shape" of an Intent, describing its inherent `risk`, `subtlety`, and the `traits` it relies on.
*   **Scoring & Transparency:** Before committing to an action, the player is shown a preview of the `chance of success`, the `projected resource cost`, and the `narrative tension` (a measure of risk vs. resources). This allows for informed, strategic decision-making.
*   **Resolution:** The `IntentEngine` resolves the action, determining success or failure and applying costs. The outcome then directly influences the character's identity and the world state.
*   **Identity Hooks (Signals):** Intents are directly tied to the Mark and Disposition systems. Choosing an `INTIMIDATE` intent might strengthen a `FEARED` Mark, while `PERSUADE` could improve a `COMPASSION` disposition. This creates a tight feedback loop where actions define character, and character influences the success of future actions.

This system makes every choice a statement of character, with mechanically supported consequences.

### 2. The Archetype of the Unwritten

The Unwritten is not a lineage but a recurring vessel of balance. They exist to disrupt fate whenever the world tilts too far toward certainty and stagnation. Recognition is universal: everyone knows the Unwritten on sight, no matter the vessel.

### 3. Masks

Masks are a culturally universal motif—carved from wood, bone, and natural materials. The Unwritten’s mask is unique and semi-persistent across runs, evolving as marks fade or transform.
-   **Wearing the mask:** The player can pass as ordinary, engaging in society unnoticed.
-   **Removing the mask:** Immediate recognition and all consequences of legacy.
Echoes and NPC factions may also bear masks, reflecting their alignment or history.

### 4. Marks (Scars of Fate)

The Journal writes identity-claims (“The Unwritten betrays an ally”). These become Marks, persistent scars of reputation.
-   **Inheritance:** the next run suffers the full weight of recent Marks.
-   **Decay:** over generations, Marks weaken unless renewed by repetition.
-   **Redemption:** players can invert Marks through effort (OATHBREAKER → LOYALIST).

### 5. Echoes (Manifestations of Past Runs)

Past selves and consequences return physically or culturally:
-   NPCs (a deserter turned mercenary leader).
-   Factions (formed around past cruelty or mercy).
-   Monuments, curses, or ruins tied to earlier choices.
Echoes fade across generations but leave permanent traces in lore and geography.

### 6. Entropy vs. Growth Balance

Personal entropy is inevitable: each Unwritten’s life ends in collapse. The world is dynamic, not doomed:
-   Abandon a city → ruin.
-   Aid a city → growth or stability.
-   Betray a city → corruption or hostile takeover.
Across runs, the world becomes a patchwork of decay and prosperity, shaped by the Unwritten’s influence.

### 7. Inquisitors (Institutional Antagonists)

A powerful order that sees the Unwritten as an existential threat to order.
-   **Role:** human face of narrative rigidity—zealots who mistake stagnation for safety.
-   **Aesthetic:** masks and robes covered in script, chains and brands etched with text.
-   **Structure:**
    -   High Inquisitors interpret the Journal.
    -   Scribes brand people with their “true” roles.
    -   Seekers hunt the Unwritten and anomalies.
They are not entropy itself, but the world’s immune response—fate’s bureaucracy.

## Why These Changes Work

-   **Stronger Narrative Identity:** Positions The Unwritten as a mythic roguelike where fate itself is the enemy.
-   **Replayability Without Reset Fatigue:** Legacy ensures every run leaves scars, but decay and redemption allow long-term evolution.
-   **Cultural Depth Through Masks & Myth:** Masks tie anonymity and recognition directly to universal worldbuilding motifs.
-   **Dynamic World State:** Player choices leave permanent scars, creating a patchwork of thriving hubs and wastelands.
-   **Tangible Antagonists:** Inquisitors give human shape to abstract cosmic forces, creating dialogue, temptation, and visible opposition.