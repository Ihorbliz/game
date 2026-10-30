'use strict';
(() => {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const LAYER_W = 1024;

  // Фізика (пікселі рівня, секунди)
  const GRAV = 2000, MAXV = 215, JUMPV = 700, MAXFALL = 900, SPRINGV = 1060;
  const STEP = 1 / 120;
  const FOLLOW = 46; // на якій відстані білка біжить за міньйоном

  let DPR = 1, SCALE = 1, VW = 800;

  // ---------- Збереження прогресу ----------
  const SAVE_KEY = 'minion-squirrel-v1';
  const NUM = THEMES.length; // скільки всього рівнів
  const save = { unlocked: 1, stars: Array(NUM).fill(0), muted: false };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) Object.assign(save, s);
  } catch (e) { /* немає сховища — граємо без збереження */ }
  // старе збереження (було 15 рівнів): дописуємо нові та відкриваємо наступний після пройденого
  while (save.stars.length < NUM) save.stars.push(0);
  for (let i = 0; i < NUM - 1; i++) if (save.stars[i] > 0) save.unlocked = Math.max(save.unlocked, i + 2);
  save.unlocked = Math.min(NUM, save.unlocked);
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } };
  Sound.setMuted(save.muted);

  // ---------- Кеш фонів і клітинок для поточного світу ----------
  let cache = { key: '' };
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    return c;
  }
  function ensureCache(idx) {
    const key = idx + ':' + cv.width + 'x' + cv.height;
    if (cache.key === key) return;
    const th = THEMES[idx];
    const sky = makeCanvas(cv.width, cv.height);
    const sc = sky.getContext('2d');
    const g = sc.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0, th.sky[0]);
    g.addColorStop(1, th.sky[1]);
    sc.fillStyle = g;
    sc.fillRect(0, 0, cv.width, cv.height);
    sc.scale(SCALE, SCALE);
    th.skyDraw(sc, VW, VIEW_H);
    const layer = (fn, seed) => {
      const c = makeCanvas(Math.round(LAYER_W * SCALE), cv.height);
      const lc = c.getContext('2d');
      lc.scale(c.width / LAYER_W, c.height / VIEW_H);
      fn.call(th, lc, LAYER_W, VIEW_H, mulberry32(seed * 101 + idx * 7));
      return c;
    };
    cache = { key, idx, th, sky, far: layer(th.far, 1), mid: layer(th.mid, 2), tiles: Art.makeTiles(th, SCALE) };
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    cv.width = Math.round(w * DPR);
    cv.height = Math.round(h * DPR);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    SCALE = cv.height / VIEW_H;
    VW = cv.width / SCALE;
    cache.key = '';
    initAmbient();
  }

  // ---------- Стан гри ----------
  const G = {
    state: 'menu', L: 0, lv: null, p: null, comp: null, trail: [],
    cam: 0, lastCam: 0, t: 0, hearts: 3, bananas: 0, cp: null,
    parts: [], amb: [], bumps: [], banner: 0, win: 0, toast: null, fade: 0, shake: 0, menuT: 0,
  };
  const input = { kl: false, kr: false, kj: false, tl: false, tr: false, tj: false, prevJ: false };

  function theme() { return THEMES[G.L]; }

  function startLevel(L) {
    G.L = L;
    G.lv = generateLevel(L);
    G.hearts = 3;
    G.bananas = 0;
    G.cp = null;
    G.parts = [];
    G.bumps = [];
    G.crumbles = new Map();
    G.win = 0;
    G.banner = 2.8;
    G.toast = null;
    G.fade = 1;
    spawnPlayer(G.lv.start.x, G.lv.start.y);
    ensureCache(L);
    initAmbient();
    setState('play');
    Sound.music(THEMES[L].music);
  }

  function spawnPlayer(x, y) {
    G.p = { x, y, vx: 0, vy: 0, w: 22, h: 40, facing: 1, onGround: false, coyote: 0, jbuf: 0, inv: 0, anim: 0, sx: 1, sy: 1, onMover: null, blinkT: 2, idle: 0 };
    G.trail = [{ x, y }];
    G.comp = { x: x - 40, y, facing: 1, moving: false, t: 0, hop: 0, blinkT: 3 };
    G.cam = clamp(x - VW * 0.4, 0, Math.max(0, G.lv.W * T - VW));
    G.lastCam = G.cam;
  }

  // ---------- Клітинки та зіткнення ----------
  function tile(tx, ty) {
    const lv = G.lv;
    if (tx < 0 || tx >= lv.W) return 1;
    if (ty < 0 || ty >= ROWS) return 0;
    return lv.grid[ty][tx];
  }
  const solid = t => (t >= 1 && t <= 4) || t === 7;

  function moveX(b, dx) {
    b.x += dx;
    const top = Math.floor((b.y - b.h + 0.5) / T), bot = Math.floor((b.y - 0.5) / T);
    if (dx > 0) {
      const tx = Math.floor((b.x + b.w / 2) / T);
      for (let ty = top; ty <= bot; ty++) if (solid(tile(tx, ty))) { b.x = tx * T - b.w / 2 - 0.01; return true; }
    } else if (dx < 0) {
      const tx = Math.floor((b.x - b.w / 2) / T);
      for (let ty = top; ty <= bot; ty++) if (solid(tile(tx, ty))) { b.x = (tx + 1) * T + b.w / 2 + 0.01; return true; }
    }
    return false;
  }

  // повертає {tx,ty} клітинки, об яку вдарились головою
  function moveY(b, dy, prevBot) {
    b.y += dy;
    b.onGround = false;
    const l = Math.floor((b.x - b.w / 2 + 0.5) / T), r = Math.floor((b.x + b.w / 2 - 0.5) / T);
    if (dy > 0) {
      const ty = Math.floor(b.y / T);
      for (let tx = l; tx <= r; tx++) {
        const t = tile(tx, ty);
        if (solid(t) || (t === 5 && prevBot <= ty * T + 0.5)) {
          b.y = ty * T;
          b.vy = 0;
          b.onGround = true;
          return null;
        }
      }
    } else if (dy < 0) {
      const ty = Math.floor((b.y - b.h) / T);
      const cx = Math.floor(b.x / T);
      const order = [cx, l, r];
      for (const tx of order) {
        if (tx < l || tx > r) continue;
        if (solid(tile(tx, ty))) {
          b.y = (ty + 1) * T + b.h;
          b.vy = 0;
          return { tx, ty };
        }
      }
    }
    return null;
  }

  // ---------- Частинки ----------
  function part(o) {
    if (G.parts.length > 320) G.parts.shift();
    G.parts.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 0.6, max: 0.6, size: 3, color: '#fff', type: 'dot', rot: 0, vr: 0 }, o));
  }
  function sparkle(x, y, col, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 120;
      part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: 3 + Math.random() * 3, color: col, type: 'star', vr: 6 });
    }
  }
  function dust(x, y, n = 5) {
    for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 16, y: y - 2, vx: (Math.random() - 0.5) * 80, vy: -20 - Math.random() * 40, life: 0.4, max: 0.4, size: 3 + Math.random() * 3, color: 'rgba(255,255,255,0.8)' });
  }
  function poof(x, y) {
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      part({ x, y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 0.45, max: 0.45, size: 6, color: 'rgba(255,255,255,0.9)' });
    }
  }
  function confetti(x, y, n = 40) {
    const cols = ['#ff5252', '#ffd23f', '#69f0ae', '#40c4ff', '#e040fb', '#ff9100'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 100 + Math.random() * 250;
      part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, g: 400, life: 1.6, max: 1.6, size: 5, color: cols[i % cols.length], type: 'confetti', rot: Math.random() * 6, vr: 10 });
    }
  }

  // ---------- Оновлення ----------
  function update(dt) {
    const lv = G.lv, th = theme();
    if (G.banner > 0) G.banner -= dt;
    if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
    G.fade = Math.max(0, G.fade - dt * 2.5);
    G.shake = Math.max(0, G.shake - dt);

    for (const m of lv.movers) {
      m.dx = 0;
      m.dy = 0;
      if (m.wait > 0) { m.wait -= dt; continue; } // коротка зупинка на краях
      if (m.axis === 'y') {
        const old = m.y;
        m.y += m.dir * m.speed * dt;
        if (m.y >= m.y1) { m.y = m.y1; m.dir = -1; m.wait = 0.7; }
        if (m.y <= m.y0) { m.y = m.y0; m.dir = 1; m.wait = 0.7; }
        m.dy = m.y - old;
      } else {
        const old = m.x;
        m.x += m.dir * m.speed * dt;
        if (m.x >= m.x1) { m.x = m.x1; m.dir = -1; m.wait = 0.3; }
        if (m.x <= m.x0) { m.x = m.x0; m.dir = 1; m.wait = 0.3; }
        m.dx = m.x - old;
      }
    }
    updateCrumbles(dt);
    for (const s of lv.springs) s.comp = Math.max(0, s.comp - dt * 4);
    for (const b of G.bumps) b.t -= dt;
    G.bumps = G.bumps.filter(b => b.t > 0);

    updatePlayer(dt, th);
    if (G.state !== 'play') return;
    updateEnemies(dt, th);
    updateComp(dt);

    for (const q of G.parts) {
      q.life -= dt;
      q.vy += q.g * dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.rot += q.vr * dt;
      if (q.type !== 'confetti' && q.type !== 'banana' && q.type !== 'heart') { q.vx *= 0.94; q.vy *= 0.94; }
    }
    G.parts = G.parts.filter(q => q.life > 0);

    const target = G.p.x - VW * 0.4;
    G.cam += (target - G.cam) * Math.min(1, dt * 6);
    G.cam = clamp(G.cam, 0, Math.max(0, lv.W * T - VW));

    if (G.win > 0) {
      G.win += dt;
      if (Math.random() < dt * 3) confetti(G.cam + VW * (0.2 + Math.random() * 0.6), 60 + Math.random() * 120, 30);
      if (G.win > 3.4) showWin();
    }
  }

  function updatePlayer(dt, th) {
    const p = G.p, lv = G.lv;
    const g = GRAV * th.gravity;
    const dir = G.win ? 1 : ((input.kr || input.tr) ? 1 : 0) - ((input.kl || input.tl) ? 1 : 0);
    const maxv = G.win ? 120 : MAXV;

    if (dir) {
      const turning = p.vx * dir < 0;
      p.vx += dir * (p.onGround ? 1900 : 1400) * (turning ? 2 : 1) * dt;
      p.facing = dir;
    } else {
      const fr = (p.onGround ? 2400 : 700) * dt;
      p.vx = Math.abs(p.vx) <= fr ? 0 : p.vx - Math.sign(p.vx) * fr;
    }
    p.vx = clamp(p.vx, -maxv, maxv);

    p.coyote = p.onGround ? 0.1 : p.coyote - dt;
    p.jbuf -= dt;
    if (p.jbuf > 0 && p.coyote > 0 && !G.win) {
      p.vy = -JUMPV * Math.sqrt(th.gravity) * (th.jumpBoost || 1);
      p.jbuf = 0;
      p.coyote = 0;
      p.onGround = false;
      p.onMover = null;
      p.sx = 0.8; p.sy = 1.2;
      Sound.play('jump');
      dust(p.x, p.y, 4);
    }
    // радісні підстрибування після фінішу
    if (G.win > 0.6 && p.onGround && Math.random() < dt * 2) p.vy = -420 * Math.sqrt(th.gravity);

    p.vy = Math.min(p.vy + g * dt, MAXFALL * (th.fallMul || 1));
    if (p.onMover) { p.x += p.onMover.dx; p.y += p.onMover.dy || 0; }
    const prevBot = p.y, wasGround = p.onGround, landV = p.vy;
    moveX(p, p.vx * dt);
    const bonk = moveY(p, p.vy * dt, prevBot);

    p.onMover = null;
    if (p.vy >= 0) {
      for (const m of lv.movers) {
        if (p.x + p.w / 2 > m.x + 2 && p.x - p.w / 2 < m.x + m.w - 2 && prevBot <= m.y + 1 + Math.abs(m.dy || 0) && p.y >= m.y) {
          p.y = m.y; p.vy = 0; p.onGround = true; p.onMover = m;
        }
      }
    }
    for (const s of lv.springs) {
      const top = s.y - 14;
      if (p.vy >= 0 && Math.abs(p.x - s.x) < 18 && prevBot <= top + 3 && p.y >= top) {
        p.y = top;
        p.vy = -SPRINGV * Math.sqrt(th.gravity);
        p.onGround = false;
        s.comp = 1;
        p.sx = 0.75; p.sy = 1.3;
        Sound.play('spring');
      }
    }
    if (!wasGround && p.onGround) {
      p.sx = 1.25; p.sy = 0.8;
      if (landV > 300) dust(p.x, p.y, 5);
    }
    p.sx += (1 - p.sx) * Math.min(1, dt * 12);
    p.sy += (1 - p.sy) * Math.min(1, dt * 12);
    if (bonk) hitTile(bonk.tx, bonk.ty);

    if (p.y > ROWS * T + 90) { fellInPit(); return; }

    // плити, що обвалюються
    if (p.onGround && !p.onMover) {
      const ty = Math.floor(p.y / T + 0.01);
      for (let tx = Math.floor((p.x - p.w / 2 + 0.5) / T); tx <= Math.floor((p.x + p.w / 2 - 0.5) / T); tx++) {
        const k = tx + ',' + ty;
        if (tile(tx, ty) === 7 && !G.crumbles.has(k)) G.crumbles.set(k, { tx, ty, t: 0.45, gone: 0 });
      }
    }
    // шипи
    {
      const l = Math.floor((p.x - p.w / 2) / T), r = Math.floor((p.x + p.w / 2) / T);
      const t0 = Math.floor((p.y - p.h) / T), t1 = Math.floor((p.y - 0.5) / T);
      for (let ty = t0; ty <= t1; ty++) for (let tx = l; tx <= r; tx++) {
        if (tile(tx, ty) !== 6) continue;
        const sx0 = tx * T + 4, sx1 = tx * T + T - 4, sy0 = ty * T + 15;
        if (p.x + p.w / 2 > sx0 && p.x - p.w / 2 < sx1 && p.y > sy0) {
          hurt(p.x + p.facing * 10);
          if (p.vy >= 0) p.vy = -560 * Math.sqrt(th.gravity);
          p.onGround = false;
        }
      }
    }

    p.inv = Math.max(0, p.inv - dt);
    p.anim += dt;
    p.blinkT -= dt;
    if (p.blinkT < -0.12) p.blinkT = 2 + Math.random() * 3;
    p.idle = (p.onGround && Math.abs(p.vx) < 5) ? p.idle + dt : 0;

    // збираємо банани
    const cy = p.y - p.h / 2;
    for (const b of lv.bananas) {
      if (!b.got && Math.abs(b.x - p.x) < 22 && Math.abs(b.y - cy) < 30) {
        b.got = true;
        G.bananas++;
        Sound.play('banana');
        sparkle(b.x, b.y, '#ffe135', 6);
      }
    }
    for (const h of lv.hearts) {
      if (!h.got && Math.abs(h.x - p.x) < 22 && Math.abs(h.y - cy) < 30) {
        h.got = true;
        G.hearts = Math.min(5, G.hearts + 1);
        Sound.play('heart');
        sparkle(h.x, h.y, '#ff6b8a', 10);
      }
    }
    for (const c of lv.checkpoints) {
      if (!c.active && Math.abs(c.x - p.x) < 26 && p.y > c.y - 80 && p.y <= c.y + 4) {
        c.active = true;
        G.cp = c;
        if (G.hearts < 3) G.hearts = 3;
        Sound.play('checkpoint');
        sparkle(c.x + 12, c.y - 55, '#ffd23f', 12);
        G.toast = { text: 'Прапорець! ✔', t: 1.4 };
      }
    }
    if (!G.win && p.x >= lv.goal.x - 8) reachGoal();

    // слід для білки
    const last = G.trail[G.trail.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 2) {
      G.trail.push({ x: p.x, y: p.y });
      if (G.trail.length > 400) G.trail.splice(0, 100);
    }
  }

  function updateCrumbles(dt) {
    const lv = G.lv, p = G.p;
    for (const [k, c] of G.crumbles) {
      if (!c.gone) {
        c.t -= dt;
        if (c.t <= 0) {
          lv.grid[c.ty][c.tx] = 0;
          c.gone = 4;
          Sound.play('bump');
          part({ x: c.tx * T + T / 2, y: c.ty * T + T / 2, vy: 40, g: 1400, life: 1.2, max: 1.2, type: 'tile', vr: (Math.random() - 0.5) * 3 });
        }
      } else {
        c.gone -= dt;
        const over = p.x + p.w / 2 > c.tx * T && p.x - p.w / 2 < (c.tx + 1) * T && p.y > c.ty * T && p.y - p.h < (c.ty + 1) * T;
        if (c.gone <= 0 && !over) {
          lv.grid[c.ty][c.tx] = 7;
          G.crumbles.delete(k);
        }
      }
    }
  }

  function hitTile(tx, ty) {
    const lv = G.lv, t = lv.grid[ty][tx];
    if (t === 3) {
      lv.grid[ty][tx] = 4;
      G.bumps.push({ tx, ty, t: 0.18 });
      const what = lv.boxes.get(tx + ',' + ty) || 'banana';
      const x = tx * T + T / 2, y = ty * T - 6;
      if (what === 'heart') {
        G.hearts = Math.min(5, G.hearts + 1);
        Sound.play('heart');
        part({ x, y, vy: -160, g: 300, life: 0.9, max: 0.9, type: 'heart' });
      } else {
        G.bananas++;
        Sound.play('box');
        setTimeout(() => Sound.play('banana'), 60);
        part({ x, y, vy: -260, g: 600, life: 0.75, max: 0.75, type: 'banana' });
      }
      sparkle(x, y, '#ffe135', 6);
    } else if (t === 2 || t === 4) {
      G.bumps.push({ tx, ty, t: 0.12 });
      Sound.play('bump');
    }
  }

  function updateEnemies(dt, th) {
    const lv = G.lv, p = G.p;
    const g = GRAV * th.gravity;
    const cx = G.cam + VW / 2;
    for (const e of lv.enemies) {
      if (e.dead) { e.dead += dt; continue; }
      if (Math.abs(e.x - cx) > VW) continue; // далеко за екраном — чекає
      if (e.type === 'walker') {
        e.vy = Math.min(e.vy + g * dt, MAXFALL);
        const prevBot = e.y;
        if (moveX(e, e.vx * dt)) e.vx = -e.vx;
        moveY(e, e.vy * dt, prevBot);
        if (e.onGround) {
          const fx = e.x + Math.sign(e.vx) * (e.w / 2 + 2);
          const below = tile(Math.floor(fx / T), Math.floor((e.y + 2) / T));
          const front = tile(Math.floor(fx / T), Math.floor((e.y - 1) / T));
          if ((!solid(below) && below !== 5) || front === 6) e.vx = -e.vx;
          // стрибунці час від часу підскакують
          if (e.hop) {
            e.hopT = (e.hopT || 1) - dt;
            if (e.hopT <= 0) { e.vy = -480 * Math.sqrt(th.gravity); e.hopT = 1.3 + Math.random(); }
          }
        }
        if (e.y > ROWS * T + 60) e.dead = 1;
      } else {
        e.t += dt * (e.spd || 1);
        const nx = e.baseX + Math.sin(e.t * 0.8) * T * 1.5;
        e.face = nx >= e.x ? 1 : -1;
        e.x = nx;
        e.y = e.baseY + Math.sin(e.t * 2) * e.range * 0.5;
      }
      // зіткнення з міньйоном
      const top = e.type === 'walker' ? e.y - e.h : e.y - e.h / 2;
      const bot = e.type === 'walker' ? e.y : e.y + e.h / 2;
      const ex0 = e.x - e.w / 2 + 3, ex1 = e.x + e.w / 2 - 3;
      if (p.x + p.w / 2 > ex0 && p.x - p.w / 2 < ex1 && p.y > top + 3 && p.y - p.h < bot - 3) {
        if (p.vy > 30 && p.y <= top + Math.max(14, e.h * 0.6)) {
          e.dead = 0.001;
          p.vy = -480 * Math.sqrt(th.gravity);
          p.sx = 0.8; p.sy = 1.2;
          Sound.play('stomp');
          sparkle(e.x, top, '#ffffff', 8);
        } else {
          hurt(e.x);
        }
      }
    }
    lv.enemies = lv.enemies.filter(e => !e.dead || e.dead < 0.6);
  }

  function updateComp(dt) {
    const c = G.comp, p = G.p, tr = G.trail;
    let dist = 0, prev = { x: p.x, y: p.y }, tx = tr[0].x, ty = tr[0].y;
    for (let i = tr.length - 1; i >= 0; i--) {
      const q = tr[i];
      const d = Math.hypot(q.x - prev.x, q.y - prev.y);
      if (dist + d >= FOLLOW) {
        const k = d > 0 ? (FOLLOW - dist) / d : 0;
        tx = prev.x + (q.x - prev.x) * k;
        ty = prev.y + (q.y - prev.y) * k;
        break;
      }
      dist += d;
      prev = q;
    }
    const ox = c.x;
    c.x += (tx - c.x) * Math.min(1, dt * 12);
    c.y += (ty - c.y) * Math.min(1, dt * 12);
    const dx = c.x - ox;
    c.moving = Math.abs(dx) > 0.12;
    if (Math.abs(dx) > 0.05) c.facing = dx > 0 ? 1 : -1;
    else if (p.idle > 0.3) c.facing = p.x >= c.x ? 1 : -1;
    c.t += dt;
    c.blinkT -= dt;
    if (c.blinkT < -0.12) c.blinkT = 2 + Math.random() * 4;
    // коли міньйон стоїть — білка весело підстрибує
    if (p.idle > 1.5) c.hop += dt; else c.hop = 0;
  }

  function hurt(fromX) {
    const p = G.p;
    if (p.inv > 0 || G.win) return;
    G.hearts--;
    Sound.play('hurt');
    p.inv = 1.6;
    p.vy = -380 * Math.sqrt(theme().gravity);
    p.vx = (p.x >= fromX ? 1 : -1) * 230;
    G.shake = 0.25;
    if (G.hearts <= 0) {
      G.hearts = 3;
      respawn();
      G.toast = { text: 'Ой! Спробуй ще раз!', t: 1.8 };
    }
  }

  function fellInPit() {
    Sound.play('fall');
    G.hearts--;
    if (G.hearts <= 0) G.hearts = 3;
    respawn();
    G.toast = { text: 'Ой! Ще раз!', t: 1.4 };
  }

  function respawn() {
    const c = G.cp;
    spawnPlayer(c ? c.x : G.lv.start.x, c ? c.y : G.lv.start.y);
    G.p.inv = 1.5;
    G.fade = 0.8;
    poof(G.comp.x, G.comp.y - 14);
    setTimeout(() => Sound.play('poof'), 150);
  }

  function reachGoal() {
    G.win = 0.001;
    Sound.stopMusic();
    Sound.play('win');
    confetti(G.lv.goal.x, G.lv.goal.y - 190, 60);
    const ratio = G.lv.totalBananas ? G.bananas / G.lv.totalBananas : 1;
    const stars = 1 + (ratio >= 0.5 ? 1 : 0) + (ratio >= 0.85 ? 1 : 0);
    G.winStars = stars;
    save.stars[G.L] = Math.max(save.stars[G.L] || 0, stars);
    save.unlocked = Math.max(save.unlocked, Math.min(NUM, G.L + 2));
    persist();
  }

  function showWin() {
    if (G.L === NUM - 1) {
      const total = save.stars.reduce((a, b) => a + b, 0);
      $('finalInfo').textContent = `Зірочок зібрано: ${total} з ${NUM * 3} ⭐`;
      setState('final');
      for (let i = 0; i < 4; i++) setTimeout(() => Sound.play('win'), i * 1300);
      return;
    }
    $('winStars').innerHTML = [0, 1, 2].map(i => `<span class="${i < G.winStars ? '' : 'off'}">⭐</span>`).join('');
    $('winInfo').textContent = `Бананів: ${G.bananas} з ${G.lv.totalBananas} 🍌`;
    setState('win');
  }

  // ---------- Малювання ----------
  function drawLayer(img, off) {
    const lw = img.width;
    let x = -((off * SCALE) % lw);
    if (x > 0) x -= lw;
    for (; x < cv.width; x += lw) ctx.drawImage(img, Math.floor(x), 0);
  }

  function drawBackground(cam) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(cache.sky, 0, 0);
    drawLayer(cache.far, cam * 0.15);
    drawLayer(cache.mid, cam * 0.4);
  }

  function drawTiles(cam) {
    const lv = G.lv, tl = cache.tiles;
    const x0 = Math.max(0, Math.floor(cam / T) - 1), x1 = Math.min(lv.W - 1, Math.ceil((cam + VW) / T) + 1);
    for (let ty = 0; ty < ROWS; ty++) {
      const row = lv.grid[ty];
      for (let tx = x0; tx <= x1; tx++) {
        const t = row[tx];
        if (!t) continue;
        let img;
        let ox = 0, oy = 0;
        if (t === 1) img = (ty > 0 && lv.grid[ty - 1][tx] === 1) ? tl.fill : tl.top;
        else if (t === 6) img = tl.spike;
        else if (t === 7) {
          img = tl.crumble;
          const cr = G.crumbles.get(tx + ',' + ty);
          if (cr && !cr.gone) { ox = (Math.random() - 0.5) * 3; oy = (Math.random() - 0.5) * 2; }
        } else img = t === 2 ? tl.block : t === 3 ? tl.box : t === 4 ? tl.used : tl.oneway;
        if (t >= 2 && t <= 4) for (const b of G.bumps) if (b.tx === tx && b.ty === ty) oy = -Math.sin((1 - b.t / 0.18) * Math.PI) * 8;
        ctx.drawImage(img, tx * T + ox, ty * T + oy, T + 0.6, T + 0.6);
      }
    }
  }

  function drawParticles() {
    for (const q of G.parts) {
      const a = Math.max(0, q.life / q.max);
      ctx.globalAlpha = a;
      if (q.type === 'star') {
        ctx.fillStyle = q.color;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); star(ctx, 0, 0, q.size, 4, 0.4); ctx.restore();
      } else if (q.type === 'confetti') {
        ctx.fillStyle = q.color;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2); ctx.restore();
      } else if (q.type === 'banana') {
        Art.banana(ctx, q.x, q.y, 0, 1);
      } else if (q.type === 'tile') {
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.drawImage(cache.tiles.crumble, -T / 2, -T / 2, T, T); ctx.restore();
      } else if (q.type === 'heart') {
        Art.heart(ctx, q.x, q.y, 1.2);
      } else {
        ctx.fillStyle = q.color;
        circ(ctx, q.x, q.y, q.size * (0.5 + a * 0.5));
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawWorld() {
    const lv = G.lv, p = G.p, c = G.comp, th = theme(), t = G.t;
    let cam = G.cam;
    const sh = G.shake > 0 ? (Math.random() - 0.5) * 6 : 0;
    drawBackground(cam);
    const camPx = Math.round((cam + sh) * SCALE);
    ctx.setTransform(SCALE, 0, 0, SCALE, -camPx, 0);
    cam = camPx / SCALE;
    const vis = x => x > cam - 80 && x < cam + VW + 80;

    if (th.pit) {
      const pg = ctx.createLinearGradient(0, VIEW_H - 40, 0, VIEW_H);
      pg.addColorStop(0, 'rgba(0,0,0,0)');
      pg.addColorStop(0.5, th.pit);
      pg.addColorStop(1, th.pit);
      ctx.fillStyle = pg;
      ctx.fillRect(cam, VIEW_H - 40 + Math.sin(t * 2) * 2, VW, 44);
    }
    for (const d of lv.decor) if (vis(d.x)) Art.decor(ctx, d, t);
    for (const k of lv.checkpoints) if (vis(k.x)) Art.checkpoint(ctx, k.x, k.y, k.active, t);
    if (vis(lv.goal.x)) Art.goal(ctx, lv.goal.x, lv.goal.y, t);
    drawTiles(cam);
    for (const m of lv.movers) {
      if (!vis(m.x) && !vis(m.x + m.w)) continue;
      if (m.axis === 'y') {
        // трос ліфта
        ctx.strokeStyle = 'rgba(60,60,70,0.7)';
        ctx.lineWidth = 2;
        line(ctx, m.x + 10, 0, m.x + 10, m.y);
        line(ctx, m.x + m.w - 10, 0, m.x + m.w - 10, m.y);
      }
      Art.mover(ctx, m, th);
    }
    for (const s of lv.springs) if (vis(s.x)) Art.spring(ctx, s.x, s.y, s.comp);
    for (const b of lv.bananas) if (!b.got && vis(b.x)) Art.banana(ctx, b.x, b.y, t + b.x * 0.01);
    for (const h of lv.hearts) if (!h.got && vis(h.x)) Art.heart(ctx, h.x, h.y + Math.sin(t * 3) * 2, 1.1 + Math.sin(t * 6) * 0.06);
    for (const e of lv.enemies) if (vis(e.x)) Art.enemy(ctx, e, t, th.enemyColor);

    // білка біжить позаду
    const hop = c.hop > 0 ? Math.abs(Math.sin(c.hop * 5)) * 8 : 0;
    Art.squirrel(ctx, c.x, c.y - hop, { t: c.t, facing: c.facing, moving: c.moving || hop > 0, blink: c.blinkT < 0 });
    // міньйон
    const flash = p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0;
    const state = !p.onGround ? 'air' : (Math.abs(p.vx) > 20 ? 'run' : 'idle');
    Art.minion(ctx, p.x, p.y, {
      t: p.anim, facing: p.facing, state, sx: p.sx, sy: p.sy,
      blink: p.blinkT < 0, alpha: flash ? 0.35 : 1, happy: G.win > 0,
    });
    drawParticles();
  }

  // ---------- Частинки середовища (сніг, бульбашки...) ----------
  function initAmbient() {
    G.amb = [];
    const idx = G.state === 'menu' || G.state === 'levels' ? menuTheme() : G.L;
    const type = THEMES[idx] ? THEMES[idx].particles : 'none';
    const n = { snow: 70, bubbles: 30, embers: 40, leaves: 14, petals: 24, fireflies: 22, sparkle: 26, dust: 20, twinkle: 30 }[type] || 0;
    for (let i = 0; i < n; i++) G.amb.push({ type, x: Math.random() * VW, y: Math.random() * VIEW_H, s: Math.random(), ph: Math.random() * 6 });
  }

  function drawAmbient(dt, camDelta) {
    if (!G.amb.length) return;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const t = G.t;
    for (const a of G.amb) {
      const par = 0.3 + a.s * 0.6;
      a.x -= camDelta * par;
      switch (a.type) {
        case 'snow': a.y += (25 + a.s * 35) * dt; a.x += Math.sin(t + a.ph) * 12 * dt; break;
        case 'bubbles': a.y -= (20 + a.s * 40) * dt; a.x += Math.sin(t * 2 + a.ph) * 15 * dt; break;
        case 'embers': a.y -= (30 + a.s * 50) * dt; a.x += Math.sin(t * 1.5 + a.ph) * 20 * dt; break;
        case 'leaves': case 'petals': a.y += (20 + a.s * 25) * dt; a.x += Math.sin(t + a.ph) * 30 * dt; break;
        case 'dust': a.x -= (30 + a.s * 50) * dt; a.y += Math.sin(t + a.ph) * 6 * dt; break;
        case 'fireflies': a.x += Math.sin(t * 0.7 + a.ph) * 15 * dt; a.y += Math.cos(t * 0.9 + a.ph) * 12 * dt; break;
        default: break;
      }
      if (a.x < -10) a.x += VW + 20;
      if (a.x > VW + 10) a.x -= VW + 20;
      if (a.y > VIEW_H + 10) a.y = -10;
      if (a.y < -10) a.y = VIEW_H + 10;
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + a.ph * 4);
      switch (a.type) {
        case 'snow': ctx.fillStyle = 'rgba(255,255,255,0.9)'; circ(ctx, a.x, a.y, 1.5 + a.s * 2.5); break;
        case 'bubbles':
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(a.x, a.y, 2 + a.s * 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.5)'; circ(ctx, a.x - 1, a.y - 1, 0.8 + a.s);
          break;
        case 'embers': ctx.fillStyle = `rgba(255,${130 + (a.s * 100 | 0)},40,${0.5 + tw * 0.5})`; circ(ctx, a.x, a.y, 1.2 + a.s * 2); break;
        case 'leaves':
          ctx.fillStyle = a.s > 0.5 ? '#f9a825' : '#7cb342';
          ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(t * 2 + a.ph); ell(ctx, 0, 0, 5, 2.5); ctx.restore();
          break;
        case 'petals':
          ctx.fillStyle = a.s > 0.6 ? '#ffffff' : '#ffb7d5';
          ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(t * 1.5 + a.ph); ell(ctx, 0, 0, 4, 2.2); ctx.restore();
          break;
        case 'dust': ctx.fillStyle = 'rgba(255,240,200,0.45)'; circ(ctx, a.x, a.y, 1 + a.s * 2); break;
        case 'fireflies': ctx.fillStyle = `rgba(230,255,120,${0.2 + tw * 0.8})`; circ(ctx, a.x, a.y, 1.5 + a.s * 1.5); break;
        case 'sparkle': ctx.fillStyle = `rgba(255,255,255,${tw * 0.9})`; star(ctx, a.x, a.y, 1.5 + a.s * 3, 4, 0.35); break;
        case 'twinkle': ctx.fillStyle = `rgba(255,255,255,${tw})`; star(ctx, a.x, a.y * 0.6, 1 + a.s * 2.5, 4, 0.3); break;
        default: break;
      }
    }
  }

  // ---------- Інтерфейс поверх гри ----------
  function outlinedText(text, x, y, size, col = '#fff', align = 'center') {
    ctx.font = `bold ${size}px "Trebuchet MS", "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.22;
    ctx.strokeStyle = 'rgba(40,25,0,0.85)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = col;
    ctx.fillText(text, x, y);
  }

  function drawHUD() {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const slots = Math.max(3, G.hearts);
    for (let i = 0; i < slots; i++) Art.heart(ctx, 30 + i * 32, 30, 1.25, i < G.hearts ? '#ff3b5c' : 'rgba(0,0,0,0.3)');
    if (G.hearts > 0) for (let i = 0; i < G.hearts; i++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ell(ctx, 30 + i * 32 - 6, 25, 3, 2, -0.6); }
    const bx = VW - 220;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    rr(ctx, bx - 26, 12, 140, 36, 18);
    ctx.fill();
    Art.banana(ctx, bx - 4, 31, 0, 1.25);
    outlinedText(`${G.bananas}/${G.lv.totalBananas}`, bx + 50, 31, 22, '#ffe135');
    outlinedText(`${G.L + 1}. ${theme().name}`, VW / 2, 28, 18);

    if (G.banner > 0) {
      const a = Math.min(1, G.banner * 2, (2.8 - G.banner) * 4);
      ctx.globalAlpha = Math.max(0, a);
      outlinedText(`Рівень ${G.L + 1}`, VW / 2, VIEW_H * 0.3, 40, '#ffd23f');
      outlinedText(`${theme().icon} ${theme().name}`, VW / 2, VIEW_H * 0.3 + 46, 28);
      ctx.globalAlpha = 1;
    }
    if (G.toast) {
      ctx.globalAlpha = Math.min(1, G.toast.t * 3);
      outlinedText(G.toast.text, VW / 2, VIEW_H * 0.42, 30, '#fff');
      ctx.globalAlpha = 1;
    }
    if (G.win > 0) {
      const s = 1 + Math.sin(G.t * 6) * 0.05;
      ctx.save();
      ctx.translate(VW / 2, VIEW_H * 0.32);
      ctx.scale(s, s);
      outlinedText('УРА! 🎉', 0, 0, 52, '#ffd23f');
      ctx.restore();
    }
    if (G.fade > 0) {
      ctx.fillStyle = `rgba(255,255,255,${G.fade * 0.8})`;
      ctx.fillRect(0, 0, VW, VIEW_H);
    }
  }

  // ---------- Меню: персонажі біжать на тлі світу ----------
  function menuTheme() { return Math.min(NUM - 1, save.unlocked - 1); }

  function renderMenu(dt) {
    const idx = menuTheme();
    ensureCache(idx);
    const th = THEMES[idx];
    const cam = G.menuT * 70;
    drawBackground(cam);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const off = cam % T;
    for (let x = -T; x < VW + T; x += T) {
      for (let ty = 11; ty < ROWS; ty++) ctx.drawImage(ty === 11 ? cache.tiles.top : cache.tiles.fill, x - off, ty * T, T + 0.6, T + 0.6);
    }
    const mx = VW * 0.86;
    Art.minion(ctx, mx, 11 * T, { t: G.menuT, facing: 1, state: 'run' });
    Art.squirrel(ctx, mx - 60, 11 * T, { t: G.menuT, facing: 1, moving: true });
    for (let i = 0; i < 3; i++) {
      const bx = ((VW + 100) - ((G.menuT * 70 + i * 260) % (VW + 200)));
      Art.banana(ctx, bx, 11 * T - 70 - i * 10, G.menuT + i);
    }
    drawAmbient(dt, 70 * dt);
    if (th.particles === 'none') { /* нічого */ }
  }

  // ---------- Екрани ----------
  const screens = ['menu', 'levels', 'pause', 'win', 'final', 'install'];
  let isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  function setState(s) {
    const prev = G.state;
    G.state = s;
    for (const id of screens) $(id).classList.toggle('hidden', id !== s);
    const playing = s === 'play';
    $('btnPause').classList.toggle('hidden', !playing);
    $('touch').classList.toggle('hidden', !playing || !isTouch);
    $('kbdHint').classList.toggle('hidden', isTouch);
    if (!playing) clearInput();
    document.body.classList.toggle('installing', s === 'install');
    if (s === 'menu' || s === 'levels') {
      if (prev !== 'menu' && prev !== 'levels' && prev !== 'install') {
        Sound.music(THEMES[menuTheme()].music);
        cache.key = '';
        initAmbient();
      }
    }
    if (s === 'pause') Sound.pauseMusic();
    if (s === 'play' && prev === 'pause') Sound.resumeMusic();
  }

  const PER_PAGE = 10;
  let levelPage = -1;
  function buildLevelGrid(page) {
    const pages = Math.ceil(NUM / PER_PAGE);
    if (page == null) page = levelPage < 0 ? Math.floor(menuTheme() / PER_PAGE) : levelPage;
    levelPage = clamp(page, 0, pages - 1);
    const from = levelPage * PER_PAGE, to = Math.min(NUM, from + PER_PAGE);
    $('pageInfo').textContent = `${from + 1}–${to}`;
    $('btnPrevPage').style.visibility = levelPage > 0 ? 'visible' : 'hidden';
    $('btnNextPage').style.visibility = levelPage < pages - 1 ? 'visible' : 'hidden';
    const grid = $('levelGrid');
    grid.innerHTML = '';
    THEMES.forEach((th, i) => {
      if (i < from || i >= to) return;
      const locked = i + 1 > save.unlocked;
      const b = document.createElement('button');
      b.className = 'lvl' + (locked ? ' locked' : '');
      const st = save.stars[i] || 0;
      b.innerHTML = `<span class="num">${locked ? '🔒' : i + 1}</span><span class="ico">${th.icon}</span><span>${th.name}</span>` +
        `<span class="st">${'⭐'.repeat(st)}${'<span style="opacity:.25">⭐</span>'.repeat(3 - st)}</span>`;
      b.addEventListener('click', () => {
        if (locked) { Sound.play('bump'); return; }
        Sound.play('click');
        goFullscreen();
        startLevel(i);
      });
      grid.appendChild(b);
    });
  }

  function togglePause() {
    if (G.state === 'play' && !G.win) setState('pause');
    else if (G.state === 'pause') setState('play');
  }

  function goFullscreen() {
    if (!isTouch) return;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
      const pr = req.call(el, { navigationUI: 'hide' });
      if (pr && pr.then) {
        pr.then(() => {
          if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
        }).catch(() => {});
      }
    } catch (e) { /* не підтримується */ }
  }

  function updateSoundButtons() {
    document.querySelectorAll('.btnSound').forEach(b => { b.textContent = save.muted ? '🔇' : '🔊'; });
  }

  const on = (id, fn) => $(id).addEventListener('click', e => { Sound.init(); Sound.play('click'); fn(e); });
  on('btnPlay', () => { goFullscreen(); startLevel(menuTheme()); });
  on('btnLevels', () => { buildLevelGrid(); setState('levels'); });
  on('btnBack', () => setState('menu'));
  on('btnPrevPage', () => buildLevelGrid(levelPage - 1));
  on('btnNextPage', () => buildLevelGrid(levelPage + 1));
  on('btnPause', togglePause);
  on('btnResume', togglePause);
  on('btnRestart', () => startLevel(G.L));
  on('btnToMenu', () => { Sound.stopMusic(); setState('menu'); });
  on('btnNext', () => startLevel(Math.min(NUM - 1, G.L + 1)));
  on('btnReplay', () => startLevel(G.L));
  on('btnWinMenu', () => setState('menu'));
  on('btnFinalMenu', () => setState('menu'));
  document.querySelectorAll('.btnSound').forEach(b => b.addEventListener('click', () => {
    Sound.init();
    save.muted = !save.muted;
    Sound.setMuted(save.muted);
    persist();
    updateSoundButtons();
  }));
  // для батьків: 5 натискань на назву відкривають усі рівні
  let titleTaps = 0, titleTimer = 0;
  $('title').addEventListener('click', () => {
    titleTaps++;
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => { titleTaps = 0; }, 1500);
    if (titleTaps >= 5) {
      titleTaps = 0;
      save.unlocked = NUM;
      persist();
      Sound.init();
      Sound.play('checkpoint');
      buildLevelGrid();
      setState('levels');
    }
  });

  // ---------- Керування ----------
  function clearInput() {
    input.kl = input.kr = input.kj = input.tl = input.tr = input.tj = false;
    for (const id of ['bL', 'bR', 'bJ']) $(id).classList.remove('on');
  }
  function pollJump() {
    const j = input.kj || input.tj;
    if (j && !input.prevJ && G.p) G.p.jbuf = 0.15;
    input.prevJ = j;
  }

  const KEYS = { ArrowLeft: 'kl', KeyA: 'kl', ArrowRight: 'kr', KeyD: 'kr', Space: 'kj', ArrowUp: 'kj', KeyW: 'kj' };
  addEventListener('keydown', e => {
    Sound.init();
    if (KEYS[e.code]) {
      input[KEYS[e.code]] = true;
      if (G.state === 'play') e.preventDefault();
    }
    if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
    if (e.code === 'Enter' && G.state === 'menu') { startLevel(menuTheme()); }
  });
  addEventListener('keyup', e => { if (KEYS[e.code]) input[KEYS[e.code]] = false; });
  addEventListener('blur', clearInput);

  // Ліва половина екрана — бігти (◀ або ▶ залежно від того, ближче до якої кнопки), права — стрибати
  const touchEl = $('touch');
  function onTouch(e) {
    e.preventDefault();
    Sound.init();
    isTouch = true;
    const rl = $('bL').getBoundingClientRect(), rrr = $('bR').getBoundingClientRect();
    const mid = (rl.left + rl.right + rrr.left + rrr.right) / 4;
    let l = false, r = false, j = false;
    for (const t of e.touches) {
      if (t.clientX > innerWidth * 0.5) j = true;
      else if (t.clientX < mid) l = true;
      else r = true;
    }
    input.tl = l; input.tr = r; input.tj = j;
    $('bL').classList.toggle('on', l);
    $('bR').classList.toggle('on', r);
    $('bJ').classList.toggle('on', j);
  }
  for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) touchEl.addEventListener(ev, onTouch, { passive: false });
  document.addEventListener('touchstart', () => {
    Sound.init();
    if (!isTouch) { isTouch = true; setState(G.state); }
  }, { passive: true });
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (G.state === 'play' && !G.win) setState('pause');
      Sound.pauseMusic();
    } else if (G.state !== 'pause') {
      Sound.resumeMusic();
    }
  });
  const portrait = matchMedia('(orientation: portrait)');
  const onOrient = () => { if (portrait.matches && isTouch && G.state === 'play' && !G.win) setState('pause'); };
  if (portrait.addEventListener) portrait.addEventListener('change', onOrient);
  addEventListener('resize', () => { resize(); onOrient(); });

  // ---------- Головний цикл ----------
  let last = performance.now(), acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    G.t += dt;
    if (G.state === 'menu' || G.state === 'levels' || G.state === 'install') {
      G.menuT += dt;
      renderMenu(dt);
      return;
    }
    if (!G.lv) return;
    ensureCache(G.L);
    if (G.state === 'play') {
      pollJump();
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 16) { update(STEP); acc -= STEP; n++; }
      if (n === 16) acc = 0;
    } else acc = 0;
    if (!G.lv) return;
    drawWorld();
    const camDelta = G.cam - G.lastCam;
    G.lastCam = G.cam;
    drawAmbient(G.state === 'play' ? dt : 0, camDelta);
    drawHUD();
  }

  // ---------- Підказка «як встановити гру» ----------
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const installed = () => navigator.standalone === true ||
    matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches;
  let installEvent = null;

  function installSteps() {
    const ios = [
      'Відкрий гру в браузері <b>Safari</b> (поки є інтернет).',
      'Натисни кнопку <b>«Поділитися»</b> <span class="ico">⬆︎</span> — квадратик зі стрілкою внизу або вгорі екрана.',
      'Прокрути список і вибери <b>«На екран „Додому“»</b> <span class="ico">＋</span>.',
      'Натисни <b>«Додати»</b>.',
      'Готово! Запускай гру з іконки з Міньйоном — тепер і без інтернету.',
    ];
    const androidPrompt = [
      'Натисни зелену кнопку <b>«Встановити»</b> нижче.',
      'Підтверди <b>«Встановити»</b>.',
      'Готово! Запускай гру з іконки з Міньйоном — тепер і без інтернету.',
    ];
    const android = [
      'Відкрий гру в <b>Chrome</b> (поки є інтернет).',
      'Натисни меню <span class="ico">⋮</span> у правому верхньому куті.',
      'Вибери <b>«Додати на головний екран»</b> або <b>«Встановити застосунок»</b>.',
      'Підтверди <b>«Встановити»</b> / <b>«Додати»</b>.',
      'Готово! Запускай гру з іконки з Міньйоном — тепер і без інтернету.',
    ];
    const desktop = [
      'На комп\'ютері можна грати просто тут, у браузері.',
      'Щоб гра була іконкою: у Chrome чи Edge натисни значок <span class="ico">⊕</span> в адресному рядку або меню <span class="ico">⋮</span> → <b>«Встановити»</b>.',
      'На телефоні відкрий це саме посилання — там буде своя підказка.',
    ];
    const list = isIOS ? ios : isAndroid ? (installEvent ? androidPrompt : android) : (installEvent ? androidPrompt : desktop);
    $('instSteps').innerHTML = list.map(x => `<li>${x}</li>`).join('');
    $('btnInstallNow').classList.toggle('hidden', !installEvent);
  }

  function updateInstallStatus() {
    const el = $('instStatus');
    if (installed()) { el.className = 'status ok'; el.textContent = '✅ Гру вже встановлено!'; return; }
    if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http') || !window.caches) { el.textContent = ''; return; }
    el.className = 'status wait';
    el.textContent = '⏳ Зберігаю гру для гри без інтернету…';
    navigator.serviceWorker.ready
      .then(() => caches.keys())
      .then(keys => {
        if (keys.length) { el.className = 'status ok'; el.textContent = '✅ Гру збережено — вона працюватиме без інтернету'; }
      })
      .catch(() => {});
  }

  function showInstall() {
    installSteps();
    updateInstallStatus();
    setState('install');
  }

  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvent = e;
    if (G.state === 'install') installSteps();
  });
  addEventListener('appinstalled', () => {
    installEvent = null;
    save.installSeen = true;
    persist();
    $('btnHowInstall').classList.add('hidden');
    if (G.state === 'install') { installSteps(); updateInstallStatus(); }
  });
  on('btnInstallNow', () => {
    if (!installEvent) return;
    installEvent.prompt();
    installEvent.userChoice.finally(() => { installEvent = null; installSteps(); updateInstallStatus(); });
  });
  on('btnInstallOk', () => {
    save.installSeen = true;
    persist();
    setState('menu');
  });
  on('btnHowInstall', showInstall);

  resize();
  updateSoundButtons();
  setState('menu');
  if (!installed()) {
    $('btnHowInstall').classList.remove('hidden');
    // на телефоні при першому відкритті одразу показуємо, як встановити
    if (isTouch && !save.installSeen) showInstall();
  }
  requestAnimationFrame(frame);

  // для автоматичних тестів
  window.__game = { G, input, startLevel, setState, save, update, tile };
})();
