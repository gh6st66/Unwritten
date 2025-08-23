/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Player } from '../../game/types';
import type { Intent, Lexicon, ParseResult, ResolveResult, SceneIndex, SceneObject, SlotName, FailReason } from './types';

/** Maps a synonym to all its canonical verbs. Returns an empty array if not found. */
function findCanonicals(verb: string | undefined, lexicon: Record<string, string[]>): string[] {
  if (!verb) return [];
  const lowerVerb = verb.toLowerCase();
  const results: string[] = [];

  // Check if it's already a canonical verb.
  if (Object.prototype.hasOwnProperty.call(lexicon, lowerVerb)) {
    results.push(lowerVerb);
  }

  // Check if it's a synonym for any canonical verbs.
  for (const canonical in lexicon) {
    if (Object.prototype.hasOwnProperty.call(lexicon, canonical) && lexicon[canonical].includes(lowerVerb)) {
      if (!results.includes(canonical)) {
        results.push(canonical);
      }
    }
  }
  
  return results;
}

/**
 * High-level resolver. Takes a parsed result and context, returns a final action or failure.
 */
export function resolve(
  p: ParseResult,
  scene: SceneIndex,
  intents: Intent[],
  lexicon: Lexicon,
  player: Player
): ResolveResult {
  // SPECIAL CASE: Handle single-word commands that were parsed as 'inspect <word>'
  // This can happen if the word is a verb (e.g., "leave", "help"). We check if the
  // supposed object is actually a known verb.
  if (p.verb === 'inspect' && p.slots.object && Object.keys(p.slots).length === 1) {
    const potentialNoun = p.slots.object;
    const verbCanonicals = findCanonicals(potentialNoun, lexicon.verbs);
    
    if (verbCanonicals.length > 0) {
      // The word is a verb. Let's see if it can be a zero-argument command.
      const verbIntents = intents.filter(i => verbCanonicals.some(c => i.verbs.includes(c)));
      const zeroArgIntent = verbIntents.find(i => i.slots.length === 0);
      
      if (zeroArgIntent) {
         // It's a valid zero-argument command. Re-parse and proceed.
         p = { raw: p.raw, verb: zeroArgIntent.verbs[0], slots: {} };
      } else if (verbIntents.length > 0) {
         // It's a verb that needs arguments (e.g., "drop needs an object").
         return fail("missing_slots_or_reqs", `What do you want to ${potentialNoun}?`, verbIntents[0].hints);
      }
    }
  }
  
  // 1. Map the parsed verb to all possible canonical verbs.
  const canonicalVerbs = findCanonicals(p.verb, lexicon.verbs);
  if (canonicalVerbs.length === 0) {
    return fail("unknown_verb", `I don't know how to '${p.verb}'.`, suggestVerbs(scene, intents));
  }

  // 2. Find all intents that could match any of these canonicals.
  const candidateIntents = intents.filter(i => canonicalVerbs.some(cv => i.verbs.includes(cv)));
  if (candidateIntents.length === 0) {
    return fail("unknown_intent", `You can't do that here.`, suggestVerbs(scene, intents));
  }

  // 3. Bind objects and other slots from the scene context.
  const bound = bindSlots(p, scene, lexicon);
  if (!bound.ok) {
    // If binding fails, but the verb was ambiguous, check if another interpretation makes sense.
    // E.g., for "look north", object binding fails, but we should proceed to check direction binding for the "move" intent.
    if (bound.reason !== 'unknown_object' && bound.reason !== 'ambiguous_object') {
        return fail(bound.reason!, bound.message!, bound.suggested);
    }
  }
  
  // 4. Find the best intent that matches the available slots and requirements.
  const matchedIntents = candidateIntents.filter(i => {
    const hasAllSlots = i.slots.every(s => bound.bindings[s] !== undefined);
    const meetsReqs = checkRequirements(i, player, scene);
    return hasAllSlots && meetsReqs;
  });

  if (matchedIntents.length === 0) {
     // Check for requirement failures before slot failures.
    const unmetIntent = candidateIntents.find(i => i.slots.every(s => p.slots[s] !== undefined));
    if (unmetIntent && unmetIntent.requirements) {
        return fail(`missing_requirement:${Object.keys(unmetIntent.requirements)[0]}`, "You can't do that right now.", unmetIntent.hints?.slice(0, 3));
    }
    return fail("missing_slots_or_reqs", "That doesn't make sense.", candidateIntents[0]?.hints?.slice(0, 3) ?? []);
  }
  
  // If multiple intents match (e.g. single-word "leave" could be move or drop), we need to prioritize.
  // A simple heuristic: prefer intents with fewer slots for single-word commands.
  const intent = matchedIntents.sort((a, b) => {
    if (Object.keys(p.slots).length === 0) {
        return a.slots.length - b.slots.length; // Prefer zero-slot intents like `move`
    }
    return b.slots.length - a.slots.length; // Otherwise prefer more specific intents
  })[0];

  return {
    ok: true,
    intent_id: intent.id,
    bindings: bound.bindings,
  };
}

