'use strict';
// ВОДНИЙ пакет: 11 підводних світів (рівні 41–80). Тут міньйон уміє плавати.
// Нові вороги й декорації мають префікс «w», щоб не перетинатися з іншими файлами.
(() => {
  const TAU = Math.PI * 2;

  // ---------- маленькі помічники ----------
  function eyes(c, pts, r, look = 1) {
    for (const [x, y] of pts) {
      c.fillStyle = '#fff'; circ(c, x, y, r);
      c.fillStyle = '#1a1a1a'; circ(c, x + look * r * 0.3, y + r * 0.1, r * 0.6);
      c.fillStyle = '#fff'; circ(c, x + look * r * 0.3 + r * 0.25, y - r * 0.22, r * 0.22);
    }
  }
  function smile(c, x, y, r, col = '#3a1a10', lw = 1.3) {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r, 0.25, Math.PI - 0.25); c.stroke();
  }
  function blush(c, x, y, r) { c.fillStyle = 'rgba(255,110,140,0.45)'; circ(c, x, y, r); }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)\s*$/, '0)'));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // тонує вже намальоване на шарі (відсуває вглиб, щоб не плутати з платформами)
  function haze(c, w, h, col) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = col; c.fillRect(0, 0, w, h); c.restore();
  }
  // смуга, що звисає зверху (стеля печери, крига)
  function bandTop(c, w, base, waves, col) {
    c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, base, waves, x));
    c.lineTo(w, 0); c.closePath(); c.fillStyle = col; c.fill();
  }
  // промені світла згори (небо не повторюється, тож можна вільно)
  function rays(c, w, h, n, col, seed, len = 0.9) {
    const r = mulberry32(seed);
    const g = c.createLinearGradient(0, 0, 0, h * len);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    for (let i = 0; i < n; i++) {
      const x = w * (i + 0.2 + r() * 0.6) / n, wd = 14 + r() * 36, sk = -40 - r() * 90;
      c.beginPath(); c.moveTo(x - wd * 0.35, 0); c.lineTo(x + wd * 0.35, 0);
      c.lineTo(x + sk + wd, h * len); c.lineTo(x + sk - wd, h * len); c.closePath(); c.fill();
    }
  }
  // мерехтлива поверхня води вгорі
  function surface(c, w, y, col, hi) {
    const f = x => y + Math.sin(x * 0.031) * 3 + Math.sin(x * 0.012 + 1) * 4;
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= w + 8; x += 8) c.lineTo(x, f(x));
    c.lineTo(w + 8, 0); c.closePath(); c.fill();
    c.strokeStyle = hi; c.lineWidth = 2; c.beginPath();
    for (let x = 0; x <= w + 8; x += 8) c.lineTo(x, f(x) + 1);
    c.stroke();
  }
  // відблиски-«сіточка» світла
  function caustics(c, w, y0, y1, n, r, col, lw = 2) {
    c.strokeStyle = col; c.lineWidth = lw;
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = y0 + r() * (y1 - y0), rx = 10 + r() * 24, ry = 3 + r() * 6, rot = r() * 0.6 - 0.3;
      wrap(w, x, 40, X => { c.beginPath(); c.ellipse(X, y, rx, ry, rot, 0, TAU); c.stroke(); });
    }
  }
  function school(c, x, y, n, s, col, seed, dir = 1) {
    const r = mulberry32(seed);
    c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const fx = x + (r() - 0.5) * 80 * s, fy = y + (r() - 0.5) * 36 * s, fs = s * (0.7 + r() * 0.5);
      ell(c, fx, fy, 6 * fs, 2.6 * fs);
      tri(c, fx - dir * 5 * fs, fy, fx - dir * 10 * fs, fy - 3 * fs, fx - dir * 10 * fs, fy + 3 * fs);
    }
  }
  function bubbleCol(c, x, y0, y1, seed, col) {
    const r = mulberry32(seed);
    c.strokeStyle = col; c.lineWidth = 1.5;
    for (let y = y0; y > y1; y -= 10 + r() * 16) {
      c.beginPath(); c.arc(x + Math.sin(y * 0.05) * 5, y, 1.5 + r() * 3.5, 0, TAU); c.stroke();
    }
  }
  function kelp(c, x, yb, ht, ph, col, leaf, blad, lw, L = 1) {
    const px = y => x + Math.sin((yb - y) * 0.016 + ph) * 9 * L;
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath(); for (let y = yb; y >= yb - ht; y -= 6) c.lineTo(px(y), y); c.stroke();
    let s = 1;
    for (let y = yb - 18 * L; y > yb - ht + 6; y -= 20 * L) {
      const X = px(y);
      c.fillStyle = leaf; ell(c, X + s * 9 * L, y - 5 * L, 10 * L, 3.2 * L, s * 0.55);
      if (blad) { c.fillStyle = blad; circ(c, X + s * 2 * L, y - 1, 2.6 * L); }
      s = -s;
    }
  }
  function bgJelly(c, x, y, s, rgb, a) {
    glow(c, x, y, 42 * s, `rgba(${rgb},${a * 0.4})`);
    c.fillStyle = `rgba(${rgb},${a})`;
    c.beginPath(); c.arc(x, y, 15 * s, Math.PI, 0);
    for (let i = 0; i <= 6; i++) c.lineTo(x + 15 * s - i * 5 * s, y + (i % 2 ? 4 : 1) * s);
    c.fill();
    c.strokeStyle = `rgba(${rgb},${a * 0.75})`; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      c.beginPath(); c.moveTo(x + i * 5 * s, y + 2 * s);
      for (let k = 1; k <= 6; k++) c.lineTo(x + i * 5 * s + Math.sin(k * 1.3 + i) * 3 * s, y + 2 * s + k * 8 * s);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, x - 6 * s, y - 8 * s, 4 * s, 2.4 * s, -0.5);
  }
  // кит, що пливе праворуч (dir=-1 — ліворуч); привітний, усміхнений
  function whale(c, x, y, s, dir, body, belly, eye) {
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(64, 2);
    c.bezierCurveTo(64, -28, 34, -36, 4, -32);
    c.bezierCurveTo(-26, -28, -48, -22, -64, -30);
    c.bezierCurveTo(-72, -34, -78, -40, -84, -46);
    c.lineTo(-79, -37);
    c.bezierCurveTo(-64, -12, -34, 22, 6, 24);
    c.bezierCurveTo(42, 26, 64, 18, 64, 2);
    c.fill();
    c.beginPath(); c.moveTo(-84, -43); c.quadraticCurveTo(-100, -44, -114, -62); c.quadraticCurveTo(-98, -58, -87, -52);
    c.quadraticCurveTo(-84, -64, -70, -72); c.quadraticCurveTo(-72, -54, -84, -43); c.fill();
    c.fillStyle = belly;
    c.beginPath(); c.moveTo(62, 8); c.bezierCurveTo(50, 22, 10, 27, -32, 10); c.bezierCurveTo(0, 15, 40, 14, 62, 8); c.fill();
    c.strokeStyle = body; c.lineWidth = 1.3;
    for (let i = 0; i < 5; i++) line(c, 52 - i * 13, 12 + i * 0.6, 46 - i * 14, 19 + i * 0.2);
    c.fillStyle = body;
    c.save(); c.translate(18, 18); c.rotate(0.6); ell(c, -12, 0, 22, 5.5); c.restore();
    c.fillStyle = eye; circ(c, 40, -6, 3);
    c.fillStyle = 'rgba(255,255,255,0.8)'; circ(c, 41, -7, 1);
    c.strokeStyle = eye; c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(63, 5); c.quadraticCurveTo(52, 13, 36, 7); c.stroke();
    c.fillStyle = 'rgba(255,140,170,0.35)'; ell(c, 44, 3, 5, 3);
    c.fillStyle = 'rgba(255,255,255,0.13)'; ell(c, 14, -26, 26, 4.5, -0.05);
    c.restore();
  }
  function column(c, x, base, ht, wd, col, dark, lite, broken) {
    c.fillStyle = dark; c.fillRect(x - wd * 0.75, base - 8, wd * 1.5, 8);
    c.fillStyle = col; c.fillRect(x - wd / 2, base - ht, wd, ht - 8);
    c.fillStyle = dark;
    for (let i = 1; i < 4; i++) c.fillRect(x - wd / 2 + i * wd / 4 - 1, base - ht, 2, ht - 8);
    if (lite) { c.fillStyle = lite; c.fillRect(x - wd / 2 + 2, base - ht, 3, ht - 8); }
    if (broken) {
      c.fillStyle = col;
      tri(c, x - wd / 2, base - ht, x + wd * 0.1, base - ht - 10, x + wd / 2, base - ht + 4);
    } else {
      c.fillStyle = dark; c.fillRect(x - wd * 0.75, base - ht - 8, wd * 1.5, 8);
      c.fillStyle = col; c.fillRect(x - wd * 0.65, base - ht - 6, wd * 1.3, 4);
    }
  }

  // ======================= ВОРОГИ =======================
  Object.assign(Art.enemies, {
    // ---- ходоки (ноги в 0,0; дивляться вправо) ----
    wHermit(c, t, col) {
      col = col || '#ff5a36';
      const dk = Art.shade(col, -50), st = t * 10;
      c.lineCap = 'round';
      c.strokeStyle = dk; c.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const lx = 3 + i * 4; line(c, lx, -5, lx + 2 + Math.sin(st + i * 2) * 2.2, 0); }
      // мушля-хатинка
      const g = c.createLinearGradient(-14, -26, 6, -2);
      g.addColorStop(0, '#fff4de'); g.addColorStop(1, '#e8945a');
      c.fillStyle = g;
      tri(c, -12, -17, -5, -23, -19, -28);
      circ(c, -3, -12, 11);
      c.strokeStyle = '#b8642e'; c.lineWidth = 1.8;
      c.beginPath();
      for (let a = 0; a < 3.6 * Math.PI; a += 0.2) { const rad = 1 + a * 0.85; c.lineTo(-4 + Math.cos(-a) * rad, -12 + Math.sin(-a) * rad * 0.92); }
      c.stroke();
      c.fillStyle = '#7a3a1c'; ell(c, 6, -9, 3.5, 7);
      // рачок визирає
      c.fillStyle = col; ell(c, 9, -9, 6, 5.5);
      c.save(); c.translate(15, -6); c.rotate(Math.sin(t * 5) * 0.25);
      circ(c, 0, 0, 4.4);
      c.fillStyle = Art.shade(col, 45); tri(c, 1, -1, 6, -3.5, 6, 1.5);
      c.restore();
      c.strokeStyle = col; c.lineWidth = 2;
      line(c, 8, -13, 7, -21); line(c, 12, -13, 13, -21);
      eyes(c, [[7, -22], [13, -22]], 2.9);
    },
    wLobster(c, t, col) {
      col = col || '#e8442e';
      const dk = Art.shade(col, -45), lt = Art.shade(col, 45);
      c.scale(0.84, 0.84);
      c.lineCap = 'round';
      c.strokeStyle = dk; c.lineWidth = 1.8;
      for (let i = 0; i < 4; i++) { const lx = -5 + i * 4; line(c, lx, -5, lx + Math.sin(t * 12 + i * 1.7) * 2.2, 0); }
      c.fillStyle = col;
      for (let i = 3; i >= 0; i--) { c.fillStyle = i % 2 ? col : Art.shade(col, -15); ell(c, -5 - i * 4.2, -7 + i * 0.6, 4.6 - i * 0.4, 4.2 - i * 0.25); }
      c.fillStyle = dk;
      c.beginPath(); c.moveTo(-19, -5); c.lineTo(-26, -10); c.lineTo(-25, -1); c.closePath(); c.fill();
      c.fillStyle = col; ell(c, 4, -9, 8, 6);
      c.fillStyle = lt; ell(c, 3, -12, 5, 1.8);
      c.fillStyle = col; ell(c, 10.5, -10, 4.5, 4.4);
      c.strokeStyle = dk; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(11, -13); c.quadraticCurveTo(4, -28, -10, -26); c.stroke();
      c.beginPath(); c.moveTo(13, -13); c.quadraticCurveTo(10, -30, -2, -31); c.stroke();
      const sn = Math.sin(t * 6) * 0.25;
      for (const [ox, oy, s] of [[16, -18, 1], [18, -9, 0.8]]) {
        c.strokeStyle = col; c.lineWidth = 2.6; line(c, 8, -8, ox - 2, oy + 1);
        c.save(); c.translate(ox + 2, oy); c.rotate(-0.25 + sn * s); c.scale(s, s);
        c.fillStyle = col; ell(c, 0, 0, 5.5, 3.6);
        c.fillStyle = dk; tri(c, 3, -1, 9, -3.5, 4, -3); tri(c, 3, 1, 9, 2.5, 4, 3);
        c.fillStyle = lt; ell(c, -1, -1.4, 2.5, 1);
        c.restore();
      }
      eyes(c, [[11, -15]], 2.6);
    },
    wStarWalker(c, t, col) {
      col = col || '#ff7aa8';
      const bob = -Math.abs(Math.sin(t * 6)) * 2.2, wob = Math.sin(t * 6) * 0.16;
      c.save(); c.translate(0, -12 + bob); c.rotate(wob);
      c.fillStyle = Art.shade(col, -40); star(c, 0, 0.8, 14.5, 5, 0.52);
      c.fillStyle = col; star(c, 0, 0, 13.5, 5, 0.52);
      c.fillStyle = Art.shade(col, 50);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; circ(c, Math.cos(a) * 8, Math.sin(a) * 8, 1.4); circ(c, Math.cos(a) * 4.6, Math.sin(a) * 4.6, 1.1); }
      eyes(c, [[0, -2], [5, -2]], 2.6);
      smile(c, 3, 1.5, 2.4, '#6a1a2a');
      blush(c, -2, 2, 1.6); blush(c, 8, 2, 1.6);
      c.restore();
    },
    wCucumber(c, t, col) {
      col = col || '#ff7a45';
      c.scale(1.2, 1.2);
      const s = Math.sin(t * 5), len = 13 + s * 1.8, hh = 11 - s * 1.2;
      c.fillStyle = Art.shade(col, -45);
      for (let i = 0; i < 7; i++) circ(c, -len + 3 + i * (2 * len - 6) / 6, -1, 1.6);
      c.fillStyle = col; rr(c, -len, -hh - 1, len * 2, hh, hh / 2); c.fill();
      c.fillStyle = Art.shade(col, 40);
      for (let i = 0; i < 6; i++) circ(c, -len + 4 + i * (2 * len - 8) / 5, -hh - 0.5 + (i % 2), 2.4);
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -2, -hh + 2, len * 0.6, 1.4);
      // корона щупалець спереду
      c.strokeStyle = '#ffe0b2'; c.lineWidth = 1.5; c.lineCap = 'round';
      for (let i = -2; i <= 2; i++) line(c, len - 1, -hh / 2 - 1, len + 4 + Math.sin(t * 8 + i) * 1.2, -hh / 2 - 1 + i * 2.2);
      c.fillStyle = '#ffe0b2'; for (let i = -2; i <= 2; i++) circ(c, len + 4.5, -hh / 2 - 1 + i * 2.2, 1.1);
      eyes(c, [[len - 8, -hh + 1], [len - 3.5, -hh + 1]], 2.3);
      smile(c, len - 5, -hh / 2 + 1, 1.8, '#5a1a0a');
    },
    wSeahorse(c, t, col) {
      col = col || '#ffb347';
      const dk = Art.shade(col, -45), lt = Art.shade(col, 45);
      const hop = -Math.abs(Math.sin(t * 5)) * 4;
      c.save(); c.translate(0, hop);
      c.strokeStyle = col; c.lineWidth = 4.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-1, -12); c.quadraticCurveTo(-5, -5, 0, -2.5); c.stroke();
      c.lineWidth = 3.5; c.beginPath(); c.arc(2.5, -4, 2.6, Math.PI * 0.9, Math.PI * 2.6); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.55)';
      ell(c, -7, -17, 3 + Math.sin(t * 20) * 1.2, 5.5);
      c.fillStyle = col; ell(c, 0, -16, 6.5, 8.5);
      c.fillStyle = lt; ell(c, 3, -15, 3, 6.5);
      c.strokeStyle = dk; c.lineWidth = 1;
      for (let i = 0; i < 4; i++) line(c, 1.5, -20 + i * 3.5, 6, -20 + i * 3.5);
      c.fillStyle = col; ell(c, 2, -26, 6, 5);
      rr(c, 5, -28, 9, 4, 2); c.fill();
      c.fillStyle = dk; circ(c, 14, -26, 1.3);
      c.fillStyle = lt; tri(c, -3, -30, -1, -36, 1, -30.5); tri(c, 0.5, -30.5, 3, -35, 4, -30);
      eyes(c, [[3.5, -27]], 2.7);
      blush(c, 5, -23.5, 1.5);
      c.restore();
    },
    wTurtle(c, t, col) {
      col = col || '#3fae74';
      const sw = Math.sin(t * 6), skin = '#a9dca0', skinD = '#78b46c';
      c.fillStyle = skinD; ell(c, -11, -3, 5, 2.5, 0.4 + sw * 0.35);
      c.fillStyle = skin; ell(c, 9, -3, 6.5, 2.6, -0.4 - sw * 0.35);
      c.fillStyle = skin; ell(c, 12, -10, 4, 3); circ(c, 16, -12, 6);
      c.fillStyle = Art.shade(col, -40); rr(c, -16, -8, 29, 4, 2); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(-2, -7, 14, 12, 0, Math.PI, 0); c.fill();
      c.fillStyle = Art.shade(col, 35);
      for (const [hx, hy, hr] of [[-2, -13, 4], [-9, -9, 3], [5, -9, 3], [-2, -6.5, 2.4]]) {
        c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(hx + Math.cos(i * TAU / 6) * hr, hy + Math.sin(i * TAU / 6) * hr * 0.8); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -6, -16, 5, 1.8, -0.3);
      eyes(c, [[17, -13.5]], 2.4);
      smile(c, 17.5, -10.5, 2.2, '#2e5a2a');
    },
    wPenguin(c, t, col) {
      col = col || '#26314d';
      const wd = Math.sin(t * 9);
      c.fillStyle = '#ff9a1e';
      ell(c, -4, -1.6 - Math.max(0, wd) * 2, 4.5, 2);
      ell(c, 5, -1.6 - Math.max(0, -wd) * 2, 4.5, 2);
      c.save(); c.translate(0, -2); c.rotate(wd * 0.08);
      c.fillStyle = col; ell(c, 0, -13, 10, 13);
      c.fillStyle = '#fff'; ell(c, 3, -11, 6.5, 10);
      c.fillStyle = col; circ(c, 1.5, -25, 8);
      c.fillStyle = '#fff'; ell(c, 4.5, -24, 4.8, 4.2);
      c.save(); c.translate(-7, -15); c.rotate(0.35 + wd * 0.25); c.fillStyle = Art.shade(col, 15); ell(c, 0, 4, 3, 7.5); c.restore();
      c.fillStyle = '#1a1a1a'; circ(c, 5.5, -25, 1.9); c.fillStyle = '#fff'; circ(c, 6.1, -25.7, 0.7);
      c.fillStyle = '#ff9a1e'; tri(c, 8.5, -24, 14, -22.5, 8.5, -21);
      blush(c, 6, -21, 1.6);
      c.restore();
    },
    wYetiCrab(c, t, col) {
      col = col || '#f4eee4';
      const dk = Art.shade(col, -70);
      c.strokeStyle = dk; c.lineWidth = 1.8; c.lineCap = 'round';
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) line(c, s * (4 + i * 3), -5, s * (9 + i * 3), Math.sin(t * 14 + i + s) * 1.5);
      c.fillStyle = col; ell(c, 0, -10, 12, 7.5);
      c.fillStyle = Art.shade(col, -18);
      for (let i = 0; i < 7; i++) circ(c, -10 + i * 3.4, -4.5 + Math.sin(i * 2) * 0.6, 2.2);
      // пухнасті клешні
      const sn = Math.abs(Math.sin(t * 5)) * 0.4;
      for (const [x, y, r, s] of [[15, -14, 5.5, 1], [-14, -11, 4, -1]]) {
        c.save(); c.translate(x, y); c.rotate(s * sn);
        c.fillStyle = col; circ(c, 0, 0, r);
        for (let i = 0; i < 6; i++) { const a = i * TAU / 6; circ(c, Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.42); }
        c.fillStyle = '#ffd0c4'; tri(c, s * r * 0.4, -1, s * r * 1.5, -3, s * r * 1.4, 1.5);
        c.restore();
      }
      c.strokeStyle = dk; c.lineWidth = 1.6; line(c, 3, -16, 3, -21); line(c, 8, -16, 9, -21);
      eyes(c, [[3, -22], [9, -22]], 2.6);
      smile(c, 4, -10, 3, '#7a4a3a', 1.4);
      blush(c, -2, -9, 1.8); blush(c, 10, -9, 1.8);
    },
    wNautilus(c, t, col) {
      col = col || '#d8562e';
      const s = Math.sin(t * 7);
      c.strokeStyle = '#f4b38c'; c.lineWidth = 1.8; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        c.beginPath(); c.moveTo(8, -9 + i * 1.6);
        c.quadraticCurveTo(14 + s * 1.5, -8 + i * 2, 15 + i * 1.2 + Math.sin(t * 7 + i) * 1.5, -1 + i * 0.2); c.stroke();
      }
      c.fillStyle = '#e8956a'; ell(c, 9, -12, 5, 5.5);
      c.fillStyle = '#fbecd5'; circ(c, -3, -13, 12.5);
      c.save(); c.beginPath(); c.arc(-3, -13, 12.5, 0, TAU); c.clip();
      c.strokeStyle = col; c.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * 0.95 + i * 0.42;
        c.beginPath(); c.moveTo(-3 + Math.cos(a) * 4, -13 + Math.sin(a) * 4);
        c.quadraticCurveTo(-3 + Math.cos(a + 0.5) * 9, -13 + Math.sin(a + 0.5) * 9, -3 + Math.cos(a + 0.2) * 14, -13 + Math.sin(a + 0.2) * 14); c.stroke();
      }
      c.restore();
      c.strokeStyle = '#c99a72'; c.lineWidth = 1.4; c.beginPath(); c.arc(-3, -13, 12.5, 0, TAU); c.stroke();
      c.fillStyle = '#6a3a24'; ell(c, 6, -13, 3, 6);
      c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -8, -20, 4, 2, -0.6);
      eyes(c, [[11, -14]], 2.6);
    },
    wSeal(c, t, col) {
      col = col || '#9fb0c2';
      const u = Math.sin(t * 7), bo = -Math.abs(u) * 1.6;
      c.save(); c.translate(0, bo);
      c.fillStyle = Art.shade(col, -25);
      tri(c, -13, -5, -22, -11, -21, -1); tri(c, -13, -3, -22, 1, -17, 1);
      c.fillStyle = col; ell(c, -2, -8, 14, 7.5);
      circ(c, 10, -14, 7.5);
      c.fillStyle = '#e4ebf2'; ell(c, 0, -4, 11, 3.6);
      c.fillStyle = Art.shade(col, -20); circ(c, -6, -11, 1.3); circ(c, -1, -13, 1.1); circ(c, -9, -8, 1);
      c.fillStyle = Art.shade(col, -18); ell(c, 4, -2, 5, 2, 0.45 + u * 0.25);
      c.fillStyle = '#e4ebf2'; ell(c, 15, -12, 3.5, 2.8);
      c.fillStyle = '#1a1a1a'; circ(c, 8.5, -16, 2.4); circ(c, 13, -16, 2.4);
      c.fillStyle = '#fff'; circ(c, 9.3, -16.8, 0.9); circ(c, 13.8, -16.8, 0.9);
      c.fillStyle = '#2a2a2a'; ell(c, 17.5, -13, 1.8, 1.3);
      c.strokeStyle = 'rgba(40,40,40,0.6)'; c.lineWidth = 0.8;
      line(c, 16, -11.5, 21, -12.5); line(c, 16, -11, 21, -10);
      blush(c, 11, -12, 1.6);
      c.restore();
    },
    wIsopod(c, t, col) {
      col = col || '#c3b5ea';
      const dk = Art.shade(col, -55);
      c.strokeStyle = dk; c.lineWidth = 1.5; c.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const lx = -11 + i * 3.6; line(c, lx, -3, lx + Math.sin(t * 14 + i * 1.1) * 1.8, 0); }
      c.fillStyle = col; ell(c, 0, -8, 15, 7.5);
      c.fillStyle = Art.shade(col, -18); tri(c, -14, -6, -20, -10, -20, -3);
      c.strokeStyle = Art.shade(col, -30); c.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) { const x = -10 + i * 4; c.beginPath(); c.moveTo(x, -15); c.quadraticCurveTo(x + 2, -8, x, -1.5); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -2, -13, 9, 1.8);
      c.fillStyle = Art.shade(col, -10); ell(c, 13, -7, 4.5, 5.5);
      c.strokeStyle = dk; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(16, -10); c.quadraticCurveTo(21, -15, 25, -12); c.stroke();
      c.beginPath(); c.moveTo(17, -6); c.quadraticCurveTo(23, -6, 25, -2); c.stroke();
      eyes(c, [[13.5, -9.5]], 2.5);
      smile(c, 15, -6, 1.6, '#3a2a5a');
    },

    // ---- плавці (центр 0,0; дивляться вправо) ----
    wClownfish(c, t) {
      const w = Math.sin(t * 10) * 0.3;
      c.save(); c.translate(-11, 0); c.rotate(w);
      c.fillStyle = '#ff7b1c'; ell(c, -4, 0, 5, 6.5);
      c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(-4, 0, 5, 6.5, 0, Math.PI * 0.6, Math.PI * 1.4); c.stroke();
      c.restore();
      c.fillStyle = '#ff7b1c'; ell(c, -1, -8, 6, 3); ell(c, 1, 8, 4, 2.4);
      c.fillStyle = '#ff8a1e'; ell(c, 0, 0, 13, 8.5);
      c.save(); c.beginPath(); c.ellipse(0, 0, 13, 8.5, 0, 0, TAU); c.clip();
      for (const x of [-8, 0, 7]) { c.fillStyle = '#222'; c.fillRect(x - 3.3, -10, 6.6, 20); c.fillStyle = '#fff'; c.fillRect(x - 2.3, -10, 4.6, 20); }
      c.restore();
      c.fillStyle = '#ffb35c'; ell(c, 2, 4, 3, 1.6, 0.4);
      eyes(c, [[9.5, -2]], 2.8);
      c.fillStyle = '#c0392b'; ell(c, 12.5, 2.5, 1.4, 1);
    },
    wAngelfish(c, t) {
      const w = Math.sin(t * 8) * 0.18;
      c.fillStyle = '#ffe680';
      c.save(); c.rotate(w * 0.4);
      c.beginPath(); c.moveTo(-2, -8); c.quadraticCurveTo(-10, -16, -14, -21); c.quadraticCurveTo(-6, -14, -6, -4); c.fill();
      c.beginPath(); c.moveTo(-2, 8); c.quadraticCurveTo(-10, 16, -14, 21); c.quadraticCurveTo(-6, 14, -6, 4); c.fill();
      c.restore();
      c.save(); c.translate(-9, 0); c.rotate(w); c.fillStyle = '#ffe680'; tri(c, 0, 0, -8, -6, -8, 6); c.restore();
      const g = c.createLinearGradient(-9, 0, 13, 0);
      g.addColorStop(0, '#eef3fb'); g.addColorStop(1, '#fff2a8');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(13, 0); c.quadraticCurveTo(6, -12, 0, -12); c.quadraticCurveTo(-8, -6, -10, 0); c.quadraticCurveTo(-8, 6, 0, 12); c.quadraticCurveTo(6, 12, 13, 0); c.fill();
      c.save(); c.clip();
      c.fillStyle = '#2b3242';
      for (const x of [-5, 1, 7]) c.fillRect(x - 1.6, -14, 3.2, 28);
      c.restore();
      eyes(c, [[8, -2]], 2.5);
      c.fillStyle = '#e07a5a'; circ(c, 12.3, 1, 1.1);
    },
    wTang(c, t) {
      const w = Math.sin(t * 10) * 0.3;
      c.save(); c.translate(-12, 0); c.rotate(w);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(2, 0); c.lineTo(-7, -7); c.quadraticCurveTo(-4, 0, -7, 7); c.closePath(); c.fill();
      c.restore();
      c.fillStyle = '#1f5fd6'; ell(c, 0, -6, 9, 4); ell(c, 0, 6, 8, 3.5);
      c.fillStyle = '#2f7cf0'; ell(c, 0, 0, 14, 9);
      c.fillStyle = '#122a66';
      c.beginPath(); c.moveTo(9, -5); c.quadraticCurveTo(0, -9, -11, -3); c.quadraticCurveTo(-4, -1, -11, 3); c.quadraticCurveTo(0, 0, 2, -2); c.quadraticCurveTo(6, -1, 9, -5); c.fill();
      c.fillStyle = '#ffd23f'; ell(c, 3, 3.5, 3, 1.5, 0.3);
      eyes(c, [[8.5, -2]], 2.8);
      smile(c, 12, 1.5, 1.4, '#0a1a44');
    },
    wOtter(c, t) {
      const b = Math.sin(t * 3) * 0.08;
      c.save(); c.rotate(b);
      c.fillStyle = '#7a4e30';
      ell(c, -15, 2, 6, 2.5, 0.2);
      ell(c, 0, 2, 14, 7);
      c.fillStyle = '#5e3a22'; ell(c, -10, -4, 3, 2, -0.6 + Math.sin(t * 6) * 0.3);
      c.fillStyle = '#b68a62'; ell(c, 0, -1.5, 10, 3.6);
      c.fillStyle = '#d9b48a'; circ(c, 13, -2, 7);
      c.fillStyle = '#7a4e30'; circ(c, 10, -8, 2); circ(c, 15, -8.5, 2);
      c.fillStyle = '#fff4e0'; ell(c, 16, 0, 4, 3);
      c.fillStyle = '#2a1a10'; ell(c, 18.5, -1.5, 1.6, 1.2);
      c.fillStyle = '#1a1a1a'; circ(c, 11.5, -3.5, 1.6); circ(c, 15.5, -4, 1.6);
      c.fillStyle = '#fff'; circ(c, 12, -4, 0.6); circ(c, 16, -4.5, 0.6);
      // ракушка на животику
      c.fillStyle = '#ff9fb2'; c.beginPath(); c.arc(2, -4, 4.5, Math.PI, 0); c.fill();
      c.strokeStyle = '#e0708a'; c.lineWidth = 0.8; for (let i = -1; i <= 1; i++) line(c, 2, -4, 2 + i * 2.8, -7.8);
      c.fillStyle = '#5e3a22'; circ(c, -1.5, -4.5, 1.8); circ(c, 5.5, -4.5, 1.8);
      c.restore();
    },
    wJelly(c, t) {
      const p = Math.sin(t * 4);
      c.strokeStyle = 'rgba(255,150,210,0.85)'; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.moveTo(i * 4, 3);
        for (let k = 1; k <= 4; k++) c.lineTo(i * 4 + Math.sin(t * 5 + k + i) * 2.2 - k * 0.8, 3 + k * 3.6 - p);
        c.stroke();
      }
      c.fillStyle = '#ff6fc4'; c.strokeStyle = '#b8287e'; c.lineWidth = 1.6;
      c.beginPath(); c.ellipse(0, 1, 13 + p, 12 - p, 0, Math.PI, 0);
      for (let i = 0; i <= 6; i++) c.lineTo(13 + p - i * (26 + 2 * p) / 6, 1 + (i % 2 ? 3 : 0));
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,210,240,0.9)'; ell(c, -5, -6 + p * 0.5, 4, 2.4, -0.5);
      eyes(c, [[1, -3], [6, -3]], 2.3);
      smile(c, 3.5, 0, 1.8, '#8a1a5a');
    },
    wGlowJelly(c, t) {
      const p = Math.sin(t * 4);
      c.save(); c.shadowColor = '#5affe0'; c.shadowBlur = 14;
      c.strokeStyle = 'rgba(120,255,230,0.9)'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) {
        c.beginPath(); c.moveTo(i * 3, 3);
        for (let k = 1; k <= 5; k++) c.lineTo(i * 3 + Math.sin(t * 5 + k + i) * 2 - k * 0.7, 3 + k * 3.4 - p);
        c.stroke();
      }
      c.fillStyle = 'rgba(90,255,220,0.55)';
      c.beginPath(); c.ellipse(0, 2, 13 + p, 11 - p, 0, Math.PI, 0); c.closePath(); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(220,255,250,0.95)'; c.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-6 + i * 4, -2, 2, 0, TAU); c.stroke(); }
      c.fillStyle = 'rgba(230,255,250,0.9)'; ell(c, -5, -6, 3.5, 2, -0.5);
      eyes(c, [[2, -4], [7, -4]], 2.2);
    },
    wManta(c, t) {
      const f = Math.sin(t * 5), tip = 15 + f * 3, curl = f * 4;
      c.strokeStyle = '#22325f'; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-18, 2 + f, -26, -1); c.stroke();
      c.fillStyle = '#7a98dc'; c.strokeStyle = '#2a3f7a'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(13, -3);
      c.quadraticCurveTo(6, -tip * 0.55, -4, -tip); c.quadraticCurveTo(-6 + curl, -tip * 0.4, -11, -1);
      c.lineTo(-11, 1); c.quadraticCurveTo(-6 + curl, tip * 0.4, -4, tip); c.quadraticCurveTo(6, tip * 0.55, 13, 3);
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; ell(c, 1, -6, 4, 2, -0.7); ell(c, 1, 6, 4, 2, 0.7);
      c.fillStyle = '#94b0ea'; ell(c, -1, 0, 9, 3);
      c.fillStyle = '#7a98dc'; ell(c, 15, -3.6, 3.6, 1.6, -0.4); ell(c, 15, 3.6, 3.6, 1.6, 0.4);
      eyes(c, [[10, -3.6], [10, 3.6]], 2.1);
    },
    wNarwhal(c, t) {
      const w = Math.sin(t * 8) * 0.35;
      c.save(); c.translate(-12, 0); c.rotate(w);
      c.fillStyle = '#7fa4cf'; ell(c, -4, -3, 5, 2.4, -0.5); ell(c, -4, 3, 5, 2.4, 0.5);
      c.restore();
      c.fillStyle = '#f2ead2';
      c.beginPath(); c.moveTo(11, -4); c.lineTo(27, -8); c.lineTo(11, -1); c.closePath(); c.fill();
      c.strokeStyle = '#c9b98e'; c.lineWidth = 0.9;
      for (let i = 0; i < 4; i++) line(c, 14 + i * 3.4, -2.6 - i * 1, 15 + i * 3.4, -5.2 - i * 0.9);
      c.fillStyle = '#8fb3d9'; ell(c, 0, 0, 13.5, 9);
      c.fillStyle = '#e6f0f9'; ell(c, 2, 4, 10, 4);
      c.fillStyle = '#6f93bf'; circ(c, -6, -4, 1.3); circ(c, -2, -6, 1); circ(c, -9, -1, 1);
      c.fillStyle = '#7fa4cf'; ell(c, 2, 6, 4, 2, 0.5);
      eyes(c, [[8, -2]], 2.5);
      smile(c, 10, 1, 1.8, '#2a3a5a');
      blush(c, 6, 1.5, 1.6);
    },
    wFirefish(c, t) {
      const f = Math.sin(t * 6) * 0.25;
      c.save(); c.translate(-2, 3); c.rotate(0.5 + f);
      c.fillStyle = '#ffc2ae'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 11, Math.PI * 0.3, Math.PI * 0.95); c.closePath(); c.fill();
      c.strokeStyle = '#ff6a50'; c.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const a = Math.PI * (0.38 + i * 0.17); line(c, 0, 0, Math.cos(a) * 10.5, Math.sin(a) * 10.5); }
      c.restore();
      c.strokeStyle = '#ffd0c0'; c.lineWidth = 1.2; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const x = -6 + i * 3.4; c.beginPath(); c.moveTo(x, -5); c.quadraticCurveTo(x - 2, -11, x - 4 + Math.sin(t * 4 + i) * 1.5, -14 + Math.abs(i - 2)); c.stroke(); }
      c.save(); c.translate(-10, 0); c.rotate(f);
      c.fillStyle = '#ffb08a'; tri(c, 0, 0, -8, -6, -8, 6); c.restore();
      c.fillStyle = '#ff5a3c'; ell(c, 0, 0, 12, 7);
      c.save(); c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, TAU); c.clip();
      c.fillStyle = '#fff1e6'; for (const x of [-7, -2, 3]) c.fillRect(x - 1.2, -8, 2.4, 16);
      c.restore();
      eyes(c, [[7, -1.5]], 2.6);
      c.fillStyle = '#a3241a'; ell(c, 11.5, 2, 1.3, 1);
    },
    wDolphin(c, t) {
      const w = Math.sin(t * 7) * 0.3;
      c.save(); c.translate(-13, -1); c.rotate(w);
      c.fillStyle = '#7095bd'; ell(c, -4, -3, 5, 2.2, -0.4); ell(c, -4, 2, 5, 2.2, 0.4);
      c.restore();
      c.fillStyle = '#7fa6cf';
      c.beginPath(); c.moveTo(-14, -1); c.quadraticCurveTo(-4, -10, 7, -8); c.quadraticCurveTo(13, -6, 14, -2);
      c.lineTo(20, -0.5); c.quadraticCurveTo(21, 1.5, 18, 2); c.quadraticCurveTo(6, 8, -6, 4); c.quadraticCurveTo(-11, 2, -14, -1); c.fill();
      tri(c, -4, -7, -1, -14, 3, -8);
      c.fillStyle = '#eaf2fa';
      c.beginPath(); c.moveTo(17, 1.5); c.quadraticCurveTo(6, 7, -6, 3.5); c.quadraticCurveTo(4, 2, 17, 1.5); c.fill();
      c.fillStyle = '#6f93bd'; ell(c, 2, 4, 4, 1.6, 0.6);
      eyes(c, [[9, -3]], 2.3);
      c.strokeStyle = '#2a3a5a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(19, 0.8); c.quadraticCurveTo(15, 2.5, 12, 1); c.stroke();
      blush(c, 11, 0, 1.4);
    },
    wLantern(c, t) {
      const w = Math.sin(t * 9) * 0.3;
      glow(c, 0, 2, 22, 'rgba(120,250,255,0.25)');
      c.save(); c.translate(-11, 0); c.rotate(w);
      c.fillStyle = '#3a4a8a'; tri(c, 0, 0, -8, -6, -8, 6); c.restore();
      c.fillStyle = '#5a6cc0'; ell(c, 0, 0, 13.5, 7.5);
      c.fillStyle = '#34407a'; ell(c, 0, -1.5, 12, 5.5);
      c.fillStyle = '#3a4a8a'; ell(c, -1, -7, 5, 2.4);
      c.save(); c.shadowColor = '#7cf9ff'; c.shadowBlur = 8; c.fillStyle = '#b8fdff';
      for (let i = 0; i < 6; i++) circ(c, -9 + i * 3.4, 4.2 - Math.abs(i - 2.5) * 0.3, 1.2);
      circ(c, 10, 3, 1.4);
      c.restore();
      eyes(c, [[7, -1.5]], 3.4);
    },

    // ---- стрільці (ноги в 0,0; «рот» праворуч на y≈-14) ----
    wCoral(c, t) {
      const p = Math.max(0, Math.sin(t * 2.4)) * 0.12;
      c.fillStyle = '#c9a77c'; ell(c, -1, -1.5, 15, 3.5);
      c.fillStyle = '#ffb36b';
      c.save(); c.translate(6, -14); c.scale(1 + p, 1 + p);
      rr(c, 0, -4.5, 11, 9, 4); c.fill();
      c.fillStyle = '#ffd1a0'; rr(c, 9, -5.5, 4, 11, 2); c.fill();
      c.fillStyle = '#7a3a2a'; ell(c, 12, 0, 1.6, 3.4);
      c.restore();
      c.fillStyle = '#ff8fab';
      c.beginPath(); c.ellipse(-3, -2, 13, 21, 0, Math.PI, 0); c.fill();
      c.strokeStyle = '#e0607e'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        for (let x = -13; x <= 7; x += 2) c.lineTo(x, -6 - i * 4.5 + Math.sin(x * 0.9 + i) * 1.4 + Math.abs(x + 3) * 0.12 * i);
        c.stroke();
      }
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -8, -18, 4, 2, -0.5);
      eyes(c, [[-5, -16], [1, -16]], 3);
      blush(c, -8, -11, 1.8); blush(c, 4, -11, 1.8);
    },
    wCannon(c, t) {
      const rec = Math.max(0, Math.sin(t * 2.4)) * 1.5;
      c.fillStyle = '#6d4a2c'; rr(c, -14, -10, 24, 8, 2); c.fill();
      c.fillStyle = '#8a6038'; c.fillRect(-13, -9, 22, 2);
      for (const wx of [-8, 5]) {
        c.fillStyle = '#4e331c'; circ(c, wx, -3, 4.5);
        c.fillStyle = '#8a6038'; circ(c, wx, -3, 1.6);
      }
      c.save(); c.translate(-rec, 0);
      c.fillStyle = '#4c5a66'; rr(c, -15, -20, 29, 11, 5.5); c.fill();
      c.fillStyle = '#5f6f7d'; c.fillRect(-12, -19, 22, 2.5);
      c.fillStyle = '#3a454f'; rr(c, 11, -21.5, 6, 15, 2.5); c.fill();
      c.fillStyle = '#121a20'; ell(c, 16.5, -14, 1.8, 4.5);
      c.fillStyle = '#3a454f'; circ(c, -16, -14.5, 3);
      c.fillStyle = '#e6dcc4'; circ(c, -8, -19, 1.8); circ(c, 8, -10.5, 1.4); circ(c, 3, -20, 1.2);
      c.strokeStyle = '#3fae5a'; c.lineWidth = 1.8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-4, -20); c.quadraticCurveTo(-6 + Math.sin(t * 2) * 2, -26, -3, -31); c.stroke();
      eyes(c, [[-3, -14.5], [3.5, -14.5]], 3);
      c.restore();
    },
    wClam(c, t) {
      const open = 0.25 + 0.3 * Math.max(0, Math.sin(t * 2.2));
      c.fillStyle = '#2f6fb8';
      c.beginPath(); c.moveTo(-15, -12); c.quadraticCurveTo(-16, 0, 0, 0); c.quadraticCurveTo(16, 0, 16, -12); c.closePath(); c.fill();
      c.fillStyle = '#4f9ae0';
      c.beginPath(); c.moveTo(-14, -12); c.quadraticCurveTo(-14, -2, 0, -2); c.quadraticCurveTo(14, -2, 15, -12); c.closePath(); c.fill();
      c.strokeStyle = '#2f6fb8'; c.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) line(c, i * 2.4, -2.5, i * 5.5, -11.5);
      c.fillStyle = '#1a2a5a'; ell(c, 1, -12.5, 14, 2.6 + open * 6);
      const pg = c.createRadialGradient(6, -15, 0.5, 7, -13.5, 4.5);
      pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#f2c8ff');
      c.fillStyle = pg; circ(c, 7, -13.5, 3.6);
      c.save(); c.translate(-15, -12); c.rotate(-open);
      c.fillStyle = '#3f86d0';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(0, -13, 15.5, -13); c.quadraticCurveTo(31, -13, 31, 0); c.closePath(); c.fill();
      c.fillStyle = '#6ab4f0'; c.beginPath(); c.moveTo(3, -1); c.quadraticCurveTo(3, -10, 15.5, -10.5); c.quadraticCurveTo(28, -10, 28, -1); c.closePath(); c.fill();
      c.strokeStyle = '#3f86d0'; c.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) line(c, 15.5 + i * 2, -1, 15.5 + i * 5.5, -11);
      eyes(c, [[11, -8], [19, -8]], 2.8);
      c.restore();
    },
    wSnapShrimp(c, t) {
      const snap = Math.sin(t * 2.4) > 0.7 ? 0.05 : 0.5;
      c.scale(0.88, 0.88);
      c.strokeStyle = '#d0603a'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const lx = -8 + i * 4; line(c, lx, -7, lx + Math.sin(t * 10 + i) * 1.5, 0); }
      c.fillStyle = '#ff9a6a';
      for (let i = 0; i < 4; i++) ell(c, -9 - i * 3.6, -10 + i * 1.6, 4.4 - i * 0.6, 4.4 - i * 0.5);
      c.fillStyle = '#ffd6c0'; tri(c, -20, -4, -25, -8, -25, 0);
      c.fillStyle = '#ff8a5a'; ell(c, -1, -12, 9, 6);
      c.fillStyle = '#fff1e6'; for (const x of [-6, -1, 4]) c.fillRect(x, -17.5, 1.6, 11);
      c.strokeStyle = '#ff8a5a'; c.lineWidth = 3; line(c, 5, -12, 8, -14);
      c.fillStyle = '#ff5a3c'; ell(c, 10, -14, 6.5, 4.6);
      c.save(); c.translate(13, -17); c.rotate(-snap);
      c.fillStyle = '#ff6a4a'; rr(c, 0, -1.6, 7, 3.2, 1.6); c.fill(); c.restore();
      c.fillStyle = '#ff6a4a'; rr(c, 12, -13, 6, 3, 1.5); c.fill();
      c.strokeStyle = '#d0603a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(3, -17); c.quadraticCurveTo(10, -30, 20, -26); c.stroke();
      c.beginPath(); c.moveTo(1, -17); c.quadraticCurveTo(-4, -32, -14, -30); c.stroke();
      c.strokeStyle = '#ff8a5a'; c.lineWidth = 1.6; line(c, 3, -16, 3, -21);
      eyes(c, [[3, -22]], 2.8);
    },
    wPuffer(c, t) {
      const inf = 1 + 0.14 * Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = '#7a6ac8'; rr(c, -10, -5, 20, 5, 2.5); c.fill();
      c.fillStyle = '#9a8ae0'; c.fillRect(-8, -5, 16, 1.5);
      c.save(); c.translate(0, -15);
      c.fillStyle = '#f5c46a'; tri(c, -10, 0, -18, -6, -18, 6);
      c.scale(inf, inf);
      c.fillStyle = '#e0a84a';
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; tri(c, Math.cos(a - 0.12) * 10, Math.sin(a - 0.12) * 10, Math.cos(a) * 13, Math.sin(a) * 13, Math.cos(a + 0.12) * 10, Math.sin(a + 0.12) * 10); }
      c.fillStyle = '#ffd27a'; circ(c, 0, 0, 10.5);
      c.fillStyle = '#fff6e0'; ell(c, 1, 4, 8, 5);
      c.fillStyle = '#c98a3a'; circ(c, -5, -5, 1.4); circ(c, -1, -7, 1.2); circ(c, -7, -1, 1.1); circ(c, 3, -8, 1);
      c.fillStyle = '#f5b04a'; ell(c, -2, 2, 3, 4.5, 0.4 + Math.sin(t * 12) * 0.3);
      c.fillStyle = '#e0567a'; ell(c, 10, 1, 2.6, 2.4);
      c.fillStyle = '#7a1a3a'; ell(c, 10.6, 1, 1.2, 1.2);
      eyes(c, [[4, -4]], 3.4);
      c.restore();
    },
    wFishStatue(c, t) {
      const gl = 0.6 + Math.sin(t * 3) * 0.3;
      c.fillStyle = '#7f8fc0'; rr(c, -13, -8, 24, 8, 1.5); c.fill();
      c.fillStyle = '#a6b4e0'; c.fillRect(-14, -9, 26, 2.5);
      c.fillStyle = '#5f6fa0'; for (const x of [-9, -3, 3]) c.fillRect(x, -6, 2, 6);
      c.fillStyle = '#b8c4ea';
      c.beginPath(); c.moveTo(-12, -9); c.quadraticCurveTo(-14, -26, 0, -28); c.quadraticCurveTo(14, -27, 15, -18);
      c.lineTo(15, -10); c.quadraticCurveTo(6, -9, -12, -9); c.fill();
      c.fillStyle = '#93a2d2'; tri(c, -10, -20, -6, -34, 2, -27); tri(c, -2, -27, 4, -33, 7, -25);
      c.strokeStyle = '#8b9aca'; c.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-6 + i * 4, -15, 3, -1.2, 1.2); c.stroke(); }
      c.fillStyle = '#26305a'; ell(c, 14, -14, 3.2, 4.2);
      c.fillStyle = `rgba(110,255,250,${gl})`; ell(c, 14.5, -14, 1.8, 2.8);
      glow(c, 6, -21, 7, `rgba(110,255,250,${gl * 0.7})`);
      c.fillStyle = '#e0fffe'; circ(c, 6, -21, 2.8);
      c.fillStyle = '#26305a'; circ(c, 7, -21, 1.4);
    },
    wWalrus(c, t) {
      const br = Math.sin(t * 2.4) * 0.6;
      c.fillStyle = '#9a6648'; ell(c, -10, -2, 6, 2.5, 0.3); ell(c, 6, -2, 6, 2.4, -0.3);
      c.fillStyle = '#b57a58'; ell(c, -3, -11, 13, 11 + br);
      circ(c, 7, -17, 9);
      c.fillStyle = '#c99070'; ell(c, -6, -16, 4, 2, -0.4);
      c.fillStyle = '#fff8e8'; tri(c, 9, -11, 11.5, -11, 10.5, -2); tri(c, 14, -11, 16.5, -11, 15.5, -3);
      c.fillStyle = '#e8b896'; circ(c, 10.5, -13.5, 4); circ(c, 15, -13.5, 4);
      c.fillStyle = '#7a4a34'; for (const [x, y] of [[9.5, -14], [11.5, -12.5], [14, -14], [16, -12.5]]) circ(c, x, y, 0.6);
      c.fillStyle = '#5a2a1a'; ell(c, 18.5, -14, 1.8, 2.2 + Math.max(0, Math.sin(t * 2.4)) * 1.5);
      c.fillStyle = '#3a2a1a'; ell(c, 13, -17, 2, 1.4);
      c.fillStyle = '#1a1a1a'; circ(c, 6, -21, 1.8); circ(c, 12, -21.5, 1.8);
      c.fillStyle = '#fff'; circ(c, 6.6, -21.6, 0.7); circ(c, 12.6, -22.1, 0.7);
    },
    wVent(c, t) {
      const hot = 0.6 + Math.sin(t * 5) * 0.25;
      glow(c, 0, -2, 18, `rgba(255,120,40,${0.35 * hot})`);
      c.fillStyle = 'rgba(80,70,80,0.55)';
      for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; circ(c, -1 + Math.sin(k * 6 + i) * 3, -30 - k * 18, 3 + k * 5); }
      c.save(); c.shadowColor = '#ff8a3a'; c.shadowBlur = 8;
      c.fillStyle = '#8a6a72';
      c.beginPath(); c.moveTo(-12, 0); c.lineTo(-8, -28); c.lineTo(5, -28); c.lineTo(10, 0); c.closePath(); c.fill();
      c.restore();
      c.fillStyle = '#a4848c'; tri(c, -8, -28, -5, -28, -10, -2);
      c.fillStyle = '#6e545c'; circ(c, -8, -10, 3.5); circ(c, 4, -22, 3); circ(c, 6, -6, 3);
      c.fillStyle = '#2a1e25'; ell(c, -1.5, -28, 6.5, 2.4);
      c.fillStyle = `rgba(255,140,40,${hot})`; ell(c, -1.5, -28.5, 4, 1.2);
      c.fillStyle = '#7a5e66'; rr(c, 5, -18, 11, 8, 3); c.fill();
      c.fillStyle = '#9a7a84'; rr(c, 14, -19.5, 4, 11, 2); c.fill();
      c.fillStyle = `rgba(255,170,60,${hot})`; ell(c, 17, -14, 1.6, 3.4);
      c.strokeStyle = `rgba(255,120,40,${hot})`; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-9, -4); c.lineTo(-6, -9); c.lineTo(-7, -14); c.stroke();
      eyes(c, [[-5, -19], [1, -19]], 2.8);
      smile(c, -2, -14, 2.4, '#ffb070', 1.5);
    },
    wSquid(c, t) {
      const pul = Math.sin(t * 2.4);
      c.save(); c.shadowColor = '#ff7ae0'; c.shadowBlur = 10;
      c.strokeStyle = '#ff9ae6'; c.lineWidth = 2.6; c.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const x0 = -6 + i * 2.4;
        c.beginPath(); c.moveTo(x0, -8);
        c.quadraticCurveTo(x0 + (i - 2.5) * 1.5, -4, x0 + (i - 2.5) * 2.4 + Math.sin(t * 6 + i) * 1.2, -0.5); c.stroke();
      }
      c.fillStyle = '#ff8ad8';
      c.beginPath(); c.moveTo(-8, -12); c.quadraticCurveTo(-9, -28 - pul, 0, -36 - pul); c.quadraticCurveTo(9, -28 - pul, 8, -12); c.closePath(); c.fill();
      tri(c, -5, -30 - pul, -12, -34 - pul, -2, -35 - pul); tri(c, 5, -30 - pul, 12, -34 - pul, 2, -35 - pul);
      c.restore();
      c.fillStyle = '#ffb8ec'; ell(c, 0, -11, 9, 6);
      c.fillStyle = '#ffd6f4'; circ(c, -3, -26, 1.6); circ(c, 2, -22, 1.4); circ(c, -1, -31, 1.2);
      c.fillStyle = '#e266c0'; rr(c, 6, -16, 8, 4.4, 2.2); c.fill();
      c.fillStyle = '#5a1a4a'; ell(c, 14, -13.8, 1.3, 2);
      eyes(c, [[0, -13], [6, -13]], 2.8);
    },
    wConch(c, t) {
      const b = Math.sin(t * 2.4) * 0.6;
      c.fillStyle = '#e7b27e';
      c.beginPath(); c.moveTo(-17, -9); c.lineTo(-2, -24); c.quadraticCurveTo(14, -27, 16, -15); c.quadraticCurveTo(16, -1, 3, 0); c.lineTo(-14, -2); c.closePath(); c.fill();
      c.fillStyle = '#f7d3a8';
      for (const [x, y] of [[-10, -15], [-5, -20], [1, -24], [7, -25]]) tri(c, x - 2.5, y + 1, x, y - 5, x + 2.5, y + 1);
      c.strokeStyle = '#c98a52'; c.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-12 + i * 5, -4); c.quadraticCurveTo(-8 + i * 5, -13, -6 + i * 6, -20 + i); c.stroke(); }
      c.fillStyle = '#ff9fa8'; ell(c, 11, -13 + b * 0.3, 6.5, 10);
      c.fillStyle = '#ffc6cc'; ell(c, 10, -15, 3.5, 6);
      c.fillStyle = '#9a3a4a'; ell(c, 14, -14, 2.4, 4.6);
      eyes(c, [[-2, -13], [4, -14]], 2.8);
      blush(c, 0, -8, 1.6);
    },
    wGardenEel(c, t) {
      const sw = Math.sin(t * 2.4) * 2;
      c.fillStyle = '#2c3160'; ell(c, -2, -1.5, 12, 3.5);
      c.fillStyle = '#10142e'; ell(c, -2, -2, 5, 1.8);
      c.save(); c.shadowColor = '#7cf9ff'; c.shadowBlur = 10;
      c.strokeStyle = '#eaf4ff'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-2, -2); c.bezierCurveTo(-4 + sw, -16, -6 + sw, -28, 2 + sw * 0.5, -26); c.quadraticCurveTo(8, -24, 10, -15); c.stroke();
      c.restore();
      c.fillStyle = '#2a2f55'; circ(c, -3 + sw * 0.6, -10, 1.3); circ(c, -4 + sw, -18, 1.3); circ(c, 0 + sw * 0.4, -25, 1.2);
      c.fillStyle = '#eaf4ff'; ell(c, 11, -14.5, 5, 4);
      c.fillStyle = '#2a1a3a'; ell(c, 15.2, -13.6, 1.3, 1.7);
      eyes(c, [[11, -16.5]], 2.5);
    },
  });

  // ======================= ДЕКОРАЦІЇ =======================
  Object.assign(Art.decors, {
    wBrainCoral(c) {
      c.fillStyle = '#f48aa8'; c.beginPath(); c.ellipse(0, 0, 13, 13, 0, Math.PI, 0); c.fill();
      c.strokeStyle = '#d4607e'; c.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) { c.beginPath(); for (let x = -11 + i * 2; x <= 11 - i * 2; x += 2) c.lineTo(x, -3 - i * 3.5 + Math.sin(x * 1.1 + i) * 1.3); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -5, -9, 3.5, 1.8, -0.5);
    },
    wFanCoral(c, t) {
      c.save(); c.rotate(Math.sin(t * 1.5) * 0.05);
      c.strokeStyle = '#b06ae0'; c.lineWidth = 1.3; c.lineCap = 'round';
      for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(i * 2, -14, i * 4, -26 + Math.abs(i) * 1.6); c.stroke(); }
      for (let k = 1; k <= 4; k++) { c.beginPath(); c.ellipse(0, -3, 4 * k, 6 * k, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      c.lineWidth = 2.5; c.strokeStyle = '#8a4ac0'; line(c, 0, 0, 0, -5);
      c.restore();
    },
    wStaghorn(c, t) {
      c.strokeStyle = '#ffa25a'; c.lineWidth = 3.6; c.lineCap = 'round';
      line(c, 0, 0, -2, -14); line(c, -2, -14, -8, -22); line(c, -2, -14, 3, -24); line(c, 0, -6, 8, -14); line(c, 8, -14, 11, -20); line(c, -5, -18, -11, -16);
      c.fillStyle = '#ffd8b0'; for (const [x, y] of [[-8, -22], [3, -24], [11, -20], [-11, -16]]) circ(c, x, y, 1.6);
    },
    wTubeSponge(c) {
      for (const [x, h, col] of [[-6, 18, '#c070e0'], [1, 26, '#d68af0'], [8, 14, '#b05ad0']]) {
        c.fillStyle = col; rr(c, x - 3.5, -h, 7, h, 3); c.fill();
        c.fillStyle = '#5a2a7a'; ell(c, x, -h + 1, 2.6, 1.3);
      }
    },
    wAnemone(c, t) {
      c.fillStyle = '#c2306f'; ell(c, 0, -3, 9, 4);
      c.strokeStyle = '#ff6fb5'; c.lineWidth = 2.6; c.lineCap = 'round';
      for (let i = -4; i <= 4; i++) {
        c.beginPath(); c.moveTo(i * 2, -5);
        c.quadraticCurveTo(i * 3 + Math.sin(t * 2.5 + i) * 2, -12, i * 3.6 + Math.sin(t * 2.5 + i + 1) * 3, -18 + Math.abs(i) * 1.3); c.stroke();
      }
      c.fillStyle = '#ffd1e8';
      for (let i = -4; i <= 4; i++) circ(c, i * 3.6 + Math.sin(t * 2.5 + i + 1) * 3, -18 + Math.abs(i) * 1.3, 1.4);
    },
    wSeaGrass(c, t) {
      c.strokeStyle = '#4caf62'; c.lineWidth = 2.2; c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) {
        const hh = 16 + (i * 7 + 21) % 9 + (i === 0 ? 6 : 0);
        c.beginPath(); c.moveTo(i * 2, 0); c.quadraticCurveTo(i * 2 + Math.sin(t * 2 + i) * 3, -hh * 0.5, i * 3 + Math.sin(t * 2 + i + 1) * 5, -hh); c.stroke();
      }
    },
    wAnchor(c) {
      c.save(); c.rotate(0.25);
      c.strokeStyle = '#5c6670'; c.lineWidth = 3.5; c.lineCap = 'round';
      line(c, 0, -2, 0, -30); line(c, -6, -24, 6, -24);
      c.beginPath(); c.arc(0, -10, 10, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
      c.lineWidth = 2.4; c.beginPath(); c.arc(0, -33, 3.2, 0, TAU); c.stroke();
      c.fillStyle = '#5c6670'; tri(c, 8, -9, 12, -4, 12, -11); tri(c, -8, -9, -12, -4, -12, -11);
      c.fillStyle = '#e6dcc4'; circ(c, 1.5, -17, 1.2); circ(c, -1.5, -26, 1);
      c.restore();
    },
    wBarrel(c) {
      c.fillStyle = '#8d5a32'; rr(c, -13, -15, 26, 15, 6); c.fill();
      c.fillStyle = '#a8703f'; rr(c, -11, -13, 22, 3, 1.5); c.fill();
      c.fillStyle = '#4a5560'; c.fillRect(-7, -15, 2.6, 15); c.fillRect(5, -15, 2.6, 15);
      c.fillStyle = '#5e3a1e'; ell(c, -13, -7.5, 2.5, 7.5);
      c.fillStyle = '#3fae5a'; ell(c, 2, -15, 4, 1.4, 0.3);
    },
    wShipWheel(c) {
      c.save(); c.translate(0, -12); c.rotate(0.3);
      c.strokeStyle = '#7a5232'; c.lineWidth = 2.4; c.lineCap = 'round';
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(c, 0, 0, Math.cos(a) * 15, Math.sin(a) * 15); }
      c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.stroke();
      c.fillStyle = '#5a3a20'; circ(c, 0, 0, 3);
      c.restore();
      c.fillStyle = '#b8a37c'; ell(c, 0, 0, 14, 3.5);
    },
    wBottle(c) {
      c.save(); c.rotate(-1.2);
      c.fillStyle = 'rgba(80,190,120,0.8)'; rr(c, -4, -18, 8, 14, 3); c.fill(); c.fillRect(-1.6, -24, 3.2, 7);
      c.fillStyle = '#8d5a32'; c.fillRect(-1.8, -26, 3.6, 3);
      c.fillStyle = '#f4ead0'; rr(c, -2, -15, 4, 8, 1); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-3, -17, 1.2, 10);
      c.restore();
    },
    wTreasure(c, t) {
      c.fillStyle = '#6d3f1e'; rr(c, -13, -12, 26, 12, 2); c.fill();
      c.fillStyle = '#f5c542'; ell(c, 0, -12, 12, 4);
      for (const [x, y] of [[-6, -14], [-1, -16], [5, -14], [2, -13]]) { c.fillStyle = '#ffdc6b'; circ(c, x, y, 2.6); }
      c.fillStyle = '#ff5a7a'; circ(c, -3, -15, 1.8); c.fillStyle = '#5ae0ff'; circ(c, 7, -15.5, 1.6);
      c.fillStyle = '#8a5228'; c.save(); c.translate(-12, -13); c.rotate(-1.9); rr(c, 0, -1, 14, 6, 2); c.fill(); c.restore();
      c.fillStyle = '#4a5560'; c.fillRect(-13, -7, 26, 2); c.fillRect(-2, -10, 4, 6);
      c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 4) * 0.4})`; star(c, 3, -19, 2.4, 4, 0.35);
    },
    wPearlClam(c, t) {
      const o = 0.5 + Math.sin(t * 1.5) * 0.12;
      c.fillStyle = '#d6a8e8'; c.beginPath(); c.moveTo(-11, -4); c.quadraticCurveTo(0, 2, 11, -4); c.lineTo(11, -6); c.lineTo(-11, -6); c.fill();
      c.fillStyle = '#7a4a9a'; ell(c, 0, -6, 10, 2.5);
      glow(c, 0, -8, 9, 'rgba(255,255,255,0.55)');
      c.fillStyle = '#ffffff'; circ(c, 0, -8, 3.2);
      c.save(); c.translate(-11, -6); c.rotate(-o);
      c.fillStyle = '#e8c4f5'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(11, -12, 22, 0); c.closePath(); c.fill();
      c.strokeStyle = '#c094d8'; c.lineWidth = 1; for (let i = -2; i <= 2; i++) line(c, 11, -1, 11 + i * 4, -7);
      c.restore();
    },
    wScallop(c) {
      c.save(); c.translate(0, -1); c.rotate(-0.15);
      c.fillStyle = '#ff9f6a'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 10, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill();
      c.strokeStyle = '#e0703a'; c.lineWidth = 1.1;
      for (let i = 0; i < 7; i++) { const a = Math.PI * 1.1 + i * 0.13; line(c, 0, 0, Math.cos(a) * 10, Math.sin(a) * 10); }
      c.fillStyle = '#ff9f6a'; c.fillRect(-3, -2, 6, 2.5);
      c.restore();
    },
    wConchShell(c) {
      c.fillStyle = '#f7c9a0';
      c.beginPath(); c.moveTo(-10, -2); c.lineTo(0, -14); c.quadraticCurveTo(9, -14, 10, -6); c.quadraticCurveTo(9, 0, 2, 0); c.closePath(); c.fill();
      c.fillStyle = '#ffb3c1'; ell(c, 5, -5, 3.5, 4.5, 0.4);
      c.strokeStyle = '#d99a6a'; c.lineWidth = 1; line(c, -6, -4, -1, -11); line(c, -3, -2, 3, -11);
    },
    wSandDollar(c) {
      c.fillStyle = '#d8c6a2'; ell(c, 0, -2, 11, 4);
      c.fillStyle = '#f4e8d0'; ell(c, 0, -2.6, 10.5, 3.6);
      c.fillStyle = '#c9b48c'; for (let i = 0; i < 5; i++) { const a = i * TAU / 5; ell(c, Math.cos(a) * 5, -2.6 + Math.sin(a) * 1.6, 2, 0.8, a); }
    },
    wStarfishW(c) {
      c.save(); c.translate(0, -5); c.scale(1, 0.62); c.rotate(0.4);
      c.fillStyle = '#5a7cf0'; star(c, 0, 0, 12, 5, 0.42);
      c.fillStyle = '#c8d6ff'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; circ(c, Math.cos(a) * 6.5, Math.sin(a) * 6.5, 1.3); }
      c.restore();
    },
    wKelp(c, t) {
      c.strokeStyle = '#5a8a2a'; c.lineWidth = 2.6; c.lineCap = 'round';
      const px = y => Math.sin(y * 0.12 + t * 1.6) * 3 * (-y / 40);
      c.beginPath(); for (let y = 0; y >= -40; y -= 4) c.lineTo(px(y), y); c.stroke();
      let s = 1;
      for (let y = -8; y >= -38; y -= 7) {
        c.fillStyle = '#7cb342'; ell(c, px(y) + s * 5, y - 2, 5.5, 2, s * 0.6);
        c.fillStyle = '#c0ca33'; circ(c, px(y) + s * 1.2, y, 1.6);
        s = -s;
      }
    },
    wBubbleRock(c, t) {
      c.fillStyle = 'rgba(220,250,255,0.75)'; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const k = (t * 0.5 + i / 4) % 1;
        c.beginPath(); c.arc(Math.sin(k * 8 + i) * 2.5, -10 - k * 30, 1.2 + k * 2.4, 0, TAU); c.stroke();
      }
      c.fillStyle = '#6d7a72'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-9, -8); c.lineTo(-2, -11); c.lineTo(7, -8); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#8a988f'; tri(c, -8, -7, -2, -10, -3, -5);
      c.fillStyle = '#3d4a42'; ell(c, 0, -10, 2, 1);
    },
    wUrchin(c) {
      c.strokeStyle = '#4a2a7a'; c.lineWidth = 1.4;
      for (let i = 0; i < 16; i++) { const a = Math.PI + i * Math.PI / 15; line(c, 0, -5, Math.cos(a) * 11, -5 + Math.sin(a) * 11); }
      c.fillStyle = '#7a4ab0'; c.beginPath(); c.ellipse(0, -1, 7, 6, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#a77ad8'; circ(c, -2, -4, 1.3);
    },
    wTurban(c) {
      c.fillStyle = '#c96a3a';
      c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-9, -10, 0, -14); c.quadraticCurveTo(9, -10, 8, 0); c.closePath(); c.fill();
      c.strokeStyle = '#ffd0a0'; c.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-7 + i * 1.5, -3 - i * 4); c.quadraticCurveTo(0, -1 - i * 4, 7 - i * 1.5, -4 - i * 4); c.stroke(); }
    },
    wSoftCoral(c, t) {
      c.strokeStyle = '#d06ac8'; c.lineWidth = 3; c.lineCap = 'round';
      const sw = Math.sin(t * 1.5) * 1.5;
      line(c, 0, 0, sw * 0.5, -12); line(c, sw * 0.5, -12, -7 + sw, -22); line(c, sw * 0.5, -12, 7 + sw, -24); line(c, 0, -6, -9, -12);
      c.save(); c.shadowColor = '#ffb8f8'; c.shadowBlur = 6; c.fillStyle = '#ffc8fa';
      for (const [x, y] of [[-7 + sw, -22], [7 + sw, -24], [-9, -12], [sw * 0.5, -16]]) { circ(c, x, y, 2.6); circ(c, x + 2.4, y + 1, 1.8); circ(c, x - 2.2, y + 1.2, 1.6); }
      c.restore();
    },
    wGlowAnemone(c, t) {
      c.fillStyle = '#6a2a8a'; ell(c, 0, -3, 8, 3.5);
      c.save(); c.shadowColor = '#ff7af0'; c.shadowBlur = 8;
      c.strokeStyle = '#d68aff'; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 2, -4); c.quadraticCurveTo(i * 3, -10, i * 4 + Math.sin(t * 2 + i) * 2.5, -16 + Math.abs(i)); c.stroke(); }
      c.fillStyle = '#ffe0ff'; for (let i = -3; i <= 3; i++) circ(c, i * 4 + Math.sin(t * 2 + i) * 2.5, -16 + Math.abs(i), 1.5);
      c.restore();
    },
    wBabyJelly(c, t) {
      const y = -20 + Math.sin(t * 2) * 3;
      c.save(); c.shadowColor = '#7ff0ff'; c.shadowBlur = 8;
      c.fillStyle = 'rgba(127,240,255,0.75)'; c.beginPath(); c.arc(0, y, 6, Math.PI, 0); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(127,240,255,0.7)'; c.lineWidth = 1;
      for (let i = -1; i <= 1; i++) line(c, i * 3, y, i * 3 + Math.sin(t * 3 + i) * 1.5, y + 8);
      c.restore();
      c.fillStyle = '#7a4aa0'; ell(c, 0, -1, 4, 1.5);
    },
    wColumn(c) {
      c.fillStyle = '#c8d0ea'; c.fillRect(-7, -4, 14, 4);
      c.fillStyle = '#e4e9f8'; c.fillRect(-5, -26, 10, 22);
      c.fillStyle = '#b4bede'; c.fillRect(-2.6, -26, 1.6, 22); c.fillRect(1, -26, 1.6, 22);
      c.fillStyle = '#e4e9f8'; tri(c, -5, -26, 0, -32, 5, -24);
      c.fillStyle = '#d0d8f0'; c.save(); c.translate(11, -3); c.rotate(0.2); rr(c, -5, -3, 10, 6, 2); c.fill(); c.restore();
    },
    wGlowColumn(c, t) {
      const g = 0.6 + Math.sin(t * 2.5) * 0.3;
      c.fillStyle = '#9aa8d8'; c.fillRect(-8, -4, 16, 4); c.fillRect(-8, -38, 16, 4);
      c.fillStyle = '#d8e0f6'; c.fillRect(-5.5, -34, 11, 30);
      c.fillStyle = '#aab6e0'; c.fillRect(-2.5, -34, 1.5, 30); c.fillRect(1.2, -34, 1.5, 30);
      c.save(); c.shadowColor = '#5ffcff'; c.shadowBlur = 10;
      c.fillStyle = `rgba(110,255,250,${g})`; c.fillRect(-6, -26, 12, 2.4); c.fillRect(-6, -13, 12, 2.4);
      circ(c, 0, -41, 3);
      c.restore();
    },
    wAmphora(c) {
      c.save(); c.translate(0, -1); c.rotate(0.18);
      c.fillStyle = '#c66f3e';
      c.beginPath(); c.moveTo(-3, -24); c.quadraticCurveTo(-11, -16, -6, -3); c.lineTo(0, 1); c.lineTo(6, -3); c.quadraticCurveTo(11, -16, 3, -24); c.closePath(); c.fill();
      c.fillRect(-2.5, -28, 5, 5);
      c.strokeStyle = '#c66f3e'; c.lineWidth = 1.6; c.beginPath(); c.arc(-5, -23, 3, Math.PI * 0.5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(5, -23, 3, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
      c.fillStyle = '#8a3e1e'; c.fillRect(-6.5, -15, 13, 2); c.fillStyle = '#f0c896'; for (let i = 0; i < 3; i++) circ(c, -4 + i * 4, -10, 1);
      c.restore();
    },
    wTrident(c, t) {
      c.save(); c.rotate(-0.12);
      c.strokeStyle = '#7fd8e8'; c.lineWidth = 2.2; c.lineCap = 'round';
      line(c, 0, 0, 0, -32); line(c, -6, -28, 6, -28);
      line(c, -6, -28, -6, -36); line(c, 6, -28, 6, -36); line(c, 0, -32, 0, -40);
      c.fillStyle = '#c8fbff'; tri(c, -8, -35, -6, -40, -4, -35); tri(c, 4, -35, 6, -40, 8, -35); tri(c, -2, -39, 0, -44, 2, -39);
      glow(c, 0, -34, 12, `rgba(120,255,250,${0.3 + Math.sin(t * 3) * 0.15})`);
      c.restore();
    },
    wGlowShell(c, t) {
      glow(c, 0, -5, 12, `rgba(140,255,240,${0.35 + Math.sin(t * 2) * 0.15})`);
      c.fillStyle = '#9fe8f0'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 9, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill();
      c.strokeStyle = '#5ab8c8'; c.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const a = Math.PI * 1.1 + i * 0.16; line(c, 0, 0, Math.cos(a) * 9, Math.sin(a) * 9); }
    },
    wIceChunk(c) {
      c.fillStyle = '#9fd4f0'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-10, -12); c.lineTo(-2, -16); c.lineTo(9, -12); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#e4f6ff'; tri(c, -10, -12, -2, -16, -3, -6);
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(3, -11, 2, 7);
    },
    wIceSpire(c) {
      c.fillStyle = '#b8e6fb'; tri(c, -7, 0, -3, -30, 1, 0); tri(c, -1, 0, 5, -20, 9, 0); tri(c, -11, 0, -8, -14, -5, 0);
      c.fillStyle = '#ffffff'; tri(c, -4, -2, -3, -28, -2, -2); tri(c, 4, -2, 5, -18, 5.6, -2);
    },
    wSnowCoral(c, t) {
      c.strokeStyle = '#eef8ff'; c.lineWidth = 2.6; c.lineCap = 'round';
      const sw = Math.sin(t * 1.4);
      line(c, 0, 0, 0, -14); line(c, 0, -14, -7 + sw, -22); line(c, 0, -14, 6 + sw, -24); line(c, 0, -8, 8, -12); line(c, 0, -6, -8, -10);
      c.fillStyle = '#ffffff'; for (const [x, y] of [[-7 + sw, -22], [6 + sw, -24], [8, -12], [-8, -10]]) circ(c, x, y, 2.4);
    },
    wSmoker(c, t) {
      c.fillStyle = 'rgba(90,80,90,0.5)';
      for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; circ(c, Math.sin(k * 5 + i) * 2.5, -24 - k * 20, 2.5 + k * 4); }
      c.fillStyle = '#3a2c34'; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-4, -24); c.lineTo(4, -24); c.lineTo(8, 0); c.fill();
      c.fillStyle = '#52404a'; circ(c, -4, -8, 2.5); circ(c, 3, -15, 2);
      c.fillStyle = `rgba(255,140,40,${0.6 + Math.sin(t * 5) * 0.3})`; ell(c, 0, -24, 3, 1.2);
    },
    wBasalt(c) {
      for (const [x, h, col] of [[-8, 12, '#3a3448'], [-2, 20, '#4a4258'], [5, 15, '#3f384e'], [10, 8, '#4a4258']]) {
        c.fillStyle = col; c.fillRect(x - 3.2, -h, 6.4, h);
        c.fillStyle = '#6a6080'; c.beginPath(); c.moveTo(x - 3.2, -h); c.lineTo(x, -h - 2); c.lineTo(x + 3.2, -h); c.lineTo(x, -h + 1.6); c.fill();
      }
    },
    wRiftia(c, t) {
      for (const [x, h] of [[-6, 20], [0, 28], [6, 16], [3, 10]]) {
        c.fillStyle = '#e8e2d6'; rr(c, x - 2.2, -h, 4.4, h, 2); c.fill();
        const sw = Math.sin(t * 2 + x) * 1;
        c.fillStyle = '#ff3a5a'; ell(c, x + sw, -h - 3, 3.2, 4.2); c.fillStyle = '#ff7a8a'; ell(c, x + sw - 1, -h - 4, 1.2, 2);
      }
    },
    wHotRock(c, t) {
      c.fillStyle = '#2e2228'; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-9, -11); c.lineTo(1, -15); c.lineTo(11, -8); c.lineTo(13, 0); c.fill();
      c.save(); c.shadowColor = '#ff6d00'; c.shadowBlur = 6;
      c.strokeStyle = `rgba(255,${130 + Math.sin(t * 4) * 50 | 0},30,0.95)`; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-7, -9); c.lineTo(-2, -4); c.lineTo(3, -11); c.lineTo(8, -5); c.stroke();
      c.restore();
    },
    wGlowShroom(c, t) {
      const g = 0.75 + Math.sin(t * 2) * 0.2;
      c.save(); c.shadowColor = '#5affc8'; c.shadowBlur = 10;
      for (const [x, h, r] of [[-6, 10, 5], [3, 16, 7], [9, 7, 4]]) {
        c.fillStyle = '#d8fff4'; c.fillRect(x - 1.2, -h, 2.4, h);
        c.fillStyle = `rgba(90,255,200,${g})`; c.beginPath(); c.ellipse(x, -h, r, r * 0.7, 0, Math.PI, 0); c.fill();
      }
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.7)'; circ(c, 1, -19, 1.2); circ(c, 5, -18, 0.9);
    },
    wGlowCoral(c, t) {
      c.save(); c.shadowColor = '#7affe8'; c.shadowBlur = 8;
      c.strokeStyle = '#46d6b8'; c.lineWidth = 2.6; c.lineCap = 'round';
      line(c, 0, 0, 0, -12); line(c, 0, -12, -6, -20); line(c, 0, -12, 5, -22); line(c, 0, -6, 7, -11);
      c.fillStyle = `rgba(200,255,245,${0.7 + Math.sin(t * 3) * 0.3})`;
      for (const [x, y] of [[-6, -20], [5, -22], [7, -11]]) circ(c, x, y, 2.2);
      c.restore();
    },
    wCrystalW(c, t) {
      c.save(); c.shadowColor = '#7affd8'; c.shadowBlur = 8 + Math.sin(t * 3) * 3;
      c.fillStyle = '#8affe0'; c.beginPath(); c.moveTo(-4, 0); c.lineTo(-6, -14); c.lineTo(-2, -22); c.lineTo(2, -14); c.lineTo(1, 0); c.fill();
      c.fillStyle = '#5ac8ff'; c.beginPath(); c.moveTo(1, 0); c.lineTo(4, -9); c.lineTo(8, -13); c.lineTo(9, -4); c.lineTo(7, 0); c.fill();
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.7)'; tri(c, -4, -12, -2, -19, -1, -12);
    },
    wBarnacleRock(c) {
      c.fillStyle = '#7d8a96'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-11, -10); c.lineTo(-2, -14); c.lineTo(9, -10); c.lineTo(14, 0); c.fill();
      c.fillStyle = '#2a3a5a'; for (const [x, y] of [[8, -4], [11, -2]]) ell(c, x, y, 2.4, 3.8, 0.6);
      for (const [x, y] of [[-7, -9], [-2, -12], [3, -9], [-9, -4]]) {
        c.fillStyle = '#e8e0d0'; c.beginPath(); c.moveTo(x - 2.6, y + 1.5); c.lineTo(x - 1.4, y - 2); c.lineTo(x + 1.4, y - 2); c.lineTo(x + 2.6, y + 1.5); c.fill();
        c.fillStyle = '#6a6a6a'; c.fillRect(x - 0.8, y - 2, 1.6, 1);
      }
    },
    wCrinoid(c, t) {
      const sw = Math.sin(t * 1.4) * 2;
      c.strokeStyle = '#c8a8e8'; c.lineWidth = 1.8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sw * 0.5, -14, sw, -26); c.stroke();
      c.save(); c.shadowColor = '#ff8af0'; c.shadowBlur = 8; c.strokeStyle = '#ffb8f4'; c.lineWidth = 1.4;
      for (let i = -3; i <= 3; i++) {
        c.beginPath(); c.moveTo(sw, -26);
        c.quadraticCurveTo(sw + i * 3, -34, sw + i * 4.5, -30 + Math.abs(i) * 1.5); c.stroke();
      }
      c.restore();
    },
    wGlowOrb(c, t) {
      c.strokeStyle = '#4a5aa0'; c.lineWidth = 1.4;
      for (const [x, h, k] of [[-5, 16, 0], [2, 24, 1], [7, 12, 2]]) {
        line(c, x * 0.4, 0, x, -h);
        const a = 0.6 + Math.sin(t * 2.5 + k * 2) * 0.35;
        glow(c, x, -h, 8, `rgba(124,249,255,${a * 0.6})`);
        c.fillStyle = `rgba(200,255,255,${a})`; circ(c, x, -h, 2.6);
      }
    },
  });

  const water = { gravity: 0.6, jumpBoost: 1.1, fallMul: 0.55, swim: true };

  window.THEME_PACKS = window.THEME_PACKS || {};
  THEME_PACKS.water = [
    // 1 — Кораловий риф
    Object.assign({}, water, {
      name: 'Кораловий риф', icon: '🐠',
      sky: ['#74ecec', '#1a88c0'],
      ground: { style: 'coral', body: '#e8877a', dark: '#cf6a62', top: '#ffe0b0', topDark: '#f2bd86', topLight: 'rgba(255,255,255,0.5)', texture: 'dots' },
      block: { fill: '#3fc1c9', light: '#9df0f0', dark: '#1f8a93' },
      oneway: { fill: '#b98cff', dark: '#7c52d0' },
      bounce: { fill: '#ff5fa2', dark: '#c2306f', light: '#ffb0d5' },
      enemy: 'wHermit', enemyColor: '#ff5a36', flyer: 'wClownfish', shooter: 'wCoral', projectile: '#e6fbff',
      decor: ['wBrainCoral', 'wFanCoral', 'wStaghorn', 'wAnemone', 'wTubeSponge', 'wSeaGrass'],
      particles: 'bubbles',
      music: { bpm: 92, root: 62, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.3, seed: 54 },
      skyDraw(c, w, h) {
        glow(c, w * 0.62, -20, 260, 'rgba(255,255,220,0.45)');
        rays(c, w, h, 7, 'rgba(255,255,240,0.22)', 541);
        surface(c, w, 10, 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.7)');
      },
      far(c, w, h, r) {
        caustics(c, w, 20, 200, 26, r, 'rgba(255,255,255,0.12)');
        for (const x of spread(w, 3, r)) { const y = 110 + r() * 110, sd = 1 + Math.floor(r() * 999); wrap(w, x, 70, X => school(c, X, y, 11, 1, 'rgba(30,130,180,0.45)', sd)); }
        const wv = [[2, 16, 0.5], [5, 7, 1]];
        band(c, w, h, 302, wv, '#58bccd');
        onBand(c, w, 302, wv, 12, r, 60, (x, y, k) => {
          c.fillStyle = '#58bccd';
          if (k < 0.4) { c.beginPath(); c.ellipse(x, y + 4, 26 + k * 40, 20 + k * 30, 0, Math.PI, 0); c.fill(); }
          else {
            c.strokeStyle = '#58bccd'; c.lineWidth = 7; c.lineCap = 'round';
            const s = 0.8 + k;
            line(c, x, y + 4, x, y - 34 * s); line(c, x, y - 14 * s, x - 18 * s, y - 36 * s); line(c, x, y - 22 * s, x + 16 * s, y - 46 * s);
          }
        });
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0], [7, 4, 1]];
        band(c, w, h, 362, wv, '#3a9fbe');
        const kinds = ['wBrainCoral', 'wFanCoral', 'wStaghorn', 'wTubeSponge', 'wAnemone', 'wBrainCoral'];
        onBand(c, w, 362, wv, 14, r, 50, (x, y, k) => {
          c.save(); c.translate(x, y + 5); const s = 1.8 + k * 1.4; c.scale(s, s);
          Art.decors[kinds[Math.floor(k * kinds.length)]](c, k * 5);
          c.restore();
        });
        haze(c, w, h, 'rgba(40,150,200,0.32)');
      },
    }),
    // 2 — Затонулий корабель
    Object.assign({}, water, {
      name: 'Затонулий корабель', icon: '⚓',
      sky: ['#3e9488', '#0c2b38'],
      ground: { style: 'sand', body: '#8a7a5a', dark: '#73654a', top: '#b8a67e', topDark: '#9a8a64', topLight: 'rgba(255,255,230,0.3)', texture: 'dots' },
      block: { fill: '#8d5a3a', light: '#b98257', dark: '#5a3520', bricks: true },
      oneway: { fill: '#a77b4f', dark: '#6b4a2a' },
      enemy: 'wLobster', enemyColor: '#ef4a32', flyer: 'wAngelfish', shooter: 'wCannon', projectile: '#d9fff4',
      decor: ['wAnchor', 'wBarrel', 'wShipWheel', 'wBottle', 'wTreasure', 'wSeaGrass'],
      particles: 'bubbles',
      music: { bpm: 80, root: 57, minor: true, lead: 'triangle', bass: 'triangle', drums: false, rest: 0.35, seed: 55 },
      skyDraw(c, w, h) {
        rays(c, w, h, 5, 'rgba(200,255,220,0.13)', 551, 0.8);
        const r = mulberry32(552);
        for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(210,240,210,${0.1 + r() * 0.25})`; circ(c, r() * w, r() * h, 0.8 + r() * 1.3); }
      },
      far(c, w, h, r) {
        const ship = (X, base, s, col, dk) => {
          c.save(); c.translate(X, base); c.scale(s, s); c.rotate(-0.08);
          c.fillStyle = col;
          c.beginPath(); c.moveTo(-170, -70); c.lineTo(-150, -20); c.quadraticCurveTo(-60, 10, 60, 0); c.lineTo(80, -40); c.lineTo(40, -48); c.lineTo(10, -30); c.lineTo(-20, -55); c.lineTo(-130, -60); c.lineTo(-140, -95); c.lineTo(-175, -95); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(90, 4); c.lineTo(108, -46); c.lineTo(190, -58); c.lineTo(205, -40); c.quadraticCurveTo(170, 6, 90, 4); c.fill();
          c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
          line(c, -90, -55, -110, -210); line(c, -10, -40, 20, -190); line(c, 150, -55, 185, -150);
          c.lineWidth = 4; line(c, -140, -170, -80, -175); line(c, -20, -150, 50, -160);
          c.fillStyle = col;
          c.beginPath(); c.moveTo(-136, -168); c.lineTo(-84, -172); c.lineTo(-90, -120); c.lineTo(-104, -132); c.lineTo(-118, -112); c.lineTo(-130, -126); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(-16, -148); c.lineTo(46, -157); c.lineTo(36, -96); c.lineTo(24, -110); c.lineTo(10, -92); c.lineTo(-4, -104); c.closePath(); c.fill();
          c.fillStyle = dk;
          for (let i = 0; i < 6; i++) circ(c, -120 + i * 30, -34 + i * 2.5, 5);
          c.strokeStyle = dk; c.lineWidth = 2;
          for (let i = 0; i < 3; i++) line(c, -150 + i * 8, -50 + i * 12, 50, -12 + i * 6);
          c.restore();
        };
        wrap(w, w * 0.56, 330, X => ship(X, 316, 1.15, '#2a6e68', '#1d5450'));
        wrap(w, w * 0.08, 140, X => ship(X, 300, 0.55, '#2a6a68', '#235a5a'));
        for (const x of spread(w, 2, r)) { const y = 90 + r() * 80, sd = 7 + Math.floor(r() * 99); wrap(w, x, 70, X => school(c, X, y, 9, 0.9, 'rgba(25,80,80,0.5)', sd)); }
        const wv = [[2, 12, 0.2], [6, 5, 1]];
        band(c, w, h, 318, wv, '#1d4f52');
        onBand(c, w, 318, wv, 9, r, 50, (x, y, k) => { c.fillStyle = '#1d4f52'; ell(c, x, y + 6, 18 + k * 26, 12 + k * 14); });
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0], [7, 4, 2]];
        band(c, w, h, 366, wv, '#2c5e54');
        onBand(c, w, 366, wv, 9, r, 60, (x, y, k) => {
          if (k < 0.35) {
            c.fillStyle = '#6e5038';
            for (let i = 0; i < 3; i++) { c.save(); c.translate(x - 16 + i * 14, y + 8); c.rotate(-0.35 + i * 0.3 + k); rr(c, -5, -46 + i * 8, 10, 50 - i * 8, 2); c.fill(); c.restore(); }
          } else if (k < 0.6) {
            c.save(); c.translate(x, y + 6); c.scale(2.6, 2.6); Art.decors.wAnchor(c); c.restore();
          } else if (k < 0.8) {
            c.save(); c.translate(x, y + 6); c.scale(2.3, 2.3); Art.decors.wBarrel(c); c.restore();
          } else {
            c.save(); c.translate(x, y + 6); c.scale(2.4, 2.4); Art.decors.wShipWheel(c); c.restore();
          }
          c.strokeStyle = '#3f8a52'; c.lineWidth = 3; c.lineCap = 'round';
          for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + 22 + i * 5, y + 6); for (let j = 1; j <= 7; j++) c.lineTo(x + 22 + i * 5 + Math.sin(j * 0.9 + i) * 4, y + 6 - j * 9); c.stroke(); }
        });
        haze(c, w, h, 'rgba(30,90,90,0.38)');
      },
    }),
    // 3 — Перлинна лагуна
    Object.assign({}, water, {
      name: 'Перлинна лагуна', icon: '🦪',
      sky: ['#b4f4f0', '#9a8ee0'],
      ground: { style: 'sand', body: '#efc0c6', dark: '#dba4ae', top: '#fff2ee', topDark: '#f6d4d4', topLight: 'rgba(255,255,255,0.7)', texture: 'dots' },
      block: { fill: '#6fd0dc', light: '#d6fbff', dark: '#3a9fb0' },
      oneway: { fill: '#ffb0d0', dark: '#d97aa2' },
      bounce: { fill: '#b993ff', dark: '#7c58d0', light: '#ece2ff' },
      enemy: 'wStarWalker', enemyColor: '#ff5f8f', flyer: 'wTang', shooter: 'wClam', projectile: '#ff6fbf',
      decor: ['wPearlClam', 'wScallop', 'wConchShell', 'wSandDollar', 'wStarfishW', 'wSeaGrass'],
      particles: 'bubbles',
      music: { bpm: 88, root: 65, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.35, seed: 56, bell: true },
      skyDraw(c, w, h) {
        glow(c, w * 0.3, -30, 300, 'rgba(255,255,255,0.55)');
        rays(c, w, h, 6, 'rgba(255,255,255,0.25)', 561, 0.85);
        surface(c, w, 12, 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.85)');
      },
      far(c, w, h, r) {
        caustics(c, w, 30, 240, 30, r, 'rgba(255,255,255,0.13)', 2.2);
        const wv = [[2, 22, 0.3], [3, 8, 1.4]];
        band(c, w, h, 296, wv, '#c3a2e0');
        onBand(c, w, 296, wv, 4, r, 80, (x, y, k) => {
          const s = 1.2 + k * 0.8;
          c.fillStyle = '#ad86d6';
          c.beginPath(); c.ellipse(x, y + 4, 34 * s, 12 * s, 0, 0, Math.PI); c.fill();
          c.save(); c.translate(x - 34 * s, y + 2); c.rotate(-0.55);
          c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(34 * s, -30 * s, 68 * s, 0); c.closePath(); c.fill(); c.restore();
          glow(c, x, y - 4 * s, 26 * s, 'rgba(255,255,255,0.7)');
          c.fillStyle = '#fff8ff'; circ(c, x, y - 4 * s, 7 * s);
        });
        band(c, w, h, 326, [[3, 10, 2], [5, 5, 0]], '#cfaee6');
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 1], [6, 5, 0]];
        onBand(c, w, 364, wv, 6, r, 70, (x, y, k) => {
          const s = 0.8 + k * 0.6;
          c.fillStyle = '#b48ad0';
          c.beginPath(); c.moveTo(x - 50 * s, y + 10); c.quadraticCurveTo(x - 46 * s, y - 70 * s, x - 6 * s, y - 80 * s); c.quadraticCurveTo(x + 40 * s, y - 72 * s, x + 50 * s, y + 10); c.fill();
          c.fillStyle = '#c9a2e2'; ell(c, x - 18 * s, y - 56 * s, 14 * s, 8 * s, -0.4);
          c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(x - 30 * s, y - 60 * s); c.quadraticCurveTo(x, y - 30 * s, x + 32 * s, y - 56 * s); c.stroke();
          c.fillStyle = '#ffffff';
          for (let i = 0; i <= 8; i++) { const tt = i / 8; const px = (1 - tt) * (1 - tt) * (x - 30 * s) + 2 * (1 - tt) * tt * x + tt * tt * (x + 32 * s); const py = (1 - tt) * (1 - tt) * (y - 60 * s) + 2 * (1 - tt) * tt * (y - 30 * s) + tt * tt * (y - 56 * s); circ(c, px, py, 2.4); }
        });
        band(c, w, h, 366, wv, '#c095d8');
        onBand(c, w, 366, wv, 12, r, 30, (x, y, k) => {
          c.save(); c.translate(x, y + 5); c.scale(2, 2);
          (k < 0.33 ? Art.decors.wScallop : k < 0.66 ? Art.decors.wConchShell : Art.decors.wSeaGrass)(c, k * 4);
          c.restore();
        });
        haze(c, w, h, 'rgba(150,130,220,0.25)');
      },
    }),
    // 4 — Ліс водоростей
    Object.assign({}, water, {
      name: 'Ліс водоростей', icon: '🌿',
      sky: ['#b8e08a', '#1a5048'],
      ground: { style: 'grass', body: '#6a5c4a', dark: '#56493a', top: '#6db84a', topDark: '#4a9233', topLight: 'rgba(230,255,170,0.35)' },
      block: { fill: '#7d8c7a', light: '#aebda8', dark: '#55634f' },
      oneway: { fill: '#9ccc4a', dark: '#5f8a2a' },
      bounce: { fill: '#ff8f3a', dark: '#c9601a', light: '#ffc188' },
      enemy: 'wCucumber', enemyColor: '#ff6a3a', flyer: 'wOtter', shooter: 'wSnapShrimp', projectile: '#f0fdff',
      decor: ['wKelp', 'wKelp', 'wBubbleRock', 'wUrchin', 'wTurban', 'wSeaGrass'],
      particles: 'bubbles',
      music: { bpm: 84, root: 60, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.35, seed: 57 },
      skyDraw(c, w, h) {
        glow(c, w * 0.45, -40, 320, 'rgba(255,250,190,0.5)');
        rays(c, w, h, 8, 'rgba(255,250,200,0.2)', 571, 0.95);
      },
      far(c, w, h, r) {
        for (const x of spread(w, 18, r, 0.9)) {
          const ht = 260 + r() * 160, ph = r() * 6;
          wrap(w, x, 40, X => kelp(c, X, 448, ht, ph, 'rgba(70,140,90,0.55)', 'rgba(80,150,95,0.5)', null, 3, 0.9));
        }
        const wv = [[2, 14, 0], [5, 6, 1.2]];
        band(c, w, h, 322, wv, '#3a7a5c');
        onBand(c, w, 322, wv, 8, r, 40, (x, y, k) => { c.fillStyle = '#3a7a5c'; ell(c, x, y + 8, 22 + k * 24, 16 + k * 12); });
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 8, r, 0.9)) {
          const ht = 300 + r() * 120, ph = r() * 6;
          wrap(w, x, 60, X => kelp(c, X, 448, ht, ph, '#5e7f2a', '#7a9e34', '#b5b83a', 6, 1.6));
        }
        for (const x of spread(w, 3, r)) { const y = 150 + r() * 120, sd = 3 + Math.floor(r() * 99); wrap(w, x, 60, X => school(c, X, y, 6, 1.2, '#ff8a3a', sd)); }
        const wv = [[3, 10, 0], [8, 4, 1]];
        band(c, w, h, 366, wv, '#4a5e48');
        onBand(c, w, 366, wv, 10, r, 40, (x, y, k) => { c.fillStyle = '#556a52'; c.beginPath(); c.moveTo(x - 24 - k * 20, y + 8); c.lineTo(x - 10, y - 14 - k * 18); c.lineTo(x + 14, y - 10 - k * 12); c.lineTo(x + 26 + k * 16, y + 8); c.fill(); });
        haze(c, w, h, 'rgba(40,110,80,0.35)');
      },
    }),
    // 5 — Царство медуз
    Object.assign({}, water, {
      name: 'Царство медуз', icon: '🪼',
      sky: ['#2a1c6a', '#b2559e'],
      ground: { style: 'coral', body: '#5b3a8c', dark: '#4a2d75', top: '#d9a0ff', topDark: '#a86bd9', topLight: 'rgba(255,225,255,0.55)', texture: 'dots' },
      block: { fill: '#3fc7c0', light: '#a2f6ee', dark: '#1f8a86' },
      oneway: { fill: '#ff9ad5', dark: '#d2609e' },
      bounce: { fill: '#7ff0ff', dark: '#2fb6d0', light: '#dcfcff' },
      enemy: 'wSeahorse', enemyColor: '#ffb347', flyer: 'wJelly', shooter: 'wPuffer', projectile: '#fff2a8',
      decor: ['wSoftCoral', 'wGlowAnemone', 'wBabyJelly', 'wSoftCoral', 'wPearlClam'],
      particles: 'sparkle',
      music: { bpm: 76, root: 64, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 58, bell: true },
      skyDraw(c, w, h) {
        const r = mulberry32(581);
        for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,220,255,${0.1 + r() * 0.3})`; circ(c, r() * w, r() * h * 0.8, 0.8 + r() * 1.5); }
        rays(c, w, h, 4, 'rgba(255,200,255,0.1)', 582, 0.7);
      },
      far(c, w, h, r) {
        const cols = ['255,140,220', '120,240,255', '200,160,255', '255,190,150'];
        for (const x of spread(w, 9, r)) {
          const y = 60 + r() * 200, s = 0.8 + r() * 0.9, col = cols[Math.floor(r() * 4)];
          wrap(w, x, 80, X => bgJelly(c, X, y, s, col, 0.45));
        }
        const wv = [[2, 18, 0.7], [4, 8, 0]];
        band(c, w, h, 318, wv, '#5c2f80');
        onBand(c, w, 318, wv, 10, r, 45, (x, y, k) => { c.fillStyle = '#5c2f80'; circ(c, x, y + 10, 18 + k * 22); });
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [6, 4, 1]];
        band(c, w, h, 364, wv, '#6c3690');
        onBand(c, w, 364, wv, 7, r, 60, (x, y, k) => {
          const s = 2.4 + k * 1.6;
          c.save(); c.translate(x, y + 6); c.scale(s, s); Art.decors.wSoftCoral(c, k * 4); c.restore();
        });
        onBand(c, w, 364, wv, 9, r, 30, (x, y, k) => {
          c.save(); c.translate(x, y + 6); c.scale(2, 2); Art.decors.wGlowAnemone(c, k * 4); c.restore();
        });
        haze(c, w, h, 'rgba(90,40,130,0.3)');
        for (const x of spread(w, 5, r)) { const y = 120 + r() * 140, s = 0.5 + r() * 0.3; wrap(w, x, 30, X => bgJelly(c, X, y, s, '150,230,255', 0.35)); }
      },
    }),
    // 6 — Атлантида
    Object.assign({}, water, {
      name: 'Атлантида', icon: '🏛️',
      sky: ['#1d4c9c', '#071840'],
      ground: { style: 'stone', body: '#4b5f9e', dark: '#3a4c85', top: '#b0c8f0', topDark: '#7f9fd6', topLight: 'rgba(160,255,250,0.55)', texture: 'bricks' },
      block: { fill: '#dfe4f5', light: '#ffffff', dark: '#8e98c4' },
      oneway: { fill: '#6fe8e0', dark: '#2fa8a6' },
      enemy: 'wTurtle', enemyColor: '#3fbf7f', flyer: 'wManta', shooter: 'wFishStatue', projectile: '#7ffcff',
      decor: ['wColumn', 'wGlowColumn', 'wAmphora', 'wTrident', 'wGlowShell'],
      particles: 'sparkle',
      music: { bpm: 80, root: 59, minor: true, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 59, bell: true },
      skyDraw(c, w, h) {
        rays(c, w, h, 6, 'rgba(150,220,255,0.14)', 591, 0.8);
        const r = mulberry32(592);
        for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(160,255,250,${0.15 + r() * 0.35})`; circ(c, r() * w, r() * h * 0.7, 0.8 + r() * 1.2); }
      },
      far(c, w, h, r) {
        const base = 330, col = '#183a7a', win = 'rgba(110,255,240,0.7)';
        const things = [];
        for (const x of spread(w, 9, r, 0.5)) things.push([x, r(), r(), r()]);
        for (const [x, k, k2, k3] of things) wrap(w, x, 90, X => {
          c.fillStyle = col;
          if (k < 0.33) {
            const wd = 70 + k2 * 40, ht = 70 + k3 * 40;
            c.fillRect(X - wd / 2, base - ht, wd, ht);
            tri(c, X - wd / 2 - 8, base - ht, X, base - ht - 30, X + wd / 2 + 8, base - ht);
            c.fillStyle = '#21468c'; for (let i = 0; i < 5; i++) c.fillRect(X - wd / 2 + 6 + i * (wd - 18) / 4, base - ht + 6, 5, ht - 10);
          } else if (k < 0.66) {
            const rad = 30 + k2 * 25;
            c.fillRect(X - rad, base - 60 - k3 * 30, rad * 2, 60 + k3 * 30);
            c.beginPath(); c.arc(X, base - 60 - k3 * 30, rad, Math.PI, 0); c.fill();
            c.fillRect(X - 2, base - 60 - k3 * 30 - rad - 18, 4, 18);
            c.fillStyle = win; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(X - rad * 0.6 + i * rad * 0.6, base - 40, 5, Math.PI, 0); c.fill(); c.fillRect(X - rad * 0.6 + i * rad * 0.6 - 5, base - 40, 10, 12); }
          } else {
            const wd = 26 + k2 * 14, ht = 140 + k3 * 90;
            c.fillRect(X - wd / 2, base - ht, wd, ht);
            tri(c, X - wd / 2 - 4, base - ht, X, base - ht - 26, X + wd / 2 + 4, base - ht);
            c.fillStyle = win; for (let y = base - ht + 16; y < base - 20; y += 26) c.fillRect(X - 3, y, 6, 10);
          }
        });
        glow(c, w * 0.5, 210, 140, 'rgba(110,255,240,0.12)');
        band(c, w, h, base, [[2, 6, 0], [5, 3, 1]], '#142f66');
      },
      mid(c, w, h, r) {
        const wv = [[3, 8, 0], [7, 3, 1]];
        band(c, w, h, 368, wv, '#1f3f82');
        const items = [];
        for (const x of spread(w, 7, r, 0.6)) items.push([x, r(), r()]);
        const glows = [];
        for (const [x, k, k2] of items) wrap(w, x, 90, X => {
          const y = bandY(w, 368, wv, X) + 8;
          if (k < 0.45) {
            column(c, X - 40, y, 150 + k2 * 40, 20, '#4a6cb8', '#37529a', 'rgba(255,255,255,0.15)');
            column(c, X + 40, y, 150 + k2 * 40, 20, '#4a6cb8', '#37529a', 'rgba(255,255,255,0.15)');
            c.fillStyle = '#37529a'; c.fillRect(X - 58, y - 166 - k2 * 40, 116, 12);
            c.fillStyle = '#4a6cb8'; tri(c, X - 60, y - 166 - k2 * 40, X, y - 196 - k2 * 40, X + 60, y - 166 - k2 * 40);
            glows.push(() => { circ(c, X, y - 178 - k2 * 40, 5); for (const cx of [X - 40, X + 40]) { c.fillRect(cx - 1, y - 150 - k2 * 40, 2, 130 + k2 * 40); } });
          } else {
            const ht = 70 + k2 * 70;
            column(c, X, y, ht, 22, '#4a6cb8', '#37529a', 'rgba(255,255,255,0.15)', k2 < 0.5);
            glows.push(() => { c.fillRect(X - 11, y - 40, 22, 3); c.fillRect(X - 1, y - ht + 4, 2, ht - 50); if (k2 >= 0.5) circ(c, X, y - ht - 18, 6); });
          }
        });
        haze(c, w, h, 'rgba(20,50,120,0.3)');
        c.save(); c.shadowColor = '#6ffcff'; c.shadowBlur = 12; c.fillStyle = 'rgba(130,255,250,0.85)';
        glows.forEach(f => f());
        c.restore();
      },
    }),
    // 7 — Льодяний океан
    Object.assign({}, water, {
      name: 'Льодяний океан', icon: '🧊', ice: true,
      sky: ['#d4f0ff', '#1d5a96'],
      ground: { style: 'snow', body: '#5b84ae', dark: '#4a6f96', top: '#f2fbff', topDark: '#cfe6f5' },
      block: { fill: '#a8e2fa', light: '#e8fbff', dark: '#5fb0d8' },
      oneway: { fill: '#e6f7ff', dark: '#8fbfdf' },
      enemy: 'wPenguin', enemyColor: '#26314d', flyer: 'wNarwhal', shooter: 'wWalrus', projectile: '#ffffff',
      decor: ['wIceChunk', 'wIceSpire', 'wSnowCoral', 'wStarfishW', 'wIceChunk'],
      particles: 'bubbles',
      music: { bpm: 86, root: 67, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.35, seed: 60, bell: true },
      skyDraw(c, w, h) {
        rays(c, w, h, 5, 'rgba(255,255,255,0.22)', 601, 0.75);
      },
      far(c, w, h, r) {
        // крижана стеля з бурульками
        const cw = [[3, 8, 0], [7, 4, 1], [11, 3, 2]];
        bandTop(c, w, 34, cw, '#eaf8ff');
        bandTop(c, w, 22, [[4, 5, 1], [9, 3, 0]], '#ffffff');
        for (const x of spread(w, 26, r)) { const l = 10 + r() * 26; wrap(w, x, 10, X => { c.fillStyle = '#eaf8ff'; tri(c, X - 5, bandY(w, 34, cw, X) - 2, X, bandY(w, 34, cw, X) + l, X + 5, bandY(w, 34, cw, X) - 2); }); }
        // світлі ополонки
        for (const x of spread(w, 3, r)) wrap(w, x, 60, X => { glow(c, X, 20, 60, 'rgba(255,255,255,0.8)'); });
        // перевернуті айсберги
        for (const x of spread(w, 4, r)) {
          const wd = 60 + r() * 60, d = 80 + r() * 90;
          wrap(w, x, wd + 20, X => {
            c.fillStyle = 'rgba(190,228,250,0.65)';
            c.beginPath(); c.moveTo(X - wd, 20); c.lineTo(X - wd * 0.6, 20 + d * 0.6); c.lineTo(X - wd * 0.1, 20 + d); c.lineTo(X + wd * 0.5, 20 + d * 0.7); c.lineTo(X + wd, 20); c.closePath(); c.fill();
            c.fillStyle = 'rgba(230,248,255,0.7)'; tri(c, X - wd * 0.6, 20 + d * 0.6, X - wd * 0.1, 20 + d, X - wd * 0.2, 30);
          });
        }
        // тюленята-силуети
        for (const x of spread(w, 3, r)) {
          const y = 170 + r() * 80, s = 0.8 + r() * 0.5;
          wrap(w, x, 40, X => {
            c.fillStyle = 'rgba(60,110,160,0.55)';
            ell(c, X, y, 22 * s, 8 * s, -0.1); circ(c, X + 20 * s, y - 3 * s, 7 * s); tri(c, X - 18 * s, y, X - 30 * s, y - 8 * s, X - 30 * s, y + 6 * s);
          });
        }
        const wv = [[2, 14, 0.4], [5, 6, 1]];
        band(c, w, h, 326, wv, '#4a80b2');
        onBand(c, w, 326, wv, 6, r, 70, (x, y, k) => {
          c.fillStyle = '#5a92c4';
          c.beginPath(); c.moveTo(x - 50 - k * 30, y + 10); c.lineTo(x - 20, y - 40 - k * 50); c.lineTo(x + 10, y - 30 - k * 40); c.lineTo(x + 40 + k * 20, y + 10); c.fill();
        });
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0], [7, 3, 1]];
        onBand(c, w, 368, wv, 5, r, 90, (x, y, k) => {
          const s = 1 + k * 0.7;
          c.fillStyle = '#8cc4e8';
          c.beginPath(); c.moveTo(x - 70 * s, y + 10); c.lineTo(x - 54 * s, y - 50 * s); c.lineTo(x - 18 * s, y - 86 * s); c.lineTo(x + 20 * s, y - 70 * s); c.lineTo(x + 46 * s, y - 34 * s); c.lineTo(x + 70 * s, y + 10); c.closePath(); c.fill();
          c.fillStyle = '#b6def5'; c.beginPath(); c.moveTo(x - 54 * s, y - 50 * s); c.lineTo(x - 18 * s, y - 86 * s); c.lineTo(x - 22 * s, y - 20 * s); c.closePath(); c.fill();
          c.fillStyle = '#6aa8d6'; c.beginPath(); c.moveTo(x + 20 * s, y - 70 * s); c.lineTo(x + 46 * s, y - 34 * s); c.lineTo(x + 10 * s, y - 10 * s); c.closePath(); c.fill();
        });
        band(c, w, h, 368, wv, '#7fb2d8');
        onBand(c, w, 368, wv, 10, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 5); c.scale(2.2, 2.2); (k < 0.5 ? Art.decors.wIceSpire : Art.decors.wSnowCoral)(c, k * 3); c.restore(); });
        for (const x of spread(w, 2, r)) {
          const y = 200 + r() * 60;
          wrap(w, x, 40, X => {
            c.save(); c.translate(X, y); c.rotate(-0.5); c.scale(1.6, 1.6);
            c.fillStyle = 'rgba(50,90,140,0.6)'; ell(c, 0, 0, 12, 5); tri(c, 11, -1.5, 16, 0, 11, 1.5); tri(c, -11, 0, -16, -3, -16, 3); c.restore();
          });
        }
        haze(c, w, h, 'rgba(40,90,150,0.42)');
      },
    }),
    // 8 — Підводний вулкан
    Object.assign({}, water, {
      name: 'Підводний вулкан', icon: '🌋',
      sky: ['#26203e', '#6a2a2a'],
      ground: { style: 'lava', body: '#3b2b33', dark: '#2a1e25', top: '#5e4650', topDark: '#ff6d2a', glow: '#ff7b1a', texture: 'cracks', topLight: 'rgba(255,170,90,0.45)' },
      block: { fill: '#615878', light: '#8e84a8', dark: '#3c3450' },
      oneway: { fill: '#7a5a5a', dark: '#4e3434' },
      enemy: 'wYetiCrab', enemyColor: '#f6f0e6', flyer: 'wFirefish', shooter: 'wVent', projectile: '#ffab40',
      decor: ['wSmoker', 'wBasalt', 'wRiftia', 'wHotRock'],
      particles: 'bubbles', pit: '#ff5a1a',
      music: { bpm: 96, root: 55, minor: true, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.3, seed: 61 },
      skyDraw(c, w, h) {
        const g = c.createLinearGradient(0, h * 0.5, 0, h);
        g.addColorStop(0, 'rgba(255,90,30,0)'); g.addColorStop(1, 'rgba(255,90,30,0.25)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      },
      far(c, w, h, r) {
        const vx = w * 0.5;
        // пухирці й дим з кратера
        c.fillStyle = 'rgba(90,70,90,0.5)';
        for (let i = 0; i < 9; i++) circ(c, vx - 10 + Math.sin(i * 1.7) * 26 + i * 4, 140 - i * 16, 18 + i * 5);
        bubbleCol(c, vx - 20, 140, 0, 611, 'rgba(255,220,200,0.5)');
        bubbleCol(c, vx + 24, 150, 10, 612, 'rgba(255,220,200,0.4)');
        glow(c, vx, 150, 120, 'rgba(255,110,30,0.45)');
        c.fillStyle = '#3a1e26';
        c.beginPath(); c.moveTo(vx - 330, 360); c.lineTo(vx - 60, 150); c.lineTo(vx + 55, 150); c.lineTo(vx + 330, 360); c.fill();
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 18;
        c.fillStyle = '#ff7a1a'; ell(c, vx, 152, 54, 8);
        c.strokeStyle = '#ff8f2a'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(vx - 28, 156); c.quadraticCurveTo(vx - 60, 230, vx - 120, 320); c.stroke();
        c.beginPath(); c.moveTo(vx + 30, 156); c.quadraticCurveTo(vx + 40, 240, vx + 90, 330); c.stroke();
        c.restore();
        c.fillStyle = '#301822';
        for (const [cx, top] of [[0, 240], [w, 240], [w * 0.2, 280], [w * 0.82, 270]]) {
          wrap(w, cx, 190, X => { c.beginPath(); c.moveTo(X - 180, 362); c.lineTo(X - 30, top); c.lineTo(X + 30, top); c.lineTo(X + 180, 362); c.fill(); });
        }
        c.fillRect(0, 356, w, h - 356);
      },
      mid(c, w, h, r) {
        const wv = [[5, 8, 0], [11, 4, 1]];
        const st = [];
        for (const x of spread(w, 6, r, 0.7)) st.push([x, 60 + r() * 90, 14 + r() * 10, Math.floor(r() * 999)]);
        for (const [x, ht, wd, sd] of st) wrap(w, x, 60, X => {
          const y = bandY(w, 366, wv, X) + 8;
          c.fillStyle = 'rgba(70,60,70,0.55)';
          for (let i = 0; i < 6; i++) circ(c, X + Math.sin(i * 1.3 + sd) * 10 + i * 5, y - ht - 10 - i * 22, 9 + i * 4);
          c.fillStyle = '#2c1c24';
          c.beginPath(); c.moveTo(X - wd, y); c.lineTo(X - wd * 0.45, y - ht); c.lineTo(X + wd * 0.45, y - ht); c.lineTo(X + wd, y); c.fill();
          c.fillStyle = '#3a2830'; circ(c, X - wd * 0.4, y - ht * 0.4, wd * 0.3); circ(c, X + wd * 0.3, y - ht * 0.7, wd * 0.25);
          c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 10; c.fillStyle = '#ff8a2a'; ell(c, X, y - ht, wd * 0.4, 2.5); c.restore();
        });
        band(c, w, h, 366, wv, '#24161c');
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.strokeStyle = '#ff7b1a'; c.lineWidth = 2;
        for (const x of spread(w, 9, r)) wrap(w, x, 20, X => {
          const y = bandY(w, 366, wv, X) + 12;
          c.beginPath(); c.moveTo(X, y); c.lineTo(X + 8, y + 10); c.lineTo(X + 3, y + 22); c.stroke();
        });
        c.restore();
        onBand(c, w, 366, wv, 8, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 6); c.scale(2.2, 2.2); (k < 0.5 ? Art.decors.wRiftia : Art.decors.wBasalt)(c, k * 3); c.restore(); });
        haze(c, w, h, 'rgba(60,20,30,0.25)');
      },
    }),
    // 9 — Підводна печера
    Object.assign({}, water, {
      name: 'Підводна печера', icon: '🔦',
      sky: ['#06161c', '#0e3236'],
      ground: { style: 'crystal', body: '#1f3236', dark: '#162629', top: '#33555a', topDark: '#24403f', glow: '#5affd0', texture: 'gems' },
      block: { fill: '#3f6a70', light: '#72a6ac', dark: '#24464a' },
      oneway: { fill: '#4f8a7a', dark: '#2a5a4c' },
      bounce: { fill: '#5affc8', dark: '#1fae86', light: '#c8fff0' },
      enemy: 'wNautilus', enemyColor: '#e05a2e', flyer: 'wGlowJelly', shooter: 'wSquid', projectile: '#d58cff',
      decor: ['wGlowShroom', 'wGlowCoral', 'wCrystalW', 'wGlowShroom', 'wBubbleRock'],
      particles: 'sparkle',
      music: { bpm: 72, root: 57, minor: true, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 62, bell: true },
      skyDraw(c, w, h) {
        glow(c, w * 0.55, h * 0.42, 260, 'rgba(60,200,190,0.18)');
      },
      far(c, w, h, r) {
        const cw = [[3, 16, 0], [7, 8, 1]];
        bandTop(c, w, 54, cw, '#0b2226');
        for (const x of spread(w, 16, r)) { const l = 30 + r() * 80; wrap(w, x, 20, X => { c.fillStyle = '#0b2226'; const y = bandY(w, 54, cw, X) - 4; tri(c, X - 13, y, X, y + l, X + 13, y); }); }
        // світлячкові ниточки
        for (const x of spread(w, 22, r)) {
          const l = 40 + r() * 120, cyan = r() < 0.6;
          wrap(w, x, 10, X => {
            const y0 = bandY(w, 54, cw, X);
            c.strokeStyle = 'rgba(150,255,230,0.25)'; c.lineWidth = 1; line(c, X, y0, X, y0 + l);
            c.save(); c.shadowColor = cyan ? '#5affe0' : '#b6ff6a'; c.shadowBlur = 6; c.fillStyle = cyan ? '#aaffee' : '#d8ffa0';
            for (let y = y0 + 8; y < y0 + l; y += 9) circ(c, X, y, 1.2);
            circ(c, X, y0 + l, 2.2);
            c.restore();
          });
        }
        const wv = [[2, 16, 0], [6, 7, 1]];
        band(c, w, h, 322, wv, '#0f2a2e');
        for (const x of spread(w, 10, r)) { const l = 20 + r() * 50; wrap(w, x, 16, X => { c.fillStyle = '#0f2a2e'; const y = bandY(w, 322, wv, X) + 6; tri(c, X - 12, y, X, y - l, X + 12, y); }); }
      },
      mid(c, w, h, r) {
        const wv = [[4, 9, 0], [9, 4, 2]];
        const pil = [];
        for (const x of spread(w, 4, r, 0.6)) pil.push([x, 30 + r() * 20, r()]);
        for (const [x, wd, k] of pil) wrap(w, x, 70, X => {
          c.fillStyle = '#1a4248';
          c.beginPath(); c.moveTo(X - wd * 1.6, 0); c.quadraticCurveTo(X - wd * 0.3, 160, X - wd * 0.6, 200); c.quadraticCurveTo(X - wd * 0.3, 260, X - wd * 1.7, 400);
          c.lineTo(X + wd * 1.7, 400); c.quadraticCurveTo(X + wd * 0.4, 260, X + wd * 0.6, 200); c.quadraticCurveTo(X + wd * 0.4, 140, X + wd * 1.5, 0); c.closePath(); c.fill();
          c.fillStyle = '#1a3e43'; ell(c, X - wd * 0.3, 120, 4, 30); ell(c, X + wd * 0.2, 290, 5, 26);
          c.save(); c.shadowColor = '#5affd0'; c.shadowBlur = 10;
          for (let i = 0; i < 4; i++) {
            const yy = 150 + i * 46 + k * 20, side = i % 2 ? 1 : -1;
            c.fillStyle = i % 2 ? '#5affc8' : '#7ae0ff';
            c.beginPath(); c.ellipse(X + side * wd * 0.55, yy, 5.5, 3, 0, Math.PI, 0); c.fill();
            c.beginPath(); c.ellipse(X + side * wd * 0.55 + side * 6, yy + 5, 3.5, 2, 0, Math.PI, 0); c.fill();
          }
          c.restore();
        });
        band(c, w, h, 366, wv, '#123034');
        onBand(c, w, 366, wv, 11, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 6); c.scale(2.2, 2.2); (k < 0.5 ? Art.decors.wGlowShroom : Art.decors.wGlowCoral)(c, k * 4); c.restore(); });
      },
    }),
    // 10 — Китова бухта
    Object.assign({}, water, {
      name: 'Китова бухта', icon: '🐋',
      sky: ['#86d6f8', '#1d58a0'],
      ground: { style: 'stone', body: '#8e9aa8', dark: '#76838f', top: '#eadfbc', topDark: '#c9bb94', topLight: 'rgba(255,255,255,0.45)', texture: 'dots' },
      block: { fill: '#4fae9a', light: '#8fdccc', dark: '#2f7a6a' },
      oneway: { fill: '#b08a62', dark: '#76583a' },
      bounce: { fill: '#ff8a7a', dark: '#d0584a', light: '#ffc4b8' },
      enemy: 'wSeal', enemyColor: '#a3b2c2', flyer: 'wDolphin', shooter: 'wConch', projectile: '#ffffff',
      decor: ['wBarnacleRock', 'wSeaGrass', 'wSandDollar', 'wScallop', 'wKelp'],
      particles: 'bubbles',
      music: { bpm: 82, root: 62, minor: false, lead: 'triangle', bass: 'sine', drums: false, rest: 0.35, seed: 63 },
      skyDraw(c, w, h) {
        glow(c, w * 0.7, -30, 280, 'rgba(255,255,230,0.5)');
        rays(c, w, h, 6, 'rgba(255,255,255,0.2)', 631, 0.85);
        surface(c, w, 9, 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)');
      },
      far(c, w, h, r) {
        caustics(c, w, 20, 120, 16, r, 'rgba(255,255,255,0.12)');
        wrap(w, w * 0.3, 240, X => {
          whale(c, X, 196, 1.45, 1, '#5590cc', '#92bde6', '#1e3e6a');
          whale(c, X + 165, 246, 0.6, 1, '#5f9ad2', '#a0c8ec', '#1e3e6a');
        });
        wrap(w, w * 0.8, 140, X => whale(c, X, 118, 0.8, -1, '#5a96d0', '#8ab8e2', '#2a4e7a'));
        bubbleCol(c, w * 0.3 + 70, 140, 30, 633, 'rgba(255,255,255,0.45)');
        for (const x of spread(w, 2, r)) { const y = 270 + r() * 30, sd = 9 + Math.floor(r() * 99); wrap(w, x, 70, X => school(c, X, y, 10, 0.8, 'rgba(40,90,150,0.5)', sd)); }
        const wv = [[2, 16, 0], [5, 7, 1]];
        band(c, w, h, 330, wv, '#2d5f94');
        onBand(c, w, 330, wv, 7, r, 60, (x, y, k) => { c.fillStyle = '#2d5f94'; c.beginPath(); c.moveTo(x - 40 - k * 30, y + 10); c.quadraticCurveTo(x - 20, y - 50 - k * 50, x + 10, y - 40 - k * 40); c.quadraticCurveTo(x + 40, y - 30, x + 50 + k * 20, y + 10); c.fill(); });
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [8, 4, 1]];
        onBand(c, w, 366, wv, 7, r, 70, (x, y, k) => {
          const s = 1 + k;
          c.fillStyle = '#4a6f8e';
          c.beginPath(); c.moveTo(x - 46 * s, y + 10); c.lineTo(x - 36 * s, y - 26 * s); c.lineTo(x - 8 * s, y - 40 * s); c.lineTo(x + 26 * s, y - 30 * s); c.lineTo(x + 46 * s, y + 10); c.fill();
          c.fillStyle = '#5a82a2'; tri(c, x - 36 * s, y - 26 * s, x - 8 * s, y - 40 * s, x - 14 * s, y - 10 * s);
          c.fillStyle = '#d8d2c0';
          for (let i = 0; i < 5; i++) { const bx = x - 26 * s + i * 11 * s, by = y - 18 * s - Math.sin(i * 1.4) * 10 * s; ell(c, bx, by, 3.5, 2.6); }
          c.fillStyle = '#ff8a5a'; c.save(); c.translate(x + 18 * s, y - 20 * s); c.rotate(0.4); star(c, 0, 0, 7, 5, 0.45); c.restore();
        });
        band(c, w, h, 366, wv, '#3a6a8e');
        onBand(c, w, 366, wv, 12, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 6); c.scale(2.2, 2.2); (k < 0.6 ? Art.decors.wSeaGrass : Art.decors.wKelp)(c, k * 4); c.restore(); });
        haze(c, w, h, 'rgba(40,100,160,0.3)');
      },
    }),
    // 11 — Глибоководна западина
    Object.assign({}, water, {
      name: 'Глибоководна западина', icon: '🌑',
      sky: ['#0a0f2c', '#010108'],
      ground: { style: 'crystal', body: '#161a33', dark: '#0f1226', top: '#2e3460', topDark: '#1d2142', glow: '#ff6ae0', texture: 'gems' },
      block: { fill: '#4c52a6', light: '#8088d8', dark: '#2a2e6a' },
      oneway: { fill: '#6a44a0', dark: '#3a2260' },
      bounce: { fill: '#ff6ef0', dark: '#c23ab8', light: '#ffc4f8' },
      enemy: 'wIsopod', enemyColor: '#c8baf0', flyer: 'wLantern', shooter: 'wGardenEel', projectile: '#7cf9ff',
      decor: ['wCrinoid', 'wGlowOrb', 'wRiftia', 'wGlowAnemone'],
      particles: 'sparkle',
      music: { bpm: 70, root: 55, minor: true, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 64, bell: true },
      skyDraw(c, w, h) {
        const r = mulberry32(641);
        for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(200,220,255,${0.08 + r() * 0.3})`; circ(c, r() * w, r() * h, 0.6 + r() * 1.1); }
      },
      far(c, w, h, r) {
        // стіни западини
        for (const [cx, wd] of [[w * 0.12, 120], [w * 0.62, 150]]) wrap(w, cx, wd + 40, X => {
          c.fillStyle = '#0a0e26';
          c.beginPath(); c.moveTo(X - wd, 0);
          for (let y = 0; y <= 448; y += 32) c.lineTo(X - wd * (0.55 + 0.25 * Math.sin(y * 0.03 + cx)), y);
          for (let y = 448; y >= 0; y -= 32) c.lineTo(X + wd * (0.5 + 0.25 * Math.sin(y * 0.025 + 2 + cx)), y);
          c.closePath(); c.fill();
          c.strokeStyle = '#121a3c'; c.lineWidth = 3; for (let y = 30; y < 400; y += 90) line(c, X - wd * 0.1, y, X - wd * 0.05 + 6, y + 50);
        });
        // сифонофори — довгі світні ланцюжки
        for (const x of spread(w, 4, r)) {
          const y0 = 40 + r() * 80, len = 160 + r() * 100, ph = r() * 6, col = r() < 0.5 ? '#7cf9ff' : '#ff8af0';
          wrap(w, x, 60, X => {
            c.save(); c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col;
            for (let i = 0; i < len; i += 7) circ(c, X + Math.sin(i * 0.03 + ph) * 30, y0 + i, 1.6 - i / len * 0.8);
            c.restore();
          });
        }
        for (const x of spread(w, 5, r)) { const y = 60 + r() * 200, s = 0.5 + r() * 0.5; wrap(w, x, 50, X => bgJelly(c, X, y, s, '140,120,255', 0.3)); }
        const wv = [[2, 12, 0], [6, 5, 1]];
        band(c, w, h, 332, wv, '#080b22');
      },
      mid(c, w, h, r) {
        const wv = [[3, 8, 0], [7, 4, 1]];
        band(c, w, h, 368, wv, '#0e1236');
        onBand(c, w, 368, wv, 12, r, 30, (x, y, k) => {
          c.save(); c.translate(x, y + 6); const s = 1.6 + k * 1.1; c.scale(s, s); c.globalAlpha = 0.75;
          (k < 0.5 ? Art.decors.wCrinoid : Art.decors.wGlowOrb)(c, k * 4);
          c.restore();
        });
        for (const x of spread(w, 3, r)) {
          const y = 150 + r() * 120;
          wrap(w, x, 30, X => {
            c.fillStyle = '#141a40'; ell(c, X, y, 16, 11); tri(c, X - 14, y, X - 26, y - 8, X - 26, y + 8);
            c.strokeStyle = '#141a40'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X + 6, y - 10); c.quadraticCurveTo(X + 14, y - 24, X + 22, y - 15); c.stroke();
            glow(c, X + 22, y - 14, 16, 'rgba(255,240,150,0.8)');
            c.fillStyle = '#fff6b0'; circ(c, X + 22, y - 14, 2.4);
            c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) tri(c, X + 8 + i * 2.5, y + 3, X + 9 + i * 2.5, y + 6, X + 10 + i * 2.5, y + 3);
          });
        }
      },
    }),
  ];
})();
