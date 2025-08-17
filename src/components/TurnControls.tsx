/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface TurnControlsProps {
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  showDefaultAction: boolean;
  onDefaultAction: () => void;
  isLocked: boolean;
}

const TurnControls: React.FC<TurnControlsProps> = ({ onEndTurn, isPlayerTurn, showDefaultAction, onDefaultAction, isLocked }) => {
  return (
    <div className="turn-controls">
      {showDefaultAction && (
        <button
            className="default-action-button"
            onClick={onDefaultAction}
            disabled={!isPlayerTurn || isLocked}
            aria-disabled={!isPlayerTurn || isLocked}
        >
            Default Strike
        </button>
      )}
      <button
        className="end-turn-button"
        onClick={onEndTurn}
        disabled={!isPlayerTurn || isLocked}
        aria-disabled={!isPlayerTurn || isLocked}
      >
        End Turn
      </button>
    </div>
  );
};

export default TurnControls;