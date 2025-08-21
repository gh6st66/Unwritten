/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { InkSpinner } from './InkSpinner';
import '../styles/loadingScreen.css';

interface Props {
  message: string;
}

export const LoadingScreen: React.FC<Props> = ({ message }) => {
  return (
    <div className="loading-screen-backdrop" role="alert" aria-busy="true">
      <div className="loading-screen-content">
        <InkSpinner />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};