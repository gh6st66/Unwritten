/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { EncounterDef, EventOption, PlayerState } from '../core/types';
import { checkCondition } from '../core/conditions';

interface NarrativeEventViewProps {
    event: EncounterDef;
    playerState: PlayerState;
    onSelectOption: (option: EventOption) => void;
    isLoading: boolean;
}

export const NarrativeEventView: React.FC<NarrativeEventViewProps> = ({ event, playerState, onSelectOption, isLoading }) => {
    const visibleOptions = event.options?.filter(o => checkCondition(o.condition, playerState)) || [];
    
    return (
        <div className="narrative-event-container">
            <h2 className="narrative-event-title">{event.name}</h2>
            <p className={`narrative-event-description ${isLoading ? 'loading' : ''}`}>
                {isLoading ? "A strange feeling washes over you..." : event.description}
            </p>
            {!isLoading && (
                <div className="narrative-event-options">
                    {visibleOptions.map(option => (
                        <div key={option.id} className="narrative-option-wrapper">
                            <button
                                className="narrative-event-button"
                                onClick={() => onSelectOption(option)}
                            >
                                {option.label}
                            </button>
                            {process.env.NODE_ENV !== "production" && option.visibilityHint && (
                                <div className="visibility-hint">{option.visibilityHint}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};