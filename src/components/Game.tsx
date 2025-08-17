/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { initializeData, getEncounterById, getMarkById, getCardById } from '../systems/DataLoader';
import { DeckManager } from '../systems/DeckManager';
import { BoardState, GameStatus, PlayerState, EventType, EventOption, EncounterDef, EffectType, PlayerBonusDef, NarrativeSeed, AnswerDef, PlayerBonusType, GameStateUpdate, Phase, OriginChoice, SealDef, Dispositions, PlayerMarks, FinalizedCharacter, DISPOSITIONS, GameEventV1, CardDef, ShakeImpulse } from '../core/types';
import { MapState, MapNode, NodeType } from '../core/mapTypes';
import { generateInitialMapState, advanceMap as advanceMapState } from '../systems/MapGenerator';
import { useResourcePools } from '../hooks/useResourcePools';
import { useGameLoopManager } from '../hooks/useGameLoopManager';
import { useInteractionGuard } from '../hooks/useInteractionGuard';
import * as EffectSystem from '../systems/EffectSystem';
import ResourceHUD from './ResourceHUD';
import HandStable from './HandStable';
import EncounterView from './EncounterView';
import NarrativeView from './NarrativeView';
import PlayerStatus from './PlayerStatus';
import TurnControls from './TurnControls';
import GameStatusOverlay from './GameStatusOverlay';
import { LiveRegion } from './LiveRegion';
import { MainMenu } from './MainMenu';
import MapView from './MapView';
import { NarrativeEventView } from './NarrativeEventView';
import { RestSiteView } from './RestSiteView';
import { OriginStoryView, JournalPage } from './OriginStoryView';
import { OriginSummaryView } from './OriginSummaryView';
import { sealData } from '../data/seals';
import '../styles/hand.css';
import '../styles/mainMenu.css';
import '../styles/map.css';
import '../styles/narrativeEvent.css';
import '../styles/originStory.css';
import '../styles/originSummary.css';
import '../styles/restSite.css';
import '../styles/vfx.css';
import '../styles/vfxDebug.css';
import { generateNarrative, generateOriginStory, resolveDynamicEvent } from '../systems/GeminiService';
import { EventId } from '../core/ids';
import { ShakingContainer } from './ShakingContainer';
import { impulseFromEvent, hitStopFromEvent } from '../systems/VfxUtils';
import { microHitStop, applyHitStop, time } from '../systems/TimeScale';
import VfxDebugOverlay from './VfxDebugOverlay';
import { FLAGS } from '../config/flags';

// --- Finite State Machine (FSM) for Views ---
type GameView =
  | { name: 'menu' }
  | { name: 'origin_story' }
  | { name: 'origin_summary', character: FinalizedCharacter }
  | { name: 'map' }
  | { name: 'loading', encounterId: string }
  | { name: 'encounter', encounterId: string, boardState: BoardState, encounterDef: EncounterDef, playerDialogue: string }
  | { name: 'narrative_event', encounterId: string, encounterDef: EncounterDef, isGenerating: boolean }
  | { name: 'rest_site', encounterId: string };

interface RunState {
  playerState: PlayerState;
  deck: string[];
  mapState: MapState;
}

const initialPlayerState: PlayerState = {
  race: 'Human',
  currentHealth: 50,
  maxHealth: 50,
  block: 0,
  statusEffects: [],
  bonuses: [],
  narrativeSeeds: [],
  dispositions: { [DISPOSITIONS.FORCEFUL]: 0, [DISPOSITIONS.DECEPTIVE]: 0, [DISPOSITIONS.HONORABLE]: 0 },
  marks: {}
};
const initialResourceState = { aggression: 3, wisdom: 3, cunning: 3 };
const baseStartingDeck = ['AGG_001', 'AGG_001', 'WIS_001', 'WIS_001', 'CUN_001', 'CUN_001', 'AGG_002', 'CUN_002'];

