/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameStatus } from '../core/types';

interface GameStatusOverlayProps {
  status: GameStatus.VICTORY | GameStatus.DEFEAT;
  onContinue: () => void;
  onEndRun: () => void;
}

const GameStatusOverlay: React.FC<GameStatusOverlayProps> = ({ status, onContinue, onEndRun }) => {
  const isVictory = status === GameStatus.VICTORY;
  const title = isVictory ? 'Victory!' : 'Defeat!';
  const titleClassName = isVictory ? 'status-title victory' : 'status-title defeat';
  const buttonText = isVictory ? 'Continue' : 'Return to Menu';
  const buttonAction = isVictory ? onContinue : onEndRun;

  return (
    <div className="game-status-overlay" role="dialog" aria-labelledby="status-title">
      <h2 id="status-title" className={titleClassName}>{title}</h2>
      <button className="play-again-button" onClick={buttonAction}>
        {buttonText}
      </button>
    </div>
  );
};

export default GameStatusOverlay;