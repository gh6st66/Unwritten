

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { RunState, Encounter, EncounterOption, Trait, Resources, Disposition, Mark, MarkId, LocationId } from "../core/types";
import { encounters } from "../data/encounters";
import { previewOption, Preview } from "../core/intent";
import { advanceTime } from "../core/time";
import { applyMarkXP } from "../core/marks";
import { ForageParams, forage as forageEngine } from "../systems/ForageEngine";
import { travel as travelEngine } from "../systems/TravelEngine";
import { rest as restEngine } from "../systems/RestEngine";

type RunCtx = {
  state: RunState;
  availableEncounters: Encounter[];
  preview: (encId: string, optId: string) => Preview | null;
  choose: (encId: string, optId: string) => void;
  forage: (params: ForageParams) => void;
  travel: (to: LocationId, willCost: number) => void;
  rest: (hours: number) => void;
};

const RunContext = createContext<RunCtx | null>(null);
export const useRun = () => {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("RunContext missing");
  return ctx;
};

export const RunProvider: React.FC<{ 
    initial: RunState; 
    children: React.ReactNode;
    onCollapse: (finalState: RunState) => void;
}> = ({ initial, children, onCollapse }) => {
  const [state, setState] = useState<RunState>(initial);

  const availableEncounters = useMemo(() => {
    return encounters.filter(e => !e.location || e.location === state.locationId);
  }, [state.locationId]);

  const preview = useCallback((encId: string, optId: string): Preview | null => {
    const enc = encounters.find(e => e.id === encId);
    const opt = enc?.options.find(o => o.id === optId);
    if (!enc || !opt) return null;
    return previewOption(state, enc, opt);
  }, [state]);

  const choose = useCallback((encId: string, optId: string) => {
    const enc = encounters.find(e => e.id === encId);
    const opt = enc?.options.find(o => o.id === optId);
    if (!enc || !opt) return;

    const p = previewOption(state, enc, opt);
    const roll = Math.random();
    const succeeded = roll < p.chance;
    
    const outcome = opt.outcomes.find(o => o.kind === (succeeded ? "SUCCESS" : "FAIL")) ?? opt.outcomes[0];

    setState(s => {
        let next = { ...s };

        // 1. Advance time
        next = advanceTime(next, 20); // TODO: use time.json

        // 2. Apply costs
        next.traits = { ...next.traits };
        next.resources = { ...next.resources };
        for (const [key, value] of Object.entries(p.projectedCosts)) {
            if (key in next.traits) {
                const k = key as Trait;
                next.traits[k] = Math.max(0, (next.traits[k] ?? 0) - value);
            } else if (key in next.resources) {
                const k = key as keyof Resources;
                next.resources[k] = Math.max(0, next.resources[k] - value);
            }
        }
        
        // 3. Apply outcome deltas
        if (outcome.resourceDelta) {
            for (const [key, value] of Object.entries(outcome.resourceDelta)) {
                const k = key as keyof Resources;
                next.resources[k] = Math.min(next.resources.maxEnergy, next.resources[k] + value);
            }
        }
        if (outcome.traitDelta) {
             for (const [key, value] of Object.entries(outcome.traitDelta)) {
                const k = key as Trait;
                next.traits[k] = Math.max(0, (next.traits[k] ?? 0) + value);
            }
        }
        if (outcome.dispositionDelta) {
            next.dispositions = { ...next.dispositions };
            for (const [key, value] of Object.entries(outcome.dispositionDelta)) {
                const k = key as Disposition;
                next.dispositions[k] = (next.dispositions[k] ?? 0) + value;
            }
        }
        if (outcome.markEffects) {
            let marks = [...next.marks];
            for (const effect of outcome.markEffects) {
                marks = applyMarkXP(marks, effect.id, effect.deltaXp ?? 0);
                // Tier logic would go here
            }
            next.marks = marks;
        }

        // 4. Update tension
        next.tension = p.projectedTension;

        // TODO: Handle echo seeds

        // 5. Log outcome
        next.log = [...next.log, { id: crypto.randomUUID(), text: outcome.text, timestamp: Date.now() }];
        
        return next;
    });

  }, [state]);

  const forage = useCallback((params: ForageParams) => {
    setState(s => {
      const { next, outcome } = forageEngine(s, params);
      const newLogs = outcome.map(o => ({ id: crypto.randomUUID(), text: o.log, timestamp: Date.now() }));
      return { ...next, log: [...s.log, ...newLogs] };
    });
  }, []);

  const travel = useCallback((to: LocationId, willCost: number) => {
    setState(s => {
      const result = travelEngine(s, to, willCost);
      if ('error' in result) {
        console.error(result.error);
        const log = { id: crypto.randomUUID(), text: result.error, timestamp: Date.now() };
        return { ...s, log: [...s.log, log] };
      }
      const log = { id: crypto.randomUUID(), text: result.log, timestamp: Date.now() };
      return { ...result.next, log: [...result.next.log, log] };
    });
  }, []);

  const rest = useCallback((hours: number) => {
    setState(s => {
      const { next, outcome } = restEngine(s, hours);
      const newLogs = outcome.map(o => ({ id: crypto.randomUUID(), text: o.log, timestamp: Date.now() }));
      return { ...next, log: [...next.log, ...newLogs] };
    });
  }, []);

  const value = { state, availableEncounters, preview, choose, forage, travel, rest };

  return (
    <RunContext.Provider value={value}>
      {children}
    </RunContext.Provider>
  );
};