// --- Helper Functions ---

function fail(reason: FailReason, message: string, suggested: string[] = []): ResolveResult {
  return { ok: false, reason, message, suggested };
}

function suggestVerbs(scene: SceneIndex, intents: Intent[]): string[] {
  // A simple suggestion engine for now.
  const suggestions: string[] = [];
  if (scene.objects.length > 0) {
    suggestions.push(`inspect ${scene.objects[0].name}`);
  }
  if (intents.find(i => i.id === 'move')) {
    const firstExit = Object.keys(scene.exits)[0];
    if (firstExit) suggestions.push(`go ${firstExit}`);
  }
  return suggestions.slice(0, 3);
}

/** Finds all matching scene objects for a given noun phrase. */
function findObjectsInScene(name: string | undefined, scene: SceneIndex): SceneObject[] {
  if (!name) return [];
  const candidates = scene.objects.filter(o => 
    o.name === name || o.aliases.includes(name) || o.id.startsWith(name)
  );
  if (candidates.length === 0) return [];
  // Sort by salience to break ties if we decide to pick one later.
  return candidates.sort((a, b) => b.salience - a.salience);
}

/** Binds slot fillers from the parse result to concrete entity IDs from the scene. */
function bindSlots(p: ParseResult, scene: SceneIndex, lexicon: Lexicon): { ok: boolean, bindings: Record<string, string>, reason?: FailReason, message?: string, suggested?: string[] } {
  const bindings: Record<string, string> = {};
  let hadObjectFailure = false;

  for (const slotName in p.slots) {
    const value = p.slots[slotName as SlotName];
    if (!value) continue;

    if (slotName === 'object' || slotName === 'target' || slotName === 'tool') {
      const objects = findObjectsInScene(value, scene);
      if (objects.length === 0) {
        hadObjectFailure = true;
        // Don't fail immediately, another interpretation might work.
        // For example, "take north path". "north path" isn't an object, but it could be a direction.
        continue;
      }
      if (objects.length > 1) {
        const suggested = objects.map(o => `inspect ${o.name}`);
        return { ok: false, bindings, reason: 'ambiguous_object', message: `Which '${value}' do you mean?`, suggested };
      }
      bindings[slotName] = objects[0].id;
    } else if (slotName === 'direction') {
      const canonicalDir = findCanonicals(value, lexicon.directions)[0];
      if (canonicalDir && scene.exits[canonicalDir]) {
        bindings.direction = canonicalDir;
      } else if (scene.exits[value]) { // Also check non-canonical, e.g. 'enter' -> 'in'
        bindings.direction = value;
      } else {
         const exitKey = Object.keys(scene.exits).find(k => lexicon.directions[k]?.includes(value));
         if (exitKey) {
            bindings.direction = exitKey;
         } else {
            // It could be something like "north path". Check if a part of it is a direction.
            const words = value.split(' ');
            const dirWord = words.find(w => findCanonicals(w, lexicon.directions).length > 0);
            const canonicalDirFromPhrase = dirWord ? findCanonicals(dirWord, lexicon.directions)[0] : null;
            if (canonicalDirFromPhrase && scene.exits[canonicalDirFromPhrase]) {
              bindings.direction = canonicalDirFromPhrase;
            }
         }
      }
    } else {
      // For other slots like 'topic' or 'lexeme', we just pass the raw value for now.
      bindings[slotName] = value;
    }
  }

  if (hadObjectFailure && Object.keys(bindings).length === 0) {
     return { ok: false, bindings, reason: 'unknown_object', message: `You don't see any '${p.slots.object}' here.` };
  }

  return { ok: true, bindings };
}

/** Checks if the player meets the requirements for an intent. */
function checkRequirements(intent: Intent, player: Player, scene: SceneIndex): boolean {
  if (!intent.requirements) return true;
  const { flags_all, flags_any, resources, location_tag } = intent.requirements;
  
  if (flags_all && !flags_all.every(f => player.flags.has(f))) return false;
  if (flags_any && !flags_any.some(f => player.flags.has(f))) return false;
  
  if (location_tag && !(scene.tags ?? []).some(t => location_tag.includes(t))) return false;

  if (resources) {
    for (const res in resources) {
      if ((player.resources[res as keyof typeof player.resources] || 0) < resources[res]) {
        return false;
      }
    }
  }

  return true;
}