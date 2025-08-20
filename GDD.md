
# Game Design Document: Unwritten

**Version:** 1.1 (Post-Spec Refactor) 
**Status:** In Development

---

## 1. Vision Statement

**Unwritten** is a mobile-first, narrative roguelike where players embody a recurring mythical figure locked in a struggle against fate. Through a unique **Intent System**, every choice is a calculated risk that shapes the player's identity through persistent **Marks** (reputation) and changes the world across generations through **Echoes** (consequences). It is a game of legacy, consequence, and the stories we leave behind.

- **Genre:** Narrative Roguelike, Interactive Fiction
- **Platform:** Web (Mobile-Optimized)
- **Target Audience:** Fans of deep narrative games like *Cultist Simulator* and *Citizen Sleeper*, and players who appreciate emergent storytelling and persistent world systems.

---

## 2. Core Gameplay Loop

The game is structured in **Runs**, where each Run represents one life of the Unwritten. The goal is not to "win," but to influence the world and manage one's legacy before the inevitable **Collapse**.

1.  **The Journal Writes:** Each Run begins with a **Claim**—a fate imposed upon the player (e.g., "You will betray an ally"). This becomes the central conflict of the run.
2.  **Explore & Interact:** The player navigates a simple world map, triggering narrative **Encounters**. They manage core resources (**Energy, Clarity, Will**) and a pool of **Traits** used for actions.
3.  **Choice & Consequence:** Encounters are resolved through the **Intent System**. The player chooses *how* to act (e.g., `PERSUADE`, `CONFRONT`), and the system calculates the odds and costs based on their current identity.
4.  **Identity Forms:** Choices create or modify **Marks**—persistent reputational scars (e.g., `OATHBREAKER`). Marks are tiered, evolving as the player reinforces certain behaviors.
5.  **Run Collapse:** A run ends through player choice, resource depletion, or reaching a time limit.
6.  **Legacy & Inheritance:** Upon collapse, the player's final Marks are saved to their **Legacy**. They bank **Echo Seeds** based on their actions. The next Run begins with a new vessel inheriting the faded Marks of the last, in a world shaped by their previous choices.

---

## 3. Core Mechanics

### 3.1. The Intent System

The primary conflict resolution mechanic, based on a single, transparent formula.

-   **Intents:** A fixed set of narrative approaches (e.g., `CONFRONT`, `DECEIVE`, `AID`). Each option in an encounter is tied to an Intent.
-   **Traits:** The player's core resources for taking action: `AGG`, `WIS`, `CUN`, and their hybrid combinations.
-   **Scoring & Transparency:** Before committing, the player sees a preview of the **Chance of Success**, **Projected Cost** in Traits/Resources, and the projected rise in **Narrative Tension**. This makes every choice a strategic calculation.
-   **Resolution:** The outcome drains resources and directly influences the player's identity by affecting Marks, Dispositions, and seeding Echoes for future runs.

### 3.2. Identity System

The player character is defined by their actions, not pre-set stats.

-   **Masks:** A core thematic and mechanical element.
    -   **Wearing the Mask:** Halves recognition checks and may hide certain intent options.
    -   **Removing the Mask:** Invokes the full weight of the Unwritten's reputation (Marks), altering encounter text and unlocking Mark-dependent branches. The mask's appearance evolves procedurally based on the player's dominant Marks.
-   **Marks:** Persistent reputational scars with Tiers (-3 to +3) and XP. They are the primary form of legacy, carried between runs (with decay) and influencing Intent resolution.
-   **Dispositions:** Short-term personality alignments (e.g., `HONOR`, `COMPASSION`) that are tracked within a single run and influence Intent scoring.

### 3.3. World & Progression

-   **Echoes:** The manifestation of past actions in future runs. Echoes are selected from a bank of "seeds" generated during a run. An enemy spared may return as an ally; a town helped may offer a unique boon.
-   **Time:** A critical resource tracked in minutes. Every action advances the clock, triggering resource regeneration and world events, and pushing the run towards its eventual time-based collapse.
-   **Tension:** A measure of narrative pressure that rises with risky actions and high-stakes encounters. Higher tension increases the difficulty of all actions, creating a natural rising action curve.

---

## 4. Reward & Progression Systems

*Unwritten* is designed with multiple long-term reward loops to encourage deep engagement.

### 4.1. The Legacy Loop (Run-to-Run)

-   **Echo Seeds:** Generated from significant actions and outcomes. The most heavily weighted seeds are banked at the end of a run.
-   **Echo Manifestation:** At the start of a new run, a limited number of Echoes are drawn from the bank and injected into the world, ensuring variety and consequence.
-   **Boons:** A planned system where banked Echoes can be spent on permanent upgrades.

### 4.2. The Herbalist's Compendium (Collection & Mastery)

This system transforms foraging into a long-term progression vector.

-   **Discovery:** The first time a plant is foraged, it is "discovered," unlocking its entry in the Compendium.
-   **Generative Lore:** Upon discovery, the Gemini API generates a unique botanical illustration and a lore-rich description for the plant, creating a moment of unique reward.
-   **Insight & Mastery:** Each subsequent time a discovered plant is foraged, there is a small, random chance to gain an "Insight." Accumulating Insights levels up that plant, unlocking permanent, passive gameplay bonuses that persist across all future runs (e.g., "+5% chance to find rare plants"). This creates an addictive, variable-ratio reward schedule.

---

## 5. Art & Sound Direction

-   **Visual Aesthetic:** Minimalist, text-centric, and moody. The UI is clean and optimized for mobile, using a dark, low-fantasy color palette. Visual flair comes from procedurally generated content, such as the evocative, ink-wash style illustrations for masks and flora.
-   **Sound Design:** Atmospheric and subtle. A minimalist, ambient soundscape will underscore the contemplative and ominous tone. UI sounds will be tactile but unobtrusive.

---

## 6. Target Platform & Monetization

-   **Platform:** Browser-based application built with modern web technologies, with a responsive design focused on a premium mobile experience.
-   **Monetization:** Designed as a premium, single-purchase experience. No microtransactions.