const describeDispositions = (dispositions: Dispositions): string => {
    // ... (implementation unchanged)
    if (!dispositions || Object.keys(dispositions).length === 0) {
        return "The character's nature is undefined.";
    }
    const sortedDispositions = Object.entries(dispositions)
        .filter(([, value]) => value !== 0)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
    
    if (sortedDispositions.length === 0) {
        return "The character is perfectly balanced.";
    }

    const primary = sortedDispositions[0];
    
    let description = `Primarily ${primary[0]}.`;
    if (sortedDispositions.length > 1) {
        const secondary = sortedDispositions[1];
        description += ` Also known for being ${secondary[0]}.`;
    }
    return description;
}

const describeMarks = (marks: PlayerMarks): string => {
    // ... (implementation unchanged)
    if (!marks || Object.keys(marks).length === 0) {
        return "none";
    }
    return Object.entries(marks).map(([id, markInstance]) => {
        const markDef = getMarkById(id as any);
        if (!markDef) return id.replace('MARK_', '');
        if (!markInstance) return id.replace('MARK_', '');
        const gradeLabel = markDef.gradeLabels[markInstance.severity - 1] || markDef.gradeLabels[markDef.gradeLabels.length - 1];
        const rootLabel = id.replace('MARK_', '').replace(/_/g, ' ');
        // Capitalize first letter
        const formattedRoot = rootLabel.charAt(0).toUpperCase() + rootLabel.slice(1).toLowerCase();
        return `${formattedRoot} (${gradeLabel})`;
    }).join(', ');
};


