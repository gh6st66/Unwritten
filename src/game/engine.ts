import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { reduce, INITIAL } from "./stateMachine";
import { GameEvent, GameState } from "./types";
import { EncounterGenerator } from "../systems/EncounterGenerator";
import { MaskForger } from "../systems/MaskForger";
import { WorldContext } from "../gen";
import { FACTIONS_DATA } from "../data/factions";
import { buildRegions } from "../services/worldGen";
import { buildNPCs } from "../services/npcGen";

const STORAGE_KEY = "unwritten:v1";

export function useEngine() {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Check for a saved game on initial mount
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw) as GameState;
            // A valid save is anything not in an initial or loading state
            if (parsed.phase && parsed.phase !== 'TITLE' && !['LOADING', 'WORLD_GEN'].includes(parsed.phase)) {
                setCanContinue(true);
            }
        } catch (e) {
            console.error("Failed to parse saved game state:", e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }
  }, []);

  const encounterGenerator = useMemo(() => new EncounterGenerator(), []);
  const maskForger = useMemo(() => new MaskForger(), []);

  useEffect(() => {
    // Only save state if we're not on the title screen
    if (state.phase !== 'TITLE') {
      // Don't save LOADING/GEN state in case user closes tab
      if (!["LOADING", "WORLD_GEN"].includes(state.phase)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }
  }, [state]);

  useEffect(() => {
    if (state.phase === "WORLD_GEN") {
        if (!state.activeSeed) {
            dispatch({ type: "GENERATION_FAILED", error: "Internal error: Missing seed for world generation." });
            return;
        }
        const ctx: WorldContext = {
            seed: state.runId,
            epoch: "Inquisition", // Placeholder
            gravity: "Order", // Placeholder
            knownFactions: FACTIONS_DATA,
        };
        const regions = buildRegions(ctx, 3);
        const ctxWithRegions: WorldContext = { ...ctx, knownRegions: regions.map(r => ({ id: r.id, name: r.name, biome: r.biome, climate: r.climate })) };
        const npcs = buildNPCs(ctxWithRegions, 12);
        
        dispatch({ type: "WORLD_GENERATED", world: { regions, npcs, factions: FACTIONS_DATA }});
        return;
    }

    if (state.phase !== "LOADING" || state.screen.kind !== 'LOADING') return;

    const { context } = state.screen;

    if (context === 'MASK') {
        const forge = async () => {
            if (!state.forgingInput || !state.activeSeed) {
                dispatch({ type: "GENERATION_FAILED", error: "Internal error: Missing input for mask forging." });
                return;
            }
            try {
              const mask = await maskForger.forge(state.forgingInput, state.activeSeed);
              dispatch({ type: "MASK_FORGED", mask });
            } catch (e) {
              console.error("Mask forging failed:", e);
              const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
              dispatch({ type: "GENERATION_FAILED", error: `Could not forge the mask. ${errorMessage}` });
            }
          };
          forge();
    } 
    
    if (context === 'ENCOUNTER') {
        const generate = async () => {
            if (!state.activeClaim) {
              dispatch({ type: "GENERATION_FAILED", error: "Internal error: No active claim found." });
              return;
            }
            try {
              const encounter = await encounterGenerator.generate(state);
              dispatch({ type: "ENCOUNTER_LOADED", encounter });
            } catch (e) {
              console.error("Encounter generation failed:", e);
              const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
              dispatch({ type: "GENERATION_FAILED", error: errorMessage });
            }
          };
      
          generate();
    }
  }, [state.phase, state.screen, state.runId, state.activeClaim, state.activeSeed, state.forgingInput, encounterGenerator, maskForger]);

  const send = useCallback((ev: GameEvent) => dispatch(ev), []);

  const loadGame = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const snapshot = JSON.parse(raw) as GameState;
            send({ type: "LOAD_STATE", snapshot });
            setCanContinue(false); // Can't continue again after loading
        } catch(e) {
            console.error("Failed to load game state:", e);
            // If loading fails, reset to a clean state
            send({ type: "RESET_GAME" });
        }
    }
  }, [send]);

  const api = useMemo(() => ({ state, send, canContinue, loadGame }), [state, send, canContinue, loadGame]);
  return api;
}