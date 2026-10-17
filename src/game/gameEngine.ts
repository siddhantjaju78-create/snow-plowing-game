/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { synthAudio } from '../audio/synthAudio.ts';
import { ThreeSceneManager } from './threeScene.ts';
import {
  GameScreen,
  GameStats,
  ComboState,
  PlayerUpgrades,
  VehiclePhysics,
} from '../types/game.ts';

export class GameEngine {
  public sceneManager: ThreeSceneManager;
  public screen: GameScreen = 'TITLE';

  // Game Statistics
  public stats: GameStats = {
    coins: 100, // Starter funds
    totalCoinsEarned: 100,
    score: 0,
    highScore: 0,
    snowClearedSqMeters: 0,
    totalSnowClearedSqMeters: 0,
    percentCleared: 0,
    highestCombo: 1,
    giftsFound: 0,
    totalGifts: 5,
    districtsCompleted: 0,
  };

  // Upgrades
  public upgrades: PlayerUpgrades = {
    bladeWidth: 1,
    enginePower: 1,
    boostCapacity: 1,
    heatedBlade: 0,
    coinCollector: 1,
  };

  // Combo Multiplier State
  public combo: ComboState = {
    currentMultiplier: 1,
    gauge: 0.0,
    timer: 0.0,
    maxTimer: 4.5,
    activeStreakCount: 0,
    tierName: 'Standard',
  };

  // Vehicle Physics
  public vehicle: VehiclePhysics = {
    x: 0,
    z: -8, // Start at town square plaza
    rotation: 0,
    speed: 0,
    maxSpeed: 14.0,
    acceleration: 18.0,
    steering: 0,
    boostAvailable: 1.0,
    isBoosting: false,
    isPlowing: false,
    plowWidthWorld: 2.2,
  };

