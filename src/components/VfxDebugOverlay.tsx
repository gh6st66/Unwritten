/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameEventV1, ShakeImpulse } from '../core/types';
import { time } from '../systems/TimeScale';

interface VfxDebugOverlayProps {
  fsmState: any; // The current state of the game's FSM
  lastImpulse?: ShakeImpulse & { key: number };
  eventHistory: GameEventV1[];
}

const formatEvent = (event: GameEventV1) => {
    const payload = JSON.stringify(event.payload);
    return `${event.type}: ${payload}`;
};

const VfxDebugOverlay: React.FC<VfxDebugOverlayProps> = ({ fsmState, lastImpulse, eventHistory }) => {
    const [animScale, setAnimScale] = React.useState(1);

    React.useEffect(() => {
        let frameId: number;
        const update = () => {
            setAnimScale(time.animScale);
            frameId = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, []);

    const fsmDisplay = {
        state: fsmState.name,
        encounterId: fsmState.encounterId || 'N/A',
    };

  return (
    <div className="vfx-debug-overlay">
      <h3>VFX Debug (F9)</h3>
      <div className="debug-info">
        <strong>FSM State:</strong> {fsmDisplay.state}
      </div>
       <div className="debug-info">
        <strong>Encounter ID:</strong> <span style={{fontSize: '10px'}}>{fsmDisplay.encounterId}</span>
      </div>
      <div className="debug-info">
        <strong>Time Scale:</strong> {animScale.toFixed(2)}
      </div>
      <div className="debug-info">
        <strong>Last Shake Impulse:</strong>
        {lastImpulse ? (
            <pre>{`{\n  amp: ${lastImpulse.amp.toFixed(2)},\n  freq: ${lastImpulse.freq},\n  duration: ${lastImpulse.duration}\n}`}</pre>
        ) : 'None'}
      </div>
      <div className="debug-section">
        <strong>Recent Events (10):</strong>
        <ul>
          {eventHistory.map((event, index) => (
            <li key={index}>{formatEvent(event)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VfxDebugOverlay;
