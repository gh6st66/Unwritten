/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

interface LiveRegionProps {
  message: string;
  // 'polite': waits until the user is idle. 'assertive': interrupts immediately.
  mode?: 'polite' | 'assertive';
}

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * A component that announces messages to screen readers.
 * It works by updating its content, which screen readers detect and read out.
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ message, mode = 'polite' }) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // We need to slightly trick React and screen readers. If the message is the same
    // as the last one, it won't be re-announced. By clearing it and then setting it,
    // we ensure it's always announced.
    if (message) {
        setAnnouncement('');
        const timer = setTimeout(() => {
            setAnnouncement(message);
        }, 100); // A short delay ensures the change is picked up.
        return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      aria-live={mode}
      aria-atomic="true"
      style={visuallyHiddenStyle}
    >
      {announcement}
    </div>
  );
};
