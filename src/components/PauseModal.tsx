/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
          <Play size={24} className="translate-x-0.5" />
        </div>

        <h2 className="text-xl font-black tracking-wider text-white mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Take a cozy breather beside the fireplace
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 mb-6">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-wider text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play size={16} />
            <span>RESUME PLOWING</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-850 hover:bg-rose-950/40 border border-slate-700/80 text-rose-300 font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span>RESET TOWN SNOW</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 w-full">
          Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300 font-mono">Esc</kbd> to quickly resume
        </div>
      </div>
    </div>
  );
};
