import React from 'react';
import '../styles/titleScreen.css';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  return (
    <div className="title-screen">
      <div className="title-content">
        <h1 className="game-title">Unwritten</h1>
        <p className="game-subtitle">A narrative roguelike of fate and consequence.</p>
        <button className="start-button" onClick={onStartGame}>
          New Run
        </button>
      </div>
    </div>
  );
};