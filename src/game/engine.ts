import { useCallback, useEffect, useMemo, useReducer } from "react";
import { reduce } from "./stateMachine";
import { GameEvent, GameState } from "./types";

const INITIAL: GameState = {
  phase: "INTRO",
  runId: "none",
  player: {
    id: "p1",
    name: "The Unwritten",
    resources: { TIME: 6, CLARITY: 3, CURRENCY: 0 },
    marks: []
  },
  screen: { kind: "INTRO", seed: "hello" }
};

const STORAGE_KEY = "unwritten:v1";

export function useEngine() {
  const [state, dispatch] = useReducer(reduce, undefined, () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : INITIAL;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const send = useCallback((ev: GameEvent) => dispatch(ev), []);
  const api = useMemo(() => ({ state, send }), [state, send]);
  return api;
}
