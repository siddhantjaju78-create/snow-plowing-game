/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio Synthesizer for SnowDrift Hero
// Zero external audio files, 100% real-time synthesis

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Plowing crunch sound nodes
  private plowNoiseNode: AudioNode | null = null;
  private plowFilter: BiquadFilterNode | null = null;
  private plowGain: GainNode | null = null;

  // Music ambient loop
  private ambientInterval: number | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.initEngineSynth();
    this.initPlowSynth();
    this.startAmbientMusic();
  }

  public unlock() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.65, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private initEngineSynth() {
    if (!this.ctx || !this.masterGain) return;

    // Dual oscillator engine hum
    this.engineOsc = this.ctx.createOscillator();
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.engineSubOsc.type = 'triangle';
    this.engineSubOsc.frequency.setValueAtTime(22.5, this.ctx.currentTime);

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineSubOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    this.engineSubOsc.start();
  }

  private initPlowSynth() {
    if (!this.ctx || !this.masterGain) return;

    // Procedural buffer of colored noise for snow scraping/crunch
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink/brown filtered noise
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.plowFilter = this.ctx.createBiquadFilter();
    this.plowFilter.type = 'bandpass';
    this.plowFilter.frequency.setValueAtTime(600, this.ctx.currentTime);
    this.plowFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.plowGain = this.ctx.createGain();
    this.plowGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    whiteNoise.connect(this.plowFilter);
    this.plowFilter.connect(this.plowGain);
    this.plowGain.connect(this.masterGain);

    whiteNoise.start();
    this.plowNoiseNode = whiteNoise;
  }

  public updateEngineSound(speedNorm: number, isBoosting: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineSubOsc || !this.engineFilter || !this.engineGain) return;

    const baseFreq = 42 + speedNorm * 65 + (isBoosting ? 30 : 0);
    const filterFreq = 110 + speedNorm * 280 + (isBoosting ? 200 : 0);
    const volume = 0.08 + speedNorm * 0.18 + (isBoosting ? 0.08 : 0);

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.04);
    this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.04);
    this.engineGain.gain.setTargetAtTime(volume, now, 0.05);
  }

  public updatePlowingSound(isPlowing: boolean, speedNorm: number) {
    if (!this.ctx || !this.plowFilter || !this.plowGain) return;

    const now = this.ctx.currentTime;
    if (isPlowing && speedNorm > 0.05) {
      const targetGain = Math.min(0.28, 0.05 + speedNorm * 0.23);
      const targetFreq = 500 + speedNorm * 450;
      this.plowGain.gain.setTargetAtTime(targetGain, now, 0.05);
      this.plowFilter.frequency.setTargetAtTime(targetFreq, now, 0.08);
    } else {
      this.plowGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  public playCoinChime(pitchMultiplier: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    const baseNote = 880 * pitchMultiplier; // A5
    osc1.frequency.setValueAtTime(baseNote, now);
    osc1.frequency.exponentialRampToValueAtTime(baseNote * 1.5, now + 0.12);

    osc2.frequency.setValueAtTime(baseNote * 2, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  public playComboUp(multiplier: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Pentatonic scale arpeggio based on combo
    const baseFreqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 1046.5];
    const startIndex = Math.min(baseFreqs.length - 4, Math.max(0, multiplier - 1));
    const chord = [baseFreqs[startIndex], baseFreqs[startIndex + 1], baseFreqs[startIndex + 2], baseFreqs[startIndex + 3]];

    chord.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = this.ctx.currentTime + index * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = index === chord.length - 1 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.32);
    });
  }

  public playBoostSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.35);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playHorn() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [349.23, 440.0]; // F4 & A4 warm friendly two-tone horn

    notes.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  public playUpgradeChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major triumphant chime

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  public playBumpSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private startAmbientMusic() {
    if (this.isMusicPlaying || !this.ctx || !this.musicGain) return;
    this.isMusicPlaying = true;

    // Cozy lofi winter chord progressions (Cmaj7 - Am7 - Dm7 - G7add9)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 220.00, 261.63, 349.23], // Dm7
      [196.00, 246.94, 293.66, 392.00], // G9
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const chord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const chordDuration = 4.2;

      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Warm cozy sine/triangle pad
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * 0.5, now); // Warm octave

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.exponentialRampToValueAtTime(550, now + chordDuration * 0.5);
        filter.frequency.exponentialRampToValueAtTime(320, now + chordDuration);

        // Gentle swelling envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.025, now + chordDuration - 0.8);
        gain.gain.linearRampToValueAtTime(0.0001, now + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + chordDuration + 0.1);
      });
    };

    playNextChord();
    this.ambientInterval = window.setInterval(playNextChord, 4200);
  }

  public dispose() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const synthAudio = new SynthAudioEngine();
