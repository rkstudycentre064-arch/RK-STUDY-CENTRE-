/**
 * Cinematic Web Audio Sound Generator for RK STUDY CENTRE 3-Second Intro
 * Pure synthesizer using standard Web Audio API - zero external audio assets, zero delay,
 * 100% compliant with browser autoplay policies and volume safety standards.
 */

class CinematicSoundDirector {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime); // Soft, gentle volume
        this.masterGain.connect(this.ctx.destination);
      }
    } catch {
      // AudioContext unavailable or restricted by policy
    }
  }

  /**
   * 0.00s - 0.40s: Soft warm ambient swell
   */
  public playAmbientSwell() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now); // Low A2 warmth
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.2); // Gentle rise to A3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(650, now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * 0.40s - 1.20s: Soft elegant whoosh synchronized with logo reveal
   */
  public playLogoWhoosh() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // White noise buffer for whoosh air texture
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.7);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.7);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * 1.20s - 1.90s: Subtle warm harmonic chime when brand name appears
   */
  public playBrandChime() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Harmonious E4 (329.63Hz) & B4 (493.88Hz) golden educational interval
      const notes = [329.63, 493.88, 659.25];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.04 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.9);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * 2.45s - 2.75s: Soft crystal resolution chime at final brand highlight
   */
  public playResolutionChime() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Soft high sparkle chime A5 (880Hz) + E5 (659.25Hz)
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.03);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now + 0.03);
      osc.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Graceful fallback
    }
  }

  public dispose() {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Already closed
      }
      this.ctx = null;
    }
  }
}

export const cinematicAudio = new CinematicSoundDirector();
