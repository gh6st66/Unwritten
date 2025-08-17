/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface NarrativeViewProps {
  isLoading: boolean;
  text: string;
}

const NarrativeView: React.FC<NarrativeViewProps> = ({ isLoading, text }) => {
  if (!isLoading && !text) {
    return null;
  }

  return (
    <div className={`narrative-view ${isLoading ? 'loading' : ''}`} aria-live="polite">
      {isLoading ? "The gears of fate are turning..." : text}
    </div>
  );
};

export default NarrativeView;