/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { MarkId, EventId, DispositionId } from './ids';
export * from './ids';

// --- Utility Types ---
export type Brand<T, B extends string> = T & { __brand: B };

// --- Enums ---
export enum Discipline {
  NONE = 'NONE',
  AGGRESSION = 'AGGRESSION',
  WISDOM = 'WISDOM',
  CUNNING = 'CUNNING',
  TACTICS = 'TACTICS',
  GUILE = 'GUILE',
  FURY = 'FURY',
}

export enum EventType {
  COMBAT = 'COMBAT',
  NARRATIVE = 'NARRATIVE',
  SKILL = 'SKILL',
  MAP = 'MAP',
  REST = 'REST',
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  CURSE = 'CURSE',
}

export enum EffectContext {
  ANY = 'ANY',
  COMBAT = 'COMBAT',
  NARRATIVE = 'NARRATIVE',
  SKILL = 'SKILL',
}

export enum EffectType {
  DEAL_DAMAGE = 'DEAL_DAMAGE',
  GAIN_BLOCK = 'GAIN_BLOCK',
  APPLY_STATUS = 'APPLY_STATUS',
  DRAW_CARDS = 'DRAW_CARDS',
  GAIN_TEMP_RESOURCE = 'GAIN_TEMP_RESOURCE',
  BYPASS_CHECK = 'BYPASS_CHECK',
  GAIN_INSIGHT = 'GAIN_INSIGHT',
  LOWER_DIFFICULTY = 'LOWER_DIFFICULTY',
  DEAL_DAMAGE_PER_MISSING_HP = 'DEAL_DAMAGE_PER_MISSING_HP',
  SCRY = 'SCRY',
  EXHAUST_ON_DRAW = 'EXHAUST_ON_DRAW',
  UNPLAYABLE = 'UNPLAYABLE',
  TRIGGER_AI_NARRATIVE = 'TRIGGER_AI_NARRATIVE',
  LOSE_HEALTH = 'LOSE_HEALTH',
  ADD_CARD_TO_DECK = 'ADD_CARD_TO_DECK',
  PLAYER_BONUS = 'PLAYER_BONUS',
  ADD_MARK = 'ADD_MARK',
}

export enum GameStatus {
    LOADING = 'LOADING',
    PLAYING = 'PLAYING',
    VICTORY = 'VICTORY',
    DEFEAT = 'DEFEAT',
}

export enum StatusType {
    STRENGTH = 'STRENGTH',
    VULNERABLE = 'VULNERABLE',
}

export enum Phase {
    PLAYER_START = 'PLAYER_START',
    PLAYER_MAIN = 'PLAYER_MAIN',
    PLAYER_END = 'PLAYER_END',
    ENEMY_START = 'ENEMY_START',
    ENEMY_MAIN = 'ENEMY_MAIN',
    ENEMY_END = 'ENEMY_END',
}

export enum PlayerBonusType {
    MAX_HEALTH = 'MAX_HEALTH',
    START_COMBAT_WISDOM = 'START_COMBAT_WISDOM',
    FIRST_TURN_DRAW = 'FIRST_TURN_DRAW',
}

// --- Character Reputation ---
export type Dispositions = Partial<Record<DispositionId, number>>;

export type MarkCategory = "behavior" | "context" | "social" | "style" | "story";
export type MarkDecayType = "none" | "time" | "node" | "combat";

export interface MarkEffectsDef {
    dcModifiers?: { resolverFamily: string, delta: number }[];
    shopModifiers?: { vendorTag: string, priceDeltaPct: number };
    encounterBias?: { tag: string, weight: number }[];
    narratorFlairs?: string[];
    dispositionNudges?: Partial<Dispositions>;
}

export interface MarkDef {
    id: MarkId;
    category: MarkCategory;
    gradeLabels: string[]; // e.g., ["Soldier", "Mercenary", "Murderer"]
    maxStacks: number;
    decay: { type: MarkDecayType, rate: number };
    tags: string[];
    effectsBySeverity?: { [level: number]: MarkEffectsDef };
    visibility: "public" | "hidden" | "revealed_on_trigger";
}

export interface PlayerMark {
    stacks: number;
    severity: number;
    first_seen_ts: number;
    last_updated_ts: number;
}

export type PlayerMarks = Partial<Record<MarkId, PlayerMark>>;


// --- Data Definitions (from JSON/Data files) ---
export interface ResourceCost {
  aggression?: number;
  wisdom?: number;
  cunning?: number;
}

export interface EffectDef {
  context: EffectContext;
  type: EffectType;
  value?: number;
  params?: string[];
}

export interface CardDef {
  id: string;
  name: string;
  rarity: Rarity;
  discipline: Discipline;
  event_types: EventType[];
  tags: string[];
  cost: ResourceCost;
  effects: EffectDef[];
  upgradeId?: string;
}

export interface NarrativeSeed {
    questionId: string;
    answerId: string;
    text: string;
}

export interface PlayerState {
    race: string;
    currentHealth: number;
    maxHealth: number;
    block: number;
    statusEffects: StatusEffect[];
    bonuses?: PlayerBonusDef[];
    narrativeSeeds?: NarrativeSeed[];
    dispositions: Dispositions;
    marks: PlayerMarks;
}

