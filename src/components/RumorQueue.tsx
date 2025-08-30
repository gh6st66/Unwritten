import React from 'react';
import '../styles/rumorQueue.css';

interface Props {
  commands: string[];
  onCommandClick: (command: string) => void;
  disabled: boolean;
}

export const RumorQueue: React.FC<Props> = ({ commands, onCommandClick, disabled }) => {
  if (!commands || commands.length === 0) {
    return null;
  }

  return (
    <div className="rumor-queue">
      <h3 className="panel-header">Whispers</h3>
      <div className="rumor-list">
        {commands.map((cmd, i) => (
          <button
            key={`${cmd}-${i}`}
            className="rumor-chip"
            onClick={() => onCommandClick(cmd)}
            disabled={disabled}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};