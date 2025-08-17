/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';

interface DamageNumberProps {
  amount: number;
}

const DamageNumber: React.FC<DamageNumberProps> = ({ amount }) => {
  const jitter = useMemo(() => ({
    x: (Math.random() - 0.5) * 16,
    y: (Math.random() - 0.5) * 8,
  }), []);

  const style = {
    transform: `translate(${jitter.x}px, ${jitter.y}px)`,
  };

  return (
    <div className="damage-number" style={style}>
      {amount}
    </div>
  );
};

export default DamageNumber;