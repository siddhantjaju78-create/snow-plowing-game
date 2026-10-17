/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Wrench, Shield, Zap, Flame, DollarSign, Check, ChevronRight } from 'lucide-react';
import { PlayerUpgrades } from '../types/game.ts';

interface GarageModalProps {
  coins: number;
  upgrades: PlayerUpgrades;
  onUpgrade: (attr: keyof PlayerUpgrades, cost: number) => boolean;
  onClose: () => void;
}

interface UpgradeItem {
  id: keyof PlayerUpgrades;
  name: string;
  description: string;
  icon: React.ReactNode;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  getStatLabel: (level: number) => string;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  coins,
  upgrades,
  onUpgrade,
  onClose,
}) => {
  const items: UpgradeItem[] = [
    {
      id: 'bladeWidth',
      name: 'Plow Blade Width',
      description: 'Expands your cutting edge to plow wider road lanes in a single pass.',
      icon: <Shield className="text-amber-400" size={22} />,
      maxLevel: 4,
      baseCost: 200,
      costMultiplier: 2.2,
      getStatLabel: (lvl) => {
        const widths = ['2.2m Standard', '2.7m Highway', '3.3m Heavy Duty', '4.0m MEGA BLADE'];
        return widths[Math.min(lvl - 1, widths.length - 1)];
      },
    },
    {
      id: 'enginePower',
      name: 'Engine Horsepower & Torque',
      description: 'Increases top speed and powers through deep snowdrifts without losing speed.',
      icon: <Wrench className="text-sky-400" size={22} />,
      maxLevel: 5,
      baseCost: 150,
      costMultiplier: 1.8,
      getStatLabel: (lvl) => `${13 + lvl * 2} MPH Top Speed`,
    },
    {
      id: 'boostCapacity',
      name: 'Turbo Nitro Boost Tank',
      description: 'Extends turbo burn duration and speeds up nitro recharge rate.',
      icon: <Zap className="text-yellow-400" size={22} />,
      maxLevel: 4,
      baseCost: 180,
      costMultiplier: 2.0,
      getStatLabel: (lvl) => `+${lvl * 25}% Nitro Burn`,
    },
    {
      id: 'heatedBlade',
      name: 'Thermal Blade / Salt Spreader',
      description: 'Melts ice instantly and softens packed snowbanks with heated hydraulics.',
      icon: <Flame className="text-rose-400" size={22} />,
      maxLevel: 3,
      baseCost: 350,
      costMultiplier: 2.5,
      getStatLabel: (lvl) => (lvl === 0 ? 'Not Installed' : `Tier ${lvl} Thermal Defrost`),
    },
    {
      id: 'coinCollector',
      name: 'Municipal Plowing Bounty',
      description: 'Increases town coin payout earned per square meter of cleared snow.',
      icon: <DollarSign className="text-emerald-400" size={22} />,
      maxLevel: 4,
      baseCost: 220,
      costMultiplier: 2.2,
      getStatLabel: (lvl) => `x${(1.0 + lvl * 0.4).toFixed(1)} Coin Multiplier`,
    },
  ];

  const getCost = (item: UpgradeItem, currentLevel: number): number => {
    return Math.round(item.baseCost * Math.pow(item.costMultiplier, currentLevel));
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white">
                ALPINE WORKSHOP & GARAGE
              </h2>
              <p className="text-xs text-slate-400">
                Upgrade your heavy winter rig to conquer the blizzards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coins balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-sm">
              <span>$</span>
              <span className="font-mono text-white tabular-nums">{coins.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {items.map((item) => {
            const currentLevel = upgrades[item.id];
            const isMaxed = currentLevel >= item.maxLevel;
            const cost = getCost(item, currentLevel);
            const canAfford = coins >= cost;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {item.name}
                      </h3>
                      {/* Level dots */}
                      <div className="flex gap-1">
                        {Array.from({ length: item.maxLevel }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              idx < currentLevel
                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      {item.description}
                    </p>

                    <span className="text-[11px] font-semibold text-sky-300">
                      Current: {item.getStatLabel(currentLevel)}
                    </span>
                  </div>
                </div>

                {/* Right: Purchase Button */}
                <div className="shrink-0 flex items-center justify-end">
                  {isMaxed ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <Check size={16} />
                      <span>MAX LEVEL</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpgrade(item.id, cost)}
                      disabled={!canAfford}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>UPGRADE</span>
                      <span className="font-mono">${cost}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs text-slate-400">
          <span>Upgrades apply immediately in real time.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all cursor-pointer"
          >
            BACK TO TOWN
          </button>
        </div>
      </div>
    </div>
  );
};
