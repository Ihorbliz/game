'use strict';
// 15 світів: кожен має своє небо, далекий і ближній фон, землю, ворогів, декорації та музику.

function bandY(w, base, waves, x) {
  let y = base;
  for (const [k, a, p] of waves) y += Math.sin((x / w) * Math.PI * 2 * k + p) * a;
  return y;
}
function band(c, w, h, base, waves, col) {
  c.beginPath();
  c.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, base, waves, x));
  c.lineTo(w, h);
  c.closePath();
  c.fillStyle = col;
  c.fill();
}
// малює об'єкт, а біля країв — ще раз, щоб шар безшовно повторювався
function wrap(w, x, m, fn) {
  fn(x);
  if (x < m) fn(x + w);
  if (x > w - m) fn(x - w);
}
function spread(w, n, rng, jitter = 0.8) {
  const out = [];
  for (let i = 0; i < n; i++) out.push((i + rng() * jitter) * w / n);
  return out;
}
function onBand(c, w, base, waves, n, rng, m, fn) {
  for (const x of spread(w, n, rng)) {
    const r = rng();
    wrap(w, x, m, X => fn(X, bandY(w, base, waves, X), r));
  }
}

function cloudShape(c, x, y, s, col) {
  c.fillStyle = col;
  circ(c, x, y, 14 * s);
  circ(c, x + 16 * s, y - 7 * s, 18 * s);
  circ(c, x + 34 * s, y, 14 * s);
  ell(c, x + 17 * s, y + 5 * s, 32 * s, 10 * s);
}
function clouds(c, w, n, rng, y0, y1, col, s0 = 0.7, s1 = 1.4) {
  for (const x of spread(w, n, rng)) {
    const y = y0 + rng() * (y1 - y0), s = s0 + rng() * (s1 - s0);
    wrap(w, x, 90 * s, X => cloudShape(c, X, y, s, col));
  }
}
function pineTree(c, x, y, s, col, snow) {
  c.fillStyle = '#5b3a1e';
  c.fillRect(x - s * 0.05, y - s * 0.2, s * 0.1, s * 0.2);
  for (let i = 0; i < 3; i++) {
    const by = y - s * 0.12 - i * s * 0.25, hw = s * (0.3 - i * 0.07);
    c.fillStyle = col;
    tri(c, x - hw, by, x, by - s * 0.42, x + hw, by);
    if (snow) {
      c.fillStyle = snow;
      tri(c, x - hw * 0.45, by - s * 0.42 * 0.55, x, by - s * 0.42, x + hw * 0.45, by - s * 0.42 * 0.55);
    }
  }
}
function roundTree(c, x, y, s, trunk, leaf, leaf2) {
  c.fillStyle = trunk;
  c.fillRect(x - s * 0.06, y - s * 0.5, s * 0.12, s * 0.5);
  c.fillStyle = leaf;
  circ(c, x, y - s * 0.65, s * 0.3);
  circ(c, x - s * 0.22, y - s * 0.5, s * 0.22);
  circ(c, x + s * 0.22, y - s * 0.52, s * 0.22);
  c.fillStyle = leaf2;
  circ(c, x - s * 0.08, y - s * 0.75, s * 0.12);
}
function palm(c, x, y, s) {
  c.strokeStyle = '#8d6e4a';
  c.lineWidth = s * 0.08;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x, y);
  c.quadraticCurveTo(x + s * 0.15, y - s * 0.5, x + s * 0.05, y - s);
  c.stroke();
  const tx = x + s * 0.05, ty = y - s;
  c.fillStyle = '#2e9e4f';
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    c.save();
    c.translate(tx, ty);
    c.rotate(a + Math.PI / 2);
    ell(c, 0, -s * 0.22, s * 0.07, s * 0.24);
    c.restore();
  }
  c.fillStyle = '#6d4c2a';
  circ(c, tx - 4, ty + 4, 4);
  circ(c, tx + 4, ty + 5, 4);
}
function building(c, x, bottom, w, h, col, win, lit, rng, ws = 7) {
  c.fillStyle = col;
  c.fillRect(x, bottom - h, w, h);
  c.fillStyle = Art.shade(col.length === 7 ? col : '#888888', -18);
  c.fillRect(x, bottom - h, w, 4);
  for (let wy = bottom - h + 12; wy < bottom - 10; wy += ws + 7) {
    for (let wx = x + 7; wx < x + w - ws - 3; wx += ws + 6) {
      c.fillStyle = rng() < lit ? win : 'rgba(0,0,0,0.18)';
      c.fillRect(wx, wy, ws, ws + 2);
    }
  }
}
function peaks(c, w, h, base, n, hmin, hmax, col, snow, rng) {
  for (const x of spread(w, n, rng, 0.6)) {
    const hh = hmin + rng() * (hmax - hmin), wd = w / n * (0.75 + rng() * 0.5);
    wrap(w, x, wd, X => {
      c.beginPath();
      c.moveTo(X - wd, base);
      c.lineTo(X - wd * 0.25, base - hh * 0.8);
      c.lineTo(X, base - hh);
      c.lineTo(X + wd * 0.3, base - hh * 0.72);
      c.lineTo(X + wd, base);
      c.closePath();
      c.fillStyle = col;
      c.fill();
      if (snow) {
        c.save();
        c.clip();
        c.fillStyle = snow;
        const sy = base - hh * 0.7;
        c.beginPath();
        c.moveTo(X - wd, 0);
        c.lineTo(X + wd, 0);
        c.lineTo(X + wd, sy);
        for (let i = 6; i >= 0; i--) c.lineTo(X - wd + (2 * wd) * i / 6, sy + (i % 2 ? 10 : -2));
        c.closePath();
        c.fill();
        c.restore();
      }
    });
  }
  c.fillStyle = col;
  c.fillRect(0, base - 1, w, h - base + 1);
}
function sun(c, x, y, r, col, glow) {
  const g = c.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
  g.addColorStop(0, glow);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  circ(c, x, y, r * 3);
  c.fillStyle = col;
  circ(c, x, y, r);
}
function stars(c, w, h, n, rng, maxY) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = `rgba(255,255,255,${0.3 + rng() * 0.7})`;
    const s = rng() < 0.1 ? 2.2 : 1 + rng();
    c.fillRect(rng() * w, rng() * (maxY || h), s, s);
  }
}
function island(c, x, y, s, top, rock) {
  c.fillStyle = rock;
  c.beginPath();
  c.moveTo(x - 50 * s, y);
  c.lineTo(x + 50 * s, y);
  c.lineTo(x + 20 * s, y + 30 * s);
  c.lineTo(x, y + 55 * s);
  c.lineTo(x - 25 * s, y + 28 * s);
  c.closePath();
  c.fill();
  c.fillStyle = top;
  ell(c, x, y, 52 * s, 9 * s);
  roundTree(c, x - 20 * s, y, 50 * s, '#795548', '#5fb24a', '#7fd36a');
  roundTree(c, x + 18 * s, y, 36 * s, '#795548', '#4f9e3e', '#7fd36a');
}

