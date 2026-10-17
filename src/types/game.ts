/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UpgradeTier {
  level: number;
  maxLevel: number;
  name: string;
  description: string;
  cost: number;
  value: number;
  unit: string;
}

export interface PlayerUpgrades {
  bladeWidth: number; // level 1-4
  enginePower: number; // level 1-5
  boostCapacity: number; // level 1-4
  heatedBlade: number; // level 1-3 (melts ice & widens clearing)
  coinCollector: number; // level 1-4 (multiplies earnings)
}

export interface GameStats {
  coins: number;
  totalCoinsEarned: number;
  score: number;
  highScore: number;
  snowClearedSqMeters: number;
  totalSnowClearedSqMeters: number;
  percentCleared: number;
  highestCombo: number;
  giftsFound: number;
  totalGifts: number;
  districtsCompleted: number;
}

export interface ComboState {
  currentMultiplier: number;
  gauge: number; // 0.0 to 1.0 (towards next multiplier)
  timer: number; // remaining seconds before multiplier drops
  maxTimer: number; // total combo window duration
  activeStreakCount: number; // continuous meters cleared
  tierName: string;
}

export interface District {
  id: string;
  name: string;
  description: string;
  targetPercent: number;
  isCompleted: boolean;
  rewardCoins: number;
}

export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'VICTORY';

export interface VehiclePhysics {
  x: number;
  z: number;
  rotation: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  steering: number;
  boostAvailable: number; // 0 to 1
  isBoosting: boolean;
  isPlowing: boolean;
  plowWidthWorld: number;
}
