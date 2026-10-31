'use strict';
// КОСМІЧНИЙ пакет (рівні 41–80): 13 космічних світів із низькою гравітацією — високі стрибки!
// Орбіта Землі, пояс астероїдів, кільця Сатурна, бурі Юпітера, льодяна комета, інопланетні джунглі,
// планета кристалів, лавова планета, зоряний корабель, інопланетне місто, сузір'я, чорна діра
// і великий фінал — Бананова галактика.
// Нові вороги й декорації мають префікс «s», щоб не перетинатися з іншими файлами.
(() => {
  const TAU = Math.PI * 2;

  // ---------- маленькі помічники ----------
  function eyes(c, pts, r, look = 1) {
    for (const [x, y] of pts) {
      c.fillStyle = '#fff'; circ(c, x, y, r);
      c.fillStyle = '#1a1a2a'; circ(c, x + look * r * 0.3, y + r * 0.1, r * 0.58);
      c.fillStyle = '#fff'; circ(c, x + look * r * 0.3 + r * 0.25, y - r * 0.22, r * 0.22);
    }
  }
  function smile(c, x, y, r, col = '#3a1a10') {
    c.strokeStyle = col; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r, 0.25, Math.PI - 0.25); c.stroke();
  }
  function ohMouth(c, x, y, rx, ry, rim) {
    c.fillStyle = rim; ell(c, x, y, rx + 1.3, ry + 1.3);
    c.fillStyle = '#3a0d1a'; ell(c, x, y, rx, ry);
    c.fillStyle = '#ff7a9a'; ell(c, x - rx * 0.2, y + ry * 0.45, rx * 0.55, ry * 0.35);
  }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function haze(c, w, y1, col) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = col; c.fillRect(0, 0, w, y1); c.restore();
  }
  function crater(c, x, y, rx, dark, lite) {
    c.fillStyle = lite; ell(c, x, y + 1, rx * 1.12, rx * 0.36);
    c.fillStyle = dark; ell(c, x, y, rx, rx * 0.3);
  }
  // кристал, що росте від основи (x, y) угору
  function gem(c, x, y, wd, ht, col, lean = 0) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - wd / 2, y); c.lineTo(x - wd / 2 + lean * 0.6, y - ht * 0.72); c.lineTo(x + lean, y - ht);
    c.lineTo(x + wd / 2 + lean * 0.6, y - ht * 0.72); c.lineTo(x + wd / 2, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.42)';
    c.beginPath(); c.moveTo(x - wd / 2 + lean * 0.6, y - ht * 0.72); c.lineTo(x + lean, y - ht); c.lineTo(x + lean * 0.4, y); c.lineTo(x - wd / 2, y); c.closePath(); c.fill();
  }
  function helmet(c, x, y, r) {
    c.fillStyle = 'rgba(170,225,255,0.22)'; circ(c, x, y, r);
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, x - r * 0.38, y - r * 0.5, r * 0.32, r * 0.14, -0.6);
  }
  // кругленька кам'яна брила (астероїд)
  function rockBlob(c, x, y, s, col, dark, seed, craters = 2) {
    const r = mulberry32(seed);
    c.beginPath();
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU, rad = s * (0.8 + r() * 0.28);
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad * 0.86);
    }
    c.closePath();
    c.fillStyle = col; c.fill();
    c.save(); c.clip();
    c.fillStyle = dark; circ(c, x + s * 0.45, y + s * 0.5, s * 0.95);
    for (let i = 0; i < craters; i++) {
      const cx = x + (r() - 0.6) * s, cy = y + (r() - 0.6) * s * 0.8, cr = s * (0.12 + r() * 0.14);
      c.fillStyle = dark; circ(c, cx, cy, cr);
      c.fillStyle = 'rgba(255,255,255,0.18)'; circ(c, cx + cr * 0.3, cy + cr * 0.3, cr * 0.6);
    }
    c.restore();
  }
  function planet(c, x, y, R, c1, c2, bands) {
    const g = c.createRadialGradient(x - R * 0.4, y - R * 0.4, R * 0.1, x, y, R);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    c.fillStyle = g; circ(c, x, y, R);
    if (bands) {
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
      for (const [dy, hh, col] of bands) { c.fillStyle = col; c.fillRect(x - R, y + dy * R, R * 2, hh * R); }
      c.restore();
    }
  }
  // половинка кільця: front=true — нижня (передня), інакше задня
  function ringArc(c, x, y, rx, ry, rot, col, lw, front) {
    c.strokeStyle = col; c.lineWidth = lw;
    c.beginPath(); c.ellipse(x, y, rx, ry, rot, front ? 0 : Math.PI, front ? Math.PI : TAU); c.stroke();
  }
  function tStars(c, w, n, r, y0, y1, a = 0.7) {
    for (let i = 0; i < n; i++) {
      const s = r() < 0.12 ? 2.2 : 1 + r();
      const x = r() * (w - s), y = y0 + r() * (y1 - y0);
      c.fillStyle = `rgba(255,255,255,${0.25 + r() * a})`; c.fillRect(x, y, s, s);
    }
  }
  function spiral(c, x, y, R, turns, rot, col, lw, sq = 1) {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath();
    const N = Math.ceil(50 * turns);
    for (let i = 0; i <= N; i++) {
      const k = i / N, a = rot + k * turns * TAU;
      c.lineTo(x + Math.cos(a) * R * k, y + Math.sin(a) * R * k * sq);
    }
    c.stroke();
  }
  function sparkle(c, x, y, r, col) { c.fillStyle = col; star(c, x, y, r, 4, 0.3); }
  // ракета стоїть на (x, y), висота ≈ 42*s
  function rocket(c, x, y, s, body, stripe, fin, flame) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (flame) {
      c.fillStyle = '#ff9100'; tri(c, -4.5, -5, 0, 6 + flame * 6, 4.5, -5);
      c.fillStyle = '#fff59d'; tri(c, -2.2, -5, 0, 1 + flame * 3, 2.2, -5);
    }
    c.fillStyle = fin;
    c.beginPath(); c.moveTo(-6, -17); c.lineTo(-12, -6); c.lineTo(-12, -1); c.lineTo(-6, -6); c.fill();
    c.beginPath(); c.moveTo(6, -17); c.lineTo(12, -6); c.lineTo(12, -1); c.lineTo(6, -6); c.fill();
    c.fillStyle = body;
    c.beginPath(); c.moveTo(-6, -5); c.lineTo(-6, -26); c.quadraticCurveTo(-6, -36, 0, -42); c.quadraticCurveTo(6, -36, 6, -26); c.lineTo(6, -5); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(2, -30, 4, 25);
    c.fillStyle = stripe;
    c.beginPath(); c.moveTo(-4.6, -34); c.quadraticCurveTo(-3, -38.5, 0, -42); c.quadraticCurveTo(3, -38.5, 4.6, -34); c.closePath(); c.fill();
    c.fillRect(-6, -13, 12, 3);
    c.fillStyle = fin; c.fillRect(-1.2, -11, 2.4, 10);
    c.fillStyle = '#455a64'; circ(c, 0, -25, 4.2);
    c.fillStyle = '#81d4fa'; circ(c, 0, -25, 3.1);
    c.fillStyle = 'rgba(255,255,255,0.8)'; circ(c, -1, -26, 1);
    c.restore();
  }
  function firework(c, x, y, R, cols) {
    c.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU, col = cols[i % cols.length];
      c.strokeStyle = col; c.lineWidth = 2.2;
      line(c, x + Math.cos(a) * R * 0.35, y + Math.sin(a) * R * 0.35, x + Math.cos(a) * R * 0.85, y + Math.sin(a) * R * 0.85);
      c.fillStyle = col; circ(c, x + Math.cos(a) * R, y + Math.sin(a) * R, 2.6);
    }
    c.fillStyle = '#fff'; star(c, x, y, R * 0.18, 4, 0.4);
  }
  // великий «космічний» банан (для фону — з відблиском, щоб не плутати з нагородою)
  function bigBanana(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const g = c.createLinearGradient(0, -8, 0, 6);
    g.addColorStop(0, '#fff6a8'); g.addColorStop(1, '#f2b200');
    c.fillStyle = g; c.strokeStyle = '#b07800'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(-10, -5); c.quadraticCurveTo(-2, 9, 10, -6); c.quadraticCurveTo(0, 2, -10, -5); c.fill(); c.stroke();
    c.fillStyle = '#6b4a1a'; circ(c, -10, -5, 1.1); circ(c, 10, -6, 1.1);
    c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -3, 1.6, 3, 0.8, 0.4);
    c.restore();
  }
  function bolt(c, x, y, s) {
    c.save(); c.shadowColor = '#fff59d'; c.shadowBlur = 10; c.fillStyle = '#ffee58';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 7 * s, y + 14 * s); c.lineTo(x - 1 * s, y + 13 * s); c.lineTo(x - 6 * s, y + 28 * s);
    c.lineTo(x + 7 * s, y + 9 * s); c.lineTo(x + 1 * s, y + 10 * s); c.lineTo(x + 5 * s, y); c.closePath(); c.fill();
    c.restore();
  }
  function jellyfish(c, t, col, lite) {
    const p = Math.sin(t * 4);
    c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      c.beginPath(); c.moveTo(i * 3.6, 2);
      for (let k = 1; k <= 4; k++) c.lineTo(i * 3.6 - k * 1.6 + Math.sin(t * 6 + k + i) * 2, 2 + k * 3.6);
      c.stroke();
    }
    glow(c, 0, -3, 24, lite.replace('A', 0.35));
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-12, 3); c.quadraticCurveTo(-13, -12 - p, 0, -12 - p); c.quadraticCurveTo(13, -12 - p, 12, 3);
    c.quadraticCurveTo(6, 5.5, 0, 3); c.quadraticCurveTo(-6, 5.5, -12, 3); c.fill();
    c.fillStyle = lite.replace('A', 0.75); ell(c, -4, -7 - p * 0.5, 4, 2.4, -0.4);
    c.fillStyle = 'rgba(255,255,255,0.5)'; circ(c, -7, -2, 1.2); circ(c, 9, -6, 1);
    eyes(c, [[2, -3], [7.5, -3]], 2.4);
    smile(c, 5, 0.5, 1.6, '#3a0a3a');
  }
  function miniUfo(c, t, body, pilot, ring) {
    const b = Math.sin(t * 3) * 1;
    c.save(); c.translate(0, b);
    if (ring) ringArc(c, 0, 0, 20, 5, 0, ring, 2, false);
    c.fillStyle = 'rgba(200,240,255,0.45)'; c.beginPath(); c.arc(0, -3, 8.5, Math.PI, 0); c.fill();
    c.fillStyle = pilot; circ(c, 1.5, -4.5, 4.4);
    c.strokeStyle = pilot; c.lineWidth = 1.2; line(c, 1, -8, 2, -11); c.fillStyle = '#ff4081'; circ(c, 2, -11.5, 1.3);
    eyes(c, [[1.5, -5], [4.8, -5]], 1.5);
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -3, 8.5, Math.PI, 0); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, -4, -8, 2.5, 1.2, -0.5);
    c.fillStyle = body; ell(c, 0, 0, 16, 5.5);
    c.fillStyle = Art.shade(body, 40); ell(c, 0, -1.5, 13, 2);
    c.fillStyle = Art.shade(body, -45); ell(c, 0, 3, 9, 2.6);
    for (let i = 0; i < 5; i++) { c.fillStyle = (Math.floor(t * 6) + i) % 2 ? '#ffeb3b' : '#ff4081'; circ(c, -11 + i * 5.5, 0.8, 1.6); }
    if (ring) ringArc(c, 0, 0, 20, 5, 0, ring, 2, true);
    c.restore();
  }
  function satellite(c, x, y, s, rot, panel, body) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.strokeStyle = '#9aa7b6'; c.lineWidth = 2; line(c, -34, 0, 34, 0);
    for (const d of [-1, 1]) {
      c.fillStyle = panel; c.fillRect(d > 0 ? 12 : -36, -9, 24, 18);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1;
      for (let i = 1; i < 4; i++) line(c, (d > 0 ? 12 : -36) + i * 6, -9, (d > 0 ? 12 : -36) + i * 6, 9);
      line(c, d > 0 ? 12 : -36, 0, d > 0 ? 36 : -12, 0);
    }
    c.fillStyle = body; rr(c, -9, -10, 18, 20, 3); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(2, -10, 7, 20);
    c.fillStyle = '#eceff1'; c.beginPath(); c.ellipse(0, -14, 8, 3, 0, Math.PI, 0); c.fill();
    c.strokeStyle = '#eceff1'; c.lineWidth = 1.5; line(c, 0, -14, 0, -20);
    c.fillStyle = '#ff5252'; circ(c, 0, -21, 1.8);
    c.restore();
  }
  function cloudLump(c, x, y, s, col, lite) {
    c.fillStyle = col;
    circ(c, x - 18 * s, y, 13 * s); circ(c, x, y - 9 * s, 18 * s); circ(c, x + 19 * s, y - 2 * s, 14 * s);
    ell(c, x, y + 4 * s, 34 * s, 10 * s);
    if (lite) { c.fillStyle = lite; circ(c, x - 6 * s, y - 16 * s, 7 * s); circ(c, x + 14 * s, y - 9 * s, 5 * s); }
  }

  // =================== Вороги ===================
  Object.assign(Art.enemies, {
    // --- ходячі (низ по центру, дивляться у +x) ---
    sAstroCat(c, t, col) {
      col = col || '#ff9f43';
      const s = Math.sin(t * 12) * 2.2;
      c.lineCap = 'round';
      c.strokeStyle = Art.shade(col, -30); c.lineWidth = 3.4;
      c.beginPath(); c.moveTo(-8, -9); c.quadraticCurveTo(-18, -9 + s * 0.4, -15, -20 - s * 0.5); c.stroke();
      c.fillStyle = '#78909c';
      rr(c, -8 + s, -6, 7, 6, 2.5); c.fill(); rr(c, 1 - s, -6, 7, 6, 2.5); c.fill();
      c.fillStyle = '#f4f7fb'; rr(c, -9, -17, 18, 13, 5); c.fill();
      c.fillStyle = '#cfd8e3'; c.fillRect(-9, -8, 18, 2);
      c.fillStyle = '#4fc3f7'; rr(c, 1, -14, 6, 4, 1); c.fill();
      c.fillStyle = '#ff5252'; circ(c, -3, -12, 1.4);
      c.fillStyle = col;
      tri(c, -2.5, -24, -1, -31.5, 4, -27); tri(c, 5, -27, 10, -31.5, 10, -23);
      circ(c, 3.5, -22, 7.5);
      c.fillStyle = '#ffc9d6'; tri(c, -1, -26, -0.6, -29.5, 2, -27.5);
      c.fillStyle = '#fff1e0'; ell(c, 7.5, -19, 4, 3);
      eyes(c, [[3.5, -23.5], [8.5, -23.5]], 2.3);
      c.fillStyle = '#ff6f91'; circ(c, 10.6, -20.3, 1.1);
      c.strokeStyle = 'rgba(80,40,20,0.6)'; c.lineWidth = 0.8;
      line(c, 10, -19, 14.5, -20); line(c, 10, -18, 14.5, -17);
      helmet(c, 3.5, -22.5, 11);
    },
    sSpaceSlug(c, t, col) {
      col = col || '#7cf0c8';
      const w = Math.sin(t * 6), dk = Art.shade(col, -60);
      const g = c.createLinearGradient(0, -16, 0, 0);
      g.addColorStop(0, Art.shade(col, 30)); g.addColorStop(1, dk);
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-14, 0); c.lineTo(12, 0); c.quadraticCurveTo(17, 0, 15, -7); c.quadraticCurveTo(13, -16, 5, -16);
      c.quadraticCurveTo(-1, -15 + w, -5, -9); c.quadraticCurveTo(-10, -4 - w, -14, 0); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, 0, -1.5, 13, 1.6);
      c.save(); c.shadowColor = '#fff59d'; c.shadowBlur = 6; c.fillStyle = '#fff59d';
      circ(c, -9, -3.5, 1.5); circ(c, -4, -7.5, 1.4); circ(c, 2, -11, 1.8); c.restore();
      c.strokeStyle = col; c.lineWidth = 2.2; c.lineCap = 'round';
      line(c, 7, -14, 6 + w, -23); line(c, 11, -14, 13 + w * 0.7, -22);
      eyes(c, [[6 + w, -24], [13 + w * 0.7, -23]], 2.7);
      smile(c, 11.5, -8, 2.2, '#123d33');
      c.fillStyle = 'rgba(255,120,160,0.6)'; circ(c, 14.5, -5.5, 1.4);
    },
    sRingling(c, t, col) {
      col = col || '#4fc3f7';
      const s = Math.sin(t * 12) * 2, tilt = 0.28 + Math.sin(t * 2) * 0.08;
      c.fillStyle = Art.shade(col, -70);
      rr(c, -7 + s, -6, 5, 6, 2); c.fill(); rr(c, 2 - s, -6, 5, 6, 2); c.fill();
      ringArc(c, 0, -15, 17, 5, tilt, '#ffd98a', 3, false);
      planet(c, 0, -15, 10, Art.shade(col, 60), Art.shade(col, -40), [[-0.5, 0.16, 'rgba(255,255,255,0.28)'], [0.35, 0.18, 'rgba(0,0,60,0.18)']]);
      eyes(c, [[2, -17.5], [7, -17.5]], 2.6);
      smile(c, 4.5, -13.5, 2.2, '#10233a');
      ringArc(c, 0, -15, 17, 5, tilt, '#ffbf47', 3, true);
    },
    sCloudPuff(c, t, col) {
      col = col || '#7e6fa8';
      const b = Math.abs(Math.sin(t * 8)) * 2, s = Math.sin(t * 12) * 2;
      c.fillStyle = Art.shade(col, -50);
      rr(c, -7 + s, -5, 5, 5, 2); c.fill(); rr(c, 3 - s, -5, 5, 5, 2); c.fill();
      c.fillStyle = '#ffee58';
      c.beginPath(); c.moveTo(-9, -19 - b); c.lineTo(-15, -11 - b); c.lineTo(-11, -11 - b); c.lineTo(-14, -4 - b); c.lineTo(-7, -13 - b); c.lineTo(-10, -13 - b); c.closePath(); c.fill();
      c.fillStyle = col;
      circ(c, -8, -10 - b, 6.5); circ(c, 8, -10 - b, 6.5); circ(c, -2, -16 - b, 8); circ(c, 5, -17 - b, 6.5); ell(c, 0, -8 - b, 13, 5);
      c.fillStyle = Art.shade(col, 45); circ(c, -4, -19 - b, 3.5); circ(c, 3, -20.5 - b, 2.5);
      eyes(c, [[2, -13 - b], [8, -13 - b]], 2.6);
      c.fillStyle = 'rgba(255,140,170,0.65)'; circ(c, -0.5, -9 - b, 1.6); circ(c, 11, -9 - b, 1.6);
      smile(c, 5.5, -10 - b, 2, '#1e1438');
    },
    sAstroPenguin(c, t, col) {
      col = col || '#37474f';
      const s = Math.sin(t * 10);
      c.save(); c.rotate(s * 0.07);
      c.fillStyle = '#ff9800';
      ell(c, -4 - s * 1.5, -1.5, 4.5, 2); ell(c, 5 + s * 1.5, -1.5, 4.5, 2);
      c.fillStyle = '#b0bec5'; rr(c, -14, -20, 6, 13, 2); c.fill();
      c.fillStyle = '#ff5252'; c.fillRect(-13, -10, 4, 2);
      c.fillStyle = '#ffab40'; tri(c, -13, -7, -11, -3 + Math.abs(s) * 2, -9, -7);
      c.fillStyle = col; ell(c, 0, -12, 10, 12);
      c.fillStyle = '#fafafa'; ell(c, 3, -10, 6.5, 9);
      c.fillStyle = Art.shade(col, -20); ell(c, -6, -11, 3, 7, 0.35);
      eyes(c, [[3, -17], [8, -17]], 2.4);
      c.fillStyle = '#ffa726'; tri(c, 7, -14.5, 14, -13, 7, -11.5);
      c.fillStyle = 'rgba(255,120,150,0.55)'; circ(c, 9, -10.5, 1.4);
      c.restore();
      helmet(c, 2, -16, 10.5);
    },
    sTriEye(c, t, col) {
      col = col || '#c6ff00';
      const j = Math.sin(t * 7);
      c.strokeStyle = Art.shade(col, -70); c.lineWidth = 2.2; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const lx = -9 + i * 6; line(c, lx, -5, lx + Math.sin(t * 14 + i * 1.7) * 2.5, 0); }
      const g = c.createLinearGradient(0, -24, 0, -2);
      g.addColorStop(0, Art.shade(col, 30)); g.addColorStop(1, Art.shade(col, -45));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-12, -4); c.quadraticCurveTo(-14, -22 + j, 0, -22 + j); c.quadraticCurveTo(14, -22 + j, 13, -4); c.closePath(); c.fill();
      c.fillStyle = Art.shade(col, -40); circ(c, -7, -9, 1.8); circ(c, -4, -14 + j, 1.3); circ(c, -9, -14, 1);
      c.strokeStyle = Art.shade(col, -45); c.lineWidth = 1.5; line(c, 1, -21 + j, -2, -29 + j);
      c.fillStyle = '#ff4fd8'; circ(c, -2, -30 + j, 2.2);
      eyes(c, [[1.5, -15 + j], [6.5, -18.5 + j], [10, -13 + j]], 2.4);
      smile(c, 6.5, -9 + j, 2.2, '#1b3a00');
    },
    sCrystalCrab(c, t, col) {
      col = col || '#ffb74d';
      c.strokeStyle = '#5e35b1'; c.lineWidth = 2; c.lineCap = 'round';
      for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) line(c, sd * (4 + i * 3), -5, sd * (9 + i * 3), Math.sin(t * 14 + i + sd) * 1.5);
      c.fillStyle = '#7e57c2'; ell(c, 0, -9, 12, 7);
      gem(c, -7, -12, 6, 11, col, -1); gem(c, -1, -13, 7, 15, Art.shade(col, 30), 0); gem(c, 4, -12, 5, 9, col, 1);
      const snap = Math.abs(Math.sin(t * 6)) * 0.5;
      c.fillStyle = '#9575cd';
      circ(c, -13, -9, 3.5);
      c.save(); c.translate(14, -10); c.rotate(-snap); circ(c, 0, 0, 5); c.fillStyle = '#ede7f6'; tri(c, 1, -1, 7, -4, 7, 2); c.restore();
      c.strokeStyle = '#7e57c2'; c.lineWidth = 2; line(c, 6, -12, 7, -20); line(c, 10, -11, 12, -19);
      eyes(c, [[7, -21], [12.5, -20]], 2.7);
      smile(c, 8, -6.5, 2, '#2a1250');
    },
    sLavaBlob(c, t, col) {
      col = col || '#ffab40';
      const j = Math.sin(t * 7), sq = 1 + j * 0.05;
      c.save(); c.scale(1 / sq, sq);
      glow(c, 0, -10, 22, 'rgba(255,120,0,0.35)');
      const g = c.createLinearGradient(0, -25, 0, 0);
      g.addColorStop(0, '#fff176'); g.addColorStop(0.45, col); g.addColorStop(1, '#e64a19');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(-15, -14, -6, -20); c.quadraticCurveTo(-2, -27, 3, -21);
      c.quadraticCurveTo(6, -26, 8, -19); c.quadraticCurveTo(15, -12, 13, 0); c.closePath(); c.fill();
      c.fillStyle = '#4e342e'; ell(c, -7, -5, 3.5, 2, 0.2); ell(c, -10, -12, 2.4, 1.6, -0.5); ell(c, 1, -3, 2.5, 1.4);
      eyes(c, [[3, -13], [9, -13]], 2.7);
      c.fillStyle = '#7a1f00'; c.beginPath(); c.ellipse(6.5, -8, 2.6, 1.8, 0, 0, Math.PI); c.fill();
      c.restore();
    },
    sRoboDog(c, t, col) {
      col = col || '#26c6da';
      const s = Math.sin(t * 14) * 2.2, dk = Art.shade(col, -60);
      c.fillStyle = '#546e7a';
      for (const [lx, p] of [[-10, 1], [-5, -1], [3, -1], [8, 1]]) { rr(c, lx + s * p * 0.6, -7, 3.5, 7, 1.5); c.fill(); }
      c.strokeStyle = '#78909c'; c.lineWidth = 1.6; c.lineCap = 'round'; line(c, -11, -14, -16, -21 - s * 0.6);
      c.fillStyle = Math.sin(t * 5) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, -16, -22 - s * 0.6, 2);
      c.fillStyle = col; rr(c, -12, -17, 19, 11, 4); c.fill();
      c.fillStyle = Art.shade(col, 40); c.fillRect(-9, -15.5, 13, 2.5);
      c.fillStyle = dk; circ(c, -7, -10.5, 1.4); circ(c, -2, -10.5, 1.4);
      c.fillStyle = col; rr(c, 3, -26, 13, 12, 4); c.fill();
      c.fillStyle = dk; rr(c, 3.5, -31, 4, 8, 2); c.fill();
      c.fillStyle = '#0f2a33'; rr(c, 6, -24, 9, 6, 2); c.fill();
      c.fillStyle = '#69f0ae'; circ(c, 9, -21, 1.6); circ(c, 13, -21, 1.6);
      c.fillStyle = '#263238'; rr(c, 14, -17, 4, 3, 1.5); c.fill();
      c.fillStyle = '#ff8fab'; rr(c, 11.5, -14.5, 3, 3.5, 1.4); c.fill();
    },
    sGreenie(c, t, col) {
      col = col || '#76ff03';
      const s = Math.sin(t * 12) * 2.2, dk = Art.shade(col, -90);
      c.fillStyle = '#5e35b1';
      rr(c, -6 + s, -4, 6, 4, 2); c.fill(); rr(c, 1 - s, -4, 6, 4, 2); c.fill();
      c.fillStyle = col; c.fillRect(-4 + s * 0.6, -8, 3, 5); c.fillRect(2 - s * 0.6, -8, 3, 5);
      c.fillStyle = '#7e57c2'; rr(c, -6, -15, 12, 8, 3); c.fill();
      c.fillStyle = '#ffeb3b'; star(c, 0, -11, 2.4, 5, 0.45);
      c.strokeStyle = col; c.lineWidth = 2.4; c.lineCap = 'round'; line(c, 5, -13, 10, -11 + s);
      c.fillStyle = col; ell(c, 2, -21, 9.5, 7.5);
      c.strokeStyle = col; c.lineWidth = 1.6; line(c, -2, -27, -5, -32); line(c, 5, -28, 8, -33);
      c.fillStyle = '#ff4fd8'; circ(c, -5, -33, 2); circ(c, 8, -34, 2);
      c.fillStyle = '#1a1a2a'; ell(c, 3, -22, 2.6, 3.4, 0.2); ell(c, 8.7, -22, 2.2, 3.2, -0.2);
      c.fillStyle = '#fff'; circ(c, 3.8, -23.4, 1); circ(c, 9.3, -23.4, 0.9);
      smile(c, 6.5, -18.5, 2, dk);
    },
    sStarPal(c, t, col) {
      col = col || '#ffb74d';
      const s = Math.sin(t * 12) * 2.2, rot = Math.sin(t * 6) * 0.08;
      c.fillStyle = Art.shade(col, -60);
      rr(c, -6 + s, -6, 4, 6, 2); c.fill(); rr(c, 2 - s, -6, 4, 6, 2); c.fill();
      c.save(); c.translate(0, -16); c.rotate(rot);
      glow(c, 0, 0, 22, 'rgba(255,230,150,0.35)');
      c.fillStyle = Art.shade(col, -35); star(c, 0, 0.8, 13.5, 5, 0.5);
      c.fillStyle = col; star(c, 0, 0, 13, 5, 0.5);
      c.fillStyle = Art.shade(col, 45); star(c, -1, -1, 6, 5, 0.5);
      eyes(c, [[1, -1], [6, -1]], 2.3);
      smile(c, 3.5, 2.5, 2, '#5a2a00');
      c.fillStyle = 'rgba(255,90,120,0.55)'; circ(c, -1.5, 3.2, 1.4); circ(c, 8.5, 3.2, 1.4);
      c.restore();
    },
    sVoidPuff(c, t, col) {
      col = col || '#b388ff';
      const b = Math.sin(t * 6) * 1.2, s = Math.sin(t * 12) * 2;
      c.fillStyle = '#4a2a85';
      rr(c, -7 + s, -5, 5, 5, 2); c.fill(); rr(c, 2 - s, -5, 5, 5, 2); c.fill();
      c.fillStyle = col;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * 0.6; circ(c, Math.cos(a) * 9, -14 + b + Math.sin(a) * 8, 4.6); }
      const g = c.createRadialGradient(0, -14 + b, 1, 0, -14 + b, 11);
      g.addColorStop(0, '#2a0f4f'); g.addColorStop(1, Art.shade(col, -60));
      c.fillStyle = g; circ(c, 0, -14 + b, 9.5);
      spiral(c, -3, -11 + b, 5, 1.6, t * 2, 'rgba(255,140,230,0.85)', 1.2);
      eyes(c, [[2, -16 + b], [7, -16 + b]], 2.8);
      sparkle(c, -5, -19 + b, 1.8, '#fff');
      smile(c, 5, -11.5 + b, 2, '#ffd1f5');
    },
    sMonkeyNaut(c, t, col) {
      col = col || '#8d5524';
      const s = Math.sin(t * 12) * 2.2;
      c.strokeStyle = col; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-7, -9); c.bezierCurveTo(-17, -8, -16, -21, -11, -21 + s * 0.4); c.stroke();
      c.fillStyle = '#eceff1';
      rr(c, -7 + s, -5, 6, 5, 2); c.fill(); rr(c, 1 - s, -5, 6, 5, 2); c.fill();
      c.fillStyle = '#4dd0e1'; rr(c, -8, -16, 16, 12, 5); c.fill();
      c.fillStyle = '#ff4081'; c.fillRect(-8, -8, 16, 2);
      c.fillStyle = '#fff'; circ(c, 2, -12, 2.8);
      Art.banana(c, 2, -12, 0, 0.22);
      c.fillStyle = col; circ(c, -3.5, -22, 2.8); circ(c, 3, -22, 7);
      c.fillStyle = '#f3cfa0'; ell(c, 6, -21, 4.6, 4.4); circ(c, -3.5, -22, 1.4);
      eyes(c, [[4.5, -23], [8.5, -23]], 2);
      smile(c, 7, -19.5, 1.8, '#5d3a1a');
      helmet(c, 3, -22, 10.5);
    },

    // --- стрільці (стоять на місці, «рот» на +x на висоті ≈ -14) ---
    sDishTurret(c, t, col) {
      col = col || '#4fc3f7';
      const p = (Math.sin(t * 4) + 1) / 2;
      c.fillStyle = '#546e7a'; rr(c, -13, -5, 24, 5, 2.5); c.fill();
      c.fillStyle = '#78909c'; for (let i = 0; i < 4; i++) circ(c, -9 + i * 6, -2.5, 1.6);
      c.fillStyle = '#eceff1'; rr(c, -10, -16, 18, 12, 5); c.fill();
      c.fillStyle = '#cfd8dc'; c.fillRect(-10, -7, 18, 2);
      eyes(c, [[-1, -11], [4, -11]], 2.3);
      c.strokeStyle = '#90a4ae'; c.lineWidth = 2.5; c.lineCap = 'round'; line(c, -2, -16, -2, -21);
      c.save(); c.translate(-2, -23); c.rotate(-0.25 + Math.sin(t * 1.5) * 0.08);
      c.fillStyle = '#b0bec5'; ell(c, 0, 0, 5, 8.5);
      c.fillStyle = '#f5f7fa'; ell(c, 1.6, 0, 3.6, 7.5);
      c.strokeStyle = '#90a4ae'; c.lineWidth = 1.4; line(c, 1, 0, 8, 0);
      c.fillStyle = col; circ(c, 8.5, 0, 1.6);
      c.restore();
      c.fillStyle = '#90a4ae'; rr(c, 6, -16, 8, 5, 2); c.fill();
      glow(c, 15, -14, 7 + p * 4, 'rgba(255,255,255,0.6)');
      c.fillStyle = col; circ(c, 14.5, -13.5, 2.4 + p * 0.8);
    },
    sCuteTurret(c, t, col) {
      col = col || '#ff7043';
      const p = (Math.sin(t * 5) + 1) / 2, dk = Art.shade(col, -55);
      c.fillStyle = '#37474f'; rr(c, -13, -6, 25, 6, 3); c.fill();
      c.fillStyle = '#78909c'; for (let i = 0; i < 4; i++) circ(c, -9 + i * 6, -3, 1.9);
      c.fillStyle = '#90a4ae'; rr(c, 6, -17, 11, 6, 2); c.fill();
      c.fillStyle = dk; c.fillRect(15, -18, 2.5, 8);
      c.fillStyle = col; c.beginPath(); c.arc(0, -6, 12, Math.PI, 0); c.fill();
      c.fillStyle = Art.shade(col, 40); ell(c, -4, -14, 4, 2, -0.4);
      c.fillStyle = '#fff'; circ(c, 3, -11, 4.6);
      c.fillStyle = '#1a1a2a'; circ(c, 4.4, -11, 2.6);
      c.fillStyle = '#fff'; circ(c, 5.2, -12, 0.9);
      c.strokeStyle = '#78909c'; c.lineWidth = 1.5; line(c, -3, -17, -5, -23);
      c.fillStyle = p > 0.5 ? '#ffeb3b' : '#69f0ae'; circ(c, -5, -24, 2);
      c.fillStyle = `rgba(255,255,255,${0.3 + p * 0.5})`; circ(c, 17, -14, 1.6);
    },
    sRockSpitter(c, t, col) {
      col = col || '#7cf0c8';
      const p = (Math.sin(t * 3.5) + 1) / 2;
      rockBlob(c, 0, -13, 13, '#8f7b6e', '#6d5a50', 7, 1);
      gem(c, -7, -20, 5, 9, col, -1); gem(c, -2, -22, 4, 7, Art.shade(col, 30), 1);
      eyes(c, [[1, -17], [6.5, -17]], 2.6);
      ohMouth(c, 10.5, -12.5, 2.4 + p * 0.8, 2.6 + p * 0.8, '#6d5a50');
      c.fillStyle = 'rgba(255,130,150,0.5)'; circ(c, 3, -10, 1.8);
    },
    sStormCloud(c, t, col) {
      const p = (Math.sin(t * 3.5) + 1) / 2, b = Math.sin(t * 2) * 1;
      c.fillStyle = '#4b4570';
      circ(c, -9, -8 + b, 7); circ(c, 9, -8 + b, 7); circ(c, -3, -16 + b, 9); circ(c, 6, -15 + b, 7); ell(c, 0, -5 + b, 14, 5);
      c.fillStyle = '#6d669c'; circ(c, -5, -19 + b, 4); circ(c, 3, -20 + b, 3);
      c.fillStyle = '#ffee58'; c.beginPath(); c.moveTo(-4, -3 + b); c.lineTo(-7, 2); c.lineTo(-4.5, 1); c.lineTo(-6, 5); c.lineTo(-1.5, 0); c.lineTo(-4, 0.5); c.closePath(); c.fill();
      eyes(c, [[1, -15 + b], [6, -15 + b]], 2.4);
      c.fillStyle = 'rgba(255,150,190,0.55)'; circ(c, 7, -11 + b, 2 + p);
      ohMouth(c, 12.5, -13 + b * 0.5, 2 + p, 2.2 + p, '#4b4570');
    },
    sIceFlower(c, t, col) {
      const p = (Math.sin(t * 3.5) + 1) / 2, sw = Math.sin(t * 2) * 0.05;
      c.fillStyle = '#b3e5fc'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-6, -5); c.lineTo(6, -5); c.lineTo(9, 0); c.fill();
      c.strokeStyle = '#4fb3d9'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-3, -9, 0, -12); c.stroke();
      c.fillStyle = '#7fd3f0'; ell(c, -5, -7, 4, 1.8, 0.5); ell(c, 5, -8, 4, 1.8, -0.5);
      c.save(); c.translate(1, -16); c.rotate(sw);
      c.fillStyle = '#e1f5fe';
      for (let i = 0; i < 6; i++) { const a = Math.PI * 0.55 + i * 0.32; tri(c, Math.cos(a) * 4, Math.sin(a) * 4, Math.cos(a + 0.16) * 13, Math.sin(a + 0.16) * 13, Math.cos(a + 0.32) * 4, Math.sin(a + 0.32) * 4); }
      c.fillStyle = '#a6e3ff'; ell(c, 1, 0, 9, 8);
      c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -2, -4, 3.5, 1.8, -0.4);
      eyes(c, [[0, -2.5], [5, -2.5]], 2.2);
      ohMouth(c, 8.5, 2.5, 1.8 + p * 0.8, 2 + p * 0.8, '#4fb3d9');
      c.restore();
    },
    sSpitPlant(c, t, col) {
      col = col || '#ff4fd8';
      const p = (Math.sin(t * 3.5) + 1) / 2, sw = Math.sin(t * 2.2) * 0.06;
      c.fillStyle = '#5b2a86'; c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(0, -6, 10, 0); c.fill();
      c.strokeStyle = '#26a69a'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-1, -1); c.quadraticCurveTo(-6, -8, -2, -12); c.stroke();
      c.fillStyle = '#4db6ac'; ell(c, -7, -5, 5, 2, 0.6); ell(c, 5, -4, 5, 2, -0.5);
      c.save(); c.translate(1, -16); c.rotate(sw);
      c.fillStyle = '#7b1fa2'; ell(c, -1, 0, 9.5, 8.5);
      c.fillStyle = '#ab47bc'; ell(c, -2, -1.5, 7.5, 6);
      c.fillStyle = '#ffeb3b'; circ(c, -6, 1, 1.4); circ(c, -3, 4, 1.1); circ(c, -7, -4, 1);
      c.fillStyle = col; ell(c, 8, -2.6 - p, 4.5, 2.2, -0.2); ell(c, 8, 2.6 + p, 4.5, 2.2, 0.2);
      c.fillStyle = '#3a0d1a'; ell(c, 9, 0, 2.6, 1.2 + p * 1.6);
      c.strokeStyle = '#ab47bc'; c.lineWidth = 1.6; line(c, 0, -7, -1, -12); line(c, 4, -6, 6, -11);
      eyes(c, [[-1, -13], [6, -12]], 2.3);
      c.restore();
    },
    sGemSpitter(c, t, col) {
      col = col || '#ff4fd8';
      const p = (Math.sin(t * 3.5) + 1) / 2;
      c.save(); c.shadowColor = col; c.shadowBlur = 8;
      gem(c, -6, -17, 6, 12, col, -2); gem(c, 0, -18, 7, 15, Art.shade(col, 35), 0); gem(c, 5, -17, 5, 9, col, 2);
      c.restore();
      c.fillStyle = '#6a5a8a';
      c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(-15, -18, 0, -19); c.quadraticCurveTo(15, -18, 13, 0); c.closePath(); c.fill();
      c.fillStyle = '#857aa8'; ell(c, -5, -14, 5, 2.4, -0.3);
      c.fillStyle = '#54476e'; circ(c, -8, -5, 1.6); circ(c, -3, -3, 1);
      eyes(c, [[0, -12], [5.5, -12]], 2.5);
      ohMouth(c, 10.5, -7, 2 + p * 0.8, 2.2 + p * 0.8, '#54476e');
    },
    sMagmaVent(c, t, col) {
      const p = (Math.sin(t * 4) + 1) / 2;
      glow(c, 0, -22, 14 + p * 4, 'rgba(255,140,0,0.45)');
      c.fillStyle = '#4a2a35';
      c.beginPath(); c.moveTo(-14, 0); c.lineTo(-6, -22); c.lineTo(6, -22); c.lineTo(14, 0); c.closePath(); c.fill();
      c.fillStyle = '#6a3a48'; c.beginPath(); c.moveTo(-9, -10); c.lineTo(-5, -21); c.lineTo(-2, -21); c.lineTo(-5, -9); c.fill();
      c.fillStyle = '#ff9100'; ell(c, 0, -22, 6.2, 2);
      c.fillStyle = '#ffe082'; ell(c, 0, -22.4, 3.4, 1);
      c.fillStyle = '#ff6d00';
      c.beginPath(); c.moveTo(-3, -22); c.quadraticCurveTo(-4, -16, -2, -13); c.quadraticCurveTo(-1, -17, 0, -22); c.fill();
      c.fillStyle = `rgba(120,90,100,${0.5 - p * 0.3})`; circ(c, 2, -28 - p * 5, 3 + p * 2);
      eyes(c, [[-2, -11], [3, -11]], 2.3);
      c.fillStyle = '#ff5722'; ell(c, 10, -13, 3.6 + p * 0.6, 3 + p * 0.6);
      c.fillStyle = '#ffe082'; ell(c, 10.5, -13, 1.8, 1.6);
    },
    sStarSpitter(c, t, col) {
      col = col || '#fff59d';
      const p = (Math.sin(t * 3.5) + 1) / 2, rot = Math.sin(t * 2) * 0.06;
      c.fillStyle = '#3949ab'; rr(c, -10, -6, 20, 6, 3); c.fill();
      c.fillStyle = '#5c6bc0'; rr(c, -7, -9, 14, 4, 2); c.fill();
      c.save(); c.translate(0, -18); c.rotate(rot);
      glow(c, 0, 0, 22, 'rgba(255,240,170,0.4)');
      c.fillStyle = '#f9a825'; star(c, 0, 0.8, 12.5, 5, 0.52);
      c.fillStyle = '#ffd54f'; star(c, 0, 0, 12, 5, 0.52);
      c.fillStyle = '#fff59d'; star(c, -1, -1, 5.5, 5, 0.5);
      eyes(c, [[-1.5, -1.5], [3.5, -1.5]], 2.1);
      ohMouth(c, 6, 4, 1.8 + p * 0.7, 1.8 + p * 0.7, '#f9a825');
      c.restore();
    },
    sOrbSpitter(c, t, col) {
      col = col || '#69f0ae';
      const p = (Math.sin(t * 3.5) + 1) / 2;
      c.fillStyle = '#4a2a85'; rr(c, -9, -6, 18, 6, 2); c.fill();
      c.fillStyle = '#6a3fb0'; rr(c, -5, -11, 10, 6, 2); c.fill();
      glow(c, 0, -19, 18 + p * 3, 'rgba(180,120,255,0.45)');
      planet(c, 0, -19, 9.5, '#f3d1ff', '#9c4dff');
      spiral(c, -2, -18, 6, 1.4, -t * 2, 'rgba(255,255,255,0.5)', 1.2);
      eyes(c, [[0, -21], [4.5, -21]], 2.2);
      ohMouth(c, 7.5, -15.5, 1.6 + p * 0.7, 1.8 + p * 0.7, '#7c3fd0');
      sparkle(c, -6, -26, 1.8, '#fff');
    },
    sPartyCannon(c, t, col) {
      const p = (Math.sin(t * 3.5) + 1) / 2;
      c.save(); c.translate(1, -15); c.rotate(-0.08);
      const g = c.createLinearGradient(0, -7, 0, 7); g.addColorStop(0, '#ff6fb5'); g.addColorStop(1, '#c2185b');
      c.fillStyle = g; rr(c, -12, -6.5, 26, 13, 6); c.fill();
      c.fillStyle = '#fff59d'; for (let i = 0; i < 3; i++) c.fillRect(-7 + i * 6, -6.5, 2.4, 13);
      c.fillStyle = '#ffd54f'; rr(c, 12, -8, 4, 16, 2); c.fill();
      c.fillStyle = '#3a0d1a'; ell(c, 15.5, 0, 1.4, 5);
      c.restore();
      c.fillStyle = '#7b3fa0'; circ(c, -3, -6, 6);
      c.fillStyle = '#b388ff'; circ(c, -3, -6, 2.5);
      c.strokeStyle = '#b388ff'; c.lineWidth = 1.2; for (let i = 0; i < 4; i++) { const a = t * 2 + i * Math.PI / 2; line(c, -3, -6, -3 + Math.cos(a) * 5, -6 + Math.sin(a) * 5); }
      eyes(c, [[-1, -18], [4, -18]], 2.2);
      smile(c, 1.5, -14.5, 1.8, '#5a0a2a');
      c.fillStyle = '#40c4ff'; c.beginPath(); c.moveTo(-4, -21); c.lineTo(-1, -33); c.lineTo(3, -21.5); c.closePath(); c.fill();
      c.fillStyle = '#fff59d'; circ(c, -1, -33.5, 2); circ(c, -2, -25, 1); circ(c, 0.5, -28, 0.9);
      const cf = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff'];
      for (let i = 0; i < 4; i++) { c.fillStyle = cf[i]; c.fillRect(17 + i * 1.5 + p * 3, -20 + i * 3 + Math.sin(t * 5 + i) * 2, 2, 2); }
    },

    // --- літаючі (центр, дивляться у +x) ---
    sSatBird(c, t) {
      const fl = Math.sin(t * 14);
      const wing = (rot, dark) => {
        c.save(); c.translate(-1, -3); c.rotate(rot);
        c.fillStyle = dark ? '#1e4fa8' : '#2f6fd8'; c.fillRect(-17, -4.5, 16, 9);
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8;
        for (let i = 1; i < 4; i++) line(c, -17 + i * 4, -4.5, -17 + i * 4, 4.5);
        line(c, -17, 0, -1, 0);
        c.restore();
      };
      wing(0.5 + fl * 0.5, true);
      c.fillStyle = '#eceff1'; ell(c, 0, 0, 9.5, 7.5);
      c.fillStyle = '#ffca28'; ell(c, 1, 3.5, 6.5, 3.2);
      c.strokeStyle = '#b0bec5'; c.lineWidth = 1.4; line(c, 2, -7, 4, -13);
      c.fillStyle = Math.sin(t * 6) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, 4, -13.5, 1.8);
      eyes(c, [[5, -2]], 2.8);
      c.fillStyle = '#ff9800'; tri(c, 8.5, -1, 15, 1, 8.5, 3);
      wing(-0.2 - fl * 0.6, false);
    },
    sCometPup(c, t) {
      const g = c.createLinearGradient(-30, 0, 0, 0);
      g.addColorStop(0, 'rgba(120,220,255,0)'); g.addColorStop(1, 'rgba(160,235,255,0.85)');
      c.fillStyle = g;
      const wv = Math.sin(t * 8) * 2;
      c.beginPath(); c.moveTo(-2, -9); c.quadraticCurveTo(-16, -8 + wv, -30, -2 + wv); c.quadraticCurveTo(-16, 2, -30, 6 - wv); c.quadraticCurveTo(-16, 8 - wv, -2, 9); c.closePath(); c.fill();
      for (let i = 0; i < 3; i++) sparkle(c, -12 - i * 6, Math.sin(t * 6 + i * 2) * 4, 1.6, 'rgba(255,255,255,0.85)');
      glow(c, 0, 0, 18, 'rgba(180,240,255,0.5)');
      const bg = c.createRadialGradient(-3, -3, 1, 0, 0, 10);
      bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#7fd8ff');
      c.fillStyle = bg; circ(c, 0, 0, 9.5);
      c.fillStyle = '#5bc0f0'; tri(c, -6, -6, -4, -12, 0, -8); tri(c, 3, -8, 7, -12, 7, -5);
      eyes(c, [[2, -1.5], [7, -1.5]], 2.4);
      smile(c, 4.5, 2.5, 1.8, '#11415e');
      c.fillStyle = 'rgba(255,120,160,0.6)'; circ(c, 0, 3.5, 1.4); circ(c, 8.5, 3, 1.3);
    },
    sJelly(c, t) { jellyfish(c, t, '#ff6fd8', 'rgba(255,200,240,A)'); },
    sJellyIce(c, t) { jellyfish(c, t, '#5ad8ff', 'rgba(220,250,255,A)'); },
    sMiniUfo(c, t) { miniUfo(c, t, '#90a4ae', '#76ff03', null); },
    sUfoPink(c, t) { miniUfo(c, t, '#ff80ab', '#80deea', '#ffd98a'); },
    sSporeBug(c, t) {
      const fl = Math.abs(Math.sin(t * 26));
      c.fillStyle = 'rgba(200,255,240,0.55)';
      ell(c, -4, -8, 5, 3 + fl * 4, -0.5); ell(c, 2, -9, 4.5, 3 + fl * 4, 0.3);
      c.fillStyle = '#ff7043'; ell(c, 0, 0, 11, 8);
      c.fillStyle = '#7b1fa2'; for (let i = 0; i < 3; i++) ell(c, -6 + i * 4, 0, 1.4, 7);
      c.fillStyle = '#ffab91'; ell(c, -2, -4, 4, 2);
      c.fillStyle = 'rgba(200,255,240,0.7)';
      ell(c, -6, -9, 5, 3 + fl * 4, -0.9); ell(c, 0, -10, 4.5, 3 + fl * 4, 0.1);
      c.strokeStyle = '#7b1fa2'; c.lineWidth = 1.3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(8, -5); c.quadraticCurveTo(12, -13, 15, -10); c.stroke();
      c.fillStyle = '#c6ff00'; circ(c, 15, -10, 1.8);
      eyes(c, [[6, -1.5]], 3);
      smile(c, 7.5, 3, 1.6, '#4a0a00');
    },
    sPrismMoth(c, t) {
      const fl = Math.sin(t * 16);
      const wingC = (rot, a) => {
        c.save(); c.rotate(rot); c.globalAlpha = a;
        const g = c.createLinearGradient(-14, -14, 0, 0);
        g.addColorStop(0, '#ff6fae'); g.addColorStop(0.35, '#ffd54f'); g.addColorStop(0.7, '#69f0ae'); g.addColorStop(1, '#7c9cff');
        c.fillStyle = g;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-16, -12); c.lineTo(-6, -16); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-13, 6); c.lineTo(-5, 9); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)'; tri(c, 0, 0, -16, -12, -9, -11);
        c.restore();
      };
      wingC(0.2 + fl * 0.35, 0.75);
      c.fillStyle = '#5e35b1'; ell(c, 0, 0, 8, 4.5);
      c.fillStyle = '#7e57c2'; circ(c, 7, -1, 4.5);
      c.strokeStyle = '#5e35b1'; c.lineWidth = 1.2; c.lineCap = 'round';
      line(c, 8, -5, 12, -11); line(c, 10, -4, 15, -8);
      c.fillStyle = '#fff59d'; circ(c, 12, -11, 1.4); circ(c, 15, -8, 1.4);
      eyes(c, [[8.5, -1.5]], 2.3);
      wingC(-0.3 - fl * 0.5, 0.95);
    },
    sEmberSprite(c, t) {
      const f = Math.sin(t * 12);
      glow(c, 0, 0, 22, 'rgba(255,140,0,0.45)');
      const g = c.createLinearGradient(-22, 0, 10, 0);
      g.addColorStop(0, 'rgba(255,80,0,0)'); g.addColorStop(0.5, '#ff6d00'); g.addColorStop(1, '#ffd54f');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(10, 0); c.quadraticCurveTo(10, -10, 0, -10); c.quadraticCurveTo(-10, -9, -22, -4 + f * 2);
      c.quadraticCurveTo(-12, -1, -18, 3 - f * 2); c.quadraticCurveTo(-8, 9, 0, 9); c.quadraticCurveTo(10, 9, 10, 0); c.fill();
      c.fillStyle = '#fff59d'; ell(c, 2, 0, 6.5, 6);
      eyes(c, [[1.5, -1.5], [6, -1.5]], 2.2);
      smile(c, 4, 2, 1.6, '#8a2a00');
    },
    sDroneBall(c, t) {
      const sp = Math.abs(Math.sin(t * 30));
      c.strokeStyle = '#78909c'; c.lineWidth = 1.6; line(c, 0, -9, 0, -13);
      c.fillStyle = 'rgba(200,210,220,0.85)'; ell(c, 0, -13.5, 3 + sp * 11, 1.6);
      c.fillStyle = '#263238'; circ(c, 0, -13.5, 1.6);
      const g = c.createRadialGradient(-3, -3, 1, 0, 0, 10);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffb74d');
      c.fillStyle = g; circ(c, 0, 0, 9.5);
      c.fillStyle = '#ef6c00'; c.fillRect(-9.5, 1, 19, 2.2);
      c.fillStyle = '#0f2a33'; rr(c, 1, -5, 9, 6, 3); c.fill();
      c.fillStyle = '#69f0ae'; circ(c, 4, -2, 1.5); circ(c, 7.5, -2, 1.5);
      c.strokeStyle = '#90a4ae'; c.lineWidth = 1.5; line(c, -5, 8, -7, 12); line(c, 4, 8, 6, 12);
      c.fillStyle = Math.sin(t * 7) > 0 ? '#ff5252' : '#40c4ff'; circ(c, -6, -3, 1.4);
    },
    sStarBird(c, t) {
      const fl = Math.sin(t * 12);
      glow(c, 0, 0, 22, 'rgba(160,220,255,0.45)');
      c.fillStyle = 'rgba(200,235,255,0.75)';
      c.save(); c.rotate(-0.3 - fl * 0.5); tri(c, -2, -2, -18, -10, -6, -14); c.restore();
      c.fillStyle = '#d6f1ff'; ell(c, 0, 0, 10, 6.5);
      c.fillStyle = '#fff59d'; tri(c, -9, 0, -17, -5, -15, 5);
      sparkle(c, -18, -5, 2, '#fff'); sparkle(c, -16, 5, 1.6, '#fff');
      c.fillStyle = '#9fd8ff'; circ(c, 6, -3, 5);
      eyes(c, [[7, -4]], 2.2);
      c.fillStyle = '#ffb74d'; tri(c, 10, -3, 15, -1.5, 10, 0);
      c.fillStyle = '#ffffff';
      c.save(); c.rotate(0.2 + fl * 0.6); tri(c, -2, -1, -16, -12, -4, -13); c.restore();
      sparkle(c, 6, -10, 1.8, '#fff59d');
    },
    sMoonlet(c, t) {
      const a = t * 3;
      const mx = Math.cos(a) * 15, my = Math.sin(a) * 5;
      const moon = () => { c.fillStyle = '#fff59d'; circ(c, mx, my, 3.2); c.fillStyle = '#ffd54f'; circ(c, mx + 0.8, my + 0.8, 1); };
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 15, 5, 0, 0, TAU); c.stroke();
      if (my < 0) moon();
      glow(c, 0, 0, 18, 'rgba(255,120,220,0.45)');
      planet(c, 0, 0, 9.5, '#ffc4ef', '#d64fb0', [[0.2, 0.18, 'rgba(120,0,90,0.25)']]);
      eyes(c, [[2, -2], [6.5, -2]], 2.3);
      smile(c, 4.3, 2, 1.6, '#5a0a4a');
      if (my >= 0) moon();
    },
    sBananaRocket(c, t) {
      const fl = Math.abs(Math.sin(t * 20));
      c.fillStyle = '#ff9100'; tri(c, -12, -4, -21 - fl * 6, 0, -12, 4);
      c.fillStyle = '#fff59d'; tri(c, -12, -2, -16 - fl * 3, 0, -12, 2);
      c.fillStyle = '#e53935';
      c.beginPath(); c.moveTo(-6, -5); c.lineTo(-13, -11); c.lineTo(-13, -4); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-6, 5); c.lineTo(-13, 11); c.lineTo(-13, 4); c.closePath(); c.fill();
      c.fillStyle = '#fafafa';
      c.beginPath(); c.moveTo(-13, -5.5); c.lineTo(5, -5.5); c.quadraticCurveTo(14, -5, 17, 0); c.quadraticCurveTo(14, 5, 5, 5.5); c.lineTo(-13, 5.5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(-13, 2, 18, 3.5);
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(10, -4.2); c.quadraticCurveTo(15, -3, 17, 0); c.quadraticCurveTo(15, 3, 10, 4.2); c.closePath(); c.fill();
      Art.banana(c, -6, 0.5, 0, 0.5);
      c.fillStyle = '#455a64'; circ(c, 4, -0.5, 4.2);
      c.fillStyle = '#81d4fa'; circ(c, 4, -0.5, 3.2);
      eyes(c, [[3.5, -1], [6, -1]], 1.2);
    },
  });

  // =================== Декорації (від точки на землі вгору) ===================
  Object.assign(Art.decors, {
    sSatDish(c, t) {
      c.fillStyle = '#78909c'; rr(c, -8, -4, 16, 4, 1.5); c.fill();
      c.strokeStyle = '#90a4ae'; c.lineWidth = 2; line(c, 0, -4, 0, -14);
      c.save(); c.translate(0, -17); c.rotate(-0.6);
      c.fillStyle = '#cfd8dc'; c.beginPath(); c.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#f5f7fa'; c.beginPath(); c.ellipse(0, 0, 11, 2.5, 0, 0, TAU); c.fill();
      c.strokeStyle = '#90a4ae'; c.lineWidth = 1.2; line(c, 0, 0, 0, -9);
      c.fillStyle = Math.sin(t * 4) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, 0, -10, 1.8);
      c.restore();
    },
    sSolarPanel(c) {
      c.fillStyle = '#90a4ae'; c.fillRect(-1.5, -12, 3, 12); rr(c, -6, -2, 12, 2, 1); c.fill();
      c.save(); c.translate(0, -14); c.rotate(-0.25);
      c.fillStyle = '#cfd8dc'; c.fillRect(-14, -6, 28, 10);
      c.fillStyle = '#2f6fd8'; c.fillRect(-13, -5, 26, 8);
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8;
      for (let i = 1; i < 6; i++) line(c, -13 + i * 26 / 6, -5, -13 + i * 26 / 6, 3);
      line(c, -13, -1, 13, -1);
      c.fillStyle = 'rgba(255,255,255,0.35)'; tri(c, -13, -5, -4, -5, -13, 1);
      c.restore();
    },
    sStarFlag(c, t) {
      c.fillStyle = '#cfd8dc'; c.fillRect(-1, -34, 2, 34);
      c.fillStyle = '#ffd54f'; circ(c, 0, -35, 2);
      const w = Math.sin(t * 4) * 2;
      c.fillStyle = '#7c4dff';
      c.beginPath(); c.moveTo(1, -33); c.quadraticCurveTo(10, -33 + w, 20, -28 + w); c.lineTo(1, -21); c.closePath(); c.fill();
      c.fillStyle = '#fff59d'; star(c, 8, -28 + w * 0.4, 3.2, 5, 0.45);
    },
    sSpaceRock(c, t) {
      rockBlob(c, 0, -8, 10, '#9a8478', '#76625a', 3, 2);
      c.save(); c.shadowColor = '#7df3ff'; c.shadowBlur = 6 + Math.sin(t * 3) * 3;
      gem(c, 5, -12, 4, 8, '#7df3ff', 1);
      c.restore();
    },
    sDrill(c, t) {
      c.strokeStyle = '#ffb74d'; c.lineWidth = 2.2; c.lineCap = 'round';
      line(c, -9, 0, 0, -26); line(c, 9, 0, 0, -26); line(c, -5, -12, 5, -12);
      c.fillStyle = '#ef6c00'; rr(c, -4, -24, 8, 8, 2); c.fill();
      c.save(); c.translate(0, -16);
      c.fillStyle = '#b0bec5'; tri(c, -3, 0, 0, 14, 3, 0);
      c.strokeStyle = '#78909c'; c.lineWidth = 1; const o = (t * 8) % 3;
      for (let i = 0; i < 4; i++) line(c, -2.5 + i * 0.6, o + i * 3, 2.5 - i * 0.6, o + i * 3 + 1.5);
      c.restore();
      c.fillStyle = Math.sin(t * 5) > 0 ? '#69f0ae' : '#ffeb3b'; circ(c, 0, -27, 2);
    },
    sCraterGlow(c, t) {
      const p = 0.5 + Math.sin(t * 2.5) * 0.25;
      glow(c, 0, -6, 18, `rgba(120,255,220,${p * 0.6})`);
      c.fillStyle = '#5c4a5a'; ell(c, 0, -2, 15, 4.5);
      c.fillStyle = '#7a6578'; ell(c, 0, -3, 15, 3);
      c.fillStyle = '#3a2d3a'; ell(c, 0, -2.5, 11, 2.2);
      c.fillStyle = `rgba(150,255,230,${0.6 + p * 0.3})`; ell(c, 0, -2.5, 8, 1.4);
      sparkle(c, -3, -10 - p * 4, 1.8, '#e0fff7'); sparkle(c, 4, -14 + p * 3, 1.4, '#e0fff7');
    },
    sIceChunk(c) {
      c.fillStyle = '#c7d6f0';
      c.beginPath(); c.moveTo(-12, 0); c.lineTo(-10, -9); c.lineTo(-3, -15); c.lineTo(6, -13); c.lineTo(12, -5); c.lineTo(11, 0); c.closePath(); c.fill();
      c.fillStyle = '#eef4ff'; c.beginPath(); c.moveTo(-10, -9); c.lineTo(-3, -15); c.lineTo(6, -13); c.lineTo(0, -8); c.closePath(); c.fill();
      c.fillStyle = '#a7b9db'; c.beginPath(); c.moveTo(0, -8); c.lineTo(6, -13); c.lineTo(12, -5); c.lineTo(11, 0); c.lineTo(2, 0); c.closePath(); c.fill();
    },
    sOrrery(c, t) {
      c.fillStyle = '#8d6e63'; rr(c, -7, -3, 14, 3, 1.5); c.fill(); c.fillRect(-1, -14, 2, 12);
      c.save(); c.shadowColor = '#ffd54f'; c.shadowBlur = 8; c.fillStyle = '#ffca28'; circ(c, 0, -18, 4.5); c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(0, -18, 12, 4, 0, 0, TAU); c.stroke();
      const a = t * 1.5;
      c.fillStyle = '#4fc3f7'; circ(c, Math.cos(a) * 12, -18 + Math.sin(a) * 4, 2.4);
      c.fillStyle = '#ff7043'; circ(c, Math.cos(a * 0.6 + 2) * 7, -18 + Math.sin(a * 0.6 + 2) * 2.4, 1.6);
    },
    sTelescope(c) {
      c.strokeStyle = '#6d4c41'; c.lineWidth = 2; c.lineCap = 'round';
      line(c, 0, -14, -8, 0); line(c, 0, -14, 8, 0); line(c, 0, -14, 0, 0);
      c.save(); c.translate(0, -16); c.rotate(-0.6);
      c.fillStyle = '#5c6bc0'; rr(c, -9, -3.5, 22, 7, 2.5); c.fill();
      c.fillStyle = '#ffd54f'; c.fillRect(-2, -3.5, 2.5, 7); c.fillRect(11, -4.5, 3, 9);
      c.fillStyle = '#9fa8da'; rr(c, -13, -2.5, 4, 5, 1.5); c.fill();
      c.restore();
    },
    sCloudTuft(c, t) {
      const b = Math.sin(t * 1.5) * 1;
      c.fillStyle = '#ffe3c2'; circ(c, -8, -5 + b, 6); circ(c, 0, -9 + b, 8); circ(c, 9, -5 + b, 6); c.fillRect(-14, -5 + b, 28, 5);
      c.fillStyle = '#fff4e6'; circ(c, -2, -12 + b, 3.5); circ(c, 6, -9 + b, 2.5);
    },
    sGasVent(c, t) {
      c.fillStyle = '#a1665e'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-6, -6); c.lineTo(6, -6); c.lineTo(10, 0); c.fill();
      c.fillStyle = '#6d3a34'; ell(c, 0, -6, 6, 1.8);
      for (let i = 0; i < 3; i++) {
        const k = ((t * 0.6 + i / 3) % 1);
        c.fillStyle = `rgba(255,225,190,${0.7 * (1 - k)})`;
        circ(c, Math.sin(k * 6 + i) * 3, -8 - k * 26, 3 + k * 6);
      }
    },
    sWindVane(c, t) {
      c.fillStyle = '#90a4ae'; c.fillRect(-1, -26, 2, 26); rr(c, -5, -2, 10, 2, 1); c.fill();
      c.save(); c.translate(0, -27); const a = t * 5;
      c.strokeStyle = '#b0bec5'; c.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const x = Math.cos(a + i * TAU / 3) * 8, y = Math.sin(a + i * TAU / 3) * 2.5;
        line(c, 0, 0, x, y); c.fillStyle = i === 0 ? '#ff5252' : '#eceff1'; circ(c, x, y, 2.6);
      }
      c.restore();
      c.fillStyle = '#ff7043'; c.beginPath(); c.moveTo(1, -20); c.lineTo(11, -18 + Math.sin(t * 3)); c.lineTo(1, -15); c.fill();
    },
    sIceSpike(c, t) {
      c.save(); c.shadowColor = '#b3f0ff'; c.shadowBlur = 6;
      gem(c, -6, 0, 6, 16, '#8fdcff', -1); gem(c, 1, 0, 8, 26, '#c8f1ff', 1); gem(c, 8, 0, 5, 12, '#8fdcff', 2);
      c.restore();
      sparkle(c, 2, -24, 1.6 + Math.sin(t * 4) * 0.8, '#fff');
    },
    sFrozenGeyser(c, t) {
      for (let i = 0; i < 4; i++) {
        const k = ((t * 0.5 + i / 4) % 1);
        c.fillStyle = `rgba(230,250,255,${0.65 * (1 - k)})`;
        circ(c, Math.sin(k * 5 + i) * 2.5, -8 - k * 30, 2.5 + k * 5);
      }
      c.fillStyle = '#d4f3ff'; c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-5, -12, 0, -9); c.quadraticCurveTo(5, -12, 12, 0); c.fill();
      c.fillStyle = '#8fdcff'; ell(c, 0, -8.5, 3.5, 1.4);
      c.fillStyle = '#ffffff'; ell(c, -5, -5, 3, 1.4, -0.6);
    },
    sAlienBulb(c, t) {
      const sw = Math.sin(t * 1.8) * 3;
      c.strokeStyle = '#26a69a'; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -14, sw, -26); c.stroke();
      c.fillStyle = '#4db6ac'; ell(c, -4, -6, 5, 2, 0.6); ell(c, 4, -10, 5, 2, -0.6);
      c.save(); c.shadowColor = '#ff6fd8'; c.shadowBlur = 10 + Math.sin(t * 3) * 4;
      c.fillStyle = '#ff6fd8'; ell(c, sw, -30, 5, 6);
      c.restore();
      c.fillStyle = '#ffd1f5'; ell(c, sw - 1.5, -32, 1.8, 2.4);
    },
    sSpiralFern(c, t) {
      const sw = Math.sin(t * 1.5) * 0.06;
      c.save(); c.rotate(sw);
      c.strokeStyle = '#00bfa5'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -18); c.stroke();
      c.beginPath();
      for (let i = 0; i <= 40; i++) { const k = i / 40, a = Math.PI + k * 3.2 * Math.PI, rad = 8 * (1 - k * 0.85); c.lineTo(rad + Math.cos(a) * rad * -1 - 0, -18 - 6 + Math.sin(a) * rad); }
      c.stroke();
      c.fillStyle = '#64ffda'; for (let i = 1; i < 4; i++) { ell(c, -4, -i * 5, 3.5, 1.4, 0.5); ell(c, 4, -i * 5 + 2, 3.5, 1.4, -0.5); }
      c.restore();
    },
    sAlienShroom(c, t) {
      c.fillStyle = '#e1f5fe'; rr(c, -2.5, -12, 5, 12, 2); c.fill();
      c.save(); c.shadowColor = '#7df3ff'; c.shadowBlur = 6;
      c.fillStyle = '#ff7043'; c.beginPath(); c.ellipse(0, -12, 12, 9, 0, Math.PI, 0); c.fill();
      c.restore();
      c.fillStyle = '#d84315'; c.fillRect(-12, -12.5, 24, 2);
      c.fillStyle = `rgba(125,243,255,${0.75 + Math.sin(t * 3) * 0.25})`;
      circ(c, -5, -16, 2.2); circ(c, 3, -19, 1.8); circ(c, 7, -14, 1.6); circ(c, -1, -13.5, 1.2);
    },
    sTentacle(c, t) {
      c.lineCap = 'round';
      for (const [ox, ph, h] of [[-5, 0, 20], [4, 1.7, 26]]) {
        c.strokeStyle = '#9c27b0'; c.lineWidth = 4.5;
        c.beginPath(); c.moveTo(ox, 0);
        for (let i = 1; i <= 6; i++) c.lineTo(ox + Math.sin(t * 2 + i * 0.7 + ph) * i * 0.8, -i * h / 6);
        c.stroke();
        c.fillStyle = '#e1bee7';
        for (let i = 1; i < 5; i++) circ(c, ox + Math.sin(t * 2 + i * 0.7 + ph) * i * 0.8 + 1.5, -i * h / 6, 1.1);
      }
    },
    sGemCluster(c, t) {
      c.save(); c.shadowColor = '#ffffff'; c.shadowBlur = 5;
      gem(c, -7, 0, 7, 15, '#3fe0d0', -2); gem(c, 1, 0, 9, 24, '#ff6fae', 0); gem(c, 8, 0, 6, 13, '#9b7bff', 2);
      c.restore();
      sparkle(c, 1, -26, 1.5 + Math.abs(Math.sin(t * 3)) * 1.5, '#fff');
    },
    sPrismRock(c, t) {
      c.globalAlpha = 0.5 + Math.sin(t * 2) * 0.15;
      const cols = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#b388ff'];
      cols.forEach((col, i) => { c.fillStyle = col; tri(c, 2, -16, 22, -26 + i * 4, 22, -22 + i * 4); });
      c.globalAlpha = 1;
      c.fillStyle = '#8a6fa8'; c.beginPath(); c.moveTo(-11, 0); c.lineTo(-8, -7); c.lineTo(4, -9); c.lineTo(10, 0); c.fill();
      c.fillStyle = 'rgba(230,245,255,0.9)'; c.beginPath(); c.moveTo(-4, -7); c.lineTo(2, -22); c.lineTo(7, -7); c.closePath(); c.fill();
      c.fillStyle = 'rgba(160,200,255,0.8)'; c.beginPath(); c.moveTo(2, -22); c.lineTo(7, -7); c.lineTo(2, -8); c.closePath(); c.fill();
    },
    sLavaVent(c, t) {
      const p = 0.5 + Math.sin(t * 3) * 0.5;
      glow(c, 0, -14, 14, `rgba(255,120,0,${0.3 + p * 0.3})`);
      c.fillStyle = '#3b2230'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-4, -14); c.lineTo(4, -14); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#ff9100'; ell(c, 0, -14, 4.5, 1.6);
      c.strokeStyle = '#ff6d00'; c.lineWidth = 1.6; line(c, -2, -13, -5, -6); line(c, -5, -6, -4, -1);
      for (let i = 0; i < 2; i++) {
        const k = ((t * 0.5 + i / 2) % 1);
        c.fillStyle = `rgba(110,80,95,${0.55 * (1 - k)})`; circ(c, Math.sin(k * 4 + i) * 3, -17 - k * 22, 2.5 + k * 5);
      }
    },
    sBasalt(c) {
      const cols = [[-8, 16], [0, 24], [8, 12]];
      for (const [x, h] of cols) {
        c.fillStyle = '#3b2230'; c.fillRect(x - 4, -h, 8, h);
        c.fillStyle = '#5a3548'; c.beginPath(); c.moveTo(x - 4, -h); c.lineTo(x - 2, -h - 2.5); c.lineTo(x + 2, -h - 2.5); c.lineTo(x + 4, -h); c.lineTo(x + 2, -h + 2); c.lineTo(x - 2, -h + 2); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 1, -h + 2, 3, h - 2);
      }
      c.strokeStyle = '#ff7043'; c.lineWidth = 1; line(c, -4, -3, -4, -10); line(c, 4, -2, 4, -7);
    },
    sCrate(c) {
      c.fillStyle = '#ef6c00'; rr(c, -11, -20, 22, 20, 2); c.fill();
      c.fillStyle = '#ffa040'; c.fillRect(-9, -18, 18, 16);
      c.strokeStyle = '#ef6c00'; c.lineWidth = 2; line(c, -9, -18, 9, -2); line(c, 9, -18, -9, -2);
      c.fillStyle = '#263238'; rr(c, -5, -13, 10, 6, 1); c.fill();
      c.fillStyle = '#ffeb3b'; star(c, 0, -10, 2.4, 5, 0.45);
    },
    sRocketSmall(c, t) {
      c.fillStyle = '#78909c'; rr(c, -12, -3, 24, 3, 1); c.fill();
      rocket(c, 0, -2, 0.75, '#f5f5f5', '#e53935', '#e53935', 0);
    },
    sLightPost(c, t) {
      c.fillStyle = '#90a4ae'; c.fillRect(-1.5, -32, 3, 32); rr(c, -5, -3, 10, 3, 1); c.fill();
      const p = 0.6 + Math.sin(t * 3) * 0.3;
      glow(c, 0, -34, 14, `rgba(120,240,255,${p * 0.6})`);
      c.strokeStyle = '#7df3ff'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -34, 6, 2.5, 0, 0, TAU); c.stroke();
      c.fillStyle = '#e0ffff'; circ(c, 0, -34, 2.4);
    },
    sConsole(c, t) {
      c.fillStyle = '#b0bec5'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-12, -12); c.lineTo(-8, -20); c.lineTo(10, -20); c.lineTo(12, -12); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#0f1d30'; c.beginPath(); c.moveTo(-8, -18); c.lineTo(9, -18); c.lineTo(10, -13); c.lineTo(-10, -13); c.closePath(); c.fill();
      c.strokeStyle = '#4ff3ff'; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i <= 16; i++) c.lineTo(-8 + i, -15.5 + Math.sin(i * 0.8 + t * 6) * 1.5); c.stroke();
      const led = ['#ff5252', '#69f0ae', '#ffeb3b', '#40c4ff'];
      for (let i = 0; i < 4; i++) { c.fillStyle = (Math.floor(t * 3) + i) % 3 ? led[i] : '#546e7a'; circ(c, -7 + i * 4.6, -7, 1.6); }
    },
    sDomeHouse(c, t) {
      c.fillStyle = '#9575cd'; c.beginPath(); c.arc(0, 0, 15, Math.PI, 0); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(-3, -2, 11, Math.PI * 1.1, Math.PI * 1.6); c.lineTo(-3, -2); c.fill();
      c.fillStyle = '#5e35b1'; c.fillRect(-15, -2, 30, 2);
      c.fillStyle = '#ffe082'; circ(c, 5, -8, 3.5);
      c.fillStyle = '#4527a0'; rr(c, -8, -9, 6, 9, 3); c.fill();
      c.strokeStyle = '#b39ddb'; c.lineWidth = 1.5; line(c, 0, -15, 0, -22);
      c.fillStyle = Math.sin(t * 4) > 0 ? '#76ff03' : '#ff4fd8'; circ(c, 0, -23, 2);
    },
    sAntennaTower(c, t) {
      c.fillStyle = '#5e35b1'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1.5, -30); c.lineTo(1.5, -30); c.lineTo(6, 0); c.fill();
      c.fillStyle = '#7e57c2'; for (let i = 1; i < 4; i++) c.fillRect(-5 + i * 1.1, -i * 8, 10 - i * 2.2, 2);
      c.save(); c.shadowColor = '#76ff03'; c.shadowBlur = 8 + Math.sin(t * 4) * 4;
      c.fillStyle = '#b2ff59'; circ(c, 0, -33, 3.5); c.restore();
      c.strokeStyle = 'rgba(178,255,89,0.5)'; c.lineWidth = 1;
      const k = (t * 1.2) % 1; c.beginPath(); c.arc(0, -33, 5 + k * 8, 0, TAU); c.stroke();
    },
    sHoloLamp(c, t) {
      c.fillStyle = '#455a64'; rr(c, -6, -5, 12, 5, 2); c.fill();
      c.fillStyle = 'rgba(255,79,216,0.18)'; c.beginPath(); c.moveTo(-4, -5); c.lineTo(-10, -26); c.lineTo(10, -26); c.lineTo(4, -5); c.fill();
      c.save(); c.translate(0, -19 + Math.sin(t * 2) * 1.5); c.rotate(t);
      c.strokeStyle = '#ff9df0'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 0, 6, 6, 0, 0, TAU); c.stroke();
      c.fillStyle = '#ffd1f5'; star(c, 0, 0, 3.5, 5, 0.45);
      c.restore();
    },
    sStarLamp(c, t) {
      c.fillStyle = '#3949ab'; c.fillRect(-1.2, -30, 2.4, 30); rr(c, -5, -3, 10, 3, 1); c.fill();
      glow(c, 0, -33, 14, 'rgba(255,240,160,0.55)');
      c.save(); c.translate(0, -33); c.rotate(t * 0.8);
      c.fillStyle = '#ffd54f'; star(c, 0, 0, 6, 5, 0.45);
      c.restore();
    },
    sVortexStone(c, t) {
      const b = Math.sin(t * 2) * 2;
      c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, 0, -1, 9, 2);
      glow(c, 0, -18 + b, 14, 'rgba(255,120,220,0.4)');
      rockBlob(c, 0, -18 + b, 8, '#5b3a92', '#3f2670', 11, 1);
      spiral(c, 0, -18 + b, 6, 1.5, t * 2, '#ff9df0', 1.4);
    },
    sOrbLamp(c, t) {
      c.fillStyle = '#4a2a85'; rr(c, -6, -4, 12, 4, 1.5); c.fill(); c.fillRect(-2, -14, 4, 10);
      glow(c, 0, -19, 13, 'rgba(105,240,174,0.55)');
      c.fillStyle = '#b9f6ca'; circ(c, 0, -19, 5);
      c.fillStyle = '#fff'; circ(c, -1.5, -20.5, 1.5);
    },
    sBananaStatue(c, t) {
      // золота статуя банана на кам'яному постаменті (стоїть вертикально — не схожа на нагороду)
      c.fillStyle = '#6a3fa0'; rr(c, -10, -9, 20, 9, 2); c.fill();
      c.fillStyle = '#8e5cc9'; c.fillRect(-10, -9, 20, 2.5);
      c.fillStyle = '#4a2a75'; rr(c, -7, -14, 14, 5, 1.5); c.fill();
      c.fillStyle = '#ffd54f'; c.fillRect(-4, -5.5, 8, 2);
      c.save(); c.translate(1, -27); c.rotate(-1.45);
      const g = c.createLinearGradient(-12, -8, 12, 8);
      g.addColorStop(0, '#fff7c0'); g.addColorStop(0.45, '#ffc107'); g.addColorStop(1, '#b8860b');
      c.fillStyle = g; c.strokeStyle = '#7a5200'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-14, -6); c.quadraticCurveTo(-2, 12, 14, -7); c.quadraticCurveTo(0, 3, -14, -6); c.fill(); c.stroke();
      c.fillStyle = '#7a5200'; circ(c, -14, -6, 1.6); circ(c, 14, -7, 1.6);
      c.fillStyle = 'rgba(255,255,255,0.75)'; ell(c, -4, 2, 4, 1, 0.35);
      c.restore();
      c.fillStyle = '#7a5200'; circ(c, -0.5, -27, 0.9); circ(c, 2.5, -27, 0.9);
      c.strokeStyle = '#7a5200'; c.lineWidth = 0.9; c.beginPath(); c.arc(1, -25.5, 1.6, 0.3, Math.PI - 0.3); c.stroke();
      sparkle(c, 8, -38, 1.5 + Math.abs(Math.sin(t * 3)) * 1.8, '#fff');
      sparkle(c, -7, -30, 1 + Math.abs(Math.sin(t * 3 + 1.5)) * 1.2, '#fff');
    },
    sRocketBanana(c, t) {
      c.fillStyle = '#5e35b1'; rr(c, -12, -3, 24, 3, 1); c.fill();
      rocket(c, 0, -2, 0.8, '#ffe135', '#6b4a1a', '#ff4081', 0);
    },
    sGiftStar(c, t) {
      c.fillStyle = '#40c4ff'; rr(c, -9, -14, 18, 14, 2); c.fill();
      c.fillStyle = '#ff4081'; c.fillRect(-1.5, -14, 3, 14); c.fillRect(-9, -9, 18, 3);
      c.fillStyle = '#ff4081'; ell(c, -4, -16, 4, 2.2, 0.4); ell(c, 4, -16, 4, 2.2, -0.4);
      c.save(); c.translate(0, -24 + Math.sin(t * 3) * 1.5); c.rotate(Math.sin(t * 2) * 0.2);
      c.fillStyle = '#ffd54f'; star(c, 0, 0, 5, 5, 0.45); c.restore();
    },
    sPartyFlag(c, t) {
      c.fillStyle = '#eceff1'; c.fillRect(-1, -36, 2, 36);
      c.fillStyle = '#ffd54f'; star(c, 0, -38, 3.2, 5, 0.45);
      const cols = ['#ff5252', '#40c4ff', '#69f0ae'];
      for (let i = 0; i < 3; i++) {
        const w = Math.sin(t * 4 + i) * 1.5;
        c.fillStyle = cols[i]; tri(c, 1, -34 + i * 8, 13, -31 + i * 8 + w, 1, -28 + i * 8);
      }
    },
  });

  // =================== Світи ===================
  window.THEME_PACKS = window.THEME_PACKS || {};
  THEME_PACKS.space = [
    // 1 ---------------------------------------------------------------
    {
      name: 'Орбіта Землі', icon: '🌍',
      sky: ['#020617', '#0b2a6b'],
      ground: { style: 'stone', body: '#dfe7f0', dark: '#b3c1d1', top: '#3d7be0', topDark: '#2a56a8', topLight: 'rgba(255,255,255,0.55)', texture: 'bricks' },
      block: { fill: '#ff7043', light: '#ffab91', dark: '#bf360c' },
      oneway: { fill: '#90caf9', dark: '#42a5f5' },
      enemy: 'sAstroCat', enemyColor: '#ff9f43', flyer: 'sSatBird',
      shooter: 'sDishTurret', projectile: '#4fe3ff',
      decor: ['sSatDish', 'sSolarPanel', 'sStarFlag', 'flagUA', 'antenna'],
      particles: 'twinkle', gravity: 0.6, jumpBoost: 1.1,
      music: { bpm: 104, root: 60, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.3, seed: 41, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 200, mulberry32(41), h * 0.55);
        sun(c, w * 0.1, 56, 12, '#ffffff', 'rgba(255,255,230,0.6)');
        const ex = w * 0.55, ey = h + 520, R = 760;
        c.save();
        const ag = c.createRadialGradient(ex, ey, R - 10, ex, ey, R + 60);
        ag.addColorStop(0, 'rgba(140,210,255,0.9)'); ag.addColorStop(0.3, 'rgba(90,170,255,0.45)'); ag.addColorStop(1, 'rgba(60,120,255,0)');
        c.fillStyle = ag; c.beginPath(); c.arc(ex, ey, R + 60, 0, TAU); c.fill();
        const og = c.createLinearGradient(0, ey - R, 0, h);
        og.addColorStop(0, '#3fa9f5'); og.addColorStop(1, '#1565c0');
        c.fillStyle = og; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.fill();
        c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.clip();
        const r = mulberry32(141);
        c.fillStyle = '#4caf50';
        for (let i = 0; i < 9; i++) { const x = r() * w, y = ey - R + 30 + r() * 200; ell(c, x, y, 40 + r() * 70, 12 + r() * 18, (r() - 0.5) * 0.4); }
        c.fillStyle = '#d7b46a';
        for (let i = 0; i < 4; i++) { const x = r() * w, y = ey - R + 50 + r() * 160; ell(c, x, y, 20 + r() * 20, 6 + r() * 6); }
        c.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 16; i++) { const x = r() * w, y = ey - R + 10 + r() * 220; ell(c, x, y, 30 + r() * 60, 4 + r() * 5, (r() - 0.5) * 0.3); }
        c.restore();
      },
      far(c, w, h, r) {
        for (const x of spread(w, 4, r)) {
          const y = 40 + r() * 120, s = 0.45 + r() * 0.35, rot = (r() - 0.5) * 0.8;
          wrap(w, x, 40, X => satellite(c, X, y, s, rot, '#3a6fc8', '#e0b04a'));
        }
        // далека станція
        wrap(w, w * 0.62, 150, X => {
          const y = 150;
          c.strokeStyle = '#aab6c6'; c.lineWidth = 4; line(c, X - 130, y, X + 130, y);
          for (const dx of [-110, -70, 70, 110]) {
            c.fillStyle = '#3d5fa8'; c.fillRect(X + dx - 12, y - 52, 24, 44); c.fillRect(X + dx - 12, y + 8, 24, 44);
            c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1;
            for (let i = 1; i < 6; i++) { line(c, X + dx - 12, y - 52 + i * 7.3, X + dx + 12, y - 52 + i * 7.3); line(c, X + dx - 12, y + 8 + i * 7.3, X + dx + 12, y + 8 + i * 7.3); }
            c.fillStyle = '#aab6c6'; c.fillRect(X + dx - 1.5, y - 52, 3, 104);
          }
          c.fillStyle = '#e9edf2'; rr(c, X - 40, y - 9, 80, 18, 8); c.fill();
          rr(c, X - 9, y - 32, 18, 64, 8); c.fill();
          c.fillStyle = '#c7cfd9'; c.fillRect(X - 40, y + 3, 80, 4);
          c.fillStyle = '#ffd54f'; for (let i = 0; i < 5; i++) circ(c, X - 28 + i * 14, y - 2, 2);
          c.fillStyle = '#f0f0f0'; c.fillRect(X + 22, y - 26, 26, 14);
        });
        haze(c, w, h, 'rgba(10,30,80,0.25)');
      },
      mid(c, w, h, r) {
        const y0 = 290;
        // довга ферма
        c.fillStyle = '#b8c4d4'; c.fillRect(0, y0, w, 4); c.fillRect(0, y0 + 22, w, 4);
        c.strokeStyle = '#9aa8ba'; c.lineWidth = 3;
        for (let x = 0; x < w; x += 32) { line(c, x, y0 + 2, x + 16, y0 + 24); line(c, x + 16, y0 + 24, x + 32, y0 + 2); }
        c.fillStyle = '#d5dde7'; for (let x = 0; x < w; x += 64) rr(c, x - 3, y0 - 2, 6, 30, 2), c.fill();
        // сонячні крила
        for (const x of spread(w, 4, r, 0.5)) {
          const up = r() < 0.5;
          wrap(w, x, 60, X => {
            const py = up ? y0 - 120 : y0 + 28;
            c.fillStyle = '#c0cad8'; c.fillRect(X - 2, up ? py : y0 + 26, 4, up ? 120 : 6);
            c.fillStyle = '#1f4ea8'; c.fillRect(X - 50, up ? py : py, 100, up ? 52 : 46);
            c.fillStyle = '#2f6fd8'; c.fillRect(X - 48, (up ? py : py) + 2, 96, (up ? 48 : 42));
            c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1;
            for (let i = 1; i < 8; i++) line(c, X - 48 + i * 12, py + 2, X - 48 + i * 12, py + (up ? 50 : 44));
            line(c, X - 48, py + (up ? 26 : 23), X + 48, py + (up ? 26 : 23));
            c.fillStyle = 'rgba(255,255,255,0.25)'; tri(c, X - 48, py + 2, X - 10, py + 2, X - 48, py + 30);
          });
        }
        // житлові модулі
        for (const x of spread(w, 2, r, 0.5)) wrap(w, x + 60, 70, X => {
          c.fillStyle = '#f2f5f9'; rr(c, X - 60, y0 - 26, 120, 36, 18); c.fill();
          c.fillStyle = '#d0d8e2'; c.fillRect(X - 50, y0 + 2, 100, 6);
          c.fillStyle = '#1e2a40'; for (let i = 0; i < 4; i++) circ(c, X - 36 + i * 24, y0 - 9, 6);
          c.fillStyle = '#9ad9ff'; for (let i = 0; i < 4; i++) circ(c, X - 36 + i * 24, y0 - 9, 4.4);
          c.fillStyle = '#e53935'; c.fillRect(X - 60, y0 - 10, 6, 6);
        });
        haze(c, w, h, 'rgba(12,30,80,0.38)');
      },
    },
    // 2 ---------------------------------------------------------------
    {
      name: 'Пояс астероїдів', icon: '☄️',
      sky: ['#120a1e', '#3b2440'],
      ground: { style: 'stone', body: '#8a7468', dark: '#6d5a50', top: '#b39c8a', topDark: '#8a7464', light: '#a08a7c', texture: 'craters' },
      block: { fill: '#7e8fa3', light: '#b8c6d6', dark: '#4e5d70' },
      oneway: { fill: '#ffb74d', dark: '#e65100' },
      enemy: 'sSpaceSlug', enemyColor: '#7cf0c8', flyer: 'sCometPup',
      shooter: 'sRockSpitter', projectile: '#ffb74d',
      decor: ['sSpaceRock', 'sDrill', 'sCraterGlow', 'sStarFlag', 'sSpaceRock'],
      particles: 'dust', gravity: 0.55, jumpBoost: 1.15,
      music: { bpm: 98, root: 57, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 42 },
      skyDraw(c, w, h) {
        stars(c, w, h, 180, mulberry32(42), h * 0.8);
        c.save(); c.translate(w * 0.5, h * 0.42); c.rotate(-0.12);
        glow(c, 0, 0, w * 0.6, 'rgba(255,170,120,0.12)');
        c.restore();
        sun(c, w * 0.84, 66, 14, '#fff2d6', 'rgba(255,200,140,0.55)');
        c.fillStyle = '#7d6a8a'; circ(c, w * 0.3, 70, 9); c.fillStyle = '#5e4e6c'; circ(c, w * 0.3 + 3, 72, 3);
      },
      far(c, w, h, r) {
        for (let i = 0; i < 70; i++) {
          const x = r() * w, y = 150 + (r() + r() + r() - 1.5) * 80, s = 1.5 + r() * 4;
          const col = r() < 0.5 ? '#5d4a5a' : '#6e5a66';
          wrap(w, x, 10, X => { c.fillStyle = col; ell(c, X, y, s * 1.3, s, r() * 3); });
        }
        for (const x of spread(w, 6, r)) {
          const y = 60 + r() * 200, s = 10 + r() * 16, seed = (r() * 1e6) | 0;
          wrap(w, x, s * 1.3, X => rockBlob(c, X, y, s, '#6a5668', '#4e3f50', seed, 2));
        }
        haze(c, w, h, 'rgba(40,20,50,0.2)');
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 5, r, 0.6)) {
          const y = 110 + r() * 150, s = 26 + r() * 26, seed = (r() * 1e6) | 0, base = r() < 0.4;
          wrap(w, x, s * 1.3, X => {
            rockBlob(c, X, y, s, '#8a7270', '#644f52', seed, 3);
            if (base) {
              c.fillStyle = '#cfd8dc'; c.beginPath(); c.arc(X - 4, y - s * 0.72, 9, Math.PI, 0); c.fill();
              c.fillStyle = '#4fc3f7'; circ(c, X - 2, y - s * 0.72 - 4, 2);
              c.strokeStyle = '#cfd8dc'; c.lineWidth = 1.5; line(c, X + 10, y - s * 0.75, X + 10, y - s * 0.75 - 14);
              c.fillStyle = '#ff5252'; circ(c, X + 10, y - s * 0.75 - 15, 2);
            }
          });
        }
        haze(c, w, h, 'rgba(30,15,40,0.3)');
        const wv = [[3, 10, 0.5], [7, 5, 2]];
        band(c, w, h, 358, wv, '#4b3a4a');
        onBand(c, w, 358, wv, 14, r, 40, (x, y, k) => {
          c.fillStyle = '#5a4757'; ell(c, x, y + 4, 18 + k * 20, 10 + k * 8);
          c.fillStyle = '#433341'; ell(c, x + 6, y + 8, 6 + k * 6, 2.5);
        });
      },
    },
    // 3 ---------------------------------------------------------------
    {
      name: 'Кільця Сатурна', icon: '🪐',
      sky: ['#0d0b26', '#4a3a6a'],
      ground: { style: 'sand', body: '#b89a72', dark: '#9a7e58', top: '#f3dfb8', topDark: '#d6b98a', texture: 'dots' },
      block: { fill: '#8e7cc3', light: '#c5b8f0', dark: '#5e4b9a' },
      oneway: { fill: '#e8f4ff', dark: '#a9c6e8' },
      bounce: { fill: '#ff8a65', dark: '#c75b39', light: '#ffccbc' },
      enemy: 'sRingling', enemyColor: '#4fc3f7', flyer: 'sUfoPink',
      shooter: 'sCuteTurret', projectile: '#ff80ab',
      decor: ['sIceChunk', 'sOrrery', 'sTelescope', 'sIceChunk', 'sStarFlag'],
      particles: 'twinkle', gravity: 0.5, jumpBoost: 1.18,
      music: { bpm: 92, root: 64, minor: false, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 43, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 220, mulberry32(43), h * 0.7);
        const px = w * 0.66, py = 128, R = 74, tilt = -0.14;
        glow(c, px, py, 220, 'rgba(255,210,150,0.18)');
        for (const [rx, lw, col] of [[200, 9, 'rgba(240,215,170,0.55)'], [178, 6, 'rgba(210,175,130,0.7)'], [158, 8, 'rgba(255,235,200,0.6)'], [134, 4, 'rgba(200,160,120,0.5)']]) ringArc(c, px, py, rx, rx * 0.19, tilt, col, lw, false);
        planet(c, px, py, R, '#fff4d6', '#c98a4a', [[-0.62, 0.12, 'rgba(200,140,80,0.35)'], [-0.3, 0.2, 'rgba(255,255,255,0.18)'], [0.1, 0.14, 'rgba(180,110,60,0.3)'], [0.45, 0.2, 'rgba(160,100,60,0.25)']]);
        c.save(); c.beginPath(); c.arc(px, py, R, 0, TAU); c.clip();
        c.fillStyle = 'rgba(90,50,30,0.3)'; c.beginPath(); c.ellipse(px, py + 10, 210, 30, tilt, 0, Math.PI); c.ellipse(px, py + 10, 130, 18, tilt, Math.PI, 0, true); c.fill();
        c.restore();
        ringArc(c, px, py, 168, 32, tilt, 'rgba(80,50,40,0.35)', 52, true);
        for (const [rx, lw, col] of [[200, 9, '#f6e2b8'], [178, 6, '#d9b98a'], [158, 8, '#fff1d6'], [134, 4, '#c9a27a']]) ringArc(c, px, py, rx, rx * 0.19, tilt, col, lw, true);
        c.fillStyle = '#b0a8c0'; circ(c, w * 0.18, 66, 10); c.fillStyle = '#8f87a3'; circ(c, w * 0.18 + 3, 69, 3);
        c.fillStyle = '#e0a060'; circ(c, w * 0.36, 190, 6);
      },
      far(c, w, h, r) {
        const bg = c.createLinearGradient(0, 190, 0, 320);
        bg.addColorStop(0, 'rgba(255,230,190,0)'); bg.addColorStop(0.5, 'rgba(255,230,190,0.1)'); bg.addColorStop(1, 'rgba(255,230,190,0)');
        c.fillStyle = bg; c.fillRect(0, 190, w, 130);
        const cols = ['#f3e6cf', '#d9c3a0', '#bfae96', '#e8f0ff', '#c9b3e6'];
        for (let i = 0; i < 180; i++) {
          const x = r() * w, y = 255 + (r() + r() - 1) * 55, s = 1.2 + r() * 3.6, col = cols[Math.floor(r() * 5)];
          wrap(w, x, 8, X => { c.fillStyle = col; c.globalAlpha = 0.6; ell(c, X, y, s * 1.4, s * 0.9); });
        }
        c.globalAlpha = 1;
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 9, r)) {
          const y = 130 + r() * 170, s = 0.8 + r() * 1.6, rot = r() * 6;
          wrap(w, x, 30 * s, X => {
            c.save(); c.translate(X, y); c.rotate(rot); c.scale(s, s);
            Art.decors.sIceChunk(c, 0);
            c.restore();
          });
        }
        haze(c, w, h, 'rgba(40,30,80,0.35)');
        const wv = [[4, 8, 0], [9, 4, 1]];
        band(c, w, h, 360, wv, '#8a7c9e');
        onBand(c, w, 360, wv, 22, r, 30, (x, y, k) => {
          c.fillStyle = k < 0.5 ? '#a596bb' : '#b8a98a'; ell(c, x, y + 3, 12 + k * 14, 8 + k * 6, k);
          c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, x - 3, y - 1, 5 + k * 4, 2);
        });
      },
    },
    // 4 ---------------------------------------------------------------
    {
      name: 'Бурі Юпітера', icon: '🌀',
      sky: ['#c2633a', '#f6d8a8'],
      ground: { style: 'cloud', body: '#f3c89a', dark: '#e0a874', top: '#fff1dc', topDark: '#f6d6b0', texture: 'puffs' },
      block: { fill: '#a1665e', light: '#d0948a', dark: '#6d3a34' },
      oneway: { fill: '#fff4e6', dark: '#e6c39c', style: 'cloud' },
      bounce: { fill: '#ff7a59', dark: '#c4492c', light: '#ffc4b0' },
      enemy: 'sCloudPuff', enemyColor: '#7e6fa8', flyer: 'sJelly',
      shooter: 'sStormCloud', projectile: '#fff176',
      decor: ['sCloudTuft', 'sGasVent', 'sWindVane', 'sCloudTuft'],
      particles: 'dust', gravity: 0.58, jumpBoost: 1.12, moverStyle: 'cloud',
      music: { bpm: 112, root: 55, minor: true, lead: 'sawtooth', bass: 'square', drums: true, rest: 0.25, seed: 44 },
      skyDraw(c, w, h) {
        const bands = [[30, 'rgba(255,240,220,0.35)'], [70, 'rgba(160,80,50,0.25)'], [110, 'rgba(255,220,180,0.3)'], [160, 'rgba(190,100,60,0.22)'], [210, 'rgba(255,245,230,0.3)']];
        bands.forEach(([y, col], i) => {
          c.fillStyle = col; c.beginPath(); c.moveTo(0, y - 14);
          for (let x = 0; x <= w; x += 10) c.lineTo(x, y - 14 + Math.sin(x / w * TAU * (2 + i) + i) * 6);
          for (let x = w; x >= 0; x -= 10) c.lineTo(x, y + 14 + Math.sin(x / w * TAU * (3 + i) + i * 2) * 6);
          c.fill();
        });
        const sx = w * 0.72, sy = 118;
        c.fillStyle = 'rgba(255,240,220,0.5)'; ell(c, sx, sy, 84, 40);
        c.fillStyle = '#d9603b'; ell(c, sx, sy, 70, 32);
        c.fillStyle = '#e8805a'; ell(c, sx - 4, sy - 3, 50, 21);
        c.save(); c.translate(sx, sy); c.scale(1, 0.45);
        spiral(c, 0, 0, 60, 2.2, 0, 'rgba(255,220,190,0.6)', 3);
        c.restore();
        c.fillStyle = '#f7d046'; circ(c, w * 0.14, 62, 15); c.fillStyle = '#e0a020'; circ(c, w * 0.14 + 5, 58, 3); circ(c, w * 0.14 - 4, 67, 2);
      },
      far(c, w, h, r) {
        for (const x of spread(w, 5, r)) {
          const y = 150 + r() * 100, s = 20 + r() * 26;
          wrap(w, x, s * 1.2, X => {
            c.save(); c.translate(X, y); c.scale(1, 0.5);
            spiral(c, 0, 0, s, 2, r() * 6, 'rgba(255,235,210,0.45)', 3);
            c.restore();
          });
        }
        const wv = [[3, 12, 0], [5, 6, 1]];
        band(c, w, h, 300, wv, '#e7b083');
        onBand(c, w, 300, wv, 18, r, 50, (x, y, k) => { c.fillStyle = '#e7b083'; circ(c, x, y + 4, 20 + k * 26); c.fillStyle = 'rgba(255,240,220,0.35)'; circ(c, x - 6, y - 4, 10 + k * 10); });
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 3, r)) {
          const y = 190 + r() * 60, s = 0.9 + r() * 0.5;
          wrap(w, x, 60 * s, X => cloudLump(c, X, y, s, '#d98c5f', '#f0b07f'));
        }
        const wv = [[3, 10, 1], [6, 5, 0]];
        band(c, w, h, 354, wv, '#c97850');
        onBand(c, w, 354, wv, 12, r, 50, (x, y, k) => cloudLump(c, x, y + 8, 0.9 + k * 0.6, '#c97850', '#e39668'));
        for (const x of spread(w, 3, r)) wrap(w, x, 20, X => bolt(c, X, bandY(w, 354, wv, X) - 70, 1.2));
      },
    },
    // 5 ---------------------------------------------------------------
    {
      name: 'Льодяна комета', icon: '☄️',
      sky: ['#020b1f', '#0d3d66'],
      ground: { style: 'frost', body: '#6fa8d6', dark: '#5a8fbf', top: '#e8fbff', topDark: '#a6e3ff', texture: 'dots' },
      block: { fill: '#5c6bc0', light: '#9fa8da', dark: '#303f9f' },
      oneway: { fill: '#b2ebf2', dark: '#4dd0e1' },
      enemy: 'sAstroPenguin', enemyColor: '#37474f', flyer: 'sJellyIce',
      shooter: 'sIceFlower', projectile: '#e1f5fe',
      decor: ['sIceSpike', 'sFrozenGeyser', 'crystalIce', 'sStarFlag', 'sIceSpike'],
      particles: 'snow', gravity: 0.45, jumpBoost: 1.2, ice: true,
      music: { bpm: 96, root: 67, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.35, seed: 45, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 220, mulberry32(45), h * 0.75);
        const hx = w * 0.84, hy = 74;
        for (let i = 60; i >= 0; i--) {
          const k = i / 60;
          glow(c, hx - k * w * 0.62, hy - k * 46 + k * k * 30, 10 + k * 70, `rgba(200,240,255,${0.3 * (1 - k) + 0.03})`);
        }
        const tg = c.createLinearGradient(hx, hy, hx - w * 0.7, hy - 40);
        tg.addColorStop(0, 'rgba(225,248,255,0.6)'); tg.addColorStop(1, 'rgba(225,248,255,0)');
        c.fillStyle = tg; c.beginPath(); c.moveTo(hx, hy - 6);
        c.quadraticCurveTo(hx - w * 0.3, hy - 70, hx - w * 0.72, hy - 120);
        c.lineTo(hx - w * 0.72, hy + 40); c.quadraticCurveTo(hx - w * 0.3, hy + 30, hx, hy + 6); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(120,190,255,0.35)'; c.lineCap = 'round';
        for (let j = 0; j < 3; j++) {
          c.lineWidth = 6 - j * 1.5; c.beginPath(); c.moveTo(hx, hy);
          c.quadraticCurveTo(hx - w * 0.3, hy - 40 - j * 14, hx - w * 0.7, hy - 60 - j * 24); c.stroke();
        }
        glow(c, hx, hy, 46, 'rgba(230,252,255,0.95)');
        c.fillStyle = '#ffffff'; circ(c, hx, hy, 8);
        c.fillStyle = '#bfefff'; circ(c, hx + 2, hy + 2, 3);
      },
      far(c, w, h, r) {
        peaks(c, w, h, 322, 6, 90, 170, '#3c78a8', '#e8fbff', r);
        for (const x of spread(w, 7, r)) {
          const y = 60 + r() * 150, sc = 0.4 + r() * 0.6, rot = r() * 6;
          wrap(w, x, 20 * sc, X => {
            c.save(); c.translate(X, y); c.rotate(rot); c.scale(sc, sc);
            c.fillStyle = '#9fd6f2'; c.beginPath(); c.moveTo(-10, 4); c.lineTo(-8, -6); c.lineTo(0, -11); c.lineTo(9, -7); c.lineTo(11, 3); c.lineTo(2, 8); c.closePath(); c.fill();
            c.fillStyle = '#e3f7ff'; c.beginPath(); c.moveTo(-8, -6); c.lineTo(0, -11); c.lineTo(9, -7); c.lineTo(0, -2); c.closePath(); c.fill();
            c.restore();
          });
        }
        haze(c, w, h, 'rgba(10,40,90,0.3)');
        for (const x of spread(w, 6, r)) { const y = 60 + r() * 200; wrap(w, x, 10, X => sparkle(c, X, y, 3, 'rgba(255,255,255,0.9)')); }
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0], [7, 4, 1]];
        for (const x of spread(w, 7, r)) {
          const hh = 60 + r() * 100, wd = 14 + r() * 14;
          wrap(w, x, wd + 4, X => {
            const by = bandY(w, 356, wv, X) + 6;
            c.fillStyle = '#7cc6ec'; c.beginPath(); c.moveTo(X - wd, by); c.lineTo(X - wd * 0.2, by - hh); c.lineTo(X + wd, by); c.fill();
            c.fillStyle = '#c8efff'; c.beginPath(); c.moveTo(X - wd, by); c.lineTo(X - wd * 0.2, by - hh); c.lineTo(X - wd * 0.1, by); c.fill();
          });
        }
        wrap(w, w * 0.4, 70, X => {
          c.strokeStyle = '#a8e4ff'; c.lineWidth = 14; c.beginPath(); c.arc(X, 360, 60, Math.PI, 0); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.arc(X, 360, 64, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
        });
        band(c, w, h, 356, wv, '#a8e4ff');
        c.fillStyle = 'rgba(255,255,255,0.6)';
        for (const x of spread(w, 16, r)) wrap(w, x, 10, X => { const y = bandY(w, 356, wv, X); ell(c, X, y + 4, 8, 2); });
      },
    },
    // 6 ---------------------------------------------------------------
    {
      name: 'Інопланетні джунглі', icon: '👽',
      sky: ['#43206e', '#3fd1b0'],
      ground: { style: 'jungle', body: '#4a2f6b', dark: '#3a2357', top: '#c04de0', topDark: '#8e2fb0', texture: 'dots' },
      block: { fill: '#26a69a', light: '#80cbc4', dark: '#00695c' },
      oneway: { fill: '#9ccc65', dark: '#558b2f' },
      bounce: { fill: '#ff7043', dark: '#bf360c', light: '#ffccbc' },
      enemy: 'sTriEye', enemyColor: '#c6ff00', flyer: 'sSporeBug',
      shooter: 'sSpitPlant', projectile: '#b2ff59',
      decor: ['sAlienBulb', 'sSpiralFern', 'sAlienShroom', 'sTentacle', 'sAlienBulb'],
      particles: 'fireflies', gravity: 0.55, jumpBoost: 1.15,
      music: { bpm: 116, root: 62, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.25, seed: 46 },
      skyDraw(c, w, h) {
        stars(c, w, h, 60, mulberry32(46), h * 0.3);
        sun(c, w * 0.24, 92, 32, '#ffd1f0', 'rgba(255,150,220,0.55)');
        sun(c, w * 0.4, 48, 12, '#d9fbff', 'rgba(150,240,255,0.6)');
        const mx = w * 0.8, my = 80;
        ringArc(c, mx, my, 40, 9, -0.3, 'rgba(255,240,180,0.7)', 3, false);
        planet(c, mx, my, 22, '#c8ff9a', '#3f9e6a');
        ringArc(c, mx, my, 40, 9, -0.3, 'rgba(255,240,180,0.9)', 3, true);
      },
      far(c, w, h, r) {
        const col = '#2f6e7e';
        const wv = [[2, 12, 0], [5, 6, 1]];
        band(c, w, h, 304, wv, col);
        for (const x of spread(w, 7, r)) {
          const hh = 70 + r() * 90, cw = 30 + r() * 30, mush = r() < 0.5;
          wrap(w, x, cw + 5, X => {
            const by = bandY(w, 304, wv, X) + 4;
            c.fillStyle = col;
            if (mush) {
              c.fillRect(X - 5, by - hh, 10, hh);
              c.beginPath(); c.ellipse(X, by - hh, cw, cw * 0.55, 0, Math.PI, 0); c.fill();
              c.fillStyle = 'rgba(255,150,230,0.45)'; circ(c, X - cw * 0.4, by - hh - 8, 3); circ(c, X + cw * 0.3, by - hh - 12, 4); circ(c, X, by - hh - 4, 2.5);
            } else {
              c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(X, by); c.quadraticCurveTo(X + 20, by - hh * 0.5, X, by - hh); c.stroke();
              c.fillStyle = col; circ(c, X, by - hh, 14);
              c.fillStyle = 'rgba(255,240,150,0.45)'; circ(c, X, by - hh, 7);
            }
          });
        }
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0.6], [7, 5, 2]];
        for (const x of spread(w, 6, r)) {
          const k = r(), hh = 90 + r() * 80, sw = (r() - 0.5) * 40;
          wrap(w, x, 50, X => {
            const by = bandY(w, 358, wv, X) + 6;
            if (k < 0.4) {
              c.strokeStyle = '#147a6e'; c.lineWidth = 7; c.lineCap = 'round';
              c.beginPath(); c.moveTo(X, by); c.quadraticCurveTo(X - 20, by - hh * 0.6, X + sw, by - hh); c.stroke();
              c.save(); c.shadowColor = '#ff6fd8'; c.shadowBlur = 16; c.fillStyle = '#ff6fd8'; ell(c, X + sw, by - hh - 10, 12, 15); c.restore();
              c.fillStyle = '#ffd1f5'; ell(c, X + sw - 4, by - hh - 15, 4, 5);
            } else if (k < 0.7) {
              c.fillStyle = '#e8f6ff'; rr(c, X - 6, by - hh * 0.6, 12, hh * 0.6, 5); c.fill();
              c.fillStyle = '#ff8a3d'; c.beginPath(); c.ellipse(X, by - hh * 0.6, 40, 26, 0, Math.PI, 0); c.fill();
              c.fillStyle = '#d84315'; c.fillRect(X - 40, by - hh * 0.6 - 2, 80, 4);
              c.fillStyle = 'rgba(125,243,255,0.9)'; circ(c, X - 18, by - hh * 0.6 - 12, 5); circ(c, X + 8, by - hh * 0.6 - 18, 4); circ(c, X + 24, by - hh * 0.6 - 8, 3.5);
            } else {
              c.strokeStyle = '#00bfa5'; c.lineWidth = 6; c.lineCap = 'round';
              c.beginPath(); c.moveTo(X, by); c.lineTo(X, by - hh * 0.55); c.stroke();
              spiral(c, X + 14, by - hh * 0.55 - 2, 16, 1.6, Math.PI, '#00bfa5', 6);
              c.fillStyle = '#64ffda'; for (let i = 1; i < 5; i++) { ell(c, X - 9, by - i * hh * 0.11, 9, 3, 0.5); ell(c, X + 9, by - i * hh * 0.11 + 4, 9, 3, -0.5); }
            }
          });
        }
        band(c, w, h, 358, wv, '#1f4f5f');
        onBand(c, w, 358, wv, 14, r, 30, (x, y, k) => { c.fillStyle = '#28676e'; circ(c, x, y + 8, 14 + k * 14); c.fillStyle = '#ff6fd8'; circ(c, x - 4, y - 2 - k * 6, 2.5); });
      },
    },
    // 7 ---------------------------------------------------------------
    {
      name: 'Планета кристалів', icon: '💎',
      sky: ['#ff9ec9', '#ffe9c7'],
      ground: { style: 'crystal', body: '#2f8f8a', dark: '#21706c', top: '#7ff5e6', topDark: '#3fc9b9', glow: '#ffd1f2', texture: 'gems' },
      block: { fill: '#ec407a', light: '#f8bbd0', dark: '#ad1457' },
      oneway: { fill: '#e1bee7', dark: '#ab47bc' },
      bounce: { fill: '#b388ff', dark: '#7c4dff', light: '#e6dcff' },
      enemy: 'sCrystalCrab', enemyColor: '#ffb74d', flyer: 'sPrismMoth',
      shooter: 'sGemSpitter', projectile: '#ff4fd8',
      decor: ['sGemCluster', 'sPrismRock', 'crystal', 'sGemCluster'],
      particles: 'sparkle', gravity: 0.52, jumpBoost: 1.18,
      music: { bpm: 100, root: 64, minor: false, lead: 'sine', bass: 'triangle', drums: false, rest: 0.3, seed: 47, bell: true },
      skyDraw(c, w, h) {
        c.fillStyle = 'rgba(255,255,255,0.14)';
        for (let i = 0; i < 5; i++) tri(c, w * (0.1 + i * 0.2), 0, w * (0.02 + i * 0.2), h, w * (0.16 + i * 0.2), h);
        const px = w * 0.72, py = 104, R = 58;
        glow(c, px, py, 150, 'rgba(255,255,255,0.4)');
        const r = mulberry32(47);
        const pts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; pts.push([px + Math.cos(a) * R, py + Math.sin(a) * R]); }
        for (let i = 0; i < 10; i++) {
          const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 10];
          const v = r();
          c.fillStyle = v < 0.33 ? '#c9b6ff' : v < 0.66 ? '#a98bff' : '#e3d6ff';
          tri(c, px + (r() - 0.5) * 10, py + (r() - 0.5) * 10, x1, y1, x2, y2);
        }
        c.fillStyle = 'rgba(255,255,255,0.45)'; tri(c, pts[5][0], pts[5][1], pts[6][0], pts[6][1], px, py);
        const s = mulberry32(147);
        for (let i = 0; i < 12; i++) sparkle(c, s() * w, 20 + s() * 180, 2 + s() * 3, 'rgba(255,255,255,0.9)');
      },
      far(c, w, h, r) {
        const wv = [[2, 10, 0.3], [5, 5, 1]];
        for (const x of spread(w, 9, r)) {
          const hh = 80 + r() * 140, wd = 22 + r() * 24, lean = (r() - 0.5) * 20, col = ['#e7b6e8', '#d0b6f5', '#f5c0d8'][Math.floor(r() * 3)];
          wrap(w, x, wd + 20, X => gem(c, X, bandY(w, 312, wv, X) + 6, wd, hh, col, lean));
        }
        band(c, w, h, 312, wv, '#e3b0d6');
        haze(c, w, h, 'rgba(255,230,240,0.3)');
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [8, 4, 1]];
        const cols = ['#3fe0d0', '#ff6fae', '#9b7bff', '#69e6ff'];
        for (const x of spread(w, 8, r)) {
          const s = 0.8 + r() * 1, k = Math.floor(r() * 4);
          wrap(w, x, 50 * s, X => {
            const by = bandY(w, 356, wv, X) + 8;
            c.save(); c.shadowColor = '#fff'; c.shadowBlur = 10;
            gem(c, X - 16 * s, by, 16 * s, 40 * s, cols[(k + 1) % 4], -6 * s);
            gem(c, X, by, 22 * s, 70 * s, cols[k], 0);
            gem(c, X + 15 * s, by, 14 * s, 32 * s, cols[(k + 2) % 4], 6 * s);
            c.restore();
          });
        }
        band(c, w, h, 356, wv, '#a86cc1');
        onBand(c, w, 356, wv, 14, r, 20, (x, y, k) => gem(c, x, y + 6, 8 + k * 6, 10 + k * 16, 'rgba(255,255,255,0.35)', (k - 0.5) * 6));
      },
    },
    // 8 ---------------------------------------------------------------
    {
      name: 'Лавова планета', icon: '🌋',
      sky: ['#1a0510', '#6b1a2a'],
      ground: { style: 'lava', body: '#33202f', dark: '#241520', top: '#5a3550', topDark: '#ff7043', glow: '#ffb300', texture: 'cracks', topLight: 'rgba(255,180,90,0.45)' },
      block: { fill: '#5d6b7a', light: '#8a9aab', dark: '#36414d' },
      oneway: { fill: '#8d6e63', dark: '#4e342e' },
      enemy: 'sLavaBlob', enemyColor: '#ffab40', flyer: 'sEmberSprite',
      shooter: 'sMagmaVent', projectile: '#ff6d00',
      decor: ['sLavaVent', 'sBasalt', 'lavaRock', 'sBasalt'],
      particles: 'embers', gravity: 0.57, jumpBoost: 1.12, pit: '#ff5a1f',
      music: { bpm: 124, root: 55, minor: true, lead: 'sawtooth', bass: 'square', drums: true, rest: 0.22, seed: 48 },
      skyDraw(c, w, h) {
        stars(c, w, h, 80, mulberry32(48), h * 0.5);
        const sx = w * 0.24, sy = 150;
        glow(c, sx, sy, 200, 'rgba(255,90,40,0.4)');
        planet(c, sx, sy, 70, '#ffcf6b', '#e8441e');
        c.fillStyle = 'rgba(170,30,10,0.35)'; ell(c, sx + 20, sy + 10, 14, 9); ell(c, sx - 26, sy - 18, 9, 6); ell(c, sx + 4, sy - 34, 7, 4);
        planet(c, w * 0.7, 70, 16, '#b07890', '#4a2030');
        planet(c, w * 0.86, 120, 8, '#d0a0a0', '#603040');
      },
      far(c, w, h, r) {
        for (const x of spread(w, 3, r)) {
          const hh = 90 + r() * 60, wd = 110 + r() * 50;
          wrap(w, x, wd, X => {
            c.fillStyle = '#2b0e16'; c.beginPath(); c.moveTo(X - wd, 310); c.lineTo(X - 18, 310 - hh); c.lineTo(X + 18, 310 - hh); c.lineTo(X + wd, 310); c.fill();
            c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 16; c.fillStyle = '#ff7b1a'; ell(c, X, 311 - hh, 18, 4);
            c.strokeStyle = '#ff7b1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(X - 6, 312 - hh); c.quadraticCurveTo(X - 26, 310 - hh * 0.5, X - 46, 306); c.stroke();
            c.restore();
            glow(c, X, 300 - hh, 40, 'rgba(255,100,30,0.25)');
          });
        }
        c.fillStyle = '#2b0e16'; c.fillRect(0, 306, w, h - 306);
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 10;
        for (const [y, k, a, col] of [[320, 3, 5, '#ff7b1a'], [338, 5, 4, '#ffab40']]) {
          c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
          for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x / w * TAU * k) * a + Math.sin(x / w * TAU * (k * 3)) * 2);
          c.stroke();
        }
        c.restore();
      },
      mid(c, w, h, r) {
        const n = 36, step = w / n;
        for (let i = 0; i < n; i++) {
          const x = i * step, hh = 14 + r() * 46 + (i % 6 === 0 ? 30 : 0);
          const top = 372 - hh;
          c.fillStyle = '#2e1220'; c.fillRect(x, top, step + 0.5, h - top);
          c.fillStyle = '#3e1b2c'; c.beginPath(); c.moveTo(x, top); c.lineTo(x + step * 0.25, top - 4); c.lineTo(x + step * 0.75, top - 4); c.lineTo(x + step + 0.5, top); c.lineTo(x + step * 0.75, top + 3); c.lineTo(x + step * 0.25, top + 3); c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + step * 0.6, top + 3, step * 0.4, h - top);
          c.fillStyle = 'rgba(255,110,40,0.55)'; c.fillRect(x, top + 4, 1.2, h - top);
        }
        const wv = [[5, 6, 0], [11, 3, 1]];
        band(c, w, h, 378, wv, '#241016');
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.strokeStyle = '#ff7b1a'; c.lineWidth = 2;
        for (const x of spread(w, 10, r)) wrap(w, x, 20, X => {
          const y = bandY(w, 378, wv, X) + 10;
          c.beginPath(); c.moveTo(X, y); c.lineTo(X + 8, y + 12); c.lineTo(X + 3, y + 24); c.stroke();
        });
        c.restore();
      },
    },
    // 9 ---------------------------------------------------------------
    {
      name: 'Зоряний корабель', icon: '🚀',
      sky: ['#0b0f2a', '#1d2457'],
      ground: { style: 'road', body: '#c7ccd6', dark: '#a9b0bd', top: '#ff8f3a', topDark: '#d9661a', texture: 'bricks' },
      block: { fill: '#5c7cfa', light: '#a5b8ff', dark: '#364fc7' },
      oneway: { fill: '#b0bec5', dark: '#607d8b' },
      enemy: 'sRoboDog', enemyColor: '#26c6da', flyer: 'sDroneBall',
      shooter: 'sCuteTurret', projectile: '#ff4081',
      decor: ['sCrate', 'sRocketSmall', 'sLightPost', 'sConsole', 'sCrate'],
      particles: 'none', gravity: 0.6, jumpBoost: 1.1, conveyor: true,
      music: { bpm: 128, root: 60, minor: false, lead: 'square', bass: 'square', drums: true, rest: 0.2, seed: 49 },
      skyDraw(c, w, h) { stars(c, w, h, 100, mulberry32(49)); },
      far(c, w, h, r) {
        c.fillStyle = '#e4e8f0'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#d3d9e4'; for (let x = 0; x < w; x += 64) c.fillRect(x, 0, 2, h);
        c.fillStyle = '#d3d9e4'; c.fillRect(0, 36, w, 3);
        for (let x = 128; x < w + 128; x += 256) {
          const X = x % w;
          wrap(w, X, 110, XX => {
            c.save();
            rr(c, XX - 96, 60, 192, 150, 40); c.clip();
            c.fillStyle = '#0b0f2a'; c.fillRect(XX - 96, 60, 192, 150);
            const rr2 = mulberry32(x);
            for (let i = 0; i < 30; i++) {
              const y = 66 + rr2() * 140, len = 20 + rr2() * 70, sx = XX - 96 + rr2() * 192;
              c.strokeStyle = rr2() < 0.5 ? 'rgba(160,220,255,0.8)' : 'rgba(255,255,255,0.7)'; c.lineWidth = 1 + rr2() * 1.5;
              line(c, sx, y, sx + len, y);
            }
            c.fillStyle = '#7e57c2'; circ(c, XX + 50, 200, 46);
            c.fillStyle = 'rgba(255,255,255,0.15)'; ell(c, XX + 40, 180, 30, 8);
            c.restore();
            c.strokeStyle = '#9aa4b5'; c.lineWidth = 9; rr(c, XX - 96, 60, 192, 150, 40); c.stroke();
            c.strokeStyle = '#f5f7fb'; c.lineWidth = 2; rr(c, XX - 92, 64, 184, 142, 36); c.stroke();
            c.fillStyle = '#9aa4b5'; for (let i = 0; i < 6; i++) circ(c, XX - 70 + i * 28, 60, 2.5);
          });
        }
        c.fillStyle = '#ff8f3a'; c.fillRect(0, 238, w, 12);
        c.fillStyle = '#ffb36b'; c.fillRect(0, 238, w, 3);
        c.fillStyle = '#cfd5e0'; c.fillRect(0, 250, w, h - 250);
        c.fillStyle = '#b5bdcb';
        for (let x = 32; x < w; x += 128) for (let i = 0; i < 4; i++) rr(c, x, 276 + i * 9, 40, 4, 2), c.fill();
        c.fillStyle = '#5c7cfa'; for (let x = 96; x < w; x += 128) { rr(c, x, 270, 16, 30, 3); c.fill(); }
        c.fillStyle = '#69f0ae'; for (let x = 96; x < w; x += 128) circ(c, x + 8, 278, 2.5);
      },
      mid(c, w, h, r) {
        c.fillStyle = '#7d8799'; c.fillRect(0, 0, w, 18);
        c.fillStyle = '#9aa4b5'; c.fillRect(0, 18, w, 8); c.fillRect(0, 34, w, 6);
        c.fillStyle = '#5f6878'; for (let x = 0; x < w; x += 64) c.fillRect(x + 20, 14, 10, 30);
        for (let x = 64; x < w; x += 128) {
          c.fillStyle = 'rgba(255,250,220,0.12)'; c.beginPath(); c.moveTo(x - 10, 44); c.lineTo(x - 60, 330); c.lineTo(x + 60, 330); c.lineTo(x + 10, 44); c.fill();
          c.fillStyle = '#5f6878'; rr(c, x - 14, 40, 28, 8, 3); c.fill();
          c.fillStyle = '#fffbe0'; rr(c, x - 10, 46, 20, 4, 2); c.fill();
        }
        const cols = [['#5c7cfa', '#3f5bd8'], ['#ff8f3a', '#d9661a'], ['#4caf50', '#2e7d32'], ['#ab47bc', '#7b1fa2']];
        for (const x of spread(w, 4, r, 0.5)) {
          const [a, b] = cols[Math.floor(r() * 4)], stack = r() < 0.5;
          wrap(w, x, 70, X => {
            for (let s = 0; s < (stack ? 2 : 1); s++) {
              const y = 362 - 46 * (s + 1), ox = s * 14;
              c.fillStyle = b; rr(c, X - 60 + ox, y, 110, 46, 3); c.fill();
              c.fillStyle = a; c.fillRect(X - 56 + ox, y + 4, 102, 38);
              c.fillStyle = b; for (let i = 1; i < 8; i++) c.fillRect(X - 56 + ox + i * 12.7, y + 4, 2.5, 38);
              c.fillStyle = '#fff'; c.fillRect(X - 20 + ox, y + 14, 30, 12);
              c.fillStyle = b; star(c, X - 5 + ox, y + 20, 4, 5, 0.45);
            }
          });
        }
        haze(c, w, h, 'rgba(215,222,235,0.5)');
        c.fillStyle = '#8c95a6'; c.fillRect(0, 362, w, h - 362);
        c.fillStyle = '#ffcf33'; for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 362); c.lineTo(x + 16, 362); c.lineTo(x + 8, 372); c.lineTo(x - 8, 372); c.fill(); }
        c.fillStyle = '#263238'; c.fillRect(0, 372, w, 3);
      },
    },
    // 10 --------------------------------------------------------------
    {
      name: 'Інопланетне місто', icon: '🛸',
      sky: ['#2b0d4a', '#ff7eb3'],
      ground: { style: 'road', body: '#3a2d5c', dark: '#2c2148', top: '#5fe3d0', topDark: '#2bb3a0', texture: 'bricks' },
      block: { fill: '#7e57c2', light: '#b39ddb', dark: '#4527a0' },
      oneway: { fill: '#4dd0e1', dark: '#00838f' },
      enemy: 'sGreenie', enemyColor: '#76ff03', flyer: 'sMiniUfo',
      shooter: 'sDishTurret', projectile: '#ff4fd8',
      decor: ['sDomeHouse', 'sAntennaTower', 'sHoloLamp', 'sLightPost', 'sDomeHouse'],
      particles: 'fireflies', gravity: 0.54, jumpBoost: 1.16,
      music: { bpm: 120, root: 59, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 50 },
      skyDraw(c, w, h) {
        stars(c, w, h, 120, mulberry32(50), h * 0.4);
        const px = w * 0.2, py = 92;
        ringArc(c, px, py, 92, 16, 0.2, 'rgba(255,220,250,0.55)', 4, false);
        planet(c, px, py, 50, '#ffd6f0', '#8a3fb0');
        c.fillStyle = 'rgba(43,13,74,0.55)'; c.beginPath(); c.arc(px, py, 50, -1.3, 1.6); c.arc(px + 22, py, 46, 1.6, -1.3, true); c.fill();
        ringArc(c, px, py, 92, 16, 0.2, 'rgba(255,220,250,0.8)', 4, true);
        const r = mulberry32(150);
        for (let i = 0; i < 3; i++) { const x = w * (0.45 + i * 0.18), y = 50 + r() * 70; c.fillStyle = 'rgba(40,10,60,0.6)'; ell(c, x, y, 14, 4); c.beginPath(); c.arc(x, y - 2, 6, Math.PI, 0); c.fill(); }
      },
      far(c, w, h, r) {
        const col = '#6b3d8f', B = 330;
        let x = 0;
        while (x < w - 30) {
          const k = r(), bw = 30 + r() * 40, bh = 90 + r() * 150;
          const X0 = x + bw / 2;
          wrap(w, X0, bw, X => {
          c.fillStyle = col;
          if (k < 0.4) {
            c.fillRect(X - 6, B - bh, 12, bh);
            circ(c, X, B - bh, bw * 0.45);
            c.fillStyle = 'rgba(120,255,240,0.6)'; for (let i = 0; i < 3; i++) circ(c, X - bw * 0.25 + i * bw * 0.25, B - bh, 2.2);
          } else if (k < 0.7) {
            c.beginPath(); c.moveTo(X - bw / 2, B); c.lineTo(X - 3, B - bh - 30); c.lineTo(X + 3, B - bh - 30); c.lineTo(X + bw / 2, B); c.fill();
            c.fillStyle = 'rgba(255,240,140,0.6)'; for (let y = B - 20; y > B - bh; y -= 22) circ(c, X, y, 2);
          } else {
            c.beginPath(); c.arc(X, B, bw * 0.75, Math.PI, 0); c.fill();
            c.fillStyle = 'rgba(120,255,240,0.5)'; circ(c, X - 8, B - 14, 3); circ(c, X + 8, B - 14, 3);
          }
          });
          x += bw + 6 + r() * 20;
        }
        c.fillStyle = col; c.fillRect(0, B, w, h - B);
        haze(c, w, h, 'rgba(255,140,200,0.18)');
      },
      mid(c, w, h, r) {
        const B = 382;
        for (const x of spread(w, 6, r, 0.6)) {
          const k = r(), hh = 100 + r() * 110, bw = 40 + r() * 30, neon = ['#4ff3ff', '#ff4fd8', '#b2ff59'][Math.floor(r() * 3)];
          wrap(w, x, bw + 10, X => {
            if (k < 0.55) {
              c.fillStyle = '#3b1f5e'; rr(c, X - 9, B - hh, 18, hh, 6); c.fill();
              c.fillStyle = '#4a2a75'; c.beginPath(); c.ellipse(X, B - hh, bw, bw * 0.42, 0, 0, TAU); c.fill();
              c.fillStyle = '#5a3590'; c.beginPath(); c.ellipse(X, B - hh - 6, bw * 0.7, bw * 0.3, 0, Math.PI, 0); c.fill();
              c.save(); c.shadowColor = neon; c.shadowBlur = 12; c.strokeStyle = neon; c.lineWidth = 2.5;
              c.beginPath(); c.ellipse(X, B - hh + 2, bw * 0.95, bw * 0.38, 0, 0, Math.PI); c.stroke(); c.restore();
              c.fillStyle = '#ffe082'; for (let i = 0; i < 5; i++) circ(c, X - bw * 0.6 + i * bw * 0.3, B - hh, 2.6);
            } else {
              c.fillStyle = '#3b1f5e'; c.beginPath(); c.arc(X, B, bw, Math.PI, 0); c.fill();
              c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(X - 6, B - 4, bw * 0.75, Math.PI * 1.1, Math.PI * 1.55); c.lineTo(X - 6, B - 4); c.fill();
              c.fillStyle = '#ffe082'; for (let i = 0; i < 3; i++) circ(c, X - bw * 0.45 + i * bw * 0.45, B - bw * 0.45, 4);
              c.save(); c.shadowColor = neon; c.shadowBlur = 10; c.fillStyle = neon; circ(c, X, B - bw - 8, 4); c.restore();
              c.strokeStyle = '#5a3590'; c.lineWidth = 2; line(c, X, B - bw, X, B - bw - 6);
            }
          });
        }
        for (const x of spread(w, 2, r)) wrap(w, x, 130, X => {
          c.strokeStyle = 'rgba(150,255,240,0.28)'; c.lineWidth = 12; c.beginPath(); c.arc(X, 330, 120, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2; c.beginPath(); c.arc(X, 330, 125, Math.PI * 1.2, Math.PI * 1.5); c.stroke();
        });
        haze(c, w, h, 'rgba(60,20,90,0.25)');
        c.fillStyle = '#2a1648'; c.fillRect(0, B, w, h - B);
        c.fillStyle = '#4ff3ff'; for (let x = 0; x < w; x += 32) c.fillRect(x + 4, B + 3, 14, 2);
      },
    },
    // 11 --------------------------------------------------------------
    {
      name: "Сузір'я", icon: '✨',
      sky: ['#050a24', '#1a2a6c'],
      ground: { style: 'crystal', body: '#1f2f7a', dark: '#18245e', top: '#ffe082', topDark: '#ffb300', glow: '#fff59d', texture: 'gems' },
      block: { fill: '#ef6c8f', light: '#ffb3c6', dark: '#b03a5b' },
      oneway: { fill: '#fff8e1', dark: '#ffd54f', style: 'cloud' },
      enemy: 'sStarPal', enemyColor: '#ffb74d', flyer: 'sStarBird',
      shooter: 'sStarSpitter', projectile: '#fff59d',
      decor: ['sTelescope', 'sStarLamp', 'sStarFlag', 'sStarLamp'],
      particles: 'twinkle', gravity: 0.42, jumpBoost: 1.25,
      music: { bpm: 84, root: 65, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 51, bell: true },
      skyDraw(c, w, h) {
        for (let i = 0; i < 7; i++) glow(c, w * (0.05 + i * 0.15), 260 - i * 34, 120, 'rgba(150,170,255,0.14)');
        stars(c, w, h, 260, mulberry32(51));
        const con = (pts, links) => {
          c.strokeStyle = 'rgba(255,230,150,0.55)'; c.lineWidth = 1.4;
          for (const [a, b] of links) line(c, pts[a][0], pts[a][1], pts[b][0], pts[b][1]);
          c.save(); c.shadowColor = '#fff8c0'; c.shadowBlur = 8;
          for (const [x, y] of pts) sparkle(c, x, y, 4, '#fffde7');
          c.restore();
        };
        const X = w * 0.12;
        con([[X, 70], [X + 40, 62], [X + 76, 70], [X + 104, 82], [X + 112, 116], [X + 156, 120], [X + 160, 84]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]]);
        const Y = w * 0.6;
        con([[Y, 50], [Y + 26, 80], [Y + 50, 56], [Y + 76, 84], [Y + 100, 52]], [[0, 1], [1, 2], [2, 3], [3, 4]]);
        const Z = w * 0.84;
        con([[Z, 140], [Z - 24, 120], [Z - 34, 150], [Z, 182], [Z + 34, 150], [Z + 24, 120]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]);
      },
      far(c, w, h, r) {
        for (let i = 0; i < 6; i++) { const x = r() * w, y = 120 + r() * 160, s = 60 + r() * 60, col = r() < 0.5 ? 'rgba(90,140,255,0.16)' : 'rgba(80,220,230,0.12)'; wrap(w, x, s, X => glow(c, X, y, s, col)); }
        tStars(c, w, 120, r, 0, 320);
        for (const x of spread(w, 4, r)) {
          const y0 = 150 + r() * 100, pts = [];
          let px = 0, py = 0;
          for (let i = 0; i < 5; i++) { pts.push([px, py]); px += 18 + r() * 26; py += (r() - 0.5) * 40; }
          wrap(w, x, 140, X => {
            c.strokeStyle = 'rgba(255,230,150,0.35)'; c.lineWidth = 1.2;
            for (let i = 1; i < pts.length; i++) line(c, X + pts[i - 1][0], y0 + pts[i - 1][1], X + pts[i][0], y0 + pts[i][1]);
            for (const [a, b] of pts) sparkle(c, X + a, y0 + b, 3, 'rgba(255,253,231,0.9)');
          });
        }
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 3, r)) {
          const y = 190 + r() * 70, s = 0.8 + r() * 0.5;
          wrap(w, x, 60 * s, X => {
            glow(c, X, y, 70 * s, 'rgba(255,230,150,0.15)');
            cloudLump(c, X, y, s, '#2a3c8f', '#3a50a8');
            for (let i = 0; i < 4; i++) sparkle(c, X - 25 * s + i * 17 * s, y - 14 * s + (i % 2) * 8, 2.4, '#ffe9a8');
          });
        }
        const wv = [[3, 10, 0], [6, 5, 2]];
        band(c, w, h, 360, wv, '#16205a');
        onBand(c, w, 360, wv, 16, r, 40, (x, y, k) => { c.fillStyle = '#1c2a6e'; circ(c, x, y + 8, 16 + k * 16); });
        c.save(); c.strokeStyle = 'rgba(255,230,150,0.45)'; c.lineWidth = 2; c.beginPath();
        for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 360, wv, x) - 2);
        c.stroke(); c.restore();
        for (const x of spread(w, 5, r)) wrap(w, x, 20, X => { c.save(); c.translate(X, bandY(w, 360, wv, X) + 4); c.scale(1.8, 1.8); Art.decors.sStarLamp(c, 0); c.restore(); });
      },
    },
    // 12 --------------------------------------------------------------
    {
      name: 'Чорна діра', icon: '🌌',
      sky: ['#0a0418', '#24104a'],
      ground: { style: 'moon', body: '#3b2667', dark: '#2c1b50', top: '#ff7ad9', topDark: '#c04fb0', light: '#4f3784', texture: 'craters' },
      block: { fill: '#00bcd4', light: '#80deea', dark: '#00838f' },
      oneway: { fill: '#ce93d8', dark: '#8e24aa' },
      bounce: { fill: '#69f0ae', dark: '#00c853', light: '#b9f6ca' },
      enemy: 'sVoidPuff', enemyColor: '#b388ff', flyer: 'sMoonlet',
      shooter: 'sOrbSpitter', projectile: '#69f0ae',
      decor: ['sVortexStone', 'sOrbLamp', 'sGemCluster', 'sCraterGlow'],
      particles: 'sparkle', gravity: 0.48, jumpBoost: 1.22,
      music: { bpm: 88, root: 57, minor: true, lead: 'triangle', bass: 'sine', drums: true, rest: 0.35, seed: 52, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 200, mulberry32(52));
        const vx = w * 0.62, vy = 150;
        glow(c, vx, vy, 260, 'rgba(170,80,255,0.35)');
        glow(c, vx, vy, 150, 'rgba(255,120,220,0.3)');
        const cols = ['#ff7ad9', '#ffb74d', '#7df3ff', '#b388ff', '#fff59d', '#69f0ae'];
        c.save(); c.translate(vx, vy); c.scale(1, 0.55);
        cols.forEach((col, i) => {
          c.globalAlpha = 0.75;
          spiral(c, 0, 0, 200, 1.25, i * TAU / cols.length, col, 7);
          c.globalAlpha = 0.4;
          spiral(c, 0, 0, 150, 1.1, i * TAU / cols.length + 0.4, '#ffffff', 2);
        });
        c.globalAlpha = 1;
        c.restore();
        c.strokeStyle = '#ffd1f5'; c.lineWidth = 4; c.beginPath(); c.ellipse(vx, vy, 34, 20, 0, 0, TAU); c.stroke();
        c.fillStyle = '#12052a'; ell(c, vx, vy, 29, 17);
        c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(vx, vy, 40, 24, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
        const r = mulberry32(152);
        for (let i = 0; i < 14; i++) { const a = r() * TAU, d = 60 + r() * 160; sparkle(c, vx + Math.cos(a) * d, vy + Math.sin(a) * d * 0.55, 2 + r() * 3, 'rgba(255,255,255,0.9)'); }
      },
      far(c, w, h, r) {
        const cols = ['rgba(255,122,217,0.25)', 'rgba(125,243,255,0.2)', 'rgba(255,183,77,0.2)'];
        cols.forEach((col, i) => {
          c.strokeStyle = col; c.lineWidth = 14 - i * 3; c.lineCap = 'round'; c.beginPath();
          for (let x = 0; x <= w; x += 8) c.lineTo(x, 210 + i * 30 + Math.sin(x / w * TAU * (2 + i) + i) * 30);
          c.stroke();
        });
        const pc = [['#ffc4ef', '#d64fb0'], ['#b9f6ca', '#2e9e6a'], ['#ffe0b2', '#e07a30'], ['#c5cae9', '#5c6bc0']];
        for (const x of spread(w, 5, r)) {
          const y = 60 + r() * 200, s = 6 + r() * 12, [a, b] = pc[Math.floor(r() * 4)];
          wrap(w, x, s * 2, X => planet(c, X, y, s, a, b));
        }
        haze(c, w, h, 'rgba(20,5,50,0.25)');
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 4, r)) {
          const y = 170 + r() * 90, s = 26 + r() * 20, seed = (r() * 1e6) | 0;
          wrap(w, x, s * 1.3, X => {
            glow(c, X, y, s * 1.6, 'rgba(255,120,220,0.2)');
            rockBlob(c, X, y, s, '#4a2f7a', '#331f5c', seed, 2);
            spiral(c, X - s * 0.2, y - s * 0.1, s * 0.4, 1.4, 0, 'rgba(255,157,240,0.7)', 2);
            c.save(); c.shadowColor = '#7df3ff'; c.shadowBlur = 8; gem(c, X + s * 0.3, y - s * 0.6, 6, 14, '#7df3ff', 2); c.restore();
          });
        }
        haze(c, w, h, 'rgba(20,8,45,0.25)');
        const wv = [[3, 10, 1], [7, 5, 0]];
        band(c, w, h, 360, wv, '#2a1650');
        onBand(c, w, 360, wv, 14, r, 30, (x, y, k) => { c.fillStyle = '#331c60'; circ(c, x, y + 8, 14 + k * 14); });
        c.save(); c.shadowColor = '#ff7ad9'; c.shadowBlur = 8; c.strokeStyle = 'rgba(255,122,217,0.7)'; c.lineWidth = 2; c.beginPath();
        for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 360, wv, x) - 1);
        c.stroke(); c.restore();
      },
    },
    // 13 --------------------------------------------------------------
    {
      name: 'Бананова галактика', icon: '🍌',
      sky: ['#2a0f5c', '#ff6fb1'],
      ground: { style: 'candy', body: '#5b2a86', dark: '#47206b', top: '#ffd54f', topDark: '#f9a825', texture: 'dots' },
      block: { fill: '#e040fb', light: '#f3a6ff', dark: '#9c27b0', bricks: true },
      oneway: { fill: '#4fc3f7', dark: '#0288d1' },
      bounce: { fill: '#ff5252', dark: '#c62828', light: '#ffcdd2' },
      enemy: 'sMonkeyNaut', enemyColor: '#8d5524', flyer: 'sBananaRocket',
      shooter: 'sPartyCannon', projectile: '#ff4081',
      decor: ['sBananaStatue', 'sRocketBanana', 'sGiftStar', 'sPartyFlag', 'flagUA', 'sBananaStatue'],
      particles: 'sparkle', gravity: 0.45, jumpBoost: 1.25,
      music: { bpm: 140, root: 65, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.2, seed: 53, bell: true },
      skyDraw(c, w, h) {
        const rb = ['rgba(255,82,82,0.35)', 'rgba(255,167,38,0.35)', 'rgba(255,238,88,0.32)', 'rgba(102,187,106,0.3)', 'rgba(66,165,245,0.32)', 'rgba(171,71,188,0.35)'];
        rb.forEach((col, i) => { const a = Math.PI * (1.05 + i * 0.16); glow(c, w * 0.42 + Math.cos(a) * w * 0.38, 330 + Math.sin(a) * 260, 160, col); });
        stars(c, w, h, 180, mulberry32(53), h * 0.7);
        const px = w * 0.78, py = 108, R = 52;
        glow(c, px, py, 150, 'rgba(255,230,120,0.5)');
        ringArc(c, px, py, 98, 18, -0.25, 'rgba(255,220,120,0.6)', 5, false);
        planet(c, px, py, R, '#fff6b0', '#f0a000');
        c.save(); c.beginPath(); c.arc(px, py, R, 0, TAU); c.clip();
        bigBanana(c, px - 8, py - 16, 3.2, 0.2); bigBanana(c, px + 18, py + 20, 2.4, -0.3);
        c.restore();
        ringArc(c, px, py, 98, 18, -0.25, 'rgba(255,230,140,0.9)', 5, true);
        for (let i = 0; i < 8; i++) { const a = Math.PI * (0.05 + i * 0.12); bigBanana(c, px + Math.cos(a) * 98 * Math.cos(-0.25) - Math.sin(a) * 18 * Math.sin(-0.25), py + Math.cos(a) * 98 * Math.sin(-0.25) + Math.sin(a) * 18 * Math.cos(-0.25), 0.7, a); }
        firework(c, w * 0.18, 80, 34, ['#ff4081', '#ffd740']);
        firework(c, w * 0.45, 52, 26, ['#40c4ff', '#b2ff59']);
        firework(c, w * 0.94, 200, 22, ['#ffd740', '#ff6e40']);
        const r = mulberry32(153);
        for (let i = 0; i < 20; i++) sparkle(c, r() * w, 20 + r() * 220, 2 + r() * 3, 'rgba(255,255,255,0.95)');
      },
      far(c, w, h, r) {
        for (const x of spread(w, 3, r)) {
          const y = 70 + r() * 120, s = 3.5 + r() * 2, rot = (r() - 0.5) * 1.2;
          wrap(w, x, 70, X => { glow(c, X, y, 60, 'rgba(255,240,150,0.35)'); bigBanana(c, X, y, s, rot); });
        }
        for (const x of spread(w, 3, r)) {
          const y = 120 + r() * 140, R = 14 + r() * 14;
          wrap(w, x, R * 2.4, X => {
            ringArc(c, X, y, R * 2, R * 0.45, 0.3, 'rgba(255,128,200,0.8)', 3, false);
            planet(c, X, y, R, '#fff3b0', '#e8a000', [[-0.3, 0.16, 'rgba(255,255,255,0.3)'], [0.25, 0.18, 'rgba(200,110,0,0.3)']]);
            ringArc(c, X, y, R * 2, R * 0.45, 0.3, 'rgba(255,128,200,0.95)', 3, true);
          });
        }
        for (const x of spread(w, 3, r)) {
          const y = 120 + r() * 120, rot = 0.6 + r() * 0.4;
          wrap(w, x, 60, X => {
            c.save(); c.translate(X, y); c.rotate(rot);
            const g = c.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, 'rgba(255,200,120,0.6)'); g.addColorStop(1, 'rgba(255,200,120,0)');
            c.fillStyle = g; c.fillRect(-4, 0, 8, 70);
            c.restore();
            c.save(); c.translate(X, y); c.rotate(rot + Math.PI);
            rocket(c, 0, 0, 0.7, '#ffe135', '#6b4a1a', '#ff4081', 1);
            c.restore();
          });
        }
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.lineCap = 'round';
        for (const x of spread(w, 4, r)) { const y = 40 + r() * 140; wrap(w, x, 50, X => line(c, X, y, X - 40, y + 16)); }
      },
      mid(c, w, h, r) {
        c.strokeStyle = '#ffe082'; c.lineWidth = 1.5;
        c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, 70 + Math.abs(Math.sin(Math.PI * x / 128)) * 26); c.stroke();
        const fc = ['#ff5252', '#ffd740', '#40c4ff', '#b2ff59', '#ff80ab', '#ab47bc'];
        for (let x = 8, i = 0; x < w; x += 16, i++) { const y = 70 + Math.abs(Math.sin(Math.PI * x / 128)) * 26; c.fillStyle = fc[i % 6]; tri(c, x - 6, y, x + 6, y, x, y + 13); }
        for (const x of spread(w, 5, r)) {
          const y = 160 + r() * 80, col = fc[Math.floor(r() * 6)];
          wrap(w, x, 20, X => {
            c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(X, y + 14); c.quadraticCurveTo(X + 6, y + 40, X - 2, y + 70); c.stroke();
            c.fillStyle = col; ell(c, X, y, 11, 14);
            c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, X - 4, y - 5, 3, 5, -0.3);
            tri(c, X - 2, y + 14, X + 2, y + 14, X, y + 11);
          });
        }
        const wv = [[3, 10, 0.4], [5, 5, 1.5]];
        band(c, w, h, 356, wv, '#4a1f7a');
        c.save(); c.strokeStyle = '#ffd54f'; c.lineWidth = 3; c.beginPath();
        for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 356, wv, x));
        c.stroke(); c.restore();
        onBand(c, w, 356, wv, 6, r, 40, (x, y, k) => {
          c.save(); c.translate(x, y + 4); c.scale(2.2, 2.2);
          (k < 0.5 ? Art.decors.sGiftStar : Art.decors.sRocketBanana)(c, 0);
          c.restore();
        });
      },
    },
  ];
})();
