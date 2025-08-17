/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardDef, EncounterDef, FactionDef, EnemyDef, RaceDef, MarkDef, MarkId, EventId } from '../core/types';
import { cardData } from '../data/cards';
import { encounterData } from '../data/encounters';
import { factionData } from '../data/factions';
import { enemyData } from '../data/enemies';
import { raceData } from '../data/races';
import { markData } from '../data/marks';

// In-memory databases for fast access
let _cardDatabase: Map<string, CardDef> = new Map();
let _encounterDatabase: Map<EventId, EncounterDef> = new Map();
let _factionDatabase: Map<string, FactionDef> = new Map();
let _enemyDatabase: Map<string, EnemyDef> = new Map();
let _raceDatabase: Map<string, RaceDef> = new Map();
let _markDatabase: Map<MarkId, MarkDef> = new Map();

/**
 * Initializes all game data from the data modules into Maps for efficient lookup.
 * This should be called once when the application starts.
 */
export const initializeData = () => {
    _cardDatabase = new Map(cardData.map(card => [card.id, card]));
    _encounterDatabase = new Map(encounterData.map(enc => [enc.id, enc]));
    _factionDatabase = new Map(factionData.map(fac => [fac.id, fac]));
    _enemyDatabase = new Map(enemyData.map(enemy => [enemy.id, enemy]));
    _raceDatabase = new Map(raceData.map(race => [race.id, race]));
    _markDatabase = new Map(markData.map(mark => [mark.id, mark]));

    console.log(`[DataLoader] Loaded ${_cardDatabase.size} cards, ${_encounterDatabase.size} encounters, ${_factionDatabase.size} factions, ${_enemyDatabase.size} enemies, ${_raceDatabase.size} races, and ${_markDatabase.size} marks.`);
};

export const getCardById = (id: string): CardDef | undefined => {
    return _cardDatabase.get(id);
};

export const getEncounterById = (id: EventId): EncounterDef | undefined => {
    return _encounterDatabase.get(id);
};

export const getFactionById = (id: string): FactionDef | undefined => {
    return _factionDatabase.get(id);
};

export const getEnemyById = (id: string): EnemyDef | undefined => {
    return _enemyDatabase.get(id);
}

export const getRaceById = (id: string): RaceDef | undefined => {
    return _raceDatabase.get(id);
};

export const getMarkById = (id: MarkId): MarkDef | undefined => {
    return _markDatabase.get(id);
};

export const getCardCount = (): number => {
    return _cardDatabase.size;
}