// --- New Event System Types ---
export type ChoiceContext = {
    player: PlayerState;
    // rng: () => number; // Future-proofing for deterministic RNG
    emitLog: (message: string) => void;
};

export type MarkSeverityGrade = "Soldier" | "Mercenary" | "Murderer" | "Ex-Prisoner" | "Hunted" | string; // Allow for expansion

export type OptionCondition =
  | { type: "HasMark"; mark: MarkId; minStacks?: number; minSeverityGrade?: MarkSeverityGrade }
  | { type: "NotMark"; mark: MarkId }
  | { type: "DispositionAtLeast"; id: DispositionId; value: number }
  | { type: "Any"; of: OptionCondition[] }
  | { type: "All"; of: OptionCondition[] }
  | { type: "None"; of: OptionCondition[] };

export type OptionConditionFn = (p: PlayerState) => boolean;

export interface EventOption {
    id: string;
    label: string;
    description?: string;
    condition?: OptionCondition | OptionConditionFn;
    onChoose: (ctx: ChoiceContext) => GameStateUpdate | void;
    visibilityHint?: string;
}
// --- End New Event System ---


export interface EncounterDef {
  id: EventId;
  name: string;
  event_type: EventType;
  description: string;
  dynamicResolution?: boolean; // If true, Gemini resolves the outcome
  seed?: number;
  enemies?: string[];
  options?: EventOption[];
}

export interface FactionUnlock {
  threshold: number;
  type: string;
  value: string;
}

export interface FactionDef {
  id: string;
  name: string;
  unlocks: FactionUnlock[];
}

export interface EnemyAction {
    type: 'ATTACK' | 'DEFEND' | 'DEBUFF';
    value?: number;
}

export interface EnemyDef {
    id:string;
    name: string;
    maxHealth: number;
    discipline: Discipline;
    actions: EnemyAction[];
}

// --- Origin Story Definitions ---
export interface AnswerDef {
    id: string;
    text: string;
    narrativeSeed: string;
    effects: EffectDef[];
    dispositionAdjustments?: Partial<Dispositions>;
    marksToAdd?: MarkId[];
    // raceHint?: 'Human' | 'Aether-touched' | 'Stoneling' | 'Deep-kin' | 'Woad'; // Race system isolated
}

export interface OriginModifierDef {
    id: string;
    label: string;
    description: string;
    dispositionAdjustments?: Partial<Dispositions>;
    marksToAdd?: MarkId[];
    effects?: EffectDef[];
    narrativeSeedAppend?: string;
}

export interface OriginChoice {
    fragment: AnswerDef;
    modifier: OriginModifierDef;
    pageText: string;
}

export interface FinalizedCharacter {
  playerState: PlayerState;
  startingDeck: string[];
  seal: SealDef;
  originChoices: OriginChoice[];
}

export interface SealDef {
    id: string;
    title: string;
    description: string;
    condition: (choices: OriginChoice[], finalDispositions: Dispositions) => boolean;
    effects: EffectDef[];
    narrativeSeed?: string;
}

// --- End Origin Story ---

export interface PlayerBonusDef {
    type: PlayerBonusType;
    value: number;
}

export interface ArchetypeBonusDef extends PlayerBonusDef {
    description: string;
}

export interface ArchetypeDef {
    id: string;
    name: string;
    description: string;
    bonuses: ArchetypeBonusDef[];
    startingDeck: string[];
}

export interface RaceDef {
    id: string;
    name: string;
    description: string;
    quote: string;
    traits: string[];
}


// --- Runtime State Interfaces (live game objects) ---
export interface StatusEffect {
    type: StatusType;
    duration: number;
}

export interface CardInstance {
    def: CardDef;
    instanceId: string;
}

export interface EnemyIntent {
    action: EnemyAction;
    target: 'PLAYER' | string; // 'PLAYER' or a specific enemy instanceId
}

export interface EnemyInstance {
    def: EnemyDef;
    instanceId: string;
    currentHealth: number;
    currentIntent: EnemyIntent | null;
    statusEffects: StatusEffect[];
}

export type ShakeImpulse = {
    amp: number;
    freq: number;
    duration: number;
    bias: { x: number; y: number };
};

export type GameEventV1 =
    | { v: 1; type: 'DAMAGE'; payload: { targetId: string; amount: number; } }
    | { v: 1; type: 'BLOCK_SHATTER'; payload: { targetId: string; direction: { x: number; y: number }; amount: number; } }
    | { v: 1; type: 'STATUS_APPLY'; payload: { targetId: string; statusType: StatusType; } };

// A single object containing all core, mutable state for the game board.
export interface BoardState {
    playerState: PlayerState;
    enemies: EnemyInstance[];
    hand: CardInstance[];
    phase: Phase;
    turn: number;
}

// Represents a collection of state changes to be applied atomically.
export interface GameStateUpdate {
    playerState?: PlayerState;
    enemies?: EnemyInstance[];
    hand?: CardInstance[];
    narrativeText?: string;
    resources?: {
        aggression?: number;
        wisdom?: number;
        cunning?: number;
    };
    events?: GameEventV1[];
}

// For dynamic event resolutions from Gemini
export interface DynamicEventOutcome {
    narrativeText: string;
    effects: EffectDef[];
    dispositionAdjustments: Partial<Dispositions>;
    marksToAdd?: MarkId[];
}