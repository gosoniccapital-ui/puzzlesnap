class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  get muted(): boolean {
    return this.isMuted;
  }

  set muted(val: boolean) {
    this.isMuted = val;
  }

  playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playSnap(consecutiveCount: number = 0) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Crisp wood "click/thud"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    
    // Pitch increases with consecutive snaps
    const baseFreq = 300 + Math.min(consecutiveCount * 25, 400);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);

    // 2. Subtle bright chime overtone
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = "sine";
    chime.frequency.setValueAtTime(baseFreq * 2.5, now);

    chimeGain.gain.setValueAtTime(0.15, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    chime.start(now);
    chime.stop(now + 0.15);
  }

  playVictory() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.12;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }
}

export const soundFx = new SoundEffects();
