# The Unwritten

A narrative-driven **rogue-lite RPG** where history is fragile, masks carry power, and identity is rewritten by choice.  
You play as **The Unwritten**—a vessel fated to disrupt certainty whenever the world leans too far into stagnation.

This is a **text-based game** built with **React + TypeScript**, featuring:
- Event-driven encounters
- Resource pools that gate actions
- Dispositions (personality sliders) and Marks (reputation tags)
- A map system that reflects geography, time, and fate
- Dynamic narrative generation using the Gemini API

---

## Core Loop: The Life of the Unwritten

Each run follows a repeatable cycle that structures the life of the Unwritten:

1. **The Journal Writes** — a fate-claim is imposed on the player (“You betray allies”).  
2. **Choice Point** — the player must resist or enact the claim through narrative actions.  
3. **Marks** — reputation scars are set, inherited, or inverted based on the outcomes.  
4. **Echoes** — consequences manifest in the world (NPCs, factions, ruins).  
5. **Entropy / Growth** — regions tilt toward ruin or prosperity based on influence.  
6. **Collapse** — the vessel inevitably ends; a new one rises with inherited scars.  

---

## Key Features

- **No traditional combat loop**: Conflict arises from narrative gravity, time pressure, and social consequence.  
- **Masks**: Semi-persistent artifacts that evolve across runs.  
- **Marks & Echoes**: Reputation and legacy systems that make the world remember your actions.  
- **Inquisitor Journal**: An antagonist that imposes fate-claims you must either embrace or resist.  
- **Event System**: Fully data-driven encounters with conditional options and narrative outcomes.  
- **Resource Pools**: Time, Aggression, Wisdom, and Cunning govern available choices.  
- **AI Integration**: Uses Gemini API for dynamic node generation, descriptions, and adaptive encounters.  

---

## Tech Stack

- **Frontend:** React 18, TypeScript  
- **Styling:** CSS3 (Flexbox, Grid, Animations)  
- **Data Layer:** Static JSON/TS definitions (`/src/data`)  
- **Systems:** Custom rules engine for events, resources, and identity  
- **AI Integration:** `@google/genai` for procedural content generation  

---

## Getting Started

This project can be served as static files for quick prototyping, but npm tooling is included for audits and development.

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/the-unwritten.git
   cd the-unwritten
   ```

2. **Serve the files directly (quick test):**

   ```sh
   python -m http.server
   ```

   Or:

   ```sh
   npx serve
   ```

   Then open `http://localhost:8000`.

3. **Install dependencies (for development and scripts):**

   ```sh
   npm install
   ```

4. **Run the no-combat audit script:**

   ```sh
   npm run audit:no-combat
   ```

   *(ensures legacy combat systems don’t sneak back into the codebase)*

---

## Project Roadmap

Development is tracked in phases. See `ROADMAP.md` for details.

* **Phase 1: Foundational Refactor (Complete)** — Removed legacy combat systems.
* **Phase 2: Core Loop Implementation (In Progress)** — Journal, Marks, inheritance.
* **Phase 3: World Systems & Antagonists** — Masks, Echoes, Inquisitor.
* **Phase 4: Polish & Expansion** — New events, UI/UX polish, sound design.

---

## Project Structure

For a full breakdown, see `FILES.md`.

* `src/components` — UI components
* `src/context` — React context for global game state
* `src/core` — Types and core definitions
* `src/data` — Encounters, masks, and other static data
* `src/startup` — Run initialization logic
* `src/systems` — Game systems (intent resolution, time, state mutation)

---

## License

MIT. Do whatever you like, just don’t reintroduce combat and call it “faithful.”
