/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ThreeSceneManager } from './game/threeScene.ts';
import { GameEngine } from './game/gameEngine.ts';
import { synthAudio } from './audio/synthAudio.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { GarageModal } from './components/GarageModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';
import { TouchControls } from './components/TouchControls.tsx';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'VICTORY'>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Initialize Three.js scene manager inside isolated container
    const sceneManager = new ThreeSceneManager(canvasMountRef.current);
    const engine = new GameEngine(sceneManager);
    engineRef.current = engine;

    // Subscribe to engine state updates for React HUD synchronization
    engine.setOnStateChange(() => {
      setScreen(engine.screen);
      setTick((t) => (t + 1) % 100000);
    });

    // Resize handler
    const handleResize = () => {
      sceneManager.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      sceneManager.dispose();
    };
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    synthAudio.setMuted(nextMuted);
  };

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleHonk = () => {
    if (engineRef.current) {
      engineRef.current.triggerHorn();
    }
  };

  const handleUpgrade = (attr: Parameters<GameEngine['upgradeAttribute']>[0], cost: number) => {
    if (engineRef.current) {
      return engineRef.current.upgradeAttribute(attr, cost);
    }
    return false;
  };

  const currentEngine = engineRef.current;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Screen Views and Overlays */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen !== 'TITLE' && currentEngine && (
        <>
          {/* Main Gameplay HUD */}
          <GameHUD
            stats={currentEngine.stats}
            combo={currentEngine.combo}
            vehicle={currentEngine.vehicle}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenPause={() => currentEngine.setScreen('PAUSED')}
            onOpenGarage={() => currentEngine.setScreen('GARAGE')}
            onHonk={handleHonk}
          />

          {/* Touch Controls (shown on touch devices) */}
          <TouchControls engine={currentEngine} />
        </>
      )}

      {/* Upgrades Garage Modal */}
      {screen === 'GARAGE' && currentEngine && (
        <GarageModal
          coins={currentEngine.stats.coins}
          upgrades={currentEngine.upgrades}
          onUpgrade={handleUpgrade}
          onClose={() => currentEngine.setScreen('PLAYING')}
        />
      )}

      {/* Pause Menu Modal */}
      {screen === 'PAUSED' && currentEngine && (
        <PauseModal
          onResume={() => currentEngine.setScreen('PLAYING')}
          onRestart={() => currentEngine.restartGame()}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Victory Celebration Modal */}
      {screen === 'VICTORY' && currentEngine && (
        <VictoryModal
          stats={currentEngine.stats}
          onContinue={() => currentEngine.setScreen('PLAYING')}
          onRestart={() => currentEngine.restartGame()}
        />
      )}
    </div>
  );
}
