/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { MapNode, NodeType, Zone, MapState, MapEdge } from '../core/mapTypes';
import { EventId, EVENTS } from '../core/ids';

// --- ENCOUNTER POOLS ---
const combatEncounters: EventId[] = [EVENTS.COMBAT_001, EVENTS.COMBAT_002];
const eventEncounters: EventId[] = [EVENTS.EVENT_001, EVENTS.SKILL_001, EVENTS.BEGGAR_PLEA];
const eliteEncounters: EventId[] = [EVENTS.COMBAT_002]; // Placeholder
const bossEncounter: EventId = EVENTS.BOSS_FIGHT_01;

// --- CONSTANTS ---
const MAP_CENTER = { x: 50, y: 50 };
const ZONE_BANDS = {
    [Zone.WILDERNESS]: { rMin: 40, rMax: 45 },
    [Zone.TOWN]: { rMin: 25, rMax: 40 },
    [Zone.RUINS]: { rMin: 10, rMax: 25 },
    [Zone.BOSS]: { rMin: 0, rMax: 10 },
};
const NODE_TYPE_WEIGHTS: Record<Zone, Record<NodeType, number>> = {
    [Zone.WILDERNESS]: { [NodeType.COMBAT]: 60, [NodeType.EVENT]: 30, [NodeType.REST]: 5, [NodeType.SHOP]: 0, [NodeType.ELITE]: 5, [NodeType.BOSS]: 0 },
    [Zone.TOWN]: { [NodeType.COMBAT]: 20, [NodeType.EVENT]: 40, [NodeType.REST]: 20, [NodeType.SHOP]: 15, [NodeType.ELITE]: 5, [NodeType.BOSS]: 0 },
    [Zone.RUINS]: { [NodeType.COMBAT]: 50, [NodeType.EVENT]: 30, [NodeType.REST]: 5, [NodeType.SHOP]: 0, [NodeType.ELITE]: 15, [NodeType.BOSS]: 0 },
    [Zone.BOSS]: { [NodeType.COMBAT]: 0, [NodeType.EVENT]: 0, [NodeType.REST]: 0, [NodeType.SHOP]: 0, [NodeType.ELITE]: 0, [NodeType.BOSS]: 100 },
};
const MIN_NODE_DISTANCE = 15;
const CANDIDATE_COUNT = 3;
const REST_SAFETY_NET_THRESHOLD = 6;
const REST_WEIGHT_BUMP_THRESHOLD = 4;

// --- HELPER FUNCTIONS ---
const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomFloat(min, max));
const pickWeighted = <T extends string>(weights: Record<T, number>): T => {
    const total = Object.values(weights).reduce<number>((sum, weight) => sum + (Number(weight) || 0), 0);
    if (total <= 0) return Object.keys(weights)[0] as T; // Fallback
    let random = Math.random() * total;
    for (const key in weights) {
        random -= weights[key];
        if (random <= 0) {
            return key as T;
        }
    }
    return Object.keys(weights)[0] as T;
};
const getRandomElement = <T>(arr: T[]): T => arr[randomInt(0, arr.length)];

const ensureRestSafetyNet = (candidates: MapNode[], state: MapState): MapNode[] => {
    if (state.quotas.restGap < REST_SAFETY_NET_THRESHOLD) return candidates;

    // If a rest isn't already offered
    if (!candidates.some(c => c.type === NodeType.REST)) {
        // Find a non-essential candidate to replace
        const replaceableIndex = candidates.findIndex(c => c.type !== NodeType.ELITE && c.type !== NodeType.BOSS);
        if (replaceableIndex !== -1) {
            const oldNode = candidates[replaceableIndex];
            candidates[replaceableIndex] = {
                ...oldNode,
                type: NodeType.REST,
                encounterId: EVENTS.REST_SITE, // Placeholder encounter
            };
        }
    }
    return candidates;
};

// --- CORE LOGIC ---

