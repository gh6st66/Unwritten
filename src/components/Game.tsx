import React from 'react';
import { GameState, Omen, Origin, Lexeme } from "../game/types";
import { ScreenRenderer } from "./ScreenRenderer";
import { PlayerStatus } from './PlayerStatus';
import { AudioManager } from '../systems/audio/AudioManager';

type Props = {
  state: GameState;
  onAttemptAction: (command: string) => void;
  onStartRun: (origin: Origin) => void;
  onCommitFirstMask: (lexeme: Lexeme) => void;
  onContinueAfterReveal: () => void;
  onAcceptOmen: (omen: Omen, approach: 'embrace' | 'resist') => void;
  onReset: () => void;
  onCloseTester: () => void;
  audioManager: AudioManager;
};

export const Game: React.FC<Props> = (props) => {
  const { state } = props;

  if (state.phase === 'SCENE') {
    return (
       <ScreenRenderer
        screen={state.screen}
        player={state.player}
        state={state}
        {...props}
      />
    );
  }

  return (
    <div className="p-4">
      <ScreenRenderer
        screen={state.screen}
        player={state.player}
        state={state}
        {...props}
      />
    </div>
  );
};