const Game = () => {
  const [viewState, setViewState] = useState<GameView>({ name: 'menu' });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Origin story state
  const [journalPages, setJournalPages] = useState<JournalPage[]>([]);
  const [isJournalLoading, setIsJournalLoading] = useState(false);

  const [runState, setRunState] = useState<RunState | null>(null);

  // Encounter-specific state
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [deckManager, setDeckManager] = useState<DeckManager | null>(null);

  const [narrativeText, setNarrativeText] = useState('');
  const [shake, setShake] = useState<Record<string, number>>({});
  const [liveMsg, setLiveMsg] = useState("");
  const [gameEvents, setGameEvents] = useState<GameEventV1[]>([]);
  const [shakeImpulse, setShakeImpulse] = useState<ShakeImpulse & { key: number } | undefined>();

  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const eventHistory = useRef<GameEventV1[]>([]);

  const resourcePools = useResourcePools(initialResourceState);
  const gameLoop = useGameLoopManager({ onCombatEnd: setGameStatus });
  const { lock, unlock, isLocked } = useInteractionGuard();

  const { reset: resetResources } = resourcePools;
  const { initialize: initializeGameLoop, advancePhase } = gameLoop;

  // Game Loop for TimeScale
  useEffect(() => {
    let animFrameId: number;
    const loop = () => {
      applyHitStop();
      animFrameId = requestAnimationFrame(loop);
    };
    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const finalizeOriginStory = useCallback((choices: OriginChoice[]) => {
    let startingDeck = [...baseStartingDeck];
    let newPlayerState: PlayerState = JSON.parse(JSON.stringify(initialPlayerState));

    if (!FLAGS.raceSystem) {
        newPlayerState.race = 'Human';
    }

    const narrativeSeeds: NarrativeSeed[] = [];
    const bonuses: PlayerBonusDef[] = [];

    choices.forEach((choice, index) => {
      const { fragment, modifier } = choice;
      let seedText = fragment.narrativeSeed;
      if (modifier.narrativeSeedAppend) {
        seedText += ` ${modifier.narrativeSeedAppend}`;
      }
      narrativeSeeds.push({ questionId: `journal_${index}`, answerId: fragment.id, text: seedText });

      const outcome = EffectSystem.applyNarrativeOutcome(
        [...fragment.effects, ...(modifier.effects || [])],
        { ...fragment.dispositionAdjustments, ...modifier.dispositionAdjustments },
        [...(fragment.marksToAdd || []), ...(modifier.marksToAdd || [])],
        newPlayerState
      );
      newPlayerState = outcome.playerState!;

      outcome.playerState!.bonuses?.forEach(bonus => {
        if (bonus.type && !isNaN(bonus.value)) {
          bonuses.push({ type: bonus.type, value: bonus.value });
        }
      });

      [...fragment.effects, ...(modifier.effects || [])].forEach(effect => {
        if (effect.type === EffectType.ADD_CARD_TO_DECK && effect.params) {
          startingDeck.push(...effect.params);
        }
      });
    });

    const awardedSeal = sealData.find(seal => seal.condition(choices, newPlayerState.dispositions)) || sealData[sealData.length - 1];

    if (awardedSeal.narrativeSeed) {
      narrativeSeeds.push({ questionId: 'seal', answerId: awardedSeal.id, text: awardedSeal.narrativeSeed });
    }
    const sealOutcome = EffectSystem.applyNarrativeOutcome(awardedSeal.effects, {}, [], newPlayerState);
    newPlayerState = sealOutcome.playerState!;

    awardedSeal.effects.forEach(effect => {
      if (effect.type === EffectType.ADD_CARD_TO_DECK && effect.params) {
        startingDeck.push(...effect.params);
      }
      if (effect.type === EffectType.PLAYER_BONUS && effect.params) {
        const bonusType = effect.params[0] as PlayerBonusType;
        const value = parseInt(effect.params[1], 10);
        if (bonusType && !isNaN(value)) {
          bonuses.push({ type: bonusType, value });
        }
      }
    });

    const healthBonus = bonuses.reduce((acc, b) => b.type === PlayerBonusType.MAX_HEALTH ? acc + b.value : acc, 0);

    newPlayerState.maxHealth += healthBonus;
    newPlayerState.currentHealth += healthBonus;
    newPlayerState.bonuses = bonuses;
    newPlayerState.narrativeSeeds = narrativeSeeds;

    setViewState({
        name: 'origin_summary',
        character: {
            playerState: newPlayerState,
            startingDeck,
            seal: awardedSeal,
            originChoices: choices,
        }
    });
    setJournalPages([]);
  }, []);

  const beginRun = useCallback((character: FinalizedCharacter) => {
    if (!character) return;
    const mapState = generateInitialMapState();
    setRunState({
      playerState: character.playerState,
      deck: character.startingDeck,
      mapState,
    });
    setViewState({ name: 'map' });
  }, []);

  const beginOriginStory = useCallback(async () => {
    setViewState({ name: 'origin_story' });
    setIsJournalLoading(true);
    try {
      const pages = await generateOriginStory();
      setJournalPages(pages);
    } catch (error) {
      console.error("Failed to generate origin story. Cannot start game.", error);
      setViewState({ name: 'menu' });
    } finally {
      setIsJournalLoading(false);
    }
  }, []);

  const loadEncounter = useCallback(async (node: MapNode, encounterId: string) => {
    if (!runState) return;

    const encounterDef = getEncounterById(node.encounterId as EventId);
    if (!encounterDef) {
      console.error(`Encounter with id "${node.encounterId}" not found!`);
      setViewState({ name: 'map' }); // Go back to map on error
      return;
    }

    let eventToShow = { ...encounterDef };
    let playerDialogue = '';
    const isDynamicDescription = !eventToShow.description;

    if (isDynamicDescription) {
        // We are already in a loading state, no need to set another flag.
        // The Gemini call will be guarded by the encounterId.
        const narrativeContext = runState.playerState.narrativeSeeds?.map(s => s.text).join('\n') || 'The player character is a blank slate.';
        const dispositionsDescription = describeDispositions(runState.playerState.dispositions);
        const marksDescription = describeMarks(runState.playerState.marks);

        let prompt;
        if (eventToShow.event_type === EventType.COMBAT) {
            prompt = `...`; // Prompt unchanged
        } else {
            prompt = `...`; // Prompt unchanged
        }
        
        const generatedText = await generateNarrative(prompt);

        // Before applying the result, check if the FSM is still waiting for this specific encounter.
        // This is the core guard against race conditions.
        let isStale = false;
        setViewState(currentView => {
            if (currentView.name !== 'loading' || currentView.encounterId !== encounterId) {
                isStale = true;
                console.warn(`Stale Gemini response for ${encounterId} ignored.`);
            }
            return currentView;
        });
        
        if (isStale) {
            unlock();
            return;
        }

        if (eventToShow.event_type === EventType.COMBAT) {
            try {
                const cleanJsonString = generatedText.replace(/^```json\s*|```$/g, '');
                const parsed = JSON.parse(cleanJsonString);
                eventToShow.description = parsed.description;
                playerDialogue = parsed.dialogue;
            } catch (e) {
                console.error("Failed to parse Gemini JSON response for combat.", generatedText, e);
                eventToShow.description = "The air crackles with tension.";
                playerDialogue = "...";
            }
        } else {
            eventToShow.description = generatedText;
        }
    }

    // Final state transition, guaranteed to be for the correct encounter
    setViewState(currentView => {
        if (currentView.name !== 'loading' || currentView.encounterId !== encounterId) {
            return currentView; // Abort if state changed again
        }
        
        if (eventToShow.event_type === EventType.NARRATIVE || eventToShow.event_type === EventType.SKILL) {
            return { name: 'narrative_event', encounterId, encounterDef: eventToShow, isGenerating: false };
        } else { // Combat
            const newDeckManager = new DeckManager(runState.deck);
            setDeckManager(newDeckManager);

            const { initialBoardState } = initializeGameLoop(eventToShow, newDeckManager, runState.playerState);
            resetResources();

            const wisdomBonus = runState.playerState.bonuses?.find(b => b.type === PlayerBonusType.START_COMBAT_WISDOM);
            if (wisdomBonus) {
                resourcePools.gain({ wisdom: wisdomBonus.value });
            }
            
            setNarrativeText('');
            setLiveMsg('');
            setGameStatus(GameStatus.PLAYING);

            return { name: 'encounter', encounterId, boardState: initialBoardState, encounterDef: eventToShow, playerDialogue };
        }
    });
    unlock();

  }, [runState, initializeGameLoop, resetResources, resourcePools, unlock]);

  const selectMapNode = useCallback((node: MapNode) => {
    if (isLocked()) return;
    lock();

    const encounterId = crypto.randomUUID(); // Generate stable ID for this interaction

    // Advance map state synchronously
    setRunState(prev => {
      if (!prev) return null;
      const newMapState = advanceMapState(prev.mapState, node.id);
      return { ...prev, mapState: newMapState };
    });

    // Transition to loading state
    setViewState({ name: 'loading', encounterId });

    // Start async loading process
    if (node.type === NodeType.REST) {
        // Rest sites are simple, no async data needed
        setViewState({ name: 'rest_site', encounterId });
        unlock();
    } else {
        loadEncounter(node, encounterId);
    }
  }, [isLocked, lock, unlock, loadEncounter]);


  const handleCombatDefeat = useCallback(() => {
    setRunState(null);
    setViewState({ name: 'menu' });
  }, []);

  const handleCombatVictory = useCallback(() => {
    if (!runState || viewState.name !== 'encounter') return;

    setRunState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        playerState: viewState.boardState.playerState
      };
    });

    setGameStatus(GameStatus.PLAYING);
    setViewState({ name: 'map' });
  }, [runState, viewState]);

  const handleSelectEventOption = useCallback(async (option: EventOption) => {
    if (isLocked() || !runState || viewState.name !== 'narrative_event') return;
    lock();

    let finalUpdate: GameStateUpdate = {};
    let finalNarrative = "";

    const playerStateDraft = JSON.parse(JSON.stringify(runState.playerState));

    if (viewState.encounterDef.dynamicResolution) {
      setViewState(v => ({ ...v, isGenerating: true } as any));
      const dynamicOutcome = await resolveDynamicEvent(viewState.encounterDef, option, playerStateDraft);
      const updateFromDynamic = EffectSystem.applyNarrativeOutcome(
        dynamicOutcome.effects, dynamicOutcome.dispositionAdjustments, dynamicOutcome.marksToAdd, playerStateDraft
      );
      Object.assign(playerStateDraft, updateFromDynamic.playerState);
      finalNarrative = dynamicOutcome.narrativeText;
    } else {
      const updateFromCallback = option.onChoose({ player: playerStateDraft, emitLog: (msg) => console.log(`[Event Log] ${msg}`) });
      if (updateFromCallback) {
        Object.assign(finalUpdate, updateFromCallback);
      }
    }

    finalUpdate.playerState = playerStateDraft;

    setRunState(prev => ({
      ...prev!,
      playerState: finalUpdate.playerState || prev!.playerState
    }));

    if (finalUpdate.resources) resourcePools.gain(finalUpdate.resources);
    if (finalNarrative) console.log("Dynamic Event Outcome:", finalNarrative);

    if (finalUpdate.playerState?.currentHealth === 0) {
      setGameStatus(GameStatus.DEFEAT);
      handleCombatDefeat();
    } else {
      setViewState({ name: 'map' });
    }

    unlock();
  }, [runState, viewState, isLocked, lock, unlock, resourcePools, handleCombatDefeat]);

  const handleLeaveRestSite = useCallback(() => {
    setViewState({ name: 'map' });
  }, []);

  const handleHeal = useCallback(() => {
    // ... (implementation unchanged)
      if (!runState) return;
      setRunState(prev => {
          if (!prev) return null;
          const playerState = prev.playerState;
          const healAmount = Math.ceil(playerState.maxHealth * 0.30);
          const newHealth = Math.min(playerState.maxHealth, playerState.currentHealth + healAmount);
          setLiveMsg(`Healed for ${newHealth - playerState.currentHealth} health.`);
          return {
              ...prev,
              playerState: { ...playerState, currentHealth: newHealth }
          };
      });
      handleLeaveRestSite();
  }, [runState, handleLeaveRestSite]);

  const handleUpgradeCard = useCallback((cardToUpgrade: CardDef) => {
    // ... (implementation unchanged)
      if (!runState || !cardToUpgrade.upgradeId) return;

      setRunState(prev => {
          if (!prev) return null;
          const deck = [...prev.deck];
          const cardIndex = deck.indexOf(cardToUpgrade.id);
          if (cardIndex > -1) {
              const upgradedCard = getCardById(cardToUpgrade.upgradeId!);
              deck[cardIndex] = cardToUpgrade.upgradeId!;
              setLiveMsg(`Upgraded ${cardToUpgrade.name} to ${upgradedCard?.name}.`);
          }
          return { ...prev, deck };
      });
      handleLeaveRestSite();
  }, [runState, handleLeaveRestSite]);

  useEffect(() => {
    initializeData();
    setIsDataLoaded(true);
  }, []);

  const triggerShake = useCallback((instanceId: string) => {
    // ... (implementation unchanged)
    setShake((m) => ({ ...m, [instanceId]: Date.now() }));
    window.setTimeout(() => {
      setShake((m) => {
        const n = { ...m };
        delete n[instanceId];
        return n;
      });
    }, 260);
  }, []);

  const handlePlayCard = useCallback(async (instanceId: string) => {
    if (isLocked() || viewState.name !== 'encounter' || viewState.boardState.phase !== Phase.PLAYER_MAIN || gameStatus !== GameStatus.PLAYING) return;

    const card = viewState.boardState.hand.find(c => c.instanceId === instanceId);
    if (!card || !deckManager) return;

    if (!resourcePools.canAfford(card.def.cost)) {
      triggerShake(instanceId);
      setLiveMsg(`Cannot play ${card.def.name}. Not enough resources.`);
      return;
    }

    lock();
    setNarrativeText('');

    try {
      resourcePools.spend(card.def.cost);
      const update = await EffectSystem.processCardPlay(card, deckManager, viewState.boardState, viewState.encounterDef);

      if (update.events) {
        setGameEvents(update.events);
        setTimeout(() => setGameEvents([]), 1100);
      }
      
      setViewState(v => {
          if (v.name !== 'encounter') return v;
          const newBoardState = {
              ...v.boardState,
              playerState: update.playerState || v.boardState.playerState,
              enemies: update.enemies || v.boardState.enemies,
              hand: update.hand || v.boardState.hand,
          };
          return { ...v, boardState: newBoardState };
      });

      if (update.narrativeText) setNarrativeText(update.narrativeText);
      if (update.resources) resourcePools.gain(update.resources);

      if (update.enemies?.length === 0) {
        setGameStatus(GameStatus.VICTORY);
      }
    } catch (e) {
      console.error("An error occurred while playing the card.", e);
    } finally {
      unlock();
    }
  }, [viewState, deckManager, gameStatus, resourcePools, lock, unlock, isLocked, triggerShake]);

  const handleEndTurn = useCallback(async () => {
    if (isLocked() || !deckManager || viewState.name !== 'encounter' || gameStatus !== GameStatus.PLAYING || viewState.boardState.phase !== Phase.PLAYER_MAIN) return;

    lock();
    try {
      const { boardState: newBoardState, events } = await advancePhase(viewState.boardState, deckManager);
      setViewState(v => v.name === 'encounter' ? { ...v, boardState: newBoardState } : v);
      if (events) {
        setGameEvents(events);
        setTimeout(() => setGameEvents([]), 1100);
      }
    } finally {
      unlock();
    }
  }, [viewState, deckManager, gameStatus, advancePhase, lock, unlock, isLocked]);

  const handleDefaultAction = useCallback(async () => {
    if (isLocked() || viewState.name !== 'encounter' || viewState.boardState.phase !== Phase.PLAYER_MAIN || gameStatus !== GameStatus.PLAYING) return;

    lock();
    try {
      const update = await EffectSystem.processDefaultAction(viewState.boardState);
      if (update.events) {
        setGameEvents(update.events);
        setTimeout(() => setGameEvents([]), 1100);
      }
      
      setViewState(v => {
          if (v.name !== 'encounter') return v;
          const newBoardState = {
              ...v.boardState,
              playerState: update.playerState || v.boardState.playerState,
              enemies: update.enemies || v.boardState.enemies,
          };
          return { ...v, boardState: newBoardState };
      });

      if (update.enemies?.length === 0) {
        setGameStatus(GameStatus.VICTORY);
      }
    } finally {
      unlock();
    }
  }, [viewState, gameStatus, lock, unlock, isLocked]);

  useEffect(() => {
    // ... (implementation for shake and hit-stop unchanged)
    if (gameEvents.length > 0) {
        eventHistory.current = [...gameEvents, ...eventHistory.current].slice(0, 10);
        const playerState = viewState.name === 'encounter' ? viewState.boardState.playerState : null;
        gameEvents.forEach(event => {
            const impulse = impulseFromEvent(event, playerState);
            if (impulse) {
                setShakeImpulse({ ...impulse, key: Date.now() + Math.random() });
            }
            const hitStopDuration = hitStopFromEvent(event, playerState);
            if (hitStopDuration > 0) {
                microHitStop(hitStopDuration);
            }
        });
    }
  }, [gameEvents, viewState]);

  // Debug overlay toggle
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderEncounterView = () => {
    if (viewState.name !== 'encounter') return null;
    const { boardState, encounterDef, playerDialogue } = viewState;
    
    const handWithState = boardState.hand.map(c => ({
        ...c,
        __shake: !!shake[c.instanceId],
        __disabled: isLocked() || boardState.phase !== Phase.PLAYER_MAIN
    }));

    const canPlayAnyCombatCard = boardState.hand.some(card =>
        card.def.event_types.includes(EventType.COMBAT) &&
        resourcePools.canAfford(card.def.cost)
    );
    const showDefaultAction = boardState.enemies.length > 0 && !canPlayAnyCombatCard;
    
    return (
      <main aria-label="Game Screen" className={`${isLocked() ? 'is-resolving' : ''} ${time.animScale === 0 ? 'hit-stop' : ''}`}>
        <div className="board">
          <ShakingContainer impulse={shakeImpulse} multiplier={1.0}>
            <EncounterView
              encounter={encounterDef}
              enemies={boardState.enemies}
              playerDialogue={playerDialogue}
              gameEvents={gameEvents}
              isLoading={false} // Already handled by FSM
            />
          </ShakingContainer>
          <ShakingContainer impulse={shakeImpulse} multiplier={0.7}>
            <NarrativeView isLoading={isLocked()} text={narrativeText} />
          </ShakingContainer>
          <ShakingContainer impulse={shakeImpulse} multiplier={1.0} className="shaking-overlay">
            <PlayerStatus playerState={boardState.playerState} gameEvents={gameEvents} />
          </ShakingContainer>
        </div>

        <ResourceHUD pools={resourcePools} />
        <TurnControls
          onEndTurn={handleEndTurn}
          isPlayerTurn={boardState.phase === Phase.PLAYER_MAIN}
          onDefaultAction={handleDefaultAction}
          showDefaultAction={showDefaultAction}
          isLocked={isLocked()}
        />
        <HandStable
          hand={handWithState}
          onPlay={handlePlayCard}
          cardSize={{ width: 120, height: 168 }}
          reducedMotion={false}
        />

        {(gameStatus === GameStatus.VICTORY || gameStatus === GameStatus.DEFEAT) && (
          <GameStatusOverlay
            status={gameStatus}
            onContinue={handleCombatVictory}
            onEndRun={handleCombatDefeat}
          />
        )}
      </main>
    );
  }

  const renderContent = () => {
    if (!isDataLoaded) {
      return <main><div className="loading-overlay">Loading game data</div></main>;
    }
    switch (viewState.name) {
      case 'menu':
        return <MainMenu onNavigate={beginOriginStory} />;
      case 'origin_story':
        return <OriginStoryView pages={journalPages} isLoading={isJournalLoading} onComplete={finalizeOriginStory} />;
      case 'origin_summary':
        return <OriginSummaryView character={viewState.character} onBegin={() => beginRun(viewState.character)} describeDispositions={describeDispositions} />;
      case 'map':
        return runState ? <main><MapView mapState={runState.mapState} onSelectNode={selectMapNode} /></main> : <p>Loading map...</p>;
      case 'loading':
        return <main><div className="loading-overlay">Entering the shadows</div></main>;
      case 'encounter':
        return renderEncounterView();
      case 'narrative_event':
        return runState ? <main><NarrativeEventView key={viewState.encounterId} event={viewState.encounterDef} playerState={runState.playerState} onSelectOption={handleSelectEventOption} isLoading={viewState.isGenerating} /></main> : <p>Loading event...</p>;
      case 'rest_site':
        return runState ? <main><RestSiteView key={viewState.encounterId} playerState={runState.playerState} deck={runState.deck} onHeal={handleHeal} onUpgrade={handleUpgradeCard} onLeave={handleLeaveRestSite} /></main> : <p>Loading rest site...</p>;
      default:
        return <MainMenu onNavigate={beginOriginStory} />;
    }
  }

  return (
    <>
      <LiveRegion message={liveMsg} />
      {process.env.NODE_ENV !== 'production' && showDebug && <VfxDebugOverlay fsmState={viewState} lastImpulse={shakeImpulse} eventHistory={eventHistory.current} />}
      {renderContent()}
    </>
  );
};

export default Game;
