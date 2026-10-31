'use strict';
// Генератор рівнів: з випадкових «шматків» складаємо трасу. Детерміновано для кожного рівня.
// Коди клітинок: 0 порожньо, 1 земля, 2 блок, 3 бонус-скринька, 4 порожня скринька, 5 хмаринка (стрибок крізь знизу),
// 6 шипи (лежать просто на землі, не тверді, колють), 7 плита, що обвалюється (тверда, падає після кроку на неї).
// Рівні 1–15 (L 0..14) мусять лишатися точно такими, як були: уся нова логіка — лише для L >= 15 (hard).

function generateLevel(L) {
  if (L >= 40) return generateLevel80(L);   // рівні 41–80 — окремий генератор (1–40 не змінюються)
  const th = THEMES[L] || THEMES[L % 15];
  const rng = mulberry32(12345 + L * 977);
  const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const d = L / 14;                       // складність 0..1
  const g = th.gravity || 1;
  const low = g < 0.8;                    // мала гравітація — ширші ями
  const sky = !!th.skyLevel;
  const hard = L >= 15;                   // нові, важчі рівні 16–40
  const ed = hard ? (L - 15) / 24 : 0;     // складність нових рівнів 0..1
  const target = hard ? Math.min(105 + L * 9, 230 + (L - 15) * 3) : 105 + L * 9; // довжина траси з шматків
  const MAXW = 12 + target + 80;

  const grid = [];
  for (let r = 0; r < ROWS; r++) grid.push(new Uint8Array(MAXW));
  const deco = new Uint8Array(MAXW);      // де можна ставити прикраси
  const bananas = [], enemies = [], springs = [], movers = [], checkpoints = [], decor = [], hearts = [];
  const boxes = new Map();

  let x = 0, gy = 11;
  const hist = [];

  // ---------- помічники ----------
  const col = (c, top) => { for (let r = top; r < ROWS; r++) grid[r][c] = 1; };
  const lay = (n, ok = true) => {
    const s = x;
    for (let i = 0; i < n; i++) { col(x, gy); if (ok) deco[x] = 1; x++; }
    return s;
  };
  const skip = n => { const s = x; x += n; return s; };
  const ban = (tx, ty) => { if (ty >= 1) bananas.push({ x: tx * T + T / 2, y: ty * T + T / 2, got: false }); };
  const walker = tx => enemies.push({
    type: 'walker', x: tx * T + T / 2, y: gy * T, vx: -(35 + d * 35), vy: 0,
    w: 26, h: 24, dead: 0, style: th.enemy, seed: rng() * 10,
  });

  // ---------- шматки траси ----------
  const chunks = {
    flat() {
      const n = ri(4, 7), s = lay(n);
      if (rng() < 0.5) for (let c = s + 1; c < s + n - 1; c++) ban(c, gy - 2);
    },
    gap() {
      const w = (L < 2 ? 2 : ri(2, 3)) + (low ? 1 : 0);
      const gy0 = gy, gs = skip(w);
      // дуга бананів над ямою
      for (let i = -1; i <= w; i++) ban(gs + i, gy0 - (i < 0 || i >= w ? 3 : 4));
      if (L >= 1 && rng() < 0.4) {
        const dh = rng() < 0.5 ? -1 : 1;
        if (gy + dh >= 7 && gy + dh <= 11) gy += dh;
      }
      lay(ri(2, 3));
    },
    step() {
      const opts = [-2, -1, 1, 2].filter(v => gy + v >= 7 && gy + v <= 11);
      gy += opts[Math.floor(rng() * opts.length)];
      const s = lay(ri(2, 4));
      if (rng() < 0.4) ban(s + 1, gy - 2);
    },
    enemy() {
      const n = ri(7, 10), s = lay(n);
      if (L >= 7 && n >= 9 && rng() < 0.35) { walker(s + 2); walker(s + n - 3); }
      else walker(s + Math.floor(n / 2));
    },
    boxes() {
      const s = lay(8), bw = ri(3, 4), b0 = s + 2, row = gy - 3;
      const nb = rng() < 0.5 ? 1 : 2;
      const pos = new Set();
      while (pos.size < nb) pos.add(ri(0, bw - 1));
      for (let i = 0; i < bw; i++) {
        const c = b0 + i;
        if (pos.has(i)) { grid[row][c] = 3; boxes.set(`${c},${row}`, 'banana'); }
        else grid[row][c] = 2;
        ban(c, row - 1);
      }
      boxesAt.push(s);
    },
    stairs() {
      const n = Math.min(ri(2, 3), gy - 7), sw = ri(1, 2);
      for (let i = 0; i < n; i++) { gy--; lay(sw, false); }
      if (L >= 3 && rng() < 0.45) {
        lay(2, false);
        const ps = skip(2);
        ban(ps, gy - 3); ban(ps + 1, gy - 3);
        lay(3, false);
      } else {
        const p = ri(3, 5), s = lay(p, false);
        for (let c = s; c < s + p; c++) ban(c, gy - 2);
      }
      for (let i = 0; i < n; i++) { gy++; lay(sw, false); }
      lay(2);
    },
    hop() {
      const k = ri(2, 3), code = sky ? 5 : 2;
      let h = 0;
      for (let i = 0; i < k; i++) {
        skip(2);
        h = Math.max(0, Math.min(2, h + ri(i === 0 ? 0 : -1, 1)));
        for (let j = 0; j < 2; j++) { grid[gy - h][x] = code; ban(x, gy - h - 1); x++; }
      }
      skip(2);
      lay(3);
    },
    spring() {
      // пружина впритул до стіни: стрибнув біля стіни — і злетів
      lay(2, false);
      const sc = lay(1, false);
      springs.push({ x: sc * T + T / 2, y: gy * T, comp: 0 });
      const w0 = x;
      for (let i = 0; i < 2; i++) { col(x, gy); for (let r = gy - 5; r < gy; r++) grid[r][x] = 2; x++; }
      ban(sc, gy - 3); ban(sc, gy - 5);
      ban(w0, gy - 6); ban(w0 + 1, gy - 6);
      ban(w0 + 2, gy - 4);
      lay(1, false);
      lay(2);
    },
    mover() {
      const pw = ri(7, 9), ps = skip(pw);
      movers.push({
        x0: ps * T + 4, x1: (ps + pw - 3) * T - 4, x: ps * T + 4, y: gy * T,
        w: 3 * T, h: 14, dir: 1, speed: 45 + d * 35, dx: 0,
      });
      for (let c = ps + 1; c < ps + pw - 1; c += 2) ban(c, gy - 1);
      lay(3);
    },
    flyer() {
      const s = lay(8);
      const fx = (s + 4) * T + T / 2, fy = (gy - 3) * T;
      enemies.push({
        type: 'flyer', x: fx, y: fy, baseX: fx, baseY: fy, t: rng() * 6,
        w: 26, h: 22, dead: 0, style: th.flyer, seed: rng() * 10, range: 2 * T, face: 1,
      });
    },
    clouds() {
      const s = lay(9);
      for (let c = s + 1; c <= s + 3; c++) { grid[gy - 3][c] = 5; ban(c, gy - 4); }
      if (gy - 6 >= 2) for (let c = s + 4; c <= s + 7; c++) { grid[gy - 6][c] = 5; ban(c, gy - 7); }
    },
  };

  // ---------- нові шматки для рівнів 16–40 (тільки hard) ----------
  const walkerH = (tx, ty = gy, canHop = true) => {
    const o = {
      type: 'walker', x: tx * T + T / 2, y: ty * T, vx: -(55 + ed * 45), vy: 0,
      w: 26, h: 24, dead: 0, style: th.enemy, seed: rng() * 10,
    };
    // стрибунці; під низькими стелями прапорець знімається нижче
    if (canHop && L >= 23 && rng() < 0.35 + 0.45 * ed) { o.hop = true; o.hopT = 1 + rng(); }
    enemies.push(o);
  };
  const flyerH = (fx, fy) => enemies.push({
    type: 'flyer', x: fx, y: fy, baseX: fx, baseY: fy, t: rng() * 6,
    w: 26, h: 22, dead: 0, style: th.flyer, seed: rng() * 10, range: 2 * T, face: 1,
    spd: Math.round((1 + 0.6 * ed) * 100) / 100,
  });
  // шипи: стовпчики землі, на яких зверху лежать шипи (без прикрас)
  const spikeRun = n => {
    const s = lay(n, false);
    for (let c = s; c < s + n; c++) grid[gy - 1][c] = 6;
    return s;
  };
  // ширина ями: здебільшого 3, з L 27 — інколи 4, мала гравітація +1 (максимум 5)
  const gapW = () => {
    let w = rng() < 0.15 ? 2 : 3;
    if (L >= 27 && rng() < 0.25 + 0.35 * (L - 27) / 12) w = 4;
    if (low) w++;
    return Math.min(w, low ? 5 : 4);
  };
  // висота приземлення: вгору на 1 або вниз на 1–2
  const landDh = () => {
    if (rng() >= 0.45) return 0;
    const opts = [-1, 1, 2].filter(v => gy + v >= 7 && gy + v <= 11);
    return opts.length ? opts[Math.floor(rng() * opts.length)] : 0;
  };
  const hardChunks = {
    flat() {
      const n = ri(4, 7), s = lay(n);
      if (rng() < 0.2) for (let c = s + 1; c < s + n - 1; c++) ban(c, gy - 2);
    },
    gap() {
      const w = gapW(), gy0 = gy, gs = skip(w);
      for (let i = 0; i < w; i++) ban(gs + i, gy0 - 4);   // банани лише над ямою — за ризик
      gy += landDh();
      lay(ri(2, 3));
    },
    gapfly() {
      // яма, над якою кружляє летун: треба вгадати момент
      lay(2);
      const w = gapW(), gy0 = gy, gs = skip(w);
      flyerH((gs + w / 2) * T, (gy0 - 4) * T - 16);
      ban(gs + Math.floor(w / 2), gy0 - 3);
      gy += landDh();
      lay(3);
    },
    step() {
      const opts = [-2, -1, 1, 2].filter(v => gy + v >= 7 && gy + v <= 11);
      gy += opts[Math.floor(rng() * opts.length)];
      const s = lay(ri(2, 4));
      if (rng() < 0.25) ban(s + 1, gy - 2);
    },
    spikes() {
      lay(ri(2, 3));
      const k = ri(1, L >= 22 ? 3 : 2), s = spikeRun(k);
      if (rng() < 0.6) for (let c = s; c < s + k; c++) ban(c, gy - 4);
      lay(2);
      if (L >= 25 && rng() < 0.35) { spikeRun(ri(1, 2)); lay(2); }
      lay(ri(0, 1));
    },
    enemy() {
      const n = ri(8, 12), s = lay(n);
      let k = 1 + (rng() < 0.3 + 0.4 * ed ? 1 : 0);
      if (L >= 27 && n >= 11 && rng() < 0.2 + 0.5 * ed) k = 3;
      if (k === 1) walkerH(s + Math.floor(n / 2));
      else for (let i = 0; i < k; i++) walkerH(s + 2 + Math.round(i * (n - 5) / (k - 1)));
      if (rng() < 0.35) ban(s + Math.floor(n / 2), gy - 3);
      if (L >= 28 && n >= 10 && rng() < 0.5 * ed) flyerH((s + n / 2) * T, (gy - 4) * T);
    },
    spikeEnemies() {
      // шипи між двома ворогами (вороги розвертаються біля шипів)
      const n1 = ri(4, 5), s1 = lay(n1);
      walkerH(s1 + 1);
      const k = ri(1, 2), sk = spikeRun(k);
      for (let c = sk; c < sk + k; c++) ban(c, gy - 4);
      const n2 = ri(4, 5), s2 = lay(n2);
      walkerH(s2 + n2 - 2);
    },
    boxes() {
      const s = lay(8), bw = ri(3, 4), b0 = s + 2, row = gy - 3;
      const nb = Math.min(bw, ri(2, 3));
      const pos = new Set();
      while (pos.size < nb) pos.add(ri(0, bw - 1));
      for (let i = 0; i < bw; i++) {
        const c = b0 + i;
        if (pos.has(i)) { grid[row][c] = 3; boxes.set(`${c},${row}`, 'banana'); }
        else { grid[row][c] = 2; if (rng() < 0.5) ban(c, row - 1); }
      }
      boxesAt.push(s);
    },
    perch() {
      // ворог патрулює вузьку платформу з блоків
      const n = ri(9, 10), s = lay(n), pw = ri(3, 4), p0 = s + 3, row = gy - 3;
      for (let i = 0; i < pw; i++) grid[row][p0 + i] = 2;
      if (rng() < 0.5) { const bc = p0 + ri(0, pw - 1); grid[row][bc] = 3; boxes.set(`${bc},${row}`, 'banana'); }
      walkerH(p0 + Math.floor(pw / 2), row, false);
      ban(p0, row - 2); ban(p0 + pw - 1, row - 2);
    },
    stairs() {
      const n = Math.min(ri(2, 3), gy - 7), sw = ri(1, 2);
      for (let i = 0; i < n; i++) { gy--; lay(sw, false); }
      if (rng() < 0.5) {
        lay(2, false);
        const ps = skip(2);
        ban(ps, gy - 3); ban(ps + 1, gy - 3);
        lay(3, false);
      } else {
        const p = ri(3, 5), s = lay(p, false);
        for (let c = s; c < s + p; c++) if (rng() < 0.5) ban(c, gy - 2);
      }
      for (let i = 0; i < n; i++) { gy++; lay(sw, false); }
      lay(2);
      if (rng() < 0.6) { spikeRun(ri(1, 2)); lay(2); }   // шипи внизу сходів
    },
    hop() {
      // камінці над ямою; з L 19 деякі обвалюються (ніколи перший і ніколи два поспіль)
      const k = ri(3, 4), code = sky ? 5 : 2;
      let h = 0, prevCr = true;
      for (let i = 0; i < k; i++) {
        skip(2);
        h = Math.max(0, Math.min(2, h + ri(i === 0 ? 0 : -1, 1)));
        const cr = L >= 19 && !prevCr && rng() < 0.3 + 0.3 * ed;
        for (let j = 0; j < 2; j++) { grid[gy - h][x] = cr ? 7 : code; ban(x, gy - h - 1); x++; }
        prevCr = cr;
      }
      skip(2);
      lay(3);
    },
    crumble() {
      // місток із плит, що обвалюються, над ямою 3–5: біжи, не зупиняйся
      lay(2);
      const c = ri(2, 4);
      let a = 0, b = 0;
      if (c === 2 || (c === 3 && rng() < 0.4)) { if (rng() < 0.5) a = 2; else b = 2; }
      skip(a);
      for (let i = 0; i < c; i++) { grid[gy][x] = 7; ban(x, gy - 2); x++; }
      skip(b);
      lay(ri(2, 3));
    },
    lift() {
      // ліфт угору на високий уступ (стрибком не дістати)
      const down = ri(10, 11);
      while (gy < down) { gy = Math.min(down, gy + 2); lay(2, false); }
      lay(ri(3, 4), false);
      const gy0 = gy, ps = skip(3);
      const ng = gy0 - (gy0 >= 11 ? ri(4, 5) : 4);
      movers.push({
        axis: 'y', x: ps * T, y: gy0 * T, y0: ng * T, y1: gy0 * T,
        w: 3 * T, h: 14, dir: 1, speed: Math.round(45 + ed * 30), dy: 0, dx: 0,
      });
      ban(ps + 1, gy0 - 2);
      gy = ng;
      lay(ri(4, 6));
    },
    mover() {
      const pw = ri(6, 8), ps = skip(pw);
      movers.push({
        axis: 'x', x0: ps * T + 4, x1: (ps + pw - 3) * T - 4, x: ps * T + 4, y: gy * T,
        w: 3 * T, h: 14, dir: 1, speed: Math.round(60 + ed * 50), dx: 0,
      });
      for (let c = ps + 1; c < ps + pw - 1; c += 2) ban(c, gy - 1);
      lay(3);
    },
    flyer() {
      const s = lay(8);
      flyerH((s + 4) * T + T / 2, (gy - 3) * T);
    },
    clouds() {
      // як і раніше, але банани внизу рідше — нагорі (ризикованіше) лишаються
      const s = lay(9);
      for (let c = s + 1; c <= s + 3; c++) { grid[gy - 3][c] = 5; if (rng() < 0.3) ban(c, gy - 4); }
      if (gy - 6 >= 2) for (let c = s + 4; c <= s + 7; c++) { grid[gy - 6][c] = 5; ban(c, gy - 7); }
    },
  };
  const CHS = hard ? Object.assign({}, chunks, hardChunks) : chunks;
  const HCH = [
    ['flat', 2.5, 15], ['gap', 3, 15], ['step', 2, 15], ['enemy', 3 + 2 * ed, 15], ['boxes', 2.4, 15],
    ['stairs', 1.5, 15], ['clouds', 1.2, 15], ['hop', 1.5, 15], ['spring', 0.8, 15],
    ['flyer', 1.5 + 1.5 * ed, 15], ['mover', 1, 15], ['spikes', 1.6 + 1.2 * ed, 15],
    ['gapfly', 0.6 + 1.2 * ed, 16], ['lift', 0.8, 17], ['crumble', 1 + ed, 19],
    ['perch', 0.8 + ed, 20], ['spikeEnemies', 0.6 + 1.2 * ed, 21],
  ];

  // вага, мінімальний рівень, чи можна зараз
  const CH = [
    ['flat', 3, 0], ['gap', 3, 0], ['step', 2, 0], ['enemy', 3, 0], ['boxes', 2, 0],
    ['stairs', 1.5, 1], ['clouds', 1.5, 2], ['hop', 1.5, 3], ['spring', 1, 4],
    ['flyer', 1.5, 5], ['mover', 1, 6],
  ];
  const can = n => {
    if ((n === 'enemy' || n === 'flyer') && x < 16) return false;
    if ((n === 'gapfly' || n === 'perch' || n === 'spikeEnemies') && x < 16) return false;
    // після ліфта не ставимо ворогів одразу на уступ
    if (hard && hist[hist.length - 1] === 'lift' && (n === 'enemy' || n === 'perch' || n === 'spikeEnemies')) return false;
    if (n === 'stairs' && gy - 1 < 7) return false;
    return true;
  };
  const pick = () => {
    const opts = [];
    let tot = 0;
    for (const [n, w0, min] of (hard ? HCH : CH)) {
      if (L < min || !can(n)) continue;
      if (hist.length >= 2 && hist[hist.length - 1] === n && hist[hist.length - 2] === n) continue;
      let w = w0;
      if (sky && (n === 'hop' || n === 'clouds')) w *= 3;
      if (n === 'enemy' && !hard) w += d * 2;
      opts.push([n, w]); tot += w;
    }
    let r = rng() * tot;
    for (const [n, w] of opts) if ((r -= w) <= 0) return n;
    return opts[opts.length - 1][0];
  };

  // ---------- збираємо трасу ----------
  const boxesAt = [];
  const estW = 12 + target + 22;
  lay(12);                                // старт: рівна земля
  while (x < 12 + target) {
    let n = pick();
    // гарантуємо скриньку в другій половині (для сердечка)
    if (hard) {
      // кожен новий рівень має свої «фішки» і досить ворогів (≈ 4 + 8·ed до кінця)
      const nw = enemies.filter(en => en.type === 'walker').length;
      if (x >= 16 && nw < (x / estW) * (4 + 8 * ed) - 2 && hist[hist.length - 1] !== 'lift' && n !== 'perch' && n !== 'spikeEnemies') n = 'enemy';
      else if (L >= 17 && x > estW * 0.4 && !hist.includes('lift')) n = 'lift';
      else if (L >= 19 && x > estW * 0.5 && !hist.includes('crumble')) n = 'crumble';
      else if (x > estW * 0.3 && !hist.includes('spikes') && !hist.includes('spikeEnemies')) n = 'spikes';
    }
    if (x > estW * 0.6 && !boxesAt.some(c => c >= estW * 0.42)) n = 'boxes';
    CHS[n]();
    hist.push(n);
  }
  const endX = x;
  lay(18);                                // фініш: рівна земля
  const W = x;
  const goal = { x: (endX + 8) * T + T / 2, y: gy * T };

  // ---------- верх кожної колонки ----------
  const topOf = c => { for (let r = 0; r < ROWS; r++) if (grid[r][c]) return r; return -1; };
  const clearAbove = (c, top, k) => { for (let r = top - k; r < top; r++) if (r < 0 || grid[r][c]) return false; return true; };
  const flatAt = c => {
    const t = topOf(c);
    if (t < 0 || grid[t][c] !== 1) return -1;
    for (const cc of [c - 1, c, c + 1]) {
      if (cc < 0 || cc >= W || topOf(cc) !== t || grid[t][cc] !== 1 || !clearAbove(cc, t, 3)) return -1;
    }
    return t;
  };
  const springCols = springs.map(s => Math.floor(s.x / T));
  const nearSpring = c => springCols.some(s => Math.abs(s - c) <= 2);

  // ---------- стрибунці не мають стрибати під низькою стелею ----------
  if (hard) {
    const sol = v => (v >= 1 && v <= 5) || v === 7;
    for (const en of enemies) {
      if (!en.hop) continue;
      const r = en.y / T, c0 = Math.floor(en.x / T);
      let a = c0, b = c0;
      const walk = c => c > 0 && c < W - 1 && sol(grid[r][c]) && !grid[r - 1][c];
      while (walk(a - 1)) a--;
      while (walk(b + 1)) b++;
      let ok = true;
      for (let c = a - 1; c <= b + 1 && ok; c++) for (let rr = Math.max(0, r - 4); rr < r - 1; rr++) if (sol(grid[rr][c])) ok = false;
      if (!ok) { delete en.hop; delete en.hopT; }
    }
  }

  // ---------- контрольні точки ----------
  const cpCols = [];
  for (const p of (L === 0 ? [0.5] : hard ? [0.25, 0.5, 0.75] : [0.35, 0.68])) {
    for (let c = Math.floor(W * p); c < endX + 4; c++) {
      if (nearSpring(c) || cpCols.some(k => Math.abs(k - c) < 6)) continue;
      const t = flatAt(c);
      if (t < 0) continue;
      checkpoints.push({ x: c * T + T / 2, y: t * T, active: false });
      cpCols.push(c);
      break;
    }
  }

  // ---------- сердечка ----------
  const keys = [...boxes.keys()];
  let hk = keys.find(k => +k.split(',')[0] >= W * 0.4);
  if (!hk && keys.length) hk = keys[keys.length - 1];
  if (hk) boxes.set(hk, 'heart');
  if (cpCols.length) {
    for (let c = cpCols[cpCols.length - 1] + 3; c < W - 2; c++) {
      const t = topOf(c);
      if (t < 3 || grid[t][c] !== 1 || !clearAbove(c, t, 3)) continue;
      hearts.push({ x: c * T + T / 2, y: (t - 2) * T + T / 2, got: false });
      break;
    }
  }

  // ---------- прикраси ----------
  const busy = new Set([5, endX + 8, endX + 7, endX + 9, ...cpCols, ...cpCols.map(c => c + 1), ...cpCols.map(c => c - 1)]);
  for (let c = 1; c < W - 1; c++) {
    if (!deco[c] || busy.has(c) || nearSpring(c)) continue;
    const t = flatAt(c);
    if (t < 0 || rng() >= 0.22) continue;
    decor.push({
      x: c * T + T / 2 + (rng() - 0.5) * 10, y: t * T,
      kind: th.decor[Math.floor(rng() * th.decor.length)], s: 0.8 + rng() * 0.5,
    });
    c += 2;
  }

  // ---------- обрізаємо сітку до W ----------
  const out = grid.map(row => row.slice(0, W));
  let totalBananas = bananas.length;
  for (const v of boxes.values()) if (v === 'banana') totalBananas++;

  return {
    L, W, H: ROWS, grid: out,
    start: { x: 5 * T + T / 2, y: 11 * T },
    bananas, enemies, springs, movers, checkpoints, decor, boxes, hearts, goal, totalBananas,
  };
}

