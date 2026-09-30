// Studio-Grade Web Audio Synthesizer for Tactile Keystroke & Spatial Audio Cues
// Synthesizes organic soundwaves directly in the browser with zero external MP3 assets and 0ms latency.

export type SoundProfile = 'silent' | 'mechanical' | 'felt' | 'typewriter';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;
  public soundTheme: SoundProfile = 'silent';

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('velum_sound_theme') as SoundProfile | null;
      if (stored && ['mechanical', 'felt', 'typewriter'].includes(stored)) {
        this.soundTheme = stored;
        this.enabled = true;
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundTheme(theme: SoundProfile) {
    this.soundTheme = theme;
    this.enabled = theme !== 'silent';
    localStorage.setItem('velum_sound_theme', theme);
  }

  public playKeystroke(key?: string) {
    if (!this.enabled || this.soundTheme === 'silent') return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Special key handling: Enter = carriage ding in typewriter mode
    if (key === 'Enter') {
      this.playCarriageReturn();
      return;
    }

    if (this.soundTheme === 'mechanical') {
      // Crisp mechanical switch click (Kailh Box White style)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 780 + (Math.random() * 140 - 70);
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.038);

      gain.gain.setValueAtTime(key === 'Backspace' ? 0.025 : 0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (this.soundTheme === 'felt') {
      // Soft velvety thud (Topre / dampened silent switch)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = 220 + (Math.random() * 50 - 25);
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.055);

      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.058);
    } else if (this.soundTheme === 'typewriter') {
      // Vintage mechanical typewriter metal hammer strike
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'triangle';
      const baseFreq = 950 + (Math.random() * 180 - 90);
      osc1.frequency.setValueAtTime(baseFreq, t);
      osc1.frequency.exponentialRampToValueAtTime(180, t + 0.045);

      osc2.frequency.setValueAtTime(baseFreq * 1.5, t);
      osc2.frequency.exponentialRampToValueAtTime(300, t + 0.03);

      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.048);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.05);
      osc2.stop(t + 0.05);
    }
  }

  public playCarriageReturn() {
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High crystalline bell ping (vintage typewriter bell)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t); // A6
    osc.frequency.exponentialRampToValueAtTime(1750, t + 0.35);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playJoinChime() {
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.12); // E5

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playCompleteSound() {
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const studioSound = new SoundEngine();
