"use client";

/**
 * Tiny synthesised sound kit. No audio files: everything is generated with
 * the Web Audio API so it stays light and loads instantly.
 */

export type SoundName =
  | "pick"
  | "unpick"
  | "pop"
  | "place"
  | "tap"
  | "rustle"
  | "ribbon"
  | "chime"
  | "sparkle"
  | "whoosh"
  | "open"
  | "undo";

const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private noise: AudioBuffer | null = null;
  private sfxOn = true;
  private musicOn = false;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private nextBeat = 0;
  private beat = 0;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      this.master.connect(comp).connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
  }

  /** Music only starts once audio has been unlocked by a user gesture. */
  setMusic(on: boolean) {
    this.musicOn = on;
    if (!on) this.stopMusic();
    else if (this.ctx) this.startMusic();
  }

  /** Must be called from a user gesture at least once so audio can start. */
  unlock() {
    this.ensure();
    if (this.musicOn && !this.musicTimer) this.startMusic();
  }

  private noiseBuffer(ctx: AudioContext) {
    if (!this.noise) {
      const len = ctx.sampleRate * 1.2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    return this.noise;
  }

  private pluck(freq: number, when: number, opts: { dur?: number; gain?: number; type?: OscillatorType; bus?: AudioNode } = {}) {
    const ctx = this.ctx!;
    const { dur = 0.6, gain = 0.22, type = "triangle", bus = this.sfxBus } = opts;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = Math.min(freq * 5, 9000);
    osc.type = type;
    osc.frequency.value = freq;
    osc2.type = "sine";
    osc2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    osc2.connect(g2).connect(g);
    g.connect(lp).connect(bus);
    osc.start(when);
    osc2.start(when);
    osc.stop(when + dur + 0.05);
    osc2.stop(when + dur + 0.05);
  }

  private bell(freq: number, when: number, gain = 0.16, dur = 1.8, bus?: AudioNode) {
    const ctx = this.ctx!;
    const partials: [number, number][] = [
      [1, 1],
      [2.76, 0.32],
      [5.4, 0.12],
    ];
    for (const [ratio, amp] of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(gain * amp, when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur / ratio ** 0.5);
      osc.connect(g).connect(bus ?? this.sfxBus);
      osc.start(when);
      osc.stop(when + dur + 0.1);
    }
  }

  private noiseBurst(when: number, dur: number, f0: number, f1: number, gain: number, q = 0.9) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, when);
    bp.frequency.exponentialRampToValueAtTime(f1, when + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(bp).connect(g).connect(this.sfxBus);
    src.start(when, Math.random() * 0.3);
    src.stop(when + dur + 0.05);
  }

  play(name: SoundName) {
    if (!this.sfxOn) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const pick = () => PENTA[Math.floor(Math.random() * 5)];
    switch (name) {
      case "pick":
        this.pluck(pick(), t, { gain: 0.2, dur: 0.5 });
        this.pluck(pick() * 2, t + 0.07, { gain: 0.07, dur: 0.4, type: "sine" });
        break;
      case "unpick":
        this.pluck(PENTA[0] / 1.5, t, { gain: 0.14, dur: 0.35 });
        break;
      case "place":
      case "pop": {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        const f = name === "pop" ? 720 : 520 + Math.random() * 160;
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.12);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.28, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(g).connect(this.sfxBus);
        osc.start(t);
        osc.stop(t + 0.2);
        if (name === "place") this.pluck(pick(), t + 0.03, { gain: 0.08, dur: 0.35, type: "sine" });
        break;
      }
      case "tap":
        this.pluck(1318.5, t, { gain: 0.06, dur: 0.12, type: "sine" });
        break;
      case "undo":
        this.pluck(659.25, t, { gain: 0.09, dur: 0.2, type: "sine" });
        this.pluck(523.25, t + 0.06, { gain: 0.08, dur: 0.25, type: "sine" });
        break;
      case "rustle":
        this.noiseBurst(t, 0.22, 2600, 4200, 0.16, 0.7);
        this.noiseBurst(t + 0.12, 0.2, 3400, 2200, 0.11, 0.7);
        break;
      case "whoosh":
        this.noiseBurst(t, 0.45, 300, 2400, 0.14, 0.6);
        break;
      case "ribbon":
        this.noiseBurst(t, 0.3, 1200, 5000, 0.07, 1.2);
        [783.99, 987.77, 1174.66].forEach((f, i) => this.pluck(f, t + 0.08 + i * 0.07, { gain: 0.1, dur: 0.5, type: "sine" }));
        break;
      case "sparkle":
        for (let i = 0; i < 4; i++) this.bell(1500 + Math.random() * 1600, t + i * 0.06, 0.05, 0.6);
        break;
      case "chime":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.bell(f, t + i * 0.11, 0.12, 2.2));
        break;
      case "open":
        this.noiseBurst(t, 0.5, 400, 3000, 0.12, 0.6);
        [659.25, 783.99, 987.77, 1318.51, 1567.98].forEach((f, i) => this.bell(f, t + 0.15 + i * 0.09, 0.11, 2.4));
        break;
    }
  }

  /* -------- generative music-box loop -------- */

  private startMusic() {
    const ctx = this.ensure();
    if (!ctx || this.musicTimer) return;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(0.32, ctx.currentTime, 0.8);
    this.nextBeat = ctx.currentTime + 0.1;
    this.beat = 0;
    this.musicTimer = setInterval(() => this.schedule(), 120);
  }

  private stopMusic() {
    if (!this.ctx) return;
    this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    // Fmaj7 – Em7 – Dm7 – Cadd9, eight gentle notes per bar
    const chords = [
      [349.23, 440.0, 523.25, 659.25],
      [329.63, 392.0, 493.88, 587.33],
      [293.66, 349.23, 440.0, 523.25],
      [261.63, 329.63, 392.0, 587.33],
    ];
    const step = 60 / 76 / 2;
    while (this.nextBeat < ctx.currentTime + 0.4) {
      const bar = Math.floor(this.beat / 8) % chords.length;
      const pos = this.beat % 8;
      const chord = chords[bar];
      if (pos === 0) {
        // soft pad: root + fifth an octave down
        for (const f of [chord[0] / 2, chord[2] / 2]) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = f;
          g.gain.setValueAtTime(0.0001, this.nextBeat);
          g.gain.exponentialRampToValueAtTime(0.05, this.nextBeat + 0.6);
          g.gain.exponentialRampToValueAtTime(0.0001, this.nextBeat + step * 8);
          osc.connect(g).connect(this.musicBus);
          osc.start(this.nextBeat);
          osc.stop(this.nextBeat + step * 8 + 0.1);
        }
      }
      const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
      if (!(pos === 7 && Math.random() < 0.4)) {
        const up = Math.random() < 0.15 ? 2 : 1;
        this.bell(chord[pattern[pos]] * 2 * up, this.nextBeat, 0.07, 1.6, this.musicBus);
      }
      this.nextBeat += step;
      this.beat++;
    }
  }
}

export const sound = new SoundEngine();