// ======================================================================
// Рівні 41–80 (L 40..79). Складність e = 0..1. Генератор дивиться ЛИШЕ на прапорці теми
// (gravity, jumpBoost, swim, ice, conveyor, bounce, skyLevel), а не на номер світу.
// Нові клітинки: 8 ворота білочки, 9/10 конвеєр вліво/вправо, 11 желе-батут.
// ======================================================================
function generateLevel80(L) {
  const th = THEMES[L] || THEMES[L % 15];
  const rng = mulberry32(12345 + L * 977);
  const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const e = Math.min(1, (L - 40) / 39);
  const g = th.gravity || 1, jb = th.jumpBoost || 1;
  const swim = !!th.swim, ice = !!th.ice, conv = !!th.conveyor, bnc = !!th.bounce, sky = !!th.skyLevel;
  const space = !swim && g < 0.8;
  // фізика стрибка (як у game.js): час польоту, найширша «чесна» яма, висота стрибка й батута
  const air = 0.7 * jb / Math.sqrt(g);
  const physGap = Math.floor((0.72 * air * 215 + 22) / T);
  const apex = 122.5 * jb * jb / T;                       // клітинок
  const upMax = Math.max(2, Math.floor(apex - 1.3));      // сходинка, на яку легко застрибнути
  const bounceUp = 240 * jb * jb / T;                     // злет із желе, клітинок
  const gapCap = ice ? 3 : swim ? 6 + Math.round(2 * e) : space ? Math.min(7, physGap, 5 + Math.round(2 * e)) : Math.min(4, physGap);
  const target = Math.round(230 + 80 * e);
  const MAXW = 12 + target + 160;

  const grid = [];
  for (let r = 0; r < ROWS; r++) grid.push(new Uint8Array(MAXW));
  const deco = new Uint8Array(MAXW);
  const bananas = [], enemies = [], springs = [], movers = [], checkpoints = [], decor = [], hearts = [], gates = [];
  const boxes = new Map();
  const spans = [], shootCols = [], boxesAt = [], hist = [];
  let x = 0, gy = 11;

  // ---------- помічники ----------
  const col = (c, top) => { for (let r = top; r < ROWS; r++) grid[r][c] = 1; };
  const lay = (n, ok = true) => {
    const s = x;
    for (let i = 0; i < n; i++) { col(x, gy); if (ok) deco[x] = 1; x++; }
    return s;
  };
  const skip = n => { const s = x; x += n; return s; };
  const ban = (tx, ty) => { if (ty >= 1) bananas.push({ x: tx * T + T / 2, y: ty * T + T / 2, got: false }); };
  const walker = (tx, ty = gy, canHop = true) => {
    const o = {
      type: 'walker', x: tx * T + T / 2, y: ty * T, vx: -(100 + 10 * e), vy: 0,
      w: 26, h: 24, dead: 0, style: th.enemy, seed: rng() * 10,
    };
    const r = rng();
    if (canHop && r < 0.3 + 0.3 * e) { o.hop = true; o.hopT = 1 + rng(); }
    else if (L >= 44 && r > 0.75 - 0.3 * e) { o.charge = true; o.vx = -Math.round(70 + 20 * e); }   // «бігун»
    enemies.push(o);
  };
  const flyer = (fx, fy) => enemies.push({
    type: 'flyer', x: fx, y: fy, baseX: fx, baseY: fy, t: rng() * 6,
    w: 26, h: 22, dead: 0, style: th.flyer, seed: rng() * 10, range: 2 * T, face: 1,
    spd: Math.round((1.25 + 0.35 * e) * 100) / 100,
  });
  const shooter = (tx, ty) => {
    enemies.push({
      type: 'shooter', x: tx * T + T / 2, y: ty * T, w: 28, h: 30, dead: 0, style: th.shooter,
      seed: rng() * 10, dir: -1, rate: Math.round((4 - 1.1 * e - 0.3 * rng()) * 100) / 100, t: Math.round(rng() * 200) / 100,
    });
    shootCols.push(tx);
  };
  const spikeRun = n => {
    const s = lay(n, false);
    for (let c = s; c < s + n; c++) grid[gy - 1][c] = 6;
    return s;
  };
  const gapW = (cap = gapCap) => {
    if (swim) return ri(3, cap);
    const r = rng();
    let w = cap;
    if (r < 0.2) w -= 2; else if (r < 0.55 - 0.15 * e) w -= 1;
    return Math.max(2, w);
  };
  // висота приземлення після ями (на найширшій ямі — не вгору)
  const landDh = (w = 0) => {
    if (rng() >= 0.45) return 0;
    const opts = [-1, 1, 2].filter(v => gy + v >= 7 && gy + v <= 11 && !(v < 0 && !swim && w >= physGap));
    return opts.length ? opts[Math.floor(rng() * opts.length)] : 0;
  };
  const sep = () => { const o = [-1, 1].filter(v => gy + v >= 7 && gy + v <= 11); gy += o[Math.floor(rng() * o.length)]; };
  const toLow = lo => { while (gy < lo) { gy = Math.min(lo, gy + 2); lay(2, false); } };
  const bouncy = (c, r) => { grid[r][c] = 11; grid[r][c + 1] = 11; };
  // скільки клітинок пролетить гравець на повній швидкості: від висоти h над рівнем до апексу і вниз на h + drop
  const flyTiles = (h, drop) => 215 * (Math.sqrt(2 * h * T / (2000 * g)) + Math.sqrt(2 * (h + drop) * T / (2000 * g))) / T;

  // ---------- шматки траси ----------
  const C = {
    flat() {
      const n = ri(4, 7), s = lay(n);
      if (rng() < 0.25) for (let c = s + 1; c < s + n - 1; c++) ban(c, gy - 2);
    },
    gap() {
      const w = gapW(), gy0 = gy, gs = skip(w);
      for (let i = 0; i < w; i++) ban(gs + i, gy0 - (w >= 5 ? 5 : 4));
      gy += landDh(w);
      lay(ri(2, 3) + (ice ? 1 : 0));
    },
    gapfly() {
      lay(2);
      const w = gapW(Math.max(3, gapCap - 1)), gy0 = gy, gs = skip(w);
      flyer((gs + w / 2) * T, (gy0 - 4) * T - 16);
      ban(gs + Math.floor(w / 2), gy0 - 3);
      gy += landDh(w);
      lay(3 + (ice ? 1 : 0));
    },
    step() {
      const opts = [-2, -1, 1, 2].filter(v => gy + v >= 7 && gy + v <= 11);
      gy += opts[Math.floor(rng() * opts.length)];
      const s = lay(ri(2, 4));
      if (rng() < 0.25) ban(s + 1, gy - 2);
    },
    spikes() {
      lay(ri(2, 3) + (ice ? 1 : 0));
      const k = ri(1, ice ? 2 : 3), s = spikeRun(k);
      if (rng() < 0.6) for (let c = s; c < s + k; c++) ban(c, gy - 4);
      lay(2 + (ice ? 1 : 0));
      if (!ice && rng() < 0.4 + 0.2 * e) { spikeRun(ri(1, e > 0.5 ? 3 : 2)); lay(2); }
      lay(ri(0, 1));
    },
    enemy() {
      const n = ri(8, 12), s = lay(n);
      let k = 1 + (rng() < 0.45 + 0.35 * e ? 1 : 0);
      if (n >= 11 && rng() < 0.3 + 0.4 * e) k = 3;
      if (k === 1) walker(s + Math.floor(n / 2));
      else for (let i = 0; i < k; i++) walker(s + 2 + Math.round(i * (n - 5) / (k - 1)));
      if (rng() < 0.35) ban(s + Math.floor(n / 2), gy - 3);
      if (n >= 10 && rng() < 0.3 + 0.3 * e) flyer((s + n / 2) * T, (gy - 4) * T);
    },
    spikeEnemies() {
      const n1 = ri(4, 5), s1 = lay(n1);
      walker(s1 + 1);
      const k = ri(1, ice ? 1 : 2), sk = spikeRun(k);
      for (let c = sk; c < sk + k; c++) ban(c, gy - 4);
      const n2 = ri(4, 5), s2 = lay(n2);
      walker(s2 + n2 - 2);
    },
    boxes() {
      const s = lay(8), bw = ri(3, 4), b0 = s + 2, row = gy - 3;
      const nb = Math.min(bw, ri(2, 3));
      const pos = new Set();
      while (pos.size < nb) pos.add(ri(0, bw - 1));
      for (let i = 0; i < bw; i++) {
        const c = b0 + i;
        if (pos.has(i)) { grid[row][c] = 3; boxes.set(`${c},${row}`, 'banana'); }
        else { grid[row][c] = 2; if (rng() < 0.5) ban(c, row - 1); }
      }
      boxesAt.push(s);
    },
    perch() {
      const n = ri(9, 10), s = lay(n), pw = ri(3, 4), p0 = s + 3, row = gy - 3;
      for (let i = 0; i < pw; i++) grid[row][p0 + i] = 2;
      if (rng() < 0.5) { const bc = p0 + ri(0, pw - 1); grid[row][bc] = 3; boxes.set(`${bc},${row}`, 'banana'); }
      walker(p0 + Math.floor(pw / 2), row, false);
      ban(p0, row - 2); ban(p0 + pw - 1, row - 2);
    },
    stairs() {
      const n = Math.min(ri(2, 3), gy - 7), sw = ri(1, 2);
      for (let i = 0; i < n; i++) { gy--; lay(sw, false); }
      if (rng() < 0.5) {
        lay(2, false);
        const ps = skip(2);
        ban(ps, gy - 3); ban(ps + 1, gy - 3);
        lay(3, false);
      } else {
        const p = ri(3, 5), s = lay(p, false);
        for (let c = s; c < s + p; c++) if (rng() < 0.5) ban(c, gy - 2);
      }
      for (let i = 0; i < n; i++) { gy++; lay(sw, false); }
      lay(2);
      if (!ice && rng() < 0.6) { spikeRun(ri(1, 2)); lay(2); }
    },
    hop() {
      const k = ri(3, 4), code = sky ? 5 : 2;
      let h = 0, prevCr = true;
      for (let i = 0; i < k; i++) {
        skip(2);
        h = Math.max(0, Math.min(2, h + ri(i === 0 ? 0 : -1, 1)));
        const cr = !prevCr && rng() < 0.3 + 0.3 * e;
        for (let j = 0; j < 2; j++) { grid[gy - h][x] = cr ? 7 : code; ban(x, gy - h - 1); x++; }
        prevCr = cr;
      }
      skip(2);
      lay(3);
    },
    crumble() {
      lay(2);
      const c = ri(2, 4);
      let a = 0, b = 0;
      if (c === 2 || (c === 3 && rng() < 0.4)) { if (rng() < 0.5) a = 2; else b = 2; }
      skip(a);
      for (let i = 0; i < c; i++) { grid[gy][x] = 7; ban(x, gy - 2); x++; }
      skip(b);
      lay(ri(2, 3) + (ice ? 1 : 0));
    },
    lift() {
      toLow(ri(10, 11));
      lay(ri(3, 4), false);
      const gy0 = gy, ps = skip(3);
      const ng = gy0 - (gy0 >= 11 ? ri(4, 5) : 4);
      movers.push({
        axis: 'y', x: ps * T, y: gy0 * T, y0: ng * T, y1: gy0 * T,
        w: 3 * T, h: 14, dir: 1, speed: Math.round(55 + e * 25), dy: 0, dx: 0,
      });
      ban(ps + 1, gy0 - 2);
      gy = ng;
      lay(ri(4, 6));
    },
    mover() {
      // у космосі — довга подорож на платформі над порожнечею
      lay(space ? 2 : 0);
      const pw = space ? ri(8, 11) : ri(6, 8), ps = skip(pw);
      movers.push({
        axis: 'x', x0: ps * T + 4, x1: (ps + pw - 3) * T - 4, x: ps * T + 4, y: gy * T,
        w: 3 * T, h: 14, dir: 1, speed: Math.round(70 + e * 40), dx: 0,
      });
      for (let c = ps + 1; c < ps + pw - 1; c += 2) ban(c, gy - 1);
      lay(3);
    },
    flyer() {
      const s = lay(8);
      flyer((s + 4) * T + T / 2, (gy - 3) * T);
      if (swim && e > 0.4 && gy >= 9 && rng() < 0.5) flyer((s + 4) * T, (gy - 6) * T);   // друга рибка вище
    },
    clouds() {
      const s = lay(9);
      for (let c = s + 1; c <= s + 3; c++) { grid[gy - 3][c] = 5; if (rng() < 0.3) ban(c, gy - 4); }
      if (gy - 6 >= 2) for (let c = s + 4; c <= s + 7; c++) { grid[gy - 6][c] = 5; ban(c, gy - 7); }
    },
    spring() {
      lay(2, false);
      const sc = lay(1, false);
      springs.push({ x: sc * T + T / 2, y: gy * T, comp: 0 });
      const w0 = x;
      for (let i = 0; i < 2; i++) { col(x, gy); for (let r = gy - 5; r < gy; r++) grid[r][x] = 2; x++; }
      ban(sc, gy - 3); ban(sc, gy - 5);
      ban(w0, gy - 6); ban(w0 + 1, gy - 6);
      ban(w0 + 2, gy - 4);
      lay(1, false);
      lay(2);
    },

    // ----- нове: стрілець (стоїть, плюється кульками; ≥6 рівних клітинок перед ним) -----
    shooter() {
      lay(2);
      if (rng() < 0.5) {               // «щит»: блоки, на які можна вилізти / за якими сховатись
        const s = lay(2, false);
        grid[gy - 1][s] = 2; grid[gy - 1][s + 1] = 2;
        lay(1);
      }
      const a = ri(6, 8);
      lay(a);
      if (gy >= 9 && rng() < 0.25 + 0.25 * e) {
        // стрілець на поличці: кульки летять над головою, зачепити можна лише у стрибку
        const p = lay(3, false), row = gy - 3;
        for (let i = 0; i < 3; i++) grid[row][p + i] = 2;
        shooter(p + 1, row);
        ban(p + 1, gy - 1);
      } else {
        const sc = lay(1, false);
        shooter(sc, gy);
        ban(sc, gy - 3);
      }
      lay(4, false);
    },
    // ----- нове: ворота білочки (тунель під землею; рівна земля, нічого небезпечного) -----
    gate() {
      sep();
      const eo = ri(2, 4), xo = ri(2, 3), bo = ri(1, 2);
      const s = lay(eo + xo + bo + 5, false);
      const ec = s + 2, tx = ec + eo, xc = tx + xo, bc = xc + bo;
      for (let r = 0; r < gy; r++) grid[r][tx] = 8;
      const inner = [];
      for (let c = ec + 1; c < xc; c++) inner.push(c);
      const nb = ri(0, 3), gb = [];
      for (let i = 0; i < nb && inner.length; i++) gb.push(inner.splice(ri(0, inner.length - 1), 1)[0]);
      gb.sort((p, q) => p - q);
      gates.push({
        tx, gy, ex: ec * T + T / 2, xx: xc * T + T / 2, bx: bc * T + T / 2,
        bananas: gb.map(c => ({ x: c * T + T / 2, y: (gy + 1) * T + 12, got: false })), open: 0,
      });
      spans.push([s, x - 1]);
      sep();
      lay(2);
    },
    // ----- нове: желе-батут перед високою стіною -----
    bouncyWall() {
      if (gy < 9) toLow(9);
      lay(2);
      const kMax = Math.max(3, Math.min(gy - 3, Math.floor(bounceUp - 2) + 1));
      const k = Math.max(Math.min(kMax, upMax + 2), kMax - (rng() < 0.3 ? 1 : 0));
      const bc = lay(2, false);
      bouncy(bc, gy - 1);
      // хто тримає «вправо», пролітає над стіною: верх стіни — такий, щоб на нього приземлитись,
      // а за стіною — довга безпечна смуга (на випадок перельоту)
      const hx = Math.max(0.5, bounceUp - (k - 1));                       // клітинок над верхом стіни
      const dTop = flyTiles(hx, 0), dGround = flyTiles(hx, k);
      const ww = Math.min(9, Math.max(ri(2, 3), Math.ceil(dTop) + 1)), w0 = x;
      for (let i = 0; i < ww; i++) { col(x, gy); for (let r = gy - k; r < gy; r++) grid[r][x] = 2; ban(x, gy - k - 1); x++; }
      for (let r = gy - 3; r > gy - k - 1; r -= 2) ban(bc + 1, r);
      ban(w0 + ww, gy - k + 1);
      lay(1, false);
      lay(Math.max(2, Math.ceil(dGround) + 2 - ww));
    },
    // ----- нове: желе під високим бонус-островом (хмаринка, крізь яку пролітаєш знизу) -----
    bouncyHigh() {
      lay(3);
      const bc = lay(2, false);
      bouncy(bc, gy - 1);
      const hr = Math.max(2, gy - Math.min(7, Math.floor(bounceUp - 1.5)));
      lay(Math.max(5, Math.ceil(flyTiles(bounceUp, 1)) + 2));            // переліт на повній швидкості — на рівне
      for (let c = bc - 1; c <= bc + 3; c++) { grid[hr][c] = 5; ban(c, hr - 1); }
      if (hr - 2 >= 1) ban(bc + 1, hr - 2);
    },
    // ----- нове: конвеєри -----
    conveyor() {
      lay(2);
      const k = ri(1, 2);
      for (let j = 0; j < k; j++) {
        const n = ri(4, 8), d = rng() < 0.5 ? 9 : 10, s = lay(n, false);
        for (let c = s; c < s + n; c++) { grid[gy][c] = d; if (rng() < 0.4) ban(c, gy - 2); }
        lay(2, false);
      }
      lay(1);
    },
    convGap() {
      // стрічка тягне назад, а попереду яма: розженись і стрибай
      lay(2);
      const n = ri(4, 6), s = lay(n, false);
      for (let c = s; c < s + n; c++) grid[gy][c] = 9;
      const w = Math.min(3, gapW()), gy0 = gy, gs = skip(w);
      for (let i = 0; i < w; i++) ban(gs + i, gy0 - 4);
      gy += landDh(w);
      lay(3);
    },
    convBridge() {
      lay(2);
      const n = ri(4, 7), d = rng() < 0.5 ? 9 : 10, s = skip(n);
      for (let c = s; c < s + n; c++) { grid[gy][c] = d; if (rng() < 0.5) ban(c, gy - 2); }
      lay(ri(2, 3));
    },
    // ----- нове (космос): «астероїди» — камінці над порожнечею на різній висоті -----
    asteroids() {
      lay(2);
      const k = ri(3, 4 + Math.round(e));
      let h = 0, prevCr = true;
      for (let i = 0; i < k; i++) {
        const nh = Math.max(0, Math.min(Math.min(3, upMax - 1, gy - 3), h + ri(-1, 2)));
        const rise = Math.max(0, nh - h);
        skip(ri(2, Math.max(2, Math.min(physGap - 1 - rise, 3 + Math.round(2 * e), gapCap))));
        const cr = !prevCr && rng() < 0.3 + 0.3 * e;
        const sw = cr ? 2 : ri(2, 3), code = cr ? 7 : (sky || rng() < 0.4 ? 5 : 2);
        for (let j = 0; j < sw; j++) { grid[gy - nh][x] = code; ban(x, gy - nh - 1); x++; }
        h = nh; prevCr = cr;
      }
      skip(ri(2, Math.max(2, Math.min(physGap - 1, 4, gapCap))));
      lay(3);
    },
    // ----- нове (космос): високі хмаринки-платформи -----
    skyHigh() {
      const st = Math.min(3, upMax - 1);
      if (rng() < 0.5) {
        const n = ri(12, 14), s = lay(n);
        let r = gy - 3, c = s + 1;
        while (c + 2 <= s + n - 2 && r >= 2) {
          for (let j = 0; j < 3; j++) { grid[r][c + j] = 5; ban(c + j, r - 1); }
          c += 4; r -= st;
        }
        if (rng() < 0.6) walker(s + n - 2);
      } else {
        lay(2);
        const gy0 = gy, hs = [gy0 - 2, gy0 - 2 - st, gy0 - 1 - st].map(r => Math.max(2, r));
        for (const r of hs) {
          skip(ri(2, 3));
          for (let j = 0; j < 3; j++) { grid[r][x] = 5; ban(x, r - 1); x++; }
        }
        skip(ri(2, 3));
        lay(3);
      }
    },
    // ----- нове (вода): висока скеля — треба пропливти вгору -----
    tallWall() {
      toLow(10);
      lay(2);
      const kMax = Math.min(5 + Math.round(3 * e), gy - 3);
      const k = ri(Math.min(kMax, 5), kMax);
      const ww = ri(2, 4), w0 = x;
      for (let i = 0; i < ww; i++) { col(x, gy - k); ban(x, gy - k - 1); x++; }
      for (let r = gy - 2; r > gy - k; r -= 2) ban(w0 - 1, r);
      lay(1, false);
      lay(2);
    },
    // ----- нове (вода): шипи на дні, а вгорі — уступ із бананами -----
    highLedge() {
      lay(2);
      const s = x;
      lay(2 + (ice ? 1 : 0));
      spikeRun(ri(1, ice ? 2 : 3));
      lay(2 + (ice ? 1 : 0));
      if (rng() < 0.5 + 0.3 * e) { spikeRun(ri(1, ice ? 2 : 3)); lay(2 + (ice ? 1 : 0)); }
      const end = x;
      lay(1);
      const hr = Math.max(2, gy - ri(5, 6));
      for (let c = s + 1; c < end - 1; c++) { grid[hr][c] = 5; if ((c - s) % 2) ban(c, hr - 1); }
      if (hr - 3 >= 2 && rng() < 0.5 * e) flyer(((s + end) / 2) * T, (hr - 2) * T);
    },
  };

  // ---------- ваги шматків ----------
  const WT = {
    flat: 2.2, gap: space ? 3.5 : swim ? 3.2 : 3, gapfly: (0.6 + 1.2 * e) * (swim ? 1.8 : 1),
    step: space ? 1.2 : 2, spikes: (1.6 + 1.2 * e) * (ice ? 0.4 : swim ? 1.3 : 1), enemy: 3 + 2 * e,
    spikeEnemies: (0.6 + 1.2 * e) * (ice ? 0.4 : 1), boxes: 2.2, perch: 0.8 + e, stairs: space ? 0.5 : 1.3,
    hop: space ? 1 : 1.5, crumble: 1 + e, lift: space ? 1.2 : 0.8, mover: space ? 2.2 : 1,
    flyer: (1.5 + 1.5 * e) * (swim ? 1.6 : 1), clouds: space ? 1.8 : 1.1, spring: space ? 0.2 : swim ? 0.3 : 0.7,
    bouncyWall: bnc ? 2 : space ? 0.3 : swim ? 0.9 : 0.5, bouncyHigh: bnc ? 1.4 : space ? 0.3 : swim ? 0.8 : 0.4,
    conveyor: conv ? 2.5 : 0, convGap: conv ? 1.4 : 0, convBridge: conv ? 1.2 : 0,
    asteroids: space ? 2.6 : 0, skyHigh: space ? 1.8 : 0, tallWall: swim ? 2 : 0, highLedge: swim ? 1.6 : 0,
  };
  const NOPICK = new Set(['gate', 'shooter']);
  const ENEMYCH = new Set(['enemy', 'flyer', 'gapfly', 'perch', 'spikeEnemies']);
  const can = n => {
    const last = hist[hist.length - 1];
    if (ENEMYCH.has(n) && x < 16) return false;
    if (last === 'lift' && (n === 'enemy' || n === 'perch' || n === 'spikeEnemies')) return false;
    if (n === 'stairs' && gy - 1 < 7) return false;
    return true;
  };
  const pick = () => {
    const opts = [];
    let tot = 0;
    for (const n in WT) {
      let w = WT[n];
      if (!w || NOPICK.has(n) || !can(n)) continue;
      if (hist.length >= 2 && hist[hist.length - 1] === n && hist[hist.length - 2] === n) continue;
      if (sky && (n === 'hop' || n === 'clouds')) w *= 3;
      opts.push([n, w]); tot += w;
    }
    let r = rng() * tot;
    for (const [n, w] of opts) if ((r -= w) <= 0) return n;
    return opts[opts.length - 1][0];
  };
  // обов'язкові «фішки» світу: [шматок, з якої частки траси]
  const musts = [['spikes', 0.3], ['crumble', 0.5]];
  if (!swim) musts.push(['lift', 0.42]);
  if (space) musts.push(['asteroids', 0.15], ['skyHigh', 0.38], ['mover', 0.66]);
  if (swim) musts.push(['tallWall', 0.12], ['highLedge', 0.45], ['gapfly', 0.66]);
  if (conv) musts.push(['conveyor', 0.1], ['convGap', 0.36], ['convBridge', 0.62]);
  if (bnc) musts.push(['bouncyWall', 0.2], ['bouncyHigh', 0.56]);
  if (!space && !swim && !conv && !bnc) musts.push(['bouncyWall', 0.58]);

  // ---------- збираємо трасу ----------
  const estW = 12 + target + 22;
  const nG = L < 50 ? ri(1, 2) : ri(2, 3);
  const gAt = (nG === 1 ? [0.33] : nG === 2 ? [0.3, 0.62] : [0.28, 0.54, 0.8]).map(f => f * estW);
  if (L === 40) gAt[0] = 18;                               // перша зустріч із воротами — одразу
  const nS = L < 41 ? 0 : Math.min(4, Math.round(1 + 2.6 * e + 0.8 * rng()));
  const sAt = [];
  for (let i = 0; i < nS; i++) sAt.push(estW * (0.14 + 0.78 * (i + 0.5) / nS));
  let lastGateEnd = -99;
  lay(12);
  while (x < 12 + target) {
    let n;
    const nw = enemies.filter(en => en.type === 'walker').length;
    const last = hist[hist.length - 1];
    // стрільці повертаються до гравця — ворота ставимо не ближче ніж за 14 клітинок після стрільця
    const lastShot = shootCols.length ? shootCols[shootCols.length - 1] : -99;
    if (gAt.length && x >= gAt[0] && x - lastShot >= 14) { n = 'gate'; gAt.shift(); }
    else if (sAt.length && x >= sAt[0] && x - lastGateEnd >= 14) { n = 'shooter'; sAt.shift(); }
    else if (x >= 16 && nw < (x / estW) * (4 + 8 * e) - 2 && last !== 'lift') n = 'enemy';
    else if (x > estW * 0.6 && !boxesAt.some(c => c >= estW * 0.42)) n = 'boxes';
    else {
      const m = musts.find(([mn, f]) => x > estW * f && !hist.includes(mn) && can(mn));
      n = m ? m[0] : pick();
    }
    C[n]();
    if (n === 'gate') lastGateEnd = spans[spans.length - 1][1];
    hist.push(n);
  }
  const endX = x;
  lay(18);
  const W = x;
  const goal = { x: (endX + 8) * T + T / 2, y: gy * T };

  // ---------- верх кожної колонки ----------
  const topOf = c => { for (let r = 0; r < ROWS; r++) if (grid[r][c]) return r; return -1; };
  const clearAbove = (c, top, k) => { for (let r = top - k; r < top; r++) if (r < 0 || grid[r][c]) return false; return true; };
  const flatAt = c => {
    const t = topOf(c);
    if (t < 0 || grid[t][c] !== 1) return -1;
    for (const cc of [c - 1, c, c + 1]) {
      if (cc < 0 || cc >= W || topOf(cc) !== t || grid[t][cc] !== 1 || !clearAbove(cc, t, 3)) return -1;
    }
    return t;
  };
  const springCols = springs.map(s => Math.floor(s.x / T));
  const nearSpring = c => springCols.some(s => Math.abs(s - c) <= 2);
  const inSpan = (c, m = 0) => spans.some(([a, b]) => c >= a - m && c <= b + m);
  const inFire = c => shootCols.some(s => c >= s - 9 && c <= s + 8);   // не відроджувати під обстрілом

  // ---------- стрибунці не мають стрибати під низькою стелею ----------
  {
    const sol = v => (v >= 1 && v <= 5) || (v >= 7 && v <= 11);
    for (const en of enemies) {
      if (!en.hop) continue;
      const r = en.y / T, c0 = Math.floor(en.x / T);
      let a = c0, b = c0;
      const walk = c => c > 0 && c < W - 1 && sol(grid[r][c]) && !grid[r - 1][c];
      while (walk(a - 1)) a--;
      while (walk(b + 1)) b++;
      let ok = true;
      for (let c = a - 1; c <= b + 1 && ok; c++) for (let rr = Math.max(0, r - 4); rr < r - 1; rr++) if (sol(grid[rr][c])) ok = false;
      if (!ok) { delete en.hop; delete en.hopT; }
    }
  }

  // ---------- контрольні точки ----------
  const cpCols = [];
  for (const p of [0.25, 0.5, 0.75]) {
    // спершу трохи вперед, потім трохи назад, а вже тоді — далі вперед
    const c0 = Math.floor(W * p), near = Math.round(W * 0.05), order = [];
    for (let c = c0; c <= c0 + near; c++) order.push(c);
    for (let c = c0 - 1; c >= c0 - near; c--) order.push(c);
    for (let c = c0 + near + 1; c < endX + 4; c++) order.push(c);
    for (const c of order) {
      if (nearSpring(c) || inSpan(c, 1) || inFire(c) || cpCols.some(k => Math.abs(k - c) < 6)) continue;
      const t = flatAt(c);
      if (t < 0) continue;
      checkpoints.push({ x: c * T + T / 2, y: t * T, active: false });
      cpCols.push(c);
      break;
    }
  }

  // ---------- сердечка ----------
  const keys = [...boxes.keys()];
  let hk = keys.find(k => +k.split(',')[0] >= W * 0.4);
  if (!hk && keys.length) hk = keys[keys.length - 1];
  if (hk) boxes.set(hk, 'heart');
  if (cpCols.length) {
    for (let c = cpCols[cpCols.length - 1] + 3; c < W - 2; c++) {
      const t = topOf(c);
      if (t < 3 || grid[t][c] !== 1 || !clearAbove(c, t, 3) || inSpan(c, 1)) continue;
      hearts.push({ x: c * T + T / 2, y: (t - 2) * T + T / 2, got: false });
      break;
    }
  }

  // ---------- прикраси ----------
  const busy = new Set([5, endX + 8, endX + 7, endX + 9, ...cpCols, ...cpCols.map(c => c + 1), ...cpCols.map(c => c - 1)]);
  for (let c = 1; c < W - 1; c++) {
    if (!deco[c] || busy.has(c) || nearSpring(c) || inSpan(c, 1)) continue;
    const t = flatAt(c);
    if (t < 0 || rng() >= 0.22) continue;
    decor.push({
      x: c * T + T / 2 + (rng() - 0.5) * 10, y: t * T,
      kind: th.decor[Math.floor(rng() * th.decor.length)], s: 0.8 + rng() * 0.5,
    });
    c += 2;
  }

  // ---------- обрізаємо сітку до W ----------
  const out = grid.map(row => row.slice(0, W));
  let totalBananas = bananas.length;
  for (const v of boxes.values()) if (v === 'banana') totalBananas++;
  for (const gt of gates) totalBananas += gt.bananas.length;

  return {
    L, W, H: ROWS, grid: out,
    start: { x: 5 * T + T / 2, y: 11 * T },
    bananas, enemies, springs, movers, checkpoints, decor, boxes, hearts, goal, totalBananas, gates,
  };
}
