/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface ParserInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export const ParserInput: React.FC<ParserInputProps> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form className="parser-form" onSubmit={handleSubmit}>
      <span className="parser-prompt-icon">&gt;</span>
      <input
        type="text"
        className="parser-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What will you do?"
        disabled={disabled}
        aria-label="Enter your action"
        autoFocus
      />
      <button type="submit" className="parser-submit" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
};
