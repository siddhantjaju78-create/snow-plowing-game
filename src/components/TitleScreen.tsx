/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Play } from 'lucide-react';
import { synthAudio } from '../audio/synthAudio.ts';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none select-none z-20">
      {/* Top Header / Audio toggle */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Alpine Village · 28°F Flurries
          </span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg pointer-events-auto cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl mx-auto">
        {/* Custom SVG Logo Badge */}
        <div className="relative mb-3">
          <svg
            className="w-80 sm:w-96 h-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            viewBox="0 0 400 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Snowy Mountain Peaks Silhouette */}
            <path
              d="M30 85L80 30L125 75L170 15L230 75L275 25L330 85H30Z"
              fill="#1e293b"
              opacity="0.8"
            />
            <path
              d="M70 42L80 30L90 42L80 47L70 42Z"
              fill="#e2e8f0"
            />
            <path
              d="M158 30L170 15L182 30L170 36L158 30Z"
              fill="#e2e8f0"
            />
            <path
              d="M265 37L275 25L285 37L275 42L265 37Z"
              fill="#e2e8f0"
            />

            {/* Plow Blade Shield Ribbon */}
            <path
              d="M40 55H360L335 100H65L40 55Z"
              fill="#0f172a"
              stroke="#f59e0b"
              strokeWidth="3.5"
            />
            <path
              d="M45 58H355"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="8 6"
            />

            {/* Main Title Text with crisp stylized lettering */}
            <text
              x="200"
              y="74"
              textAnchor="middle"
              className="font-black text-2xl tracking-widest fill-amber-400 font-sans"
              style={{ fontWeight: 900, letterSpacing: '0.18em' }}
            >
              SNOWDRIFT
            </text>
            <text
              x="200"
              y="94"
              textAnchor="middle"
              className="font-extrabold text-sm tracking-widest fill-sky-200 uppercase font-sans"
              style={{ letterSpacing: '0.35em' }}
            >
              HERO
            </text>
          </svg>
        </div>

        <p className="text-sky-100/90 text-sm sm:text-base font-medium max-w-md mb-6 leading-relaxed drop-shadow">
          Plow snow off cozy alpine avenues, chain continuous combo multipliers, and customize your winter rig.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="pointer-events-auto group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-lg tracking-wider rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <Play className="fill-slate-950" size={20} />
          <span>START PLOWING</span>
          <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono font-normal">
            SPACE
          </span>
        </button>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="w-full flex justify-center pb-2">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-xl pointer-events-auto">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">WASD / Arrows</kbd>
            <span>Drive</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">Space</kbd>
            <span>Turbo Boost</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">H</kbd>
            <span>Honk Horn</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">Esc / P</kbd>
            <span>Pause</span>
          </span>
        </div>
      </div>
    </div>
  );
};