  // Input states (continuous held vs edge-triggered)
  public input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    horn: false,
  };

  // Animation frame ID
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private onStateChangeCallback: (() => void) | null = null;
  private hornCooldown: number = 0;

  constructor(sceneManager: ThreeSceneManager) {
    this.sceneManager = sceneManager;
    this.setupKeyboardListeners();
    this.syncUpgradeStats();

    // Start simulation loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public setOnStateChange(callback: () => void) {
    this.onStateChangeCallback = callback;
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback();
    }
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Audio unlock on user interaction
      synthAudio.unlock();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = true;
      if (e.code === 'Space') {
        if (this.screen === 'TITLE') {
          this.startGame();
        } else {
          this.input.boost = true;
        }
      }
      if (e.code === 'KeyH') {
        this.triggerHorn();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.screen === 'PLAYING') {
          this.setScreen('PAUSED');
        } else if (this.screen === 'PAUSED') {
          this.setScreen('PLAYING');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'Space') this.input.boost = false;
    });

    // Clear held keys on window blur
    window.addEventListener('blur', () => {
      this.input.forward = false;
      this.input.backward = false;
      this.input.left = false;
      this.input.right = false;
      this.input.boost = false;
    });
  }

  public startGame() {
    synthAudio.unlock();
    this.setScreen('PLAYING');
    synthAudio.playUpgradeChime();
  }

  public setScreen(screen: GameScreen) {
    this.screen = screen;
    this.notifyStateChange();
  }

  public triggerHorn() {
    if (this.hornCooldown <= 0) {
      synthAudio.playHorn();
      this.hornCooldown = 0.5;
    }
  }

  public syncUpgradeStats() {
    const bladeWidths = [2.2, 2.7, 3.3, 4.0];
    this.vehicle.plowWidthWorld = bladeWidths[Math.min(this.upgrades.bladeWidth - 1, bladeWidths.length - 1)];
    this.vehicle.maxSpeed = 13.0 + this.upgrades.enginePower * 2.2;
    this.vehicle.acceleration = 16.0 + this.upgrades.enginePower * 3.0;
    this.sceneManager.updateBladeUpgrade(this.upgrades.bladeWidth);
  }

  public upgradeAttribute(attr: keyof PlayerUpgrades, cost: number): boolean {
    if (this.stats.coins >= cost) {
      this.stats.coins -= cost;
      this.upgrades[attr]++;
      this.syncUpgradeStats();
      synthAudio.playUpgradeChime();
      this.notifyStateChange();
      return true;
    }
    return false;
  }

  private loop(now: number) {
    this.animFrameId = requestAnimationFrame(this.loop);

    // Delta time clamped to avoid large jumps on tab switch
    const rawDt = (now - this.lastTime) / 1000;
    const delta = Math.min(rawDt, 0.05);
    this.lastTime = now;

    if (this.hornCooldown > 0) {
      this.hornCooldown -= delta;
    }

    if (this.screen === 'PLAYING') {
      this.updatePhysics(delta);
      this.updatePlowing(delta);
      this.updateCombo(delta);
      this.checkGifts();
    }

    // Camera follow & visual animations
    const isTitle = this.screen === 'TITLE';
    this.sceneManager.updateCamera(this.vehicle.x, this.vehicle.z, delta, isTitle);
    this.sceneManager.animateVisuals(this.vehicle.speed, delta, this.vehicle.isBoosting);

    // Render WebGL frame
    this.sceneManager.render();
  }

  private updatePhysics(delta: number) {
    const v = this.vehicle;

    // 1. Boost handling
    const wantsBoost = this.input.boost && v.boostAvailable > 0.05 && v.speed > 1.0;
    if (wantsBoost) {
      v.isBoosting = true;
      const drainRate = 0.35 / (1.0 + this.upgrades.boostCapacity * 0.3);
      v.boostAvailable = Math.max(0, v.boostAvailable - delta * drainRate);
      if (Math.random() < 0.2) synthAudio.playBoostSound();
    } else {
      v.isBoosting = false;
      // Recharge boost slowly when moving or idle
      const rechargeRate = 0.12 + this.upgrades.boostCapacity * 0.05;
      v.boostAvailable = Math.min(1.0, v.boostAvailable + delta * rechargeRate);
    }

    // 2. Throttle & Acceleration
    const effectiveMaxSpeed = v.maxSpeed * (v.isBoosting ? 1.6 : 1.0);
    const effectiveAccel = v.acceleration * (v.isBoosting ? 1.8 : 1.0);

    if (this.input.forward) {
      v.speed = Math.min(effectiveMaxSpeed, v.speed + effectiveAccel * delta);
    } else if (this.input.backward) {
      v.speed = Math.max(-effectiveMaxSpeed * 0.5, v.speed - effectiveAccel * 0.8 * delta);
    } else {
      // Natural rolling friction / engine drag
      if (v.speed > 0) {
        v.speed = Math.max(0, v.speed - 9.0 * delta);
      } else if (v.speed < 0) {
        v.speed = Math.min(0, v.speed + 9.0 * delta);
      }
    }

    // 3. Steering & Turning
    let steerTarget = 0;
    if (this.input.left) steerTarget += 1.0;
    if (this.input.right) steerTarget -= 1.0;

    v.steering = THREE.MathUtils.damp(v.steering, steerTarget, 9.0, delta);

    // Turn vehicle if moving
    if (Math.abs(v.speed) > 0.1) {
      const turnMultiplier = (v.speed > 0 ? 1 : -1) * (2.4 - Math.min(1.0, Math.abs(v.speed) / effectiveMaxSpeed) * 0.8);
      v.rotation += v.steering * turnMultiplier * delta;
    }

    // Update front wheel visual turning
    const frontWheelAngle = v.steering * 0.45;
    this.sceneManager.vehicleMesh.frontWheelPivots.forEach((pivot) => {
      pivot.rotation.y = frontWheelAngle;
    });

    // 4. Movement vector & position update
    const forwardX = Math.sin(v.rotation);
    const forwardZ = Math.cos(v.rotation);

    const prevX = v.x;
    const prevZ = v.z;

    v.x += forwardX * v.speed * delta;
    v.z += forwardZ * v.speed * delta;

    // 5. Obstacle Collision Resolution
    const vehicleRadius = 1.6;
    for (const obs of this.sceneManager.obstacles) {
      const dx = v.x - obs.x;
      const dz = v.z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = obs.radius + vehicleRadius;

      if (dist < minDist && dist > 0.001) {
        // Soft elastic push back
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushZ = (dz / dist) * overlap;
        v.x += pushX;
        v.z += pushZ;

        // Bump bounce
        if (Math.abs(v.speed) > 2.0) {
          synthAudio.playBumpSound();
        }
        v.speed *= -0.3; // Rebound
      }
    }

    // Boundary bounds (town limits)
    const limit = (ThreeSceneManager as unknown as { WORLD_SIZE?: number }).WORLD_SIZE || 55;
    v.x = Math.max(-limit, Math.min(limit, v.x));
    v.z = Math.max(-limit, Math.min(limit, v.z));

    // Update 3D vehicle mesh transform
    const meshGroup = this.sceneManager.vehicleMesh.group;
    meshGroup.position.set(v.x, 0, v.z);
    meshGroup.rotation.y = v.rotation;

    // Slight vehicle tilt / suspension roll during turns
    const rollTilt = -v.steering * (Math.abs(v.speed) / v.maxSpeed) * 0.07;
    meshGroup.rotation.z = THREE.MathUtils.damp(meshGroup.rotation.z, rollTilt, 8.0, delta);

    // Audio frequency update based on speed
    synthAudio.updateEngineSound(Math.abs(v.speed) / effectiveMaxSpeed, v.isBoosting);
  }

  private updatePlowing(delta: number) {
    const v = this.vehicle;

    if (Math.abs(v.speed) < 0.2) {
      v.isPlowing = false;
      synthAudio.updatePlowingSound(false, 0);
      return;
    }

    // Calculate blade world center (positioned at front of plow)
    const bladeOffset = 2.1;
    const bladeWorldX = v.x + Math.sin(v.rotation) * bladeOffset;
    const bladeWorldZ = v.z + Math.cos(v.rotation) * bladeOffset;

    // Plow snow mask
    const plowResult = this.sceneManager.snowSystem.plowSnow(
      bladeWorldX,
      bladeWorldZ,
      v.rotation,
      v.plowWidthWorld,
      this.upgrades.heatedBlade
    );

    v.isPlowing = plowResult.isPlowingFreshSnow;
    const normSpeed = Math.abs(v.speed) / v.maxSpeed;
    synthAudio.updatePlowingSound(v.isPlowing, normSpeed);

    if (plowResult.clearedSqMeters > 0) {
      this.stats.snowClearedSqMeters += plowResult.clearedSqMeters;
      this.stats.totalSnowClearedSqMeters += plowResult.clearedSqMeters;
      this.stats.percentCleared = this.sceneManager.snowSystem.getPercentCleared();

      // Combo progression
      this.combo.activeStreakCount += plowResult.clearedSqMeters;
      this.combo.timer = this.combo.maxTimer;

      // Charge combo gauge (faster with higher levels)
      const gaugeGain = (plowResult.clearedSqMeters / (6 + this.combo.currentMultiplier * 4));
      this.combo.gauge += gaugeGain;

      if (this.combo.gauge >= 1.0) {
        this.advanceComboTier();
      }

      // Coins award with combo multiplier and upgrade bonus
      const coinRate = (0.35 + this.upgrades.coinCollector * 0.25) * this.combo.currentMultiplier;
      const coinGain = Math.floor(plowResult.clearedSqMeters * coinRate);
      if (coinGain > 0) {
        this.stats.coins += coinGain;
        this.stats.totalCoinsEarned += coinGain;
        this.stats.score += coinGain * 10;
        if (Math.random() < 0.12) {
          synthAudio.playCoinChime(0.9 + this.combo.currentMultiplier * 0.1);
        }
      }

      if (this.stats.score > this.stats.highScore) {
        this.stats.highScore = this.stats.score;
      }

      // Check Victory Condition (90% cleared)
      if (this.stats.percentCleared >= 90 && this.screen === 'PLAYING') {
        this.setScreen('VICTORY');
        synthAudio.playUpgradeChime();
      }

      this.notifyStateChange();
    }
  }

  private advanceComboTier() {
    const multipliers = [1, 2, 3, 5, 8, 10];
    const tierNames = ['Standard', 'Chilly Streak x2', 'Frost Rush x3', 'Blizzard Surge x5', 'Avalanche Master x8', 'ABSOLUTE ZERO x10!'];

    const currentIndex = multipliers.indexOf(this.combo.currentMultiplier);
    if (currentIndex < multipliers.length - 1) {
      const nextIndex = currentIndex + 1;
      this.combo.currentMultiplier = multipliers[nextIndex];
      this.combo.tierName = tierNames[nextIndex];
      this.combo.gauge = 0;
      this.combo.maxTimer = Math.max(3.0, 4.8 - nextIndex * 0.25);
      this.combo.timer = this.combo.maxTimer;

      if (this.combo.currentMultiplier > this.stats.highestCombo) {
        this.stats.highestCombo = this.combo.currentMultiplier;
      }

      synthAudio.playComboUp(this.combo.currentMultiplier);
      this.notifyStateChange();
    } else {
      this.combo.gauge = 1.0; // Max reached
    }
  }

  private updateCombo(delta: number) {
    if (this.combo.currentMultiplier > 1) {
      this.combo.timer -= delta;
      if (this.combo.timer <= 0) {
        // Multiplier decayed
        this.combo.currentMultiplier = 1;
        this.combo.gauge = 0;
        this.combo.timer = 0;
        this.combo.tierName = 'Standard';
        this.notifyStateChange();
      }
    }
  }

  private checkGifts() {
    const v = this.vehicle;
    for (const gift of this.sceneManager.giftItems) {
      if (!gift.collected) {
        const dx = v.x - gift.x;
        const dz = v.z - gift.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.2) {
          gift.collected = true;
          gift.mesh.visible = false;
          this.stats.giftsFound++;
          const bonusCoins = 150 * this.combo.currentMultiplier;
          this.stats.coins += bonusCoins;
          this.stats.score += 2500;
          synthAudio.playComboUp(5);
          synthAudio.playCoinChime(1.5);
          this.notifyStateChange();
        }
      }
    }
  }

  public restartGame() {
    this.sceneManager.snowSystem.resetSnow();
    this.vehicle.x = 0;
    this.vehicle.z = -8;
    this.vehicle.rotation = 0;
    this.vehicle.speed = 0;
    this.stats.percentCleared = 0;
    this.stats.snowClearedSqMeters = 0;
    this.stats.giftsFound = 0;
    this.combo.currentMultiplier = 1;
    this.combo.gauge = 0;
    this.sceneManager.giftItems.forEach((g) => {
      g.collected = false;
      g.mesh.visible = true;
    });
    this.setScreen('PLAYING');
    synthAudio.playUpgradeChime();
  }

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    synthAudio.dispose();
  }
}
