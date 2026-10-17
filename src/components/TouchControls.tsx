/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Volume1 } from 'lucide-react';
import { GameEngine } from '../game/gameEngine.ts';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  if (!isTouchDevice) return null;

  const handleTouch = (key: 'forward' | 'backward' | 'left' | 'right' | 'boost', state: boolean) => {
    engine.input[key] = state;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-15 flex justify-between items-end p-4 pb-20 select-none">
      {/* Steering Controls (Bottom Left) */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onTouchStart={() => handleTouch('left', true)}
          onTouchEnd={() => handleTouch('left', false)}
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white active:text-slate-950 shadow-xl transition-all"
        >
          <ArrowLeft size={24} />
        </button>

        <button
          onTouchStart={() => handleTouch('right', true)}
          onTouchEnd={() => handleTouch('right', false)}
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white active:text-slate-950 shadow-xl transition-all"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Throttle, Reverse & Turbo Boost (Bottom Right) */}
      <div className="flex items-end gap-2 pointer-events-auto">
        {/* Turbo Boost */}
        <button
          onTouchStart={() => handleTouch('boost', true)}
          onTouchEnd={() => handleTouch('boost', false)}
          onMouseDown={() => handleTouch('boost', true)}
          onMouseUp={() => handleTouch('boost', false)}
          className="w-14 h-14 rounded-2xl bg-amber-500/80 active:bg-amber-400 border border-amber-400 flex items-center justify-center text-slate-950 shadow-xl transition-all"
        >
          <Zap size={24} className="fill-slate-950" />
        </button>

        {/* Reverse */}
        <button
          onTouchStart={() => handleTouch('backward', true)}
          onTouchEnd={() => handleTouch('backward', false)}
          onMouseDown={() => handleTouch('backward', true)}
          onMouseUp={() => handleTouch('backward', false)}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-slate-700 border border-slate-700 flex items-center justify-center text-white shadow-xl transition-all"
        >
          <ArrowDown size={24} />
        </button>

        {/* Gas / Forward */}
        <button
          onTouchStart={() => handleTouch('forward', true)}
          onTouchEnd={() => handleTouch('forward', false)}
          onMouseDown={() => handleTouch('forward', true)}
          onMouseUp={() => handleTouch('forward', false)}
          className="w-16 h-16 rounded-2xl bg-sky-500/90 active:bg-sky-400 border border-sky-400 flex items-center justify-center text-white active:text-slate-950 shadow-xl transition-all"
        >
          <ArrowUp size={28} />
        </button>
      </div>
    </div>
  );
};