/** Generates candidate nodes for the next step. */
const generateCandidates = (state: MapState, previousNode: MapNode): { newNodes: MapNode[], newEdges: MapEdge[] } => {
    let candidates: MapNode[] = [];
    const edges: MapEdge[] = [];
    const currentAngle = Math.atan2(previousNode.position.y - MAP_CENTER.y, previousNode.position.x - MAP_CENTER.x);

    // Determine target zone based on progress
    const targetZone = state.step < 3 ? Zone.WILDERNESS : state.step < 7 ? Zone.TOWN : Zone.RUINS;

    for (let i = 0; i < CANDIDATE_COUNT; i++) {
        let position: { x: number; y: number };
        let attempts = 0;
        
        // Find a valid position for the new node
        do {
            const angleSpread = Math.PI / 2; // 90 degrees total spread
            const angle = currentAngle + randomFloat(-angleSpread / 2, angleSpread / 2) + (i - 1) * (angleSpread / 2.5);
            const radius = randomFloat(ZONE_BANDS[targetZone].rMin, ZONE_BANDS[targetZone].rMax);
            position = {
                x: MAP_CENTER.x + radius * Math.cos(angle),
                y: MAP_CENTER.y + radius * Math.sin(angle),
            };
            attempts++;
        } while (state.nodes.some(n => distance(n.position, position) < MIN_NODE_DISTANCE) && attempts < 20);

        if (attempts >= 20) continue; // Skip if we can't find a spot

        // Pacing & Fairness Rules
        const baseWeights = { ...NODE_TYPE_WEIGHTS[targetZone] };
        if (state.quotas.restGap >= REST_WEIGHT_BUMP_THRESHOLD) {
            baseWeights.REST = (baseWeights.REST || 0) + 40;
        }
        const nodeType = pickWeighted(baseWeights);

        // Select an encounter for the node type
        let encounterId: EventId;
        switch (nodeType) {
            case NodeType.COMBAT: encounterId = getRandomElement(combatEncounters); break;
            case NodeType.ELITE: encounterId = getRandomElement(eliteEncounters); break;
            case NodeType.EVENT: encounterId = getRandomElement(eventEncounters); break;
            case NodeType.REST: encounterId = EVENTS.REST_SITE; break;
            // TODO: Add SHOP specific "encounters"
            default: encounterId = getRandomElement(eventEncounters); break;
        }

        const newNode: MapNode = {
            id: `step-${state.step}-node-${i}`,
            step: state.step,
            type: nodeType,
            encounterId,
            position,
            zone: targetZone,
        };
        candidates.push(newNode);
        edges.push({ from: previousNode.id, to: newNode.id });
    }
    
    // Safety net for rests
    candidates = ensureRestSafetyNet(candidates, state);
    
    // Add boss node if conditions are met
    if (state.step >= 10) {
        const bossNode: MapNode = {
            id: `step-${state.step}-node-boss`,
            step: state.step,
            type: NodeType.BOSS,
            encounterId: bossEncounter,
            position: MAP_CENTER,
            zone: Zone.BOSS
        }
        candidates.push(bossNode);
        edges.push({ from: previousNode.id, to: bossNode.id });
    }

    return { newNodes: candidates, newEdges: edges };
};

export const generateInitialMapState = (): MapState => {
    const startNode: MapNode = {
        id: 'step-0-node-0',
        step: 0,
        type: NodeType.EVENT,
        encounterId: EVENTS.BEGGAR_PLEA,
        position: { x: 50, y: 95 },
        zone: Zone.WILDERNESS,
    };

    const state: MapState = {
        nodes: [startNode],
        edges: [],
        currentNodeId: startNode.id,
        step: 1,
        quotas: { restGap: 0, shopsSeenSince: 0, elitesSeenSince: 0 },
    };

    const { newNodes, newEdges } = generateCandidates(state, startNode);
    
    state.nodes.push(...newNodes);
    state.edges.push(...newEdges);

    return state;
};

export const advanceMap = (currentState: MapState, chosenNodeId: string): MapState => {
    const chosenNode = currentState.nodes.find(n => n.id === chosenNodeId);
    if (!chosenNode || chosenNode.step !== currentState.step) {
        console.error("Invalid node chosen.");
        return currentState;
    }
    
    // Create new state object
    const newState: MapState = {
        ...currentState,
        currentNodeId: chosenNodeId,
        step: currentState.step + 1,
        // Remove old candidates that were not chosen
        nodes: currentState.nodes.filter(n => n.step <= currentState.step),
        edges: currentState.edges.filter(e => currentState.nodes.find(n => n.id === e.from && n.step < currentState.step)),
        quotas: { ...currentState.quotas }
    };

    // Update quotas
    newState.quotas.restGap = chosenNode.type === NodeType.REST ? 0 : newState.quotas.restGap + 1;
    newState.quotas.elitesSeenSince = chosenNode.type === NodeType.ELITE ? 0 : newState.quotas.elitesSeenSince + 1;
    newState.quotas.shopsSeenSince = chosenNode.type === NodeType.SHOP ? 0 : newState.quotas.shopsSeenSince + 1;

    // Generate next set of candidates, unless the boss was chosen
    if (chosenNode.type !== NodeType.BOSS) {
        const { newNodes, newEdges } = generateCandidates(newState, chosenNode);
        newState.nodes.push(...newNodes);
        newState.edges.push(...newEdges);
    }
    
    return newState;
};