const GR = {
  grass: { style: 'grass', body: '#9a6435', dark: '#7c4c24', top: '#62cc4b', topDark: '#3fa33a' },
};

const THEMES = [
  // 1
  {
    name: 'Сонячні луки', icon: '🌼',
    sky: ['#6ec6ff', '#d6f2ff'],
    ground: GR.grass,
    block: { fill: '#d98a46', light: '#f2b276', dark: '#9a5524', bricks: true },
    oneway: { fill: '#c58b52', dark: '#8a5a2b' },
    enemy: 'beetle', enemyColor: '#e53935', flyer: 'bee',
    decor: ['flower', 'flower2', 'tulip', 'bush', 'mushroom'],
    particles: 'none', gravity: 1,
    music: { bpm: 118, root: 60, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.25, seed: 1 },
    skyDraw(c, w, h) { sun(c, w * 0.8, 70, 30, '#fff59d', 'rgba(255,245,157,0.6)'); },
    far(c, w, h, r) {
      clouds(c, w, 6, r, 40, 140, 'rgba(255,255,255,0.95)');
      band(c, w, h, 295, [[2, 22, 0.5], [3, 12, 1.2]], '#b8e88e');
    },
    mid(c, w, h, r) {
      const wv = [[3, 16, 2], [5, 7, 0.3]];
      band(c, w, h, 335, wv, '#88d064');
      onBand(c, w, 335, wv, 7, r, 60, (x, y, k) => roundTree(c, x, y + 6, 60 + k * 40, '#7b5531', '#5fb24a', '#7fd36a'));
    },
  },
  // 2
  {
    name: 'Чарівний ліс', icon: '🌲',
    sky: ['#9fd8e6', '#eaf8e6'],
    ground: { style: 'grass', body: '#7a5230', dark: '#5f3e22', top: '#4caf50', topDark: '#2e7d32' },
    block: { fill: '#8d6e4a', light: '#b08f68', dark: '#5d452c', bricks: true },
    oneway: { fill: '#a1764a', dark: '#6d4c2a' },
    enemy: 'beetle', enemyColor: '#7e57c2', flyer: 'bee',
    decor: ['mushroom', 'fern', 'stump', 'bush', 'flower2'],
    particles: 'leaves', gravity: 1,
    music: { bpm: 104, root: 62, minor: false, lead: 'sine', bass: 'triangle', drums: true, rest: 0.35, seed: 2 },
    skyDraw(c, w, h) {
      sun(c, w * 0.25, 60, 24, '#fffde7', 'rgba(255,253,231,0.5)');
      c.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 4; i++) tri(c, w * (0.2 + i * 0.18), 0, w * (0.1 + i * 0.18), h, w * (0.26 + i * 0.18), h);
    },
    far(c, w, h, r) {
      const wv = [[2, 12, 0], [4, 6, 1]];
      band(c, w, h, 300, wv, '#a7cfb0');
      onBand(c, w, 300, wv, 24, r, 40, (x, y, k) => pineTree(c, x, y + 8, 70 + k * 50, '#8fbf9c'));
    },
    mid(c, w, h, r) {
      const wv = [[3, 10, 1], [5, 5, 0]];
      band(c, w, h, 345, wv, '#5f9f6a');
      onBand(c, w, 345, wv, 13, r, 60, (x, y, k) => k < 0.7 ? pineTree(c, x, y + 8, 90 + k * 70, '#3d7a4c') : roundTree(c, x, y + 8, 80, '#5d4037', '#4c8a52', '#66a96a'));
    },
  },
  // 3
  {
    name: 'Морський пляж', icon: '🏖️',
    sky: ['#45b8f2', '#c6f1ff'],
    ground: { style: 'sand', body: '#f0cf86', dark: '#d9b263', top: '#fbe3a6', topDark: '#e8c47d' },
    block: { fill: '#4fc3f7', light: '#a6e5ff', dark: '#1e88c8' },
    oneway: { fill: '#c49a6c', dark: '#8b6a45' },
    enemy: 'crab', enemyColor: '#e8503a', flyer: 'bird',
    decor: ['shell', 'starfish', 'umbrella', 'shell', 'starfish'],
    particles: 'none', gravity: 1, pit: '#2196f3',
    music: { bpm: 112, root: 65, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.3, seed: 3 },
    skyDraw(c, w, h) { sun(c, w * 0.7, 80, 32, '#fff59d', 'rgba(255,240,150,0.6)'); },
    far(c, w, h, r) {
      clouds(c, w, 5, r, 40, 130, 'rgba(255,255,255,0.95)');
      const g = c.createLinearGradient(0, 270, 0, h);
      g.addColorStop(0, '#1e88e5');
      g.addColorStop(1, '#64c8f6');
      c.fillStyle = g;
      c.fillRect(0, 270, w, h - 270);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillRect(0, 270, w, 2);
      for (let i = 0; i < 40; i++) c.fillRect(r() * w, 285 + r() * 120, 10 + r() * 14, 2);
      // вітрильник
      const bx = w * 0.3;
      c.fillStyle = '#8d6e63';
      c.beginPath(); c.moveTo(bx - 20, 284); c.lineTo(bx + 20, 284); c.lineTo(bx + 14, 292); c.lineTo(bx - 14, 292); c.fill();
      c.fillStyle = '#fff';
      tri(c, bx, 282, bx, 248, bx + 18, 282);
      c.fillStyle = '#ff7043';
      tri(c, bx - 2, 282, bx - 2, 255, bx - 15, 282);
      // острівець
      c.fillStyle = '#e8c47d';
      ell(c, w * 0.75, 272, 40, 8);
      palm(c, w * 0.75, 270, 50);
    },
    mid(c, w, h, r) {
      const wv = [[2, 10, 0], [4, 5, 1]];
      band(c, w, h, 350, wv, '#f6d58e');
      onBand(c, w, 350, wv, 5, r, 80, (x, y, k) => palm(c, x, y + 6, 100 + k * 40));
    },
  },
  // 4
  {
    name: 'Гаряча пустеля', icon: '🏜️',
    sky: ['#ff9d4d', '#ffe8b5'],
    ground: { style: 'sand', body: '#e3a35a', dark: '#c98a43', top: '#f5c77e', topDark: '#d9a35a' },
    block: { fill: '#d4a26a', light: '#f0c792', dark: '#9c6d3c', bricks: true },
    oneway: { fill: '#b98a55', dark: '#7d5a33' },
    enemy: 'beetle', enemyColor: '#8d6e3c', flyer: 'bird',
    decor: ['cactus', 'skullRock', 'tumbleweed', 'cactus', 'rock'],
    particles: 'dust', gravity: 1,
    music: { bpm: 100, root: 62, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 4 },
    skyDraw(c, w, h) { sun(c, w * 0.3, 110, 46, '#fff3c4', 'rgba(255,240,200,0.7)'); },
    far(c, w, h, r) {
      for (const x of spread(w, 4, r)) {
        const mw = 60 + r() * 70, mh = 60 + r() * 60;
        wrap(w, x, mw, X => {
          c.fillStyle = '#d98a5a';
          c.beginPath(); c.moveTo(X - mw, 320); c.lineTo(X - mw * 0.7, 320 - mh); c.lineTo(X + mw * 0.7, 320 - mh); c.lineTo(X + mw, 320); c.fill();
          c.fillStyle = '#c9774a';
          c.fillRect(X - mw * 0.7, 320 - mh, mw * 1.4, 6);
        });
      }
      wrap(w, w * 0.62, 120, X => {
        c.fillStyle = '#e6aa6c'; tri(c, X - 90, 320, X, 220, X + 90, 320);
        c.fillStyle = '#cf9152'; tri(c, X, 220, X + 90, 320, X + 30, 320);
      });
      band(c, w, h, 318, [[2, 6, 0]], '#e9b06d');
    },
    mid(c, w, h, r) {
      const wv = [[2, 14, 0.4], [3, 8, 2]];
      band(c, w, h, 348, wv, '#f2c27a');
      onBand(c, w, 348, wv, 6, r, 40, (x, y, k) => {
        c.save(); c.translate(x, y + 6); c.scale(2 + k, 2 + k); Art.decors.cactus(c); c.restore();
      });
    },
  },
  // 5
  {
    name: 'Високі гори', icon: '⛰️',
    sky: ['#4d9de0', '#d8edff'],
    ground: { style: 'stone', body: '#8a8f99', dark: '#6f747d', top: '#6fbf5a', topDark: '#4b8f3f', texture: 'dots' },
    block: { fill: '#9ea7b3', light: '#c9d1da', dark: '#6b7480' },
    oneway: { fill: '#8d6e4a', dark: '#5d452c' },
    enemy: 'snowball', enemyColor: '#b9d4ee', flyer: 'bird',
    decor: ['rock', 'pine', 'flower2', 'rock'],
    particles: 'none', gravity: 1,
    music: { bpm: 96, root: 60, minor: false, lead: 'sine', bass: 'triangle', drums: true, rest: 0.35, seed: 5 },
    skyDraw(c, w, h) { sun(c, w * 0.85, 60, 24, '#fffde7', 'rgba(255,255,230,0.5)'); },
    far(c, w, h, r) {
      clouds(c, w, 4, r, 40, 110, 'rgba(255,255,255,0.85)', 0.6, 1);
      peaks(c, w, h, 330, 5, 170, 250, '#9bb3d1', '#ffffff', r);
    },
    mid(c, w, h, r) {
      peaks(c, w, h, 365, 7, 90, 150, '#6582a0', '#eef5fb', r);
      const wv = [[3, 8, 0]];
      band(c, w, h, 352, wv, '#4f7a5a');
      onBand(c, w, 352, wv, 14, r, 30, (x, y, k) => pineTree(c, x, y + 6, 50 + k * 40, '#2f5f45'));
    },
  },
  // 6
  {
    name: 'Снігова країна', icon: '❄️',
    sky: ['#9dbfe3', '#f0f7ff'],
    ground: { style: 'snow', body: '#7b8fa6', dark: '#66798f', top: '#ffffff', topDark: '#d6e6f5' },
    block: { fill: '#b3e5fc', light: '#e1f5fe', dark: '#6fb7d9' },
    oneway: { fill: '#e3f2fd', dark: '#90b4d0' },
    enemy: 'snowball', enemyColor: '#a9c8ec', flyer: 'bird',
    decor: ['snowman', 'snowPine', 'crystalIce', 'snowPine'],
    particles: 'snow', gravity: 1,
    music: { bpm: 108, root: 67, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.3, seed: 6, bell: true },
    skyDraw(c, w, h) { sun(c, w * 0.2, 70, 22, '#ffffff', 'rgba(255,255,255,0.5)'); },
    far(c, w, h, r) {
      const wv = [[2, 25, 1], [3, 12, 0]];
      band(c, w, h, 290, wv, '#dce9f7');
      onBand(c, w, 290, wv, 18, r, 20, (x, y, k) => pineTree(c, x, y + 6, 40 + k * 30, '#a9bfd6', '#f4f9ff'));
    },
    mid(c, w, h, r) {
      const wv = [[3, 12, 0], [5, 5, 2]];
      band(c, w, h, 342, wv, '#f4f9ff');
      onBand(c, w, 342, wv, 10, r, 50, (x, y, k) => pineTree(c, x, y + 8, 80 + k * 60, '#3f6f5f', '#ffffff'));
    },
  },
  // 7
  {
    name: 'Велике місто', icon: '🏙️',
    sky: ['#62bdf9', '#e2f4ff'],
    ground: { style: 'road', body: '#9e7466', dark: '#86604f', top: '#c7ccd3', topDark: '#8f969e', texture: 'bricks' },
    block: { fill: '#e57373', light: '#ffab91', dark: '#b2453f', bricks: true },
    oneway: { fill: '#90a4ae', dark: '#546e7a' },
    enemy: 'robot', enemyColor: '#9aa6b2', flyer: 'bird',
    decor: ['lamp', 'hydrant', 'bench', 'sign', 'flagUA'],
    particles: 'none', gravity: 1,
    music: { bpm: 124, root: 60, minor: false, lead: 'square', bass: 'square', drums: true, rest: 0.2, seed: 7 },
    skyDraw(c, w, h) { sun(c, w * 0.15, 60, 26, '#fff9c4', 'rgba(255,250,200,0.5)'); },
    far(c, w, h, r) {
      clouds(c, w, 5, r, 30, 110, 'rgba(255,255,255,0.9)');
      let x = 0;
      while (x < w) {
        const bw = 40 + r() * 50, bh = 100 + r() * 140;
        building(c, x, 345, bw, bh, '#a9c5de', '#c3d9ec', 0.6, r, 5);
        x += bw - 2;
      }
    },
    mid(c, w, h, r) {
      const cols = ['#ef8f7a', '#f6c85f', '#7fb7e6', '#9fd28a', '#c9a0dc', '#ffb27a'];
      let x = 0;
      while (x < w - 40) {
        const bw = Math.min(60 + r() * 50, w - x), bh = 80 + r() * 100;
        building(c, x, 385, bw, bh, cols[Math.floor(r() * cols.length)], '#e8f6ff', 0.8, r);
        if (r() < 0.4) { c.fillStyle = '#607d8b'; c.fillRect(x + bw * 0.6, 385 - bh - 14, 3, 14); }
        x += bw + 4 + r() * 16;
      }
    },
  },
  // 8
  {
    name: 'Нічне місто', icon: '🌃',
    sky: ['#0a1030', '#2b2f6b'],
    ground: { style: 'road', body: '#3d3f5c', dark: '#30324a', top: '#6a6f8c', topDark: '#474b66', texture: 'bricks' },
    block: { fill: '#5c6bc0', light: '#8e99f3', dark: '#303f9f', bricks: true },
    oneway: { fill: '#7986cb', dark: '#3949ab' },
    enemy: 'robot', enemyColor: '#7c8bb0', flyer: 'bat',
    decor: ['neonLamp', 'hydrant', 'bench', 'neonLamp'],
    particles: 'fireflies', gravity: 1,
    music: { bpm: 112, root: 57, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 8 },
    skyDraw(c, w, h) {
      stars(c, w, h, 140, mulberry32(8), h * 0.6);
      c.fillStyle = '#fff8dc'; circ(c, w * 0.75, 80, 26);
      c.fillStyle = '#0f163e'; circ(c, w * 0.75 + 12, 72, 24);
    },
    far(c, w, h, r) {
      let x = 0;
      while (x < w) {
        const bw = 40 + r() * 50, bh = 120 + r() * 140;
        building(c, x, 345, bw, bh, '#1b2350', '#ffd86b', 0.3, r, 5);
        x += bw - 2;
      }
    },
    mid(c, w, h, r) {
      let x = 0;
      const neon = ['#ff4fa3', '#3ff0ff', '#b2ff59', '#ffd740'];
      while (x < w - 40) {
        const bw = Math.min(60 + r() * 50, w - x), bh = 80 + r() * 100;
        building(c, x, 385, bw, bh, r() < 0.5 ? '#262a5c' : '#2f2a5a', '#ffe08a', 0.45, r);
        if (r() < 0.6) {
          c.save();
          const col = neon[Math.floor(r() * neon.length)];
          c.shadowColor = col; c.shadowBlur = 12;
          c.strokeStyle = col; c.lineWidth = 3;
          rr(c, x + 8, 385 - bh + 14, Math.min(40, bw - 16), 14, 5);
          c.stroke();
          c.restore();
        }
        x += bw + 4 + r() * 16;
      }
    },
  },
  // 9
  {
    name: 'Дикі джунглі', icon: '🌴',
    sky: ['#86d47b', '#e3f9c2'],
    ground: { style: 'jungle', body: '#6d4c2f', dark: '#523720', top: '#2e9e43', topDark: '#1b6e2c' },
    block: { fill: '#8d6e4a', light: '#b08f68', dark: '#5d452c' },
    oneway: { fill: '#6d8f3a', dark: '#44602a' },
    enemy: 'beetle', enemyColor: '#26c6da', flyer: 'bird',
    decor: ['jungleFlower', 'bigLeaf', 'fern', 'bigLeaf', 'mushroom'],
    particles: 'fireflies', gravity: 1,
    music: { bpm: 120, root: 64, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.2, seed: 9 },
    skyDraw(c, w, h) { sun(c, w * 0.6, 50, 22, '#fffde7', 'rgba(255,255,220,0.5)'); },
    far(c, w, h, r) {
      const wv = [[3, 15, 0], [7, 6, 1]];
      band(c, w, h, 265, wv, '#4c9b45');
      onBand(c, w, 265, wv, 30, r, 50, (x, y, k) => { c.fillStyle = '#4c9b45'; circ(c, x, y, 25 + k * 25); });
      onBand(c, w, 290, [[2, 8, 0]], 20, r, 40, (x, y, k) => { c.fillStyle = '#3f8a3a'; circ(c, x, y, 20 + k * 20); });
    },
    mid(c, w, h, r) {
      for (const x of spread(w, 5, r)) wrap(w, x, 30, X => {
        c.fillStyle = '#6b4a2a'; c.fillRect(X - 9, 0, 18, h);
        c.fillStyle = '#5a3d22'; c.fillRect(X - 2, 0, 3, h);
      });
      for (const x of spread(w, 9, r)) {
        const len = 80 + r() * 150;
        wrap(w, x, 20, X => {
          c.strokeStyle = '#2f7d32'; c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(X, 0);
          for (let y = 0; y < len; y += 10) c.lineTo(X + Math.sin(y * 0.05) * 6, y);
          c.stroke();
          c.fillStyle = '#43a047';
          for (let y = 15; y < len; y += 22) ell(c, X + Math.sin(y * 0.05) * 6 + 5, y, 6, 3, 0.5);
        });
      }
      const wv = [[4, 10, 0], [9, 4, 1]];
      band(c, w, h, 360, wv, '#2e8b3a');
      onBand(c, w, 360, wv, 12, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 4); c.scale(2.2, 2.2); Art.decors.bigLeaf(c, 0); c.restore(); });
    },
  },
  // 10
  {
    name: 'Підводний світ', icon: '🐠',
    sky: ['#3cc4ec', '#0b3d73'],
    ground: { style: 'coral', body: '#c9a66b', dark: '#b08c52', top: '#efdcab', topDark: '#d4bb83' },
    block: { fill: '#ff8fb1', light: '#ffc1d4', dark: '#d45d84' },
    oneway: { fill: '#80cbc4', dark: '#4d9a92' },
    enemy: 'crab', enemyColor: '#ff7043', flyer: 'fish',
    decor: ['coral', 'coral2', 'seaweed', 'chest', 'starfish', 'seaweed'],
    particles: 'bubbles', gravity: 0.6, jumpBoost: 1.1, fallMul: 0.55,
    music: { bpm: 84, root: 60, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 10 },
    skyDraw(c, w, h) {
      c.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 6; i++) tri(c, w * (0.05 + i * 0.17), 0, w * (0.0 + i * 0.17), h, w * (0.12 + i * 0.17), h);
    },
    far(c, w, h, r) {
      const wv = [[2, 30, 0], [5, 10, 1]];
      band(c, w, h, 330, wv, '#145e8c');
      onBand(c, w, 330, wv, 8, r, 40, (x, y, k) => {
        c.strokeStyle = '#1b6f9a'; c.lineWidth = 6; c.lineCap = 'round';
        const s = 1 + k;
        line(c, x, y, x, y - 40 * s); line(c, x, y - 20 * s, x - 20 * s, y - 45 * s); line(c, x, y - 28 * s, x + 18 * s, y - 55 * s);
      });
    },
    mid(c, w, h, r) {
      const wv = [[3, 8, 0]];
      band(c, w, h, 368, wv, '#1d7aa8');
      onBand(c, w, 368, wv, 14, r, 30, (x, y, k) => {
        c.save(); c.translate(x, y + 4); c.scale(2, 2);
        const kinds = ['coral', 'coral2', 'seaweed'];
        Art.decors[kinds[Math.floor(k * 3)]](c, k * 5);
        c.restore();
      });
    },
  },
  // 11
  {
    name: 'Кришталева печера', icon: '💎',
    sky: ['#140b24', '#2f1b4d'],
    ground: { style: 'crystal', body: '#4a3470', dark: '#3a2858', top: '#6a4f99', topDark: '#4f3a78', glow: '#7df3ff', texture: 'gems' },
    block: { fill: '#7e57c2', light: '#b39ddb', dark: '#4527a0' },
    oneway: { fill: '#9575cd', dark: '#5e35b1' },
    enemy: 'slime', enemyColor: '#b388ff', flyer: 'bat',
    decor: ['crystal', 'stalagmite', 'mushroomGlow', 'crystal'],
    particles: 'sparkle', gravity: 1,
    music: { bpm: 90, root: 57, minor: true, lead: 'sine', bass: 'triangle', drums: false, rest: 0.4, seed: 11, bell: true },
    skyDraw(c, w, h) {},
    far(c, w, h, r) {
      for (const x of spread(w, 18, r)) { const l = 30 + r() * 90; wrap(w, x, 20, X => { c.fillStyle = '#24153e'; tri(c, X - 14, 0, X, l, X + 14, 0); }); }
      band(c, w, h, 320, [[3, 18, 0], [7, 8, 1]], '#22143a');
      for (const x of spread(w, 10, r)) { const l = 30 + r() * 50; wrap(w, x, 20, X => { c.fillStyle = '#22143a'; tri(c, X - 12, 330, X, 330 - l, X + 12, 330); }); }
    },
    mid(c, w, h, r) {
      for (const x of spread(w, 9, r)) { const l = 50 + r() * 100; wrap(w, x, 25, X => { c.fillStyle = '#2c1a48'; tri(c, X - 20, 0, X, l, X + 20, 0); }); }
      const wv = [[4, 10, 0], [9, 4, 2]];
      band(c, w, h, 352, wv, '#341f55');
      const cols = ['#4ef0ff', '#ff6ee7', '#a78bff', '#69f0ae'];
      onBand(c, w, 352, wv, 10, r, 30, (x, y, k) => {
        const col = cols[Math.floor(k * cols.length)];
        c.save(); c.shadowColor = col; c.shadowBlur = 14; c.fillStyle = col;
        const s = 1 + k;
        c.beginPath(); c.moveTo(x - 6 * s, y + 4); c.lineTo(x - 8 * s, y - 20 * s); c.lineTo(x - 2 * s, y - 34 * s); c.lineTo(x + 4 * s, y - 20 * s); c.lineTo(x + 3 * s, y + 4); c.fill();
        c.beginPath(); c.moveTo(x + 3 * s, y + 4); c.lineTo(x + 8 * s, y - 14 * s); c.lineTo(x + 14 * s, y - 20 * s); c.lineTo(x + 13 * s, y + 4); c.fill();
        c.restore();
      });
    },
  },
  // 12
  {
    name: 'Вогняний вулкан', icon: '🌋',
    sky: ['#2a0a0a', '#b23a1f'],
    ground: { style: 'lava', body: '#3e2723', dark: '#2a1a17', top: '#5d4037', topDark: '#ff6d00', glow: '#ff7b1a', texture: 'cracks', topLight: 'rgba(255,160,80,0.4)' },
    block: { fill: '#6d4c41', light: '#8d6e63', dark: '#3e2723' },
    oneway: { fill: '#795548', dark: '#4e342e' },
    enemy: 'slime', enemyColor: '#ff8a3d', flyer: 'bat',
    decor: ['lavaRock', 'fireFlower', 'lavaRock', 'rock'],
    particles: 'embers', gravity: 1, pit: '#ff6a00',
    music: { bpm: 128, root: 55, minor: true, lead: 'sawtooth', bass: 'square', drums: true, rest: 0.2, seed: 12 },
    skyDraw(c, w, h) {},
    far(c, w, h, r) {
      const vx = w * 0.5;
      c.fillStyle = 'rgba(80,40,40,0.6)';
      for (let i = 0; i < 6; i++) circ(c, vx - 30 + i * 14 + r() * 10, 90 - i * 12, 26 + i * 4);
      c.fillStyle = '#3d1717';
      c.beginPath(); c.moveTo(vx - 300, 360); c.lineTo(vx - 50, 140); c.lineTo(vx + 50, 140); c.lineTo(vx + 300, 360); c.fill();
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 20;
      c.fillStyle = '#ff6a00'; ell(c, vx, 142, 48, 8);
      c.strokeStyle = '#ff8f1f'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(vx - 20, 145); c.quadraticCurveTo(vx - 40, 220, vx - 90, 300); c.stroke();
      c.beginPath(); c.moveTo(vx + 25, 145); c.quadraticCurveTo(vx + 50, 230, vx + 70, 320); c.stroke();
      c.restore();
      c.fillStyle = '#331212';
      c.beginPath(); c.moveTo(w * 0.05 - 150, 360); c.lineTo(w * 0.05, 230); c.lineTo(w * 0.05 + 150, 360); c.fill();
      c.beginPath(); c.moveTo(w * 1.05 - 150, 360); c.lineTo(w * 1.05, 230); c.lineTo(w * 1.05 + 150, 360); c.fill();
      c.fillRect(0, 358, w, h);
    },
    mid(c, w, h, r) {
      const wv = [[7, 10, 0], [13, 5, 1]];
      band(c, w, h, 358, wv, '#241010');
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.strokeStyle = '#ff7b1a'; c.lineWidth = 2;
      for (const x of spread(w, 10, r)) wrap(w, x, 20, X => {
        const y = bandY(w, 358, wv, X) + 12;
        c.beginPath(); c.moveTo(X, y); c.lineTo(X + 8, y + 12); c.lineTo(X + 3, y + 24); c.stroke();
      });
      c.restore();
    },
  },
  // 13
  {
    name: 'Цукеркова країна', icon: '🍭',
    sky: ['#ffb6dc', '#fff2fa'],
    ground: { style: 'candy', body: '#7b4a2e', dark: '#653a22', top: '#ff8fc4', topDark: '#e86aa8', texture: 'dots' },
    block: { fill: '#ff80ab', light: '#ffc1d9', dark: '#d1477a' },
    oneway: { fill: '#b2ebf2', dark: '#4dd0e1' },
    enemy: 'slime', enemyColor: '#ff6fb5', flyer: 'bee',
    decor: ['lollipop', 'candyCane', 'cupcake', 'gumdrop'],
    particles: 'sparkle', gravity: 1, pit: '#ff77b7',
    music: { bpm: 132, root: 67, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 13 },
    skyDraw(c, w, h) { sun(c, w * 0.82, 70, 26, '#fff9fc', 'rgba(255,255,255,0.6)'); },
    far(c, w, h, r) {
      clouds(c, w, 4, r, 40, 120, '#ffd1ec');
      clouds(c, w, 3, r, 60, 150, '#e1d0ff', 0.6, 1);
      band(c, w, h, 300, [[2, 20, 0], [3, 10, 1]], '#f7a8c8');
      band(c, w, h, 325, [[3, 14, 2]], '#c9b2ff');
    },
    mid(c, w, h, r) {
      const wv = [[3, 10, 0]];
      band(c, w, h, 356, wv, '#ff9ec7');
      const kinds = ['lollipop', 'candyCane', 'gumdrop', 'cupcake'];
      onBand(c, w, 356, wv, 10, r, 40, (x, y, k) => {
        c.save(); c.translate(x, y + 4); c.scale(2.2, 2.2); Art.decors[kinds[Math.floor(k * 4)]](c); c.restore();
      });
    },
  },
  // 14
  {
    name: 'Небесне королівство', icon: '☁️',
    sky: ['#7ec3ff', '#ffe0ef'],
    ground: { style: 'cloud', body: '#e9efff', dark: '#d6e0fa', top: '#ffffff', topDark: '#e9efff', texture: 'puffs' },
    block: { fill: '#ffd54f', light: '#fff1a8', dark: '#e0a800' },
    oneway: { fill: '#ffffff', dark: '#c9d6f2', style: 'cloud' },
    enemy: 'alien', enemyColor: '#80deea', flyer: 'bird',
    decor: ['cloudPuff', 'rainbowFlower', 'cloudPuff'],
    particles: 'sparkle', gravity: 1, moverStyle: 'cloud', skyLevel: true,
    music: { bpm: 100, root: 65, minor: false, lead: 'triangle', bass: 'sine', drums: false, rest: 0.35, seed: 14, bell: true },
    skyDraw(c, w, h) {
      sun(c, w * 0.15, 70, 26, '#fffde7', 'rgba(255,253,231,0.6)');
      const cols = ['#ff5252', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      c.globalAlpha = 0.35;
      c.lineWidth = 10;
      cols.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(w * 0.62, 380, 260 - i * 10, Math.PI, 0); c.stroke(); });
      c.globalAlpha = 1;
    },
    far(c, w, h, r) {
      for (const x of spread(w, 3, r)) { const y = 140 + r() * 60; wrap(w, x, 80, X => island(c, X, y, 0.6, '#9be07c', '#b49a85')); }
      const wv = [[3, 12, 0]];
      band(c, w, h, 335, wv, 'rgba(255,255,255,0.9)');
      onBand(c, w, 335, wv, 14, r, 50, (x, y, k) => { c.fillStyle = 'rgba(255,255,255,0.9)'; circ(c, x, y, 26 + k * 22); });
    },
    mid(c, w, h, r) {
      for (const x of spread(w, 3, r)) { const y = 200 + r() * 60; wrap(w, x, 90, X => island(c, X, y, 1, '#7fd36a', '#a1887f')); }
      const wv = [[4, 8, 1]];
      band(c, w, h, 392, wv, '#f7fbff');
      onBand(c, w, 392, wv, 16, r, 40, (x, y, k) => { c.fillStyle = '#f7fbff'; circ(c, x, y, 20 + k * 18); });
    },
  },
  // 15
  {
    name: 'Відкритий космос', icon: '🚀',
    sky: ['#030010', '#170a38'],
    ground: { style: 'moon', body: '#7d7d92', dark: '#626276', top: '#a9a9bd', topDark: '#8a8aa0', light: '#9696aa', texture: 'craters' },
    block: { fill: '#78909c', light: '#b0bec5', dark: '#455a64' },
    oneway: { fill: '#80deea', dark: '#26a6b5' },
    enemy: 'alien', enemyColor: '#8be36a', flyer: 'ufo',
    decor: ['moonRock', 'antenna', 'moonRock', 'flagUA'],
    particles: 'twinkle', gravity: 0.55, jumpBoost: 1.15,
    music: { bpm: 92, root: 57, minor: true, lead: 'triangle', bass: 'sine', drums: true, rest: 0.35, seed: 15, bell: true },
    skyDraw(c, w, h) {
      const r = mulberry32(15);
      for (const [x, y, col] of [[0.3, 0.3, 'rgba(156,39,176,0.25)'], [0.7, 0.5, 'rgba(33,150,243,0.2)']]) {
        const g = c.createRadialGradient(w * x, h * y, 10, w * x, h * y, 220);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      }
      stars(c, w, h, 220, r);
      // Земля
      const ex = w * 0.82, ey = 90;
      c.fillStyle = '#1e88e5'; circ(c, ex, ey, 38);
      c.fillStyle = '#43a047';
      ell(c, ex - 10, ey - 8, 14, 10, 0.4); ell(c, ex + 14, ey + 10, 10, 14, -0.3); ell(c, ex - 4, ey + 22, 8, 5);
      c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, ex + 6, ey - 24, 14, 4);
    },
    far(c, w, h, r) {
      wrap(w, w * 0.35, 80, X => {
        c.fillStyle = '#e0a96d'; circ(c, X, 160, 40);
        c.fillStyle = '#c98b4f'; c.fillRect(X - 40, 150, 80, 6);
        c.strokeStyle = '#f3d3a1'; c.lineWidth = 4; c.beginPath(); c.ellipse(X, 160, 70, 14, -0.25, 0, Math.PI * 2); c.stroke();
      });
      wrap(w, w * 0.08, 30, X => { c.fillStyle = '#d9534f'; circ(c, X, 230, 18); c.fillStyle = '#b53e3a'; circ(c, X - 5, 226, 4); });
      for (const x of spread(w, 8, r)) { const y = 60 + r() * 200, s = 4 + r() * 8; wrap(w, x, 20, X => { c.fillStyle = '#5d5470'; ell(c, X, y, s * 1.3, s, 0.4); }); }
    },
    mid(c, w, h, r) {
      const wv = [[3, 10, 0], [7, 5, 1]];
      band(c, w, h, 362, wv, '#55556a');
      for (const x of spread(w, 12, r)) {
        const rad = 8 + r() * 18;
        wrap(w, x, 40, X => { c.fillStyle = '#45455a'; ell(c, X, bandY(w, 362, wv, X) + 14 + rad * 0.3, rad, rad * 0.35); });
      }
    },
  },
];
