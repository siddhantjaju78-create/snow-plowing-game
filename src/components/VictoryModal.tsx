/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Star, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { GameStats } from '../types/game.ts';

interface VictoryModalProps {
  stats: GameStats;
  onContinue: () => void;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onContinue,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Trophy size={32} />
        </div>

        {/* Stars */}
        <div className="flex gap-2 mb-3">
          <Star size={24} className="fill-amber-400 text-amber-400" />
          <Star size={28} className="fill-amber-400 text-amber-400 -translate-y-1" />
          <Star size={24} className="fill-amber-400 text-amber-400" />
        </div>

        <h2 className="text-2xl font-black tracking-wider text-white mb-1">
          TOWN ROADS CLEARED!
        </h2>
        <p className="text-xs text-slate-300 max-w-xs mb-6">
          The villagers can safely drive to school, market, and work thanks to your heroic plowing!
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cleared</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {stats.snowClearedSqMeters.toLocaleString()} m²
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Clean Percentage</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
              {stats.percentCleared.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Highest Combo</span>
            <span className="text-base font-bold font-mono text-sky-400 tabular-nums">
              x{stats.highestCombo}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Holiday Gifts</span>
            <span className="text-base font-bold font-mono text-rose-400 tabular-nums">
              {stats.giftsFound} / {stats.totalGifts}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onContinue}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-wider text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>KEEP PLOWING (FREE ROAM)</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span>PLAY AGAIN (NEW BLIZZARD)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
