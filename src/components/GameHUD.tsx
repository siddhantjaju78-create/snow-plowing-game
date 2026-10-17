/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Wrench,
  Gift,
  Zap,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume1,
} from 'lucide-react';
import { GameStats, ComboState, VehiclePhysics } from '../types/game.ts';

interface GameHUDProps {
  stats: GameStats;
  combo: ComboState;
  vehicle: VehiclePhysics;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenGarage: () => void;
  onHonk: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  combo,
  vehicle,
  isMuted,
  onToggleMute,
  onOpenPause,
  onOpenGarage,
  onHonk,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Speed calculation in mph/kmh display
  const speedMph = Math.round(Math.abs(vehicle.speed) * 2.2);
  const boostPercent = Math.round(vehicle.boostAvailable * 100);

  // Combo theme colors
  const getComboStyle = (mult: number) => {
    switch (mult) {
      case 2:
        return { badge: 'bg-sky-500/90 text-white', glow: 'text-sky-300' };
      case 3:
        return { badge: 'bg-emerald-500/90 text-white', glow: 'text-emerald-300' };
      case 5:
        return { badge: 'bg-amber-500/90 text-slate-950 font-black', glow: 'text-amber-300' };
      case 8:
        return { badge: 'bg-rose-500/90 text-white font-black', glow: 'text-rose-300' };
      case 10:
        return { badge: 'bg-purple-600/90 text-yellow-300 font-black ring-2 ring-yellow-400', glow: 'text-yellow-300' };
      default:
        return { badge: 'bg-slate-700/80 text-slate-200', glow: 'text-slate-300' };
    }
  };

  const comboStyle = getComboStyle(combo.currentMultiplier);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* 1. TOP PERIMETER STATUS CLUSTERS */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Village Snow Cleared Progress */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-xl pointer-events-auto min-w-[210px]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Roads Cleared
            </span>
            <span className="tabular-nums font-mono text-slate-200 font-bold">
              {stats.percentCleared.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, stats.percentCleared))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
            <span>Clean: <strong className="tabular-nums text-slate-200">{stats.snowClearedSqMeters.toLocaleString()} m²</strong></span>
            <span className="text-amber-400/90 font-medium">Target: 90%</span>
          </div>
        </div>

        {/* Center-Top: Combo Multiplier Active Badge */}
        {combo.currentMultiplier > 1 && (
          <div className="flex flex-col items-center pointer-events-none transform transition-all animate-bounce">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-2xl border border-white/20 ${comboStyle.badge}`}>
              <Sparkles size={16} />
              <span className="text-sm font-black tracking-wider uppercase">
                {combo.tierName}
              </span>
              <span className="text-lg font-black font-mono">
                x{combo.currentMultiplier}
              </span>
            </div>

            {/* Combo Decay Timer Bar */}
            <div className="w-36 h-1.5 bg-slate-900/80 rounded-full mt-1 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.max(0, (combo.timer / combo.maxTimer) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Top-Right: Coins, Gifts, Audio & Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gifts Found */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-lg text-xs font-semibold text-rose-300">
            <Gift size={16} className="text-rose-400" />
            <span className="tabular-nums font-mono text-white">{stats.giftsFound}</span>
            <span className="text-slate-500">/</span>
            <span className="tabular-nums text-slate-400">{stats.totalGifts}</span>
          </div>

          {/* Coins Earned */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-lg text-sm font-black text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-400/40">
              $
            </span>
            <span className="tabular-nums font-mono tracking-tight text-white">
              {stats.coins.toLocaleString()}
            </span>
          </div>

          {/* Upgrade Garage Button */}
          <button
            onClick={onOpenGarage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg transition-all cursor-pointer"
            title="Open Upgrades Garage"
          >
            <Wrench size={16} />
            <span className="hidden sm:inline">GARAGE</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onOpenPause}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
            title="Pause Game"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* 2. ERGONOMIC COLLAPSIBLE BOTTOM DOCK (Unified, 100% Zero Viewport Occlusion) */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        {/* Toggle Collapse Pill */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 mb-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-semibold text-slate-300 shadow-md transition-all cursor-pointer"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp size={14} />
              <span>Show Dashboard</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              <span>Hide Dashboard</span>
            </>
          )}
        </button>

        {/* The Sleek Bottom Glass Dock */}
        {!isDockCollapsed && (
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-8 px-6 py-3 rounded-2xl bg-slate-900/92 border border-slate-700/60 shadow-2xl max-w-3xl w-full">
            {/* Speed Gauge */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800/80 text-sky-400 border border-slate-700/50">
                <Gauge size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono tabular-nums text-white">
                    {speedMph}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    MPH
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Blade: <strong className="text-amber-300">{vehicle.plowWidthWorld.toFixed(1)}m</strong>
                </span>
              </div>
            </div>

            {/* Turbo Boost Meter */}
            <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[220px]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Zap size={13} className="fill-amber-400" />
                  TURBO NITRO
                </span>
                <span className="tabular-nums font-mono text-slate-300 text-[10px]">
                  {boostPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    vehicle.isBoosting
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${boostPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400">Hold [SPACE] to boost</span>
            </div>

            {/* Quick Interactive Horn Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onHonk}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                title="Honk Horn [H]"
              >
                <Volume1 size={16} className="text-amber-400" />
                <span>HORN</span>
                <kbd className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-slate-400 font-mono">H</kbd>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
