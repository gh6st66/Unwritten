/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { PlayerState, GameEventV1, StatusType, StatusEffect } from '../core/types';
import DamageNumber from './DamageNumber';

const StatusLingerVFX: React.FC<{ statuses: StatusEffect[]; targetId: string }> = ({ statuses, targetId }) => {
    const [particles, setParticles] = useState<{ key: number; type: StatusType }[]>([]);

    useEffect(() => {
        const intervals: number[] = [];
        const createParticle = (type: StatusType) => {
            setParticles(p => [...p, { key: Math.random(), type }]);
            setTimeout(() => {
                setParticles(p => p.slice(1));
            }, 2000); // Animation duration
        };

        statuses.forEach(status => {
            if (status.type === StatusType.STRENGTH) {
                const id = setInterval(() => createParticle(StatusType.STRENGTH), 2500);
                intervals.push(id as unknown as number);
            }
            if (status.type === StatusType.VULNERABLE) {
                const id = setInterval(() => createParticle(StatusType.VULNERABLE), 2200);
                intervals.push(id as unknown as number);
            }
        });

        return () => intervals.forEach(clearInterval);
    }, [statuses]);

    return (
        <div className="vfx-linger-container">
            {particles.map(p => (
                <div key={p.key} className={`vfx-linger ${p.type.toLowerCase()}`} />
            ))}
        </div>
    );
};


const VFXRenderer: React.FC<{ events: GameEventV1[]; targetId: string }> = ({ events, targetId }) => {
    const [vfx, setVfx] = useState<(GameEventV1 & { key: number })[]>([]);

    useEffect(() => {
        const newVfx = events
            .filter(e => e.payload.targetId === targetId && (e.type === 'BLOCK_SHATTER' || e.type === 'STATUS_APPLY'))
            .map(e => ({ ...e, key: Math.random() }));

        if (newVfx.length > 0) {
            setVfx(currentVfx => [...currentVfx, ...newVfx]);
            const timer = setTimeout(() => {
                setVfx(current => current.slice(newVfx.length));
            }, 1000); // Animation duration + buffer
            return () => clearTimeout(timer);
        }
    }, [events, targetId]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
            {vfx.map(event => {
                if (event.type === 'BLOCK_SHATTER') {
                    const { direction } = event.payload;
                    const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI) + 90;
                    const style = {
                        position: 'absolute',
                        right: '-60px',
                        top: '-30px',
                        transform: `rotate(${angle}deg)`,
                    } as React.CSSProperties;
                    return <div key={event.key} style={style}><div className="vfx-block-shatter" /></div>;
                }
                if (event.type === 'STATUS_APPLY') {
                    const statusClass = event.payload.statusType.toLowerCase();
                    return <div key={event.key} className={`vfx-status-apply ${statusClass}`}><div /></div>;
                }
                return null;
            })}
        </div>
    );
};


interface PlayerStatusProps {
  playerState: PlayerState;
  gameEvents: GameEventV1[];
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ playerState, gameEvents }) => {
  const { currentHealth, maxHealth, block, statusEffects } = playerState;
  const healthPercentage = maxHealth > 0 ? (currentHealth / maxHealth) * 100 : 0;
  const damageEvents = gameEvents.filter((e): e is Extract<GameEventV1, { type: 'DAMAGE' }> => e.type === 'DAMAGE' && e.payload.targetId === 'PLAYER');

  return (
    <div className="player-status">
      <StatusLingerVFX statuses={statusEffects} targetId="PLAYER" />
      <VFXRenderer events={gameEvents} targetId="PLAYER" />
       <div className="damage-number-container">
        {damageEvents.map((event, index) => (
            <DamageNumber key={index} amount={event.payload.amount} />
        ))}
      </div>
      <div className="health-bar-container" aria-label={`Player health: ${currentHealth} of ${maxHealth}`}>
        <div className="health-bar" style={{ width: `${healthPercentage}%` }}></div>
        <div className="health-text">{currentHealth} / {maxHealth}</div>
      </div>
      {block > 0 && (
        <div className="block-display" aria-label={`Player block: ${block}`}>
          🛡️ {block}
        </div>
      )}
      {statusEffects && statusEffects.length > 0 && (
        <div className="status-effects-container">
          {statusEffects.map(status => (
            <div key={`${status.type}-${status.duration}`} className={`status-effect ${status.type.toLowerCase()}`} title={`${status.type} (${status.duration})`}>
              {status.duration}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerStatus;
