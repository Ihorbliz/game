'use strict';
// Звуки та музика генеруються прямо в браузері (Web Audio) — жодних файлів і інтернету не потрібно.
const Sound = (() => {
  let ctx = null, master, musicGain, sfxGain, noiseBuf;
  let muted = false;
  let timer = null, song = null, songCfg = null, step = 0, nextTime = 0;

  function init() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(master);
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (songCfg && !timer) startScheduler();
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.03);
  }

  function tone(freq, t0, dur, o = {}) {
    const type = o.type || 'square', vol = o.vol || 0.2, attack = o.attack || 0.005;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.filter;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(o.dest || sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(t0, dur, o = {}) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'lowpass';
    f.frequency.value = o.freq || 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f);
    f.connect(g);
    g.connect(o.dest || sfxGain);
    s.start(t0);
    s.stop(t0 + dur + 0.02);
  }

  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const arp = (t, notes, gap, o) => notes.forEach((n, i) => tone(midi(n), t + i * gap, o.dur || 0.15, o));

  const SFX = {
    jump: t => tone(320, t, 0.17, { type: 'square', vol: 0.12, slideTo: 640, filter: 2200 }),
    banana: t => { tone(988, t, 0.08, { type: 'triangle', vol: 0.28 }); tone(1480, t + 0.06, 0.16, { type: 'triangle', vol: 0.26 }); },
    stomp: t => { noise(t, 0.12, { vol: 0.35, freq: 900 }); tone(420, t, 0.16, { type: 'square', vol: 0.12, slideTo: 110, filter: 1500 }); },
    hurt: t => tone(520, t, 0.4, { type: 'sawtooth', vol: 0.14, slideTo: 130, filter: 1600 }),
    bump: t => tone(150, t, 0.08, { type: 'triangle', vol: 0.3, slideTo: 90 }),
    box: t => arp(t, [72, 76, 79], 0.05, { type: 'square', vol: 0.09, filter: 3000, dur: 0.1 }),
    spring: t => tone(170, t, 0.4, { type: 'triangle', vol: 0.32, slideTo: 950 }),
    checkpoint: t => arp(t, [72, 76, 79, 84], 0.08, { type: 'triangle', vol: 0.26, dur: 0.2 }),
    heart: t => arp(t, [76, 79, 83, 88], 0.07, { type: 'sine', vol: 0.3, dur: 0.2 }),
    poof: t => noise(t, 0.3, { vol: 0.18, freq: 2500, type: 'bandpass' }),
    fall: t => tone(760, t, 0.65, { type: 'triangle', vol: 0.22, slideTo: 140 }),
    click: t => tone(700, t, 0.06, { type: 'triangle', vol: 0.18 }),
    win: t => {
      const mel = [72, 76, 79, 84, 79, 84, 88];
      const tim = [0, 0.12, 0.24, 0.36, 0.6, 0.72, 0.9];
      mel.forEach((n, i) => tone(midi(n), t + tim[i], i === mel.length - 1 ? 0.8 : 0.2, { type: 'square', vol: 0.1, filter: 3000 }));
      [48, 55, 60].forEach((n, i) => tone(midi(n), t + 0.9, 0.9, { type: 'triangle', vol: 0.18 }));
    },
  };

  function play(name) {
    if (!ctx || muted || !SFX[name]) return;
    SFX[name](ctx.currentTime + 0.01);
  }

  // ---------- Музика: невелика весела мелодія, своя для кожного світу ----------
  function rngOf(seed) {
    let a = seed * 9973 + 7;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeSong(cfg) {
    const rng = rngOf(cfg.seed);
    const scale = cfg.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    const progs = cfg.minor
      ? [[0, 5, 2, 6], [0, 3, 4, 0], [0, 5, 3, 4]]
      : [[0, 4, 5, 3], [0, 3, 4, 4], [0, 5, 3, 4], [0, 3, 0, 4]];
    const prog = progs[Math.floor(rng() * progs.length)];
    const deg = d => cfg.root + scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
    const SPB = 8; // восьмих на такт
    const mel = [];
    let cur = 9;
    for (let b = 0; b < 4; b++) {
      const ch = prog[b];
      for (let s = 0; s < SPB; s++) {
        if (b === 3 && s >= 6) { mel.push(null); continue; }
        if (s % 4 !== 0 && rng() < cfg.rest) { mel.push(null); continue; }
        if (s % 4 === 0) {
          const c = [ch, ch + 2, ch + 4, ch + 7, ch + 9, ch + 11].filter(v => v >= 4 && v <= 14);
          c.sort((a, b2) => Math.abs(a - cur) - Math.abs(b2 - cur));
          cur = c[rng() < 0.7 ? 0 : Math.min(1, c.length - 1)];
        } else {
          cur += [-2, -1, -1, 1, 1, 2][Math.floor(rng() * 6)];
          cur = Math.max(4, Math.min(14, cur));
        }
        mel.push({ n: deg(cur), len: (s % 2 === 0 && rng() < 0.3) ? 2 : 1 });
      }
    }
    // Друга половина повторює першу, але закінчується на тоніці
    const full = mel.concat(mel.slice(0, 3 * SPB));
    for (let s = 0; s < SPB; s++) {
      if (s === 0) full.push({ n: deg(prog[3] + 4), len: 2 });
      else if (s === 4) full.push({ n: deg(7), len: 3 });
      else full.push(null);
    }
    const bass = [];
    for (let b = 0; b < 8; b++) {
      const ch = prog[b % 4];
      for (let s = 0; s < SPB; s++) {
        if (s === 0 || s === 4) bass.push(deg(ch) - 24);
        else if ((s === 2 || s === 6) && cfg.drums) bass.push(deg(ch + 4) - 24);
        else bass.push(null);
      }
    }
    return { mel: full, bass, len: full.length };
  }

  const LEAD_VOL = { sine: 0.13, triangle: 0.12, square: 0.05, sawtooth: 0.045 };

  function scheduleStep(i, t, sd) {
    const m = song.mel[i];
    if (m) {
      tone(midi(m.n), t, sd * m.len * 0.9, { type: songCfg.lead, vol: LEAD_VOL[songCfg.lead] || 0.1, dest: musicGain, filter: 2400, attack: 0.012 });
      if (songCfg.bell) tone(midi(m.n + 12), t, sd * 1.6, { type: 'sine', vol: 0.035, dest: musicGain });
    }
    const b = song.bass[i];
    if (b) tone(midi(b), t, sd * 1.7, { type: songCfg.bass, vol: songCfg.bass === 'square' ? 0.05 : 0.14, dest: musicGain, filter: 700, attack: 0.01 });
    const s = i % 8;
    if (songCfg.drums) {
      if (s === 0 || s === 4) tone(110, t, 0.12, { type: 'sine', vol: 0.3, slideTo: 45, dest: musicGain });
      if (s === 2 || s === 6) noise(t, 0.09, { vol: 0.08, freq: 1800, type: 'bandpass', dest: musicGain });
    }
    if (s % 2 === 1) noise(t, 0.035, { vol: 0.035, freq: 7000, type: 'highpass', dest: musicGain });
  }

  function startScheduler() {
    if (!ctx || !song) return;
    stopScheduler();
    const sd = 60 / songCfg.bpm / 2;
    nextTime = ctx.currentTime + 0.12;
    timer = setInterval(() => {
      if (!ctx) return;
      if (nextTime < ctx.currentTime - 0.5) nextTime = ctx.currentTime + 0.05; // після сну вкладки
      while (nextTime < ctx.currentTime + 0.18) {
        scheduleStep(step, nextTime, sd);
        nextTime += sd;
        step = (step + 1) % song.len;
      }
    }, 30);
  }

  function stopScheduler() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function music(cfg) {
    songCfg = cfg;
    song = makeSong(cfg);
    step = 0;
    startScheduler();
  }

  function stopMusic() {
    stopScheduler();
    songCfg = null;
    song = null;
  }

  return {
    init, play, music, stopMusic, setMuted,
    pauseMusic: stopScheduler,
    resumeMusic: () => { if (song && !timer) startScheduler(); },
    get muted() { return muted; },
  };
})();
