'use strict';
// Генератор рівнів: з випадкових «шматків» складаємо трасу. Детерміновано для кожного рівня.
// Коди клітинок: 0 порожньо, 1 земля, 2 блок, 3 бонус-скринька, 4 порожня скринька, 5 хмаринка (стрибок крізь знизу).

function generateLevel(L) {
  const th = THEMES[L];
  const rng = mulberry32(12345 + L * 977);
  const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const d = L / 14;                       // складність 0..1
  const g = th.gravity || 1;
  const low = g < 0.8;                    // мала гравітація — ширші ями
  const sky = !!th.skyLevel;
  const target = 105 + L * 9;             // довжина траси з шматків
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

  // вага, мінімальний рівень, чи можна зараз
  const CH = [
    ['flat', 3, 0], ['gap', 3, 0], ['step', 2, 0], ['enemy', 3, 0], ['boxes', 2, 0],
    ['stairs', 1.5, 1], ['clouds', 1.5, 2], ['hop', 1.5, 3], ['spring', 1, 4],
    ['flyer', 1.5, 5], ['mover', 1, 6],
  ];
  const can = n => {
    if ((n === 'enemy' || n === 'flyer') && x < 16) return false;
    if (n === 'stairs' && gy - 1 < 7) return false;
    return true;
  };
  const pick = () => {
    const opts = [];
    let tot = 0;
    for (const [n, w0, min] of CH) {
      if (L < min || !can(n)) continue;
      if (hist.length >= 2 && hist[hist.length - 1] === n && hist[hist.length - 2] === n) continue;
      let w = w0;
      if (sky && (n === 'hop' || n === 'clouds')) w *= 3;
      if (n === 'enemy') w += d * 2;
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
    if (x > estW * 0.6 && !boxesAt.some(c => c >= estW * 0.42)) n = 'boxes';
    chunks[n]();
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

  // ---------- контрольні точки ----------
  const cpCols = [];
  for (const p of (L === 0 ? [0.5] : [0.35, 0.68])) {
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
