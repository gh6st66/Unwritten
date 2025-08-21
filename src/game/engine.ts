import { useCallback, useEffect, useMemo, useReducer } from "react";
import { reduce, INITIAL } from "./stateMachine";
import { GameEvent, GameState } from "./types";
import { EncounterGenerator } from "../systems/EncounterGenerator";

const STORAGE_KEY = "unwritten:v1";

export function useEngine() {
  const [state, dispatch] = useReducer(reduce, undefined, () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Prevent loading a "stuck" state from a previous session
    if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        if (parsed.phase === "LOADING") {
            return INITIAL;
        }
        return parsed;
    }
    return INITIAL;
  });

  const encounterGenerator = useMemo(() => new EncounterGenerator(), []);

  useEffect(() => {
    // Don't save LOADING state in case user closes tab
    if (state.phase !== "LOADING") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (state.phase !== "LOADING") return;

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
  }, [state.phase, state.activeClaim, state.player.marks, state.player.maskSeed, encounterGenerator, dispatch]);


  const send = useCallback((ev: GameEvent) => dispatch(ev), []);
  const api = useMemo(() => ({ state, send }), [state, send]);
  return api;
}
