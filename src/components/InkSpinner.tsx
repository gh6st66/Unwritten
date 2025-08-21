/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import '../styles/inkSpinner.css';

export const InkSpinner: React.FC = () => (
  <svg
    className="ink-spinner"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loading"
    role="img"
  >
    <defs>
      <filter id="ink-goo-filter">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
          result="goo"
        />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
    <g filter="url(#ink-goo-filter)">
      <circle className="ink-spinner-blot ink-spinner-blot1" cx="50" cy="50" r="15" />
      <circle className="ink-spinner-blot ink-spinner-blot2" cx="50" cy="50" r="10" />
      <circle className="ink-spinner-blot ink-spinner-blot3" cx="50" cy="50" r="12" />
      <circle className="ink-spinner-blot ink-spinner-blot4" cx="50" cy="50" r="8" />
    </g>
  </svg>
);