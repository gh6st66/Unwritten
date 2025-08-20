import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { RunState, EncounterDef, MarkId } from "../core/types";
import { now, applyTimeCost, refillTick } from "../systems/timeUtils";
import { journalResist, journalAccept } from "../systems/JournalEngine";
import { applyOptionEffects, adjustDisposition } from "../systems/mutation";
import { encounters } from "../data/encounters";
import { IntentContext, resolveIntent } from "../systems/intent/IntentEngine";
import { TraitKey } from "../systems/intent/IntentTypes";
import { invertMark } from "../systems/Marks";
import { CollapseTrigger } from "../systems/RunManager";

type RunCtx = {
  state: RunState;
  setState: React.Dispatch<React.SetStateAction<RunState>>;
  availableEncounters: EncounterDef[];
  choose: (encounterId: string, optionId: string) => void;
  toggleMask: () => void;
  endRun: (trigger: CollapseTrigger) => void;
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
    onCollapse: (finalState: RunState, trigger: CollapseTrigger) => void;
}> = ({ initial, children, onCollapse }) => {
  const [state, setState] = useState<RunState>(initial);

  // Tick passive refills on read
  const hydrated = useMemo(() => refillTick(state, now()), [state]);

  const availableEncounters = useMemo(() => {
    return encounters.filter(e => (e.appearsIf ?? []).every(fn => fn(hydrated)));
  }, [hydrated]);

  const toggleMask = useCallback(() => {
    setState(s => ({
      ...s,
      identity: {
        ...s.identity,
        mask: { ...s.identity.mask, wearing: !s.identity.mask.wearing },
      },
    }));
  }, []);

  const endRun = useCallback((trigger: CollapseTrigger) => {
    onCollapse(state, trigger);
  }, [onCollapse, state]);

  const choose = useCallback((encounterId: string, optionId: string) => {
    setState(s => {
      const enc = encounters.find(e => e.id === encounterId);
      if (!enc) return s;
      const opt = enc.options.find(o => o.id === optionId);
      if (!opt) return s;

      let next = { ...s };

      // 1. Apply base time cost
      if (opt.timeCost) next = applyTimeCost(next, opt.timeCost);

      // 2. Handle mask requirements
      if (opt.requiresUnmasked && next.identity.mask.wearing) {
        next.identity.mask.wearing = false; // forced recognition
      }

      // 3. Handle claims
      if (opt.resistClaimId) next = journalResist(next, opt.resistClaimId);
      if (opt.acceptClaimId) next = journalAccept(next, opt.acceptClaimId);

      // 4. Resolve Intent if it exists, otherwise use simple effects
      if (opt.intent && opt.onResolve) {
        const context: IntentContext = {
            runState: next,
            optionCostMult: opt.intent.costMult,
            optionRiskDelta: opt.intent.riskDelta,
            optionSubtletyDelta: opt.intent.subtletyDelta,
            successCap: opt.intent.successCap,
            claimPressure: 0, 
            difficultyMod: 0
        };

        const outcome = resolveIntent(opt.intent.kind, context);
        
        // Apply resource costs
        for(const [key, value] of Object.entries(outcome.costs)) {
            const k = key as TraitKey;
            next.resources[k] = Math.max(0, (next.resources[k] ?? 0) - (value ?? 0));
        }
        
        // Handle dispositions
        for(const d of outcome.dispositionsDelta ?? []) {
            next = adjustDisposition(d.key, d.delta)(next);
        }
        
        // Handle mark inversion on success
        if (outcome.succeeded && opt.invertsMarkId) {
          next = { ...next, identity: { ...next.identity, marks: invertMark(next.identity.marks, opt.invertsMarkId as MarkId, next.identity.generationIndex)}};
        }

        // Apply branch effects from onResolve
        const branchEffects = opt.onResolve[outcome.branchKey ?? ""];
        if(branchEffects && Array.isArray(branchEffects)){
            next = applyOptionEffects(next, branchEffects);
        }

      } else if (opt.effects) {
        // Fallback to legacy/simple effect system
        next = applyOptionEffects(next, opt.effects);
      }

      return next;
    });
  }, []);

  return (
    <RunContext.Provider value={{ state: hydrated, setState, availableEncounters, choose, toggleMask, endRun }}>
      {children}
    </RunContext.Provider>
  );
};