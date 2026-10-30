'use strict';
// Світи 29–40: фабрика, іграшки, гроза, захід сонця, шахта, піраміди, глибини,
// Місяць, Марс, космічна станція, туманність і фінальне Бананове королівство.
// Нові вороги й декорації мають префікс «x», щоб не перетинатися з іншими файлами.
(() => {
  const TAU = Math.PI * 2;
  // ---------- маленькі помічники ----------
  function eyes(c, pts, r, look = 1) {
    for (const [x, y] of pts) {
      c.fillStyle = '#fff'; circ(c, x, y, r);
      c.fillStyle = '#1a1a1a'; circ(c, x + look * r * 0.3, y + r * 0.1, r * 0.58);
      c.fillStyle = '#fff'; circ(c, x + look * r * 0.3 + r * 0.25, y - r * 0.22, r * 0.22);
    }
  }
  function smile(c, x, y, r, col = '#3a1a10') {
    c.strokeStyle = col; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r, 0.25, Math.PI - 0.25); c.stroke();
  }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function gear(c, x, y, R, n, col, hole, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = col;
    for (let i = 0; i < n; i++) { c.save(); c.rotate(i * TAU / n); c.fillRect(-R * 0.16, -R * 1.18, R * 0.32, R * 0.4); c.restore(); }
    circ(c, 0, 0, R);
    if (hole) { c.fillStyle = hole; circ(c, 0, 0, R * 0.35); }
    c.restore();
  }
  function bolt(c, x, y, len, seed) {
    const r = mulberry32(seed);
    const pts = [[x, y]];
    let px = x, py = y;
    while (py < y + len) { px += (r() - 0.5) * 40; py += 18 + r() * 20; pts.push([px, py]); }
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    c.shadowColor = '#fff6b0'; c.shadowBlur = 22;
    for (const [lw, col] of [[7, 'rgba(255,240,150,0.55)'], [3, '#fffde7']]) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
      pts.forEach(([a, b]) => c.lineTo(a, b)); c.stroke();
    }
    c.restore();
  }
  function rain(c, w, n, r, y0, y1, len, col, lw) {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = y0 + r() * (y1 - y0);
      wrap(w, x, 12, X => line(c, X, y, X - len * 0.3, y + len));
    }
  }
  function palmSil(c, x, y, s, col) {
    c.strokeStyle = col; c.lineWidth = s * 0.07; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * 0.18, y - s * 0.5, x + s * 0.08, y - s); c.stroke();
    c.fillStyle = col;
    for (let i = 0; i < 7; i++) {
      c.save(); c.translate(x + s * 0.08, y - s); c.rotate(-Math.PI / 2 + (i - 3) * 0.5 + Math.PI / 2);
      ell(c, 0, -s * 0.22, s * 0.06, s * 0.25); c.restore();
    }
  }
  function bananaPalm(c, x, y, s, trunk, leaf, leaf2) {
    c.strokeStyle = trunk; c.lineWidth = s * 0.09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - s * 0.12, y - s * 0.5, x + s * 0.04, y - s); c.stroke();
    c.strokeStyle = Art.shade(trunk, -30); c.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) { const yy = y - s * i / 6; line(c, x - s * 0.08, yy, x + s * 0.03, yy - 2); }
    const tx = x + s * 0.04, ty = y - s;
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? leaf : leaf2;
      c.save(); c.translate(tx, ty); c.rotate((i - 3) * 0.48);
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.18, -s * 0.28, 0, -s * 0.5); c.quadraticCurveTo(-s * 0.18, -s * 0.28, 0, 0); c.fill();
      c.restore();
    }
    bunch(c, tx, ty + s * 0.08, s);
  }
  function jelly(c, x, y, s, col, a) {
    glow(c, x, y, 40 * s, col.replace('A', a * 0.45));
    c.fillStyle = col.replace('A', a);
    c.beginPath(); c.arc(x, y, 14 * s, Math.PI, 0); c.quadraticCurveTo(x, y + 6 * s, x - 14 * s, y); c.fill();
    c.strokeStyle = col.replace('A', a * 0.8); c.lineWidth = 2 * s; c.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      c.beginPath(); c.moveTo(x + i * 5 * s, y + 2 * s);
      for (let k = 1; k <= 4; k++) c.lineTo(x + i * 5 * s + Math.sin(k * 1.5 + i) * 3 * s, y + 2 * s + k * 7 * s);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, x - 5 * s, y - 7 * s, 4 * s, 2.5 * s, -0.5);
  }
  // тонує вже намальоване (відсуває шар углиб, щоб не плутати з платформами)
  function haze(c, w, y1, col) {
    c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = col; c.fillRect(0, 0, w, y1); c.restore();
  }
  // гроно бананів, що росте вгору (не схоже на банан-нагороду)
  function bunch(c, x, y, s) {
    c.lineCap = 'round';
    c.strokeStyle = '#6b8e23'; c.lineWidth = s * 0.05; line(c, x, y - s * 0.02, x, y + s * 0.16);
    for (let i = -2; i <= 2; i++) {
      for (const [col, lw] of [['#c9a227', s * 0.07], ['#ffd54f', s * 0.05]]) {
        c.strokeStyle = col; c.lineWidth = lw;
        c.beginPath(); c.moveTo(x + i * s * 0.035, y + s * 0.12); c.quadraticCurveTo(x + i * s * 0.09, y + s * 0.06, x + i * s * 0.075, y - s * 0.02 + Math.abs(i) * s * 0.02); c.stroke();
      }
    }
  }
  function crater(c, x, y, rx, dark, lite) {
    c.fillStyle = lite; ell(c, x, y + 1, rx * 1.12, rx * 0.36);
    c.fillStyle = dark; ell(c, x, y, rx, rx * 0.3);
  }
  function crystalShard(c, x, y, s, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x, y - 22 * s); c.lineTo(x + 8 * s, y - 6 * s); c.lineTo(x, y + 14 * s); c.lineTo(x - 8 * s, y - 6 * s); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)';
    c.beginPath(); c.moveTo(x, y - 22 * s); c.lineTo(x + 8 * s, y - 6 * s); c.lineTo(x, y - 2 * s); c.closePath(); c.fill();
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

  // =================== Вороги ===================
  Object.assign(Art.enemies, {
    // --- ходячі (низ по центру, дивляться у +x) ---
    xGearBot(c, t, col) {
      col = col || '#ff8a3d';
      const s = Math.sin(t * 12) * 2;
      c.fillStyle = '#455a64';
      rr(c, -10 + s, -6, 8, 6, 2.5); c.fill(); rr(c, 2 - s, -6, 8, 6, 2.5); c.fill();
      gear(c, 0, -16, 11, 8, Art.shade(col, -45), null, t * 2);
      c.fillStyle = col; circ(c, 0, -16, 11);
      c.fillStyle = '#fff6e5'; circ(c, 1, -16, 8);
      eyes(c, [[-2, -17], [5, -17]], 3);
      smile(c, 2, -14, 2.2);
      c.strokeStyle = '#555'; c.lineWidth = 1.5; line(c, 0, -27, 2, -32);
      c.fillStyle = Math.sin(t * 6) > 0 ? '#ffeb3b' : '#ff5252'; circ(c, 2, -33, 2.2);
    },
    xToySoldier(c, t, col) {
      col = col || '#e53935';
      const s = Math.sin(t * 10) * 2.5;
      c.fillStyle = '#1e3a8a';
      c.fillRect(-6 + s * 0.5, -9, 5, 7); c.fillRect(1 - s * 0.5, -9, 5, 7);
      c.fillStyle = '#222'; rr(c, -7 + s * 0.5, -3, 7, 3, 1.5); c.fill(); rr(c, 0 - s * 0.5, -3, 7, 3, 1.5); c.fill();
      c.fillStyle = col; rr(c, -8, -19, 16, 11, 3); c.fill();
      c.fillStyle = '#ffd54f'; c.fillRect(-1, -19, 2, 11); circ(c, -4, -15, 1); circ(c, 4, -15, 1);
      c.fillStyle = '#fff'; c.fillRect(-8, -10, 16, 2);
      c.fillStyle = '#ffe0c2'; circ(c, 1, -23, 6.5);
      c.fillStyle = 'rgba(255,90,90,0.55)'; circ(c, -2, -21, 1.6); circ(c, 6, -21, 1.6);
      eyes(c, [[-0.5, -24], [4.5, -24]], 2.3);
      c.fillStyle = '#222'; rr(c, -6, -36, 13, 10, 3); c.fill();
      c.fillStyle = '#ffd54f'; c.fillRect(-6, -28, 13, 2); circ(c, 0.5, -36, 2);
      c.fillStyle = col; ell(c, -10, -16, 2.5, 5, 0.2); ell(c, 10, -16, 2.5, 5, -0.2);
    },
    xSnail(c, t, col) {
      col = col || '#ffca28';
      const st = Math.sin(t * 6);
      c.fillStyle = '#7fd3c6';
      c.beginPath(); c.moveTo(-14, 0); c.lineTo(10, 0); c.quadraticCurveTo(16, 0, 15, -8); c.lineTo(11, -14); c.quadraticCurveTo(6, -12, 4, -4); c.lineTo(-14, -2); c.closePath(); c.fill();
      c.strokeStyle = '#7fd3c6'; c.lineWidth = 2; c.lineCap = 'round';
      line(c, 10, -13, 9 + st, -21); line(c, 13, -12, 15 + st, -20);
      eyes(c, [[9 + st, -22], [15 + st, -21]], 2.6);
      smile(c, 12, -8, 2, '#2c5a54');
      c.fillStyle = col; circ(c, -4, -12, 10);
      c.strokeStyle = Art.shade(col, -70); c.lineWidth = 2;
      c.beginPath(); for (let a = 0; a < 13; a += 0.4) c.lineTo(-4 + Math.cos(a) * a * 0.7, -12 + Math.sin(a) * a * 0.7); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -8, -18, 3, 2, -0.6);
    },
    xHermit(c, t, col) {
      col = col || '#ff6f61';
      c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) line(c, 2 + i * 4, -5, 4 + i * 4, Math.sin(t * 14 + i) * 1.5);
      c.fillStyle = '#f4d7b0';
      c.beginPath(); c.moveTo(-15, -2); c.quadraticCurveTo(-16, -22, -2, -24); c.quadraticCurveTo(8, -20, 6, -4); c.closePath(); c.fill();
      c.strokeStyle = '#c99a6a'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(-4, -12, 7, 0.3, 5.5); c.stroke(); c.beginPath(); c.arc(-4, -12, 3, 0.3, 5); c.stroke();
      c.fillStyle = col; ell(c, 8, -8, 7, 5);
      const sn = Math.abs(Math.sin(t * 6)) * 0.5;
      c.save(); c.translate(14, -10); c.rotate(-sn); circ(c, 0, 0, 4.5); c.fillStyle = '#ffd7c9'; tri(c, 1, -1, 6, -3, 6, 1); c.restore();
      c.strokeStyle = col; c.lineWidth = 2; line(c, 7, -12, 6, -19); line(c, 11, -12, 12, -19);
      eyes(c, [[6, -20], [12, -20]], 2.8);
    },
    xMole(c, t, col) {
      col = col || '#8a7aa8';
      const s = Math.sin(t * 10) * 1.5;
      c.fillStyle = Art.shade(col, -30); ell(c, -6 + s, -2, 4, 2.5); ell(c, 6 - s, -2, 4, 2.5);
      c.fillStyle = col; ell(c, 0, -11, 13, 11);
      c.fillStyle = Art.shade(col, 35); ell(c, 3, -7, 7, 5);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(0, -18, 11, 8, 0, Math.PI, 0); c.fill(); c.fillRect(-12, -19, 24, 2.5);
      c.fillStyle = '#fffbe0'; circ(c, 4, -22, 3);
      c.fillStyle = 'rgba(255,240,150,0.35)'; tri(c, 6, -24, 18, -30, 18, -16);
      eyes(c, [[0, -13], [7, -13]], 3);
      c.fillStyle = '#ff8fab'; circ(c, 12, -9, 3);
      c.fillStyle = '#fbe9e7'; ell(c, 13, -4, 3, 2);
    },
    xMummy(c, t, col) {
      col = col || '#f5efe0';
      const s = Math.sin(t * 9) * 2;
      c.fillStyle = Art.shade(col, -40);
      rr(c, -7 + s * 0.5, -8, 6, 8, 2); c.fill(); rr(c, 1 - s * 0.5, -8, 6, 8, 2); c.fill();
      c.fillStyle = col; rr(c, -10, -28, 20, 22, 9); c.fill();
      c.strokeStyle = Art.shade(col, -55); c.lineWidth = 1.3;
      for (let i = 0; i < 5; i++) line(c, -9, -24 + i * 4 + (i % 2), 9, -25 + i * 4 - (i % 2));
      c.fillStyle = '#3a2a1a'; rr(c, -4, -24, 13, 7, 3); c.fill();
      eyes(c, [[-0.5, -20.5], [5.5, -20.5]], 2.8);
      c.fillStyle = col; rr(c, 6, -17, 10, 4, 2); c.fill(); rr(c, 4, -12, 10, 4, 2); c.fill();
      c.strokeStyle = col; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-8, -14); c.quadraticCurveTo(-14, -12 + Math.sin(t * 5) * 3, -17, -8 + Math.sin(t * 5 + 1) * 3); c.stroke();
    },
    xOctopus(c, t, col) {
      col = col || '#ff6e9c';
      c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const x = -9 + i * 6;
        c.beginPath(); c.moveTo(x, -10); c.quadraticCurveTo(x + Math.sin(t * 8 + i) * 4, -4, x + Math.sin(t * 8 + i + 1) * 3 + 2, -1); c.stroke();
      }
      c.fillStyle = col; ell(c, 0, -17, 13, 12);
      c.fillStyle = Art.shade(col, 40); circ(c, -6, -23, 2); circ(c, -1, -27, 1.5); circ(c, 7, -25, 1.6);
      eyes(c, [[-1, -16], [6, -16]], 3.6);
      smile(c, 3, -12, 2);
    },
    xMoonBunny(c, t, col) {
      col = col || '#f3e5ff';
      const hop = Math.abs(Math.sin(t * 6)) * 4;
      c.save(); c.translate(0, -hop);
      c.fillStyle = col;
      ell(c, -2, -24, 3, 9, -0.25); ell(c, 4, -25, 3, 9, 0.2);
      c.fillStyle = '#ff9ec7'; ell(c, -2, -24, 1.4, 6, -0.25); ell(c, 4, -25, 1.4, 6, 0.2);
      c.fillStyle = col; ell(c, -1, -9, 12, 9); circ(c, 5, -15, 7.5); circ(c, -12, -9, 3.5);
      c.fillStyle = '#fff'; circ(c, -13, -10, 2.5);
      eyes(c, [[3, -16], [8.5, -16]], 2.6);
      c.fillStyle = '#ff7eb3'; circ(c, 11.5, -13, 1.4);
      c.fillStyle = 'rgba(255,120,170,0.5)'; circ(c, 3, -12, 1.8);
      c.strokeStyle = 'rgba(170,220,255,0.75)'; c.lineWidth = 1.5; c.beginPath(); c.arc(3, -15, 10.5, -2.6, 0.6); c.stroke();
      c.restore();
      c.fillStyle = Art.shade(col, -30); ell(c, -6, -1, 4, 1.8); ell(c, 5, -1, 4, 1.8);
    },
    xMarsRover(c, t, col) {
      col = col || '#eceff1';
      for (const x of [-9, 0, 9]) {
        c.fillStyle = '#37474f'; circ(c, x, -4, 4);
        c.strokeStyle = '#90a4ae'; c.lineWidth = 1.2; const a = t * 9;
        line(c, x - Math.cos(a) * 3, -4 - Math.sin(a) * 3, x + Math.cos(a) * 3, -4 + Math.sin(a) * 3);
      }
      c.fillStyle = col; rr(c, -13, -14, 26, 8, 3); c.fill();
      c.fillStyle = '#1e88e5'; c.fillRect(-12, -17, 12, 3);
      c.fillStyle = '#90a4ae'; c.fillRect(4, -24, 2.5, 10);
      c.fillStyle = col; rr(c, 0, -32, 15, 9, 3); c.fill();
      eyes(c, [[4.5, -27.5], [10.5, -27.5]], 2.7);
      c.strokeStyle = '#b0bec5'; c.lineWidth = 1.2; line(c, -10, -14, -12, -22);
      c.fillStyle = Math.sin(t * 5) > 0 ? '#ff5252' : '#69f0ae'; circ(c, -12, -23, 1.8);
    },
    xAstroBot(c, t, col) {
      col = col || '#ff8a65';
      c.fillStyle = '#37474f'; rr(c, -12, -7, 24, 7, 3.5); c.fill();
      c.fillStyle = '#90a4ae'; for (let i = 0; i < 4; i++) circ(c, -8 + i * 5.3 + ((t * 20) % 5.3) * 0.2, -3.5, 1.6);
      c.fillStyle = col; rr(c, -11, -27, 22, 21, 8); c.fill();
      c.fillStyle = Art.shade(col, 40); c.fillRect(-7, -10, 14, 2);
      c.fillStyle = '#16233a'; rr(c, -7, -24, 15, 11, 4); c.fill();
      c.fillStyle = '#4ff3ff';
      const bl = Math.sin(t * 2.5) > 0.93;
      if (bl) { c.fillRect(-4, -19, 4, 1.5); c.fillRect(2, -19, 4, 1.5); } else { rr(c, -4, -21, 3.5, 5, 1.5); c.fill(); rr(c, 2.5, -21, 3.5, 5, 1.5); c.fill(); }
      c.strokeStyle = '#78909c'; c.lineWidth = 1.5; line(c, 0, -27, 0, -32);
      c.fillStyle = Math.sin(t * 6) > 0 ? '#69f0ae' : '#ffeb3b'; circ(c, 0, -33, 2.3);
      c.fillStyle = Art.shade(col, -35); ell(c, -12, -17, 2.5, 4); ell(c, 12, -17, 2.5, 4);
    },
    xStarBlob(c, t, col) {
      col = col || '#ffd54f';
      const s = Math.sin(t * 10) * 2;
      c.fillStyle = Art.shade(col, -60); ell(c, -5 + s, -2, 3.5, 2); ell(c, 5 - s, -2, 3.5, 2);
      c.save(); c.translate(0, -14); c.rotate(Math.sin(t * 3) * 0.15);
      c.shadowColor = col; c.shadowBlur = 8;
      c.fillStyle = col; star(c, 0, 0, 15, 5, 0.55);
      c.restore();
      eyes(c, [[-2, -15], [5, -15]], 3);
      c.fillStyle = 'rgba(255,110,140,0.6)'; circ(c, -5, -11, 1.6); circ(c, 8, -11, 1.6);
      smile(c, 1.5, -12, 2);
    },
    xPineapple(c, t, col) {
      col = col || '#ffb300';
      const s = Math.sin(t * 11) * 2;
      c.fillStyle = '#6d4c1a'; rr(c, -7 + s, -5, 5, 5, 2); c.fill(); rr(c, 2 - s, -5, 5, 5, 2); c.fill();
      c.fillStyle = '#2e9e43';
      for (let i = -2; i <= 2; i++) { c.save(); c.translate(0, -26); c.rotate(i * 0.38 + Math.sin(t * 4) * 0.05); ell(c, 0, -6, 2.6, 7); c.restore(); }
      c.fillStyle = col; ell(c, 0, -15, 11, 12);
      c.strokeStyle = Art.shade(col, -60); c.lineWidth = 1;
      c.save(); c.beginPath(); c.ellipse(0, -15, 11, 12, 0, 0, TAU); c.clip();
      for (let i = -3; i <= 3; i++) { line(c, i * 6 - 12, -27, i * 6 + 12, -3); line(c, i * 6 + 12, -27, i * 6 - 12, -3); }
      c.restore();
      c.fillStyle = '#fff3c4'; ell(c, 2, -15, 7, 5);
      eyes(c, [[-1, -16], [5, -16]], 2.7);
      smile(c, 2, -13, 1.8);
    },
    // --- літаючі (центр у 0,0) ---
    xPropBot(c, t) {
      const p = Math.cos(t * 40);
      c.fillStyle = '#607d8b'; c.fillRect(-1, -14, 2, 5);
      c.fillStyle = '#cfd8dc'; ell(c, 0, -14, Math.abs(p) * 13 + 2, 2);
      c.fillStyle = '#ffb74d'; rr(c, -10, -9, 20, 17, 5); c.fill();
      c.fillStyle = '#263238'; rr(c, -7, -6, 15, 9, 3); c.fill();
      c.fillStyle = '#69f0ae'; circ(c, -2, -1.5, 2.2); circ(c, 4, -1.5, 2.2);
      c.fillStyle = '#e65100'; c.fillRect(-6, 5, 12, 1.5);
      c.strokeStyle = '#607d8b'; c.lineWidth = 1.6; line(c, -8, 8, -10, 12); line(c, 8, 8, 10, 12);
    },
    xToyPlane(c, t) {
      const p = Math.abs(Math.cos(t * 40));
      c.fillStyle = '#1e88e5'; ell(c, -1, -5, 4, 9, 0.1); ell(c, -1, 5, 4, 9, -0.1);
      c.fillStyle = '#fdd835'; tri(c, -14, 0, -18, -8, -10, 0);
      c.fillStyle = '#e53935'; ell(c, 0, 0, 14, 6);
      c.fillStyle = '#fff'; circ(c, 13, 0, 2.5);
      c.fillStyle = 'rgba(80,80,80,0.6)'; ell(c, 15, 0, 1.2, p * 9 + 1);
      c.fillStyle = '#90caf9'; ell(c, 3, -5, 4, 3);
      eyes(c, [[6, -1], [10, -1]], 2.2);
    },
    xRaincloud(c, t) {
      c.strokeStyle = 'rgba(140,200,255,0.9)'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const y = 6 + ((t * 30 + i * 6) % 14); line(c, -7 + i * 7, y, -8 + i * 7, y + 3); }
      c.fillStyle = '#c5d0de';
      circ(c, -8, 0, 7); circ(c, 0, -4, 9); circ(c, 9, 0, 7); ell(c, 0, 2, 15, 5);
      c.fillStyle = '#eef3f8'; circ(c, -3, -7, 4);
      eyes(c, [[-3, 0], [4, 0]], 2.6);
      c.fillStyle = 'rgba(255,120,150,0.5)'; circ(c, -7, 3, 1.5); circ(c, 8, 3, 1.5);
      if (Math.sin(t * 2) > 0.85) { c.fillStyle = '#ffeb3b'; c.beginPath(); c.moveTo(10, 4); c.lineTo(6, 12); c.lineTo(9, 12); c.lineTo(5, 19); c.lineTo(13, 9); c.lineTo(10, 9); c.closePath(); c.fill(); }
    },
    xSeagull(c, t) {
      const f = Math.sin(t * 14);
      c.fillStyle = '#b0bec5';
      c.beginPath(); c.moveTo(-4, -1); c.quadraticCurveTo(-10, -12 * f - 2, -18, -6 * f - 4); c.quadraticCurveTo(-10, 0, -2, 3); c.fill();
      c.fillStyle = '#fff'; ell(c, 0, 1, 11, 6.5); circ(c, 8, -3, 5);
      c.fillStyle = '#90a4ae'; tri(c, -10, 0, -16, -3, -15, 4);
      c.fillStyle = '#ff9800'; tri(c, 12, -3, 18, -1, 12, 0);
      eyes(c, [[9, -4.5]], 2.2);
      c.fillStyle = '#cfd8dc';
      c.beginPath(); c.moveTo(2, -1); c.quadraticCurveTo(6, -12 * f - 2, 12, -7 * f - 3); c.quadraticCurveTo(6, 0, 3, 2); c.fill();
    },
    xScarab(c, t) {
      const f = Math.abs(Math.sin(t * 30));
      c.fillStyle = 'rgba(255,240,200,0.6)'; ell(c, -4, -9, 7, 3 + f * 3, -0.4); ell(c, 3, -9, 6, 3 + f * 3, 0.4);
      c.fillStyle = '#00897b'; ell(c, -2, 0, 11, 8);
      c.fillStyle = '#ffd54f'; c.fillRect(-2.5, -7.5, 1.5, 15);
      c.fillStyle = '#26c6da'; ell(c, -6, -3, 3, 2, -0.5);
      c.fillStyle = '#004d40'; circ(c, 9, 0, 6);
      c.strokeStyle = '#ffd54f'; c.lineWidth = 1.3; line(c, 12, -4, 16, -8); line(c, 12, 4, 16, 7);
      eyes(c, [[11, -1.5]], 2.4);
    },
    xAnglerfish(c, t) {
      const w = Math.sin(t * 8) * 0.25;
      c.fillStyle = '#8a70f0';
      c.save(); c.translate(-12, 0); c.rotate(w); tri(c, 0, 0, -8, -7, -8, 7); c.restore();
      c.strokeStyle = '#b39dff'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(3, -10); c.quadraticCurveTo(10, -22, 17, -13); c.stroke();
      const g = 0.6 + 0.4 * Math.sin(t * 4);
      glow(c, 17, -12, 12, `rgba(200,255,120,${0.7 * g})`);
      c.fillStyle = '#f4ff81'; circ(c, 17, -12, 3);
      c.fillStyle = '#a58cff'; ell(c, 0, 0, 13, 11);
      c.fillStyle = '#cbbcff'; ell(c, -2, 5, 8, 4);
      eyes(c, [[5, -3]], 4.5);
      c.fillStyle = '#1a237e'; c.beginPath(); c.arc(8, 5, 4, 0.1, Math.PI - 0.3); c.fill();
      c.fillStyle = '#fff'; tri(c, 6, 5, 7, 7.5, 8, 5); tri(c, 9, 5, 10, 7.5, 11, 5);
    },
    xComet(c, t) {
      for (let i = 5; i >= 1; i--) {
        c.fillStyle = `rgba(150,220,255,${0.12 * (6 - i)})`;
        circ(c, -i * 5 + Math.sin(t * 8 + i) * 1.2, Math.sin(t * 6 + i) * 1.5, 9 - i * 1.2);
      }
      c.save(); c.shadowColor = '#80d8ff'; c.shadowBlur = 10;
      c.fillStyle = '#b3e5fc'; circ(c, 3, 0, 9.5); c.restore();
      c.fillStyle = '#e1f5fe'; circ(c, 1, -3, 4);
      eyes(c, [[3, -1], [9, -1]], 2.7);
      smile(c, 6, 3, 2, '#01579b');
    },
    xDrone(c, t) {
      const p = Math.abs(Math.cos(t * 45));
      c.fillStyle = '#90a4ae'; c.fillRect(-14, -6, 28, 2);
      c.fillStyle = 'rgba(200,220,230,0.8)'; ell(c, -12, -8, p * 8 + 2, 1.6); ell(c, 12, -8, p * 8 + 2, 1.6);
      c.fillStyle = '#fafafa'; rr(c, -9, -5, 18, 11, 5); c.fill();
      c.fillStyle = '#e53935'; c.fillRect(-9, 1, 18, 2);
      c.fillStyle = '#263238'; circ(c, 2, 0, 4);
      c.fillStyle = '#4fc3f7'; circ(c, 3, 0, 2.2);
      c.fillStyle = '#fff'; circ(c, 3.8, -0.8, 0.9);
      c.fillStyle = Math.sin(t * 8) > 0 ? '#69f0ae' : '#ff5252'; circ(c, -6, -2, 1.3);
    },
    xSatellite(c, t) {
      const sp = Math.sin(t * 2) * 0.15;
      c.save(); c.rotate(sp);
      c.fillStyle = '#1565c0'; c.fillRect(-20, -5, 10, 10); c.fillRect(10, -5, 10, 10);
      c.strokeStyle = '#90caf9'; c.lineWidth = 0.8;
      for (const x of [-20, 10]) { line(c, x + 5, -5, x + 5, 5); line(c, x, 0, x + 10, 0); }
      c.fillStyle = '#90a4ae'; c.fillRect(-10, -1, 20, 2);
      c.fillStyle = '#ffca28'; rr(c, -7, -8, 14, 15, 4); c.fill();
      c.strokeStyle = '#b0bec5'; c.lineWidth = 1.5; line(c, 0, -8, 0, -13);
      c.fillStyle = '#eceff1'; c.beginPath(); c.arc(0, -13, 5, Math.PI, 0); c.fill();
      eyes(c, [[-2.5, -1], [3, -1]], 2.4);
      c.restore();
    },
    xStarMoth(c, t) {
      const f = Math.sin(t * 16);
      c.save(); c.shadowColor = '#ff80ff'; c.shadowBlur = 10;
      for (const s of [-1, 1]) {
        c.fillStyle = s < 0 ? 'rgba(255,128,255,0.85)' : 'rgba(128,240,255,0.85)';
        ell(c, s * 4, -5 - f * 2, 7, 4 + f * 3, s * 0.6);
        ell(c, s * 4, 4, 5, 3, -s * 0.6);
      }
      c.restore();
      c.fillStyle = '#fff59d'; ell(c, 0, 0, 3.5, 8);
      c.strokeStyle = '#fff59d'; c.lineWidth = 1; line(c, 1, -7, 5, -12); line(c, -1, -7, -4, -12);
      c.fillStyle = '#fff'; circ(c, 5, -12, 1.4); circ(c, -4, -12, 1.4);
      eyes(c, [[1.5, -3]], 2.1);
    },
    xButterflyGold(c, t) {
      const f = Math.abs(Math.sin(t * 12));
      for (const s of [-1, 1]) {
        c.save(); c.scale(1, 1); c.translate(s * 1, 0);
        c.fillStyle = '#ffc107'; ell(c, s * 7, -5, 8 * (0.4 + f * 0.6), 7, s * 0.4);
        c.fillStyle = '#ff7043'; ell(c, s * 6, 5, 6 * (0.4 + f * 0.6), 4.5, -s * 0.5);
        c.fillStyle = '#fff59d'; circ(c, s * 7 * (0.4 + f * 0.6), -6, 2);
        c.restore();
      }
      c.fillStyle = '#5d4037'; ell(c, 0, 0, 2.5, 8);
      c.strokeStyle = '#5d4037'; c.lineWidth = 1; line(c, 1, -7, 4, -12); line(c, -1, -7, -4, -12);
      c.fillStyle = '#fff'; circ(c, 1.5, -4, 1.6); c.fillStyle = '#111'; circ(c, 2, -4, 0.9);
    },
  });

  // =================== Декорації ===================
  Object.assign(Art.decors, {
    // фабрика
    xGear(c, t) {
      c.fillStyle = '#546e7a'; c.fillRect(-2, -14, 4, 14); c.fillRect(-8, -3, 16, 3);
      gear(c, 0, -20, 10, 8, '#ffa726', '#6d4c41', t * 1.5);
      gear(c, 13, -10, 6, 6, '#90a4ae', '#455a64', -t * 2.5);
    },
    xCrate(c) {
      c.fillStyle = '#b07a43'; c.fillRect(-12, -20, 24, 20);
      c.strokeStyle = '#7a4f26'; c.lineWidth = 2; c.strokeRect(-11, -19, 22, 18); line(c, -11, -19, 11, -1);
      c.fillStyle = '#c99358'; c.fillRect(-11, -12, 22, 3);
      Art.banana(c, 0, -11, 1.3, 0.7);
    },
    xPipe(c, t) {
      c.fillStyle = '#78909c'; c.fillRect(-5, -34, 10, 34);
      c.fillStyle = '#90a4ae'; c.fillRect(-3, -34, 3, 34);
      c.fillStyle = '#607d8b'; c.fillRect(-7, -6, 14, 4); c.fillRect(-7, -34, 14, 4);
      c.strokeStyle = '#e53935'; c.lineWidth = 2; c.beginPath(); c.arc(8, -20, 4, 0, TAU); c.stroke(); line(c, 4, -20, 12, -20); line(c, 8, -24, 8, -16);
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1;
        c.fillStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; circ(c, Math.sin(k * 6 + i) * 3, -38 - k * 18, 3 + k * 5);
      }
    },
    // іграшки
    xToyBlocks(c) {
      const b = [[-12, -12, '#e53935', 'А'], [0, -12, '#1e88e5', 'Б'], [-6, -24, '#43a047', 'В']];
      c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const [x, y, col, ch] of b) {
        c.fillStyle = Art.shade(col, -40); rr(c, x, y, 12, 12, 2); c.fill();
        c.fillStyle = col; rr(c, x, y, 12, 10.5, 2); c.fill();
        c.fillStyle = '#fff'; c.fillText(ch, x + 6, y + 5.5);
      }
    },
    xTeddy(c, t) {
      const B = '#b07848', L = '#e0b48a';
      c.fillStyle = B; circ(c, -7, -16, 3.5); circ(c, 7, -16, 3.5); ell(c, -6, -3, 5, 3.5); ell(c, 6, -3, 5, 3.5);
      ell(c, 0, -9, 8, 8); circ(c, -6, -27, 3.5); circ(c, 6, -27, 3.5); circ(c, 0, -21, 7);
      c.fillStyle = L; circ(c, -6, -27, 1.8); circ(c, 6, -27, 1.8); ell(c, 0, -8, 4.5, 5); ell(c, 0, -19, 3.5, 2.6);
      c.fillStyle = '#222'; circ(c, -2.5, -23, 1.2); circ(c, 2.5, -23, 1.2); circ(c, 0, -20, 1.1);
      c.fillStyle = '#e53935'; tri(c, -4, -15, 0, -13.5, -4, -12); tri(c, 4, -15, 0, -13.5, 4, -12);
    },
    xCrayon(c) {
      c.save(); c.rotate(0.15);
      c.fillStyle = '#7e57c2'; c.fillRect(-4, -28, 8, 28);
      c.fillStyle = '#5e35b1'; c.fillRect(-4, -22, 8, 3); c.fillRect(-4, -8, 8, 3);
      c.fillStyle = '#f3d7a0'; tri(c, -4, -28, 0, -36, 4, -28);
      c.fillStyle = '#7e57c2'; tri(c, -1.5, -33, 0, -36, 1.5, -33);
      c.restore();
    },
    xBall(c, t) {
      c.save(); c.translate(0, -9); c.rotate(Math.sin(t) * 0.3);
      const cols = ['#e53935', '#fff', '#fdd835', '#fff', '#1e88e5', '#fff'];
      for (let i = 0; i < 6; i++) { c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 9, i * TAU / 6, (i + 1) * TAU / 6); c.fill(); }
      c.fillStyle = '#fff'; circ(c, 0, 0, 2.5); c.fillStyle = 'rgba(255,255,255,0.4)'; circ(c, -3, -4, 2.5);
      c.restore();
    },
    // гроза
    xRainUmbrella(c, t) {
      c.strokeStyle = '#6d4c41'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -26); c.lineTo(0, -3); c.arc(3, -3, 3, Math.PI, 0, true); c.stroke();
      c.fillStyle = '#ffca28'; c.beginPath(); c.moveTo(-17, -24); c.quadraticCurveTo(0, -46, 17, -24);
      for (let i = 2; i >= -2; i--) c.quadraticCurveTo(i * 7 + 3.5, -28, i * 7 - 3.5 + (i === -2 ? -3.5 : 0), -24);
      c.fill();
      c.fillStyle = '#ff7043'; c.beginPath(); c.moveTo(-6, -24); c.quadraticCurveTo(0, -46, 6, -24); c.closePath(); c.fill();
      c.fillStyle = 'rgba(160,210,255,0.9)';
      for (const x of [-16, 16]) { const k = (t * 1.5 + x) % 1; ell(c, x, -22 + Math.abs(k) * 20, 1.3, 2); }
    },
    xPuddle(c, t) {
      c.fillStyle = '#5c8fbf'; ell(c, 0, -1.5, 14, 3);
      c.fillStyle = 'rgba(200,230,255,0.5)'; ell(c, -4, -2, 5, 1);
      c.strokeStyle = 'rgba(220,240,255,0.7)'; c.lineWidth = 0.9;
      for (let i = 0; i < 2; i++) { const k = (t * 0.8 + i * 0.5) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.ellipse(i ? 5 : -5, -1.5, 1 + k * 6, 0.4 + k * 1.5, 0, 0, TAU); c.stroke(); }
      c.globalAlpha = 1;
    },
    xBoots(c) {
      for (const x of [-7, 5]) {
        c.fillStyle = '#ffca28'; rr(c, x, -16, 7, 16, 2); c.fill(); rr(c, x, -5, 11, 5, 2); c.fill();
        c.fillStyle = '#f9a825'; c.fillRect(x, -16, 7, 2.5);
      }
    },
    // захід сонця
    xLighthouse(c, t) {
      c.fillStyle = '#5d4037'; ell(c, 0, -2, 14, 4);
      c.fillStyle = '#fafafa'; c.beginPath(); c.moveTo(-8, -2); c.lineTo(-5, -36); c.lineTo(5, -36); c.lineTo(8, -2); c.fill();
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(-7.3, -10); c.lineTo(-6.6, -17); c.lineTo(6.6, -17); c.lineTo(7.3, -10); c.fill();
      c.beginPath(); c.moveTo(-6, -24); c.lineTo(-5.4, -30); c.lineTo(5.4, -30); c.lineTo(6, -24); c.fill();
      c.fillStyle = '#37474f'; c.fillRect(-7, -38, 14, 2.5); c.fillRect(-4, -46, 8, 2);
      const on = 0.6 + 0.4 * Math.sin(t * 3);
      glow(c, 0, -41, 16, `rgba(255,236,140,${0.8 * on})`);
      c.fillStyle = '#fff59d'; c.fillRect(-3.5, -44, 7, 6);
      c.fillStyle = '#e53935'; tri(c, -5, -46, 0, -51, 5, -46);
      c.fillStyle = '#5d4037'; c.fillRect(-2, -8, 4, 6);
    },
    xBuoy(c, t) {
      c.save(); c.translate(0, Math.sin(t * 2) * 1.5); c.rotate(Math.sin(t * 1.6) * 0.12);
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(-8, -4); c.lineTo(-4, -22); c.lineTo(4, -22); c.lineTo(8, -4); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-6.5, -15, 13, 4);
      c.fillStyle = '#37474f'; ell(c, 0, -3, 10, 3);
      c.fillStyle = Math.sin(t * 4) > 0 ? '#ffeb3b' : '#ff8f00'; circ(c, 0, -24, 2.5);
      c.restore();
    },
    // шахта
    xMineCart(c) {
      c.fillStyle = '#5d4037'; c.fillRect(-18, -2, 36, 2);
      c.fillStyle = '#ff5ec4'; tri(c, -10, -16, -6, -24, -2, -16);
      c.fillStyle = '#4fc3f7'; tri(c, -3, -16, 1, -26, 5, -16);
      c.fillStyle = '#69f0ae'; tri(c, 3, -16, 7, -22, 11, -16);
      c.fillStyle = '#78909c'; c.beginPath(); c.moveTo(-14, -17); c.lineTo(14, -17); c.lineTo(11, -5); c.lineTo(-11, -5); c.fill();
      c.fillStyle = '#90a4ae'; c.fillRect(-15, -18, 30, 3);
      c.strokeStyle = '#546e7a'; c.lineWidth = 1.2; line(c, -6, -14, -5, -7); line(c, 6, -14, 5, -7);
      c.fillStyle = '#37474f'; circ(c, -7, -4, 3.5); circ(c, 7, -4, 3.5);
      c.fillStyle = '#b0bec5'; circ(c, -7, -4, 1.3); circ(c, 7, -4, 1.3);
    },
    xLantern(c, t) {
      c.fillStyle = '#6d4c41'; c.fillRect(-1.5, -30, 3, 30); c.fillRect(-1.5, -30, 10, 2.5);
      const f = 0.75 + 0.25 * Math.sin(t * 7);
      glow(c, 8, -20, 18, `rgba(255,190,90,${0.6 * f})`);
      c.strokeStyle = '#3e2723'; c.lineWidth = 1.2; line(c, 8, -28, 8, -26);
      c.fillStyle = '#3e2723'; c.fillRect(4, -26, 8, 2); c.fillRect(4, -15, 8, 2);
      c.fillStyle = `rgba(255,213,79,${0.8 + 0.2 * f})`; rr(c, 4.5, -24, 7, 9, 2); c.fill();
      c.fillStyle = '#fff8e1'; ell(c, 8, -19, 1.5, 2.5);
    },
    xGem(c, t) {
      c.fillStyle = '#5d4a3a'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-8, -7); c.lineTo(8, -8); c.lineTo(12, 0); c.fill();
      c.save(); c.shadowBlur = 6 + Math.sin(t * 3) * 3;
      c.shadowColor = '#4fc3f7'; c.fillStyle = '#4fc3f7'; c.beginPath(); c.moveTo(-6, -5); c.lineTo(-4, -20); c.lineTo(0, -5); c.fill();
      c.shadowColor = '#ff5ec4'; c.fillStyle = '#ff5ec4'; c.beginPath(); c.moveTo(-1, -5); c.lineTo(3, -15); c.lineTo(7, -5); c.fill();
      c.shadowColor = '#ffd54f'; c.fillStyle = '#ffd54f'; c.beginPath(); c.moveTo(5, -5); c.lineTo(9, -11); c.lineTo(11, -4); c.fill();
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.7)'; tri(c, -4.5, -15, -4, -19, -3, -14);
    },
    // піраміди
    xTorch(c, t) {
      c.fillStyle = '#6d4c41'; c.fillRect(-2, -24, 4, 24); c.fillStyle = '#ffb300'; c.fillRect(-5, -26, 10, 4);
      glow(c, 0, -32, 20, 'rgba(255,170,60,0.55)');
      const fl = Math.sin(t * 12) * 2;
      c.fillStyle = '#ff6d00'; c.beginPath(); c.moveTo(-5, -26); c.quadraticCurveTo(-4 + fl * 0.3, -36, fl, -42); c.quadraticCurveTo(5, -34, 5, -26); c.fill();
      c.fillStyle = '#ffd740'; c.beginPath(); c.moveTo(-2.5, -26); c.quadraticCurveTo(0, -34, fl * 0.5, -36); c.quadraticCurveTo(2.5, -31, 2.5, -26); c.fill();
    },
    xVase(c) {
      c.fillStyle = '#c0703a';
      c.beginPath(); c.moveTo(-4, -24); c.quadraticCurveTo(-12, -16, -7, -2); c.lineTo(7, -2); c.quadraticCurveTo(12, -16, 4, -24); c.fill();
      c.fillRect(-5, -27, 10, 3); c.fillRect(-5, -2, 10, 2);
      c.fillStyle = '#1e5aa8'; c.fillRect(-8.5, -15, 17, 3);
      c.fillStyle = '#ffd54f'; for (let i = -2; i <= 2; i++) tri(c, i * 3 - 1.5, -12, i * 3, -9, i * 3 + 1.5, -12);
      c.fillStyle = '#2e2018'; c.fillRect(-7, -19, 14, 1.5);
    },
    xCatStatue(c, t) {
      c.fillStyle = '#8d6e3c'; c.fillRect(-9, -5, 18, 5);
      const G = '#ffc93c', D = '#c99000';
      c.fillStyle = G;
      ell(c, 0, -14, 6.5, 10);
      c.beginPath(); c.moveTo(-5, -26); c.lineTo(-4, -34); c.lineTo(-1, -29); c.lineTo(1, -29); c.lineTo(4, -34); c.lineTo(5, -26); c.fill();
      circ(c, 0, -26, 5);
      c.fillStyle = D; c.fillRect(-1, -14, 2, 9); ell(c, 6, -6, 4, 1.5);
      c.fillStyle = '#1e5aa8'; c.fillRect(-5, -21, 10, 2);
      c.fillStyle = '#2e7d32'; circ(c, -2, -27, 1.1); circ(c, 2, -27, 1.1);
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 3)})`; star(c, -3, -18, 2, 4, 0.3);
    },
    xGoldPile(c, t) {
      c.fillStyle = '#c99000'; ell(c, 0, -3, 15, 5);
      c.fillStyle = '#ffc93c'; c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-6, -16, 0, -15); c.quadraticCurveTo(8, -15, 14, -2); c.fill();
      c.fillStyle = '#ffe082'; for (const [x, y] of [[-8, -6], [-2, -11], [5, -8], [9, -4], [0, -5]]) ell(c, x, y, 3, 1.6);
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(3, -18); c.lineTo(6, -15); c.lineTo(3, -12); c.lineTo(0, -15); c.fill();
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 4)})`; star(c, -5, -13, 2.5, 4, 0.3);
    },
    // глибини
    xAnemone(c, t) {
      c.fillStyle = '#4a2a6a'; ell(c, 0, -3, 8, 4);
      c.strokeStyle = '#ff80df'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.save(); c.shadowColor = '#ff80df'; c.shadowBlur = 8;
      for (let i = -3; i <= 3; i++) { const sw = Math.sin(t * 2 + i) * 3; c.beginPath(); c.moveTo(i * 2, -4); c.quadraticCurveTo(i * 4, -12, i * 5 + sw, -18 + Math.abs(i)); c.stroke(); }
      c.fillStyle = '#ffe0f7'; for (let i = -3; i <= 3; i++) circ(c, i * 5 + Math.sin(t * 2 + i) * 3, -18 + Math.abs(i), 1.6);
      c.restore();
    },
    xTubeWorm(c, t) {
      for (const [x, h, col] of [[-6, 20, '#4ff3ff'], [0, 28, '#b388ff'], [6, 16, '#69f0ae']]) {
        c.fillStyle = '#e0e0e0'; rr(c, x - 2.5, -h, 5, h, 2); c.fill();
        c.fillStyle = '#bdbdbd'; c.fillRect(x - 2.5, -h * 0.5, 5, 1.2);
        c.save(); c.shadowColor = col; c.shadowBlur = 10; c.fillStyle = col;
        const o = 0.7 + 0.3 * Math.sin(t * 3 + x);
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; ell(c, x + Math.cos(a) * 4 * o, -h + Math.sin(a) * 4 * o, 1.4, 3.5 * o, a + Math.PI / 2); }
        c.restore();
      }
    },
    // Місяць
    xLander(c, t) {
      c.strokeStyle = '#b0bec5'; c.lineWidth = 2; c.lineCap = 'round';
      line(c, -8, -12, -15, 0); line(c, 8, -12, 15, 0); line(c, -5, -12, -7, 0); line(c, 5, -12, 7, 0);
      c.fillStyle = '#90a4ae'; c.fillRect(-18, -1.5, 6, 1.5); c.fillRect(12, -1.5, 6, 1.5);
      c.fillStyle = '#ffc107'; c.beginPath(); c.moveTo(-11, -17); c.lineTo(11, -17); c.lineTo(9, -9); c.lineTo(-9, -9); c.fill();
      c.fillStyle = '#ffe082'; c.fillRect(-9, -15, 4, 4); c.fillRect(1, -15, 6, 3);
      c.fillStyle = '#eceff1'; c.beginPath(); c.moveTo(-8, -17); c.lineTo(-7, -27); c.lineTo(-2, -31); c.lineTo(5, -30); c.lineTo(8, -24); c.lineTo(8, -17); c.fill();
      c.fillStyle = '#263238'; ell(c, 0, -24, 3.5, 3); c.fillStyle = '#80deea'; circ(c, 0.8, -24.8, 1.3);
      c.strokeStyle = '#cfd8dc'; c.lineWidth = 1.2; line(c, 5, -30, 7, -36);
      c.fillStyle = Math.sin(t * 4) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, 7, -36.5, 1.6);
    },
    xRocket(c, t) {
      c.fillStyle = '#607d8b'; c.fillRect(-12, -3, 24, 3);
      c.fillStyle = '#e53935'; tri(c, -6, -8, -11, -2, -6, -16); tri(c, 6, -8, 11, -2, 6, -16);
      c.fillStyle = '#fafafa'; c.beginPath(); c.moveTo(-6, -4); c.lineTo(-6, -26); c.quadraticCurveTo(0, -40, 6, -26); c.lineTo(6, -4); c.fill();
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(-5, -30); c.quadraticCurveTo(0, -40, 5, -30); c.fill();
      c.fillStyle = '#1e88e5'; circ(c, 0, -21, 3.2); c.fillStyle = '#bbdefb'; circ(c, -0.8, -21.8, 1.2);
      c.fillStyle = '#0057b7'; c.fillRect(-6, -12, 12, 2); c.fillStyle = '#ffd700'; c.fillRect(-6, -10, 12, 2);
    },
    // Марс
    xMarsRock(c) {
      c.fillStyle = '#8e3b22'; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-10, -10); c.lineTo(-2, -15); c.lineTo(8, -11); c.lineTo(13, 0); c.fill();
      c.fillStyle = '#c4613c'; tri(c, -9, -9, -2, -14, -3, -6);
      c.fillStyle = '#6e2a16'; circ(c, 4, -5, 2);
    },
    xDome(c, t) {
      c.fillStyle = '#90a4ae'; c.fillRect(-18, -4, 36, 4);
      c.fillStyle = 'rgba(200,240,255,0.75)'; c.beginPath(); c.arc(0, -4, 16, Math.PI, 0); c.fill();
      c.strokeStyle = '#eceff1'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -4, 16, Math.PI, 0); c.stroke();
      line(c, 0, -20, 0, -4); c.beginPath(); c.ellipse(0, -4, 8, 16, 0, Math.PI, 0); c.stroke();
      c.fillStyle = '#43a047'; circ(c, -6, -8, 3.5); circ(c, 6, -9, 4); circ(c, 0, -7, 3);
      c.fillStyle = Math.sin(t * 3) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, 0, -21, 1.6);
    },
    // станція
    xConsole(c, t) {
      c.fillStyle = '#455a64'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-14, -14); c.lineTo(-8, -22); c.lineTo(14, -22); c.lineTo(14, 0); c.fill();
      c.fillStyle = '#102030'; c.fillRect(-6, -20, 17, 9);
      c.strokeStyle = '#4ff3ff'; c.lineWidth = 1; c.beginPath();
      for (let x = 0; x <= 15; x++) c.lineTo(-5 + x, -15.5 + Math.sin(x * 0.8 + t * 4) * 2.5); c.stroke();
      const cols = ['#ff5252', '#69f0ae', '#ffeb3b', '#40c4ff'];
      for (let i = 0; i < 4; i++) { c.fillStyle = (Math.floor(t * 3) + i) % 3 ? cols[i] : '#263238'; circ(c, -9 + i * 6, -6, 1.8); }
      c.fillStyle = '#607d8b'; c.fillRect(-14, -2, 28, 2);
    },
    xOxyTank(c) {
      for (const [x, col] of [[-6, '#4fc3f7'], [5, '#ff8a65']]) {
        c.fillStyle = col; rr(c, x - 5, -24, 10, 24, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 3, -21, 2, 16);
        c.fillStyle = '#90a4ae'; c.fillRect(x - 2, -27, 4, 3);
      }
      c.fillStyle = '#fafafa'; c.fillRect(-11, -14, 22, 3);
    },
    xSpacePlant(c, t) {
      c.fillStyle = '#78909c'; c.fillRect(-9, -6, 18, 6);
      c.strokeStyle = '#43a047'; c.lineWidth = 1.8;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(i * 3, -14, i * 5 + Math.sin(t * 2 + i), -20 + Math.abs(i) * 2); c.stroke(); }
      c.fillStyle = '#ff80ab'; circ(c, 0, -21, 2.5);
      c.fillStyle = 'rgba(200,240,255,0.3)'; c.beginPath(); c.arc(0, -6, 12, Math.PI, 0); c.fill();
      c.strokeStyle = 'rgba(230,250,255,0.8)'; c.lineWidth = 1; c.beginPath(); c.arc(0, -6, 12, Math.PI, 0); c.stroke();
    },
    // туманність
    xStarCrystal(c, t) {
      const b = Math.sin(t * 2) * 3;
      c.fillStyle = 'rgba(180,120,255,0.35)'; ell(c, 0, -1, 9, 2.5);
      glow(c, 0, -20 + b, 18, 'rgba(255,150,255,0.45)');
      crystalShard(c, 0, -20 + b, 0.7, '#e1b3ff');
      c.fillStyle = '#fff'; star(c, 0, -22 + b, 3, 4, 0.35);
    },
    xOrb(c, t) {
      c.fillStyle = '#5e35b1'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(-4, -10); c.lineTo(4, -10); c.lineTo(7, 0); c.fill();
      c.fillStyle = '#7e57c2'; c.fillRect(-6, -12, 12, 2.5);
      const b = Math.sin(t * 2.5) * 1.5;
      glow(c, 0, -19 + b, 14, 'rgba(120,255,240,0.6)');
      c.fillStyle = '#a7fff6'; circ(c, 0, -19 + b, 5.5);
      c.fillStyle = '#fff'; circ(c, -2, -21 + b, 1.8);
    },
    // королівство
    xBananaTree(c, t) {
      c.save(); c.rotate(Math.sin(t * 1.2) * 0.02);
      bananaPalm(c, 0, 0, 40, '#a1774a', '#3fae49', '#2e8b3a');
      c.restore();
    },
    xCrown(c, t) {
      c.fillStyle = '#c62828'; rr(c, -12, -7, 24, 7, 3); c.fill();
      c.fillStyle = '#ffd54f'; c.fillRect(-12, -2, 24, 1.5);
      c.fillStyle = '#ffc107'; c.beginPath(); c.moveTo(-9, -8); c.lineTo(-10, -20); c.lineTo(-5, -14); c.lineTo(0, -22); c.lineTo(5, -14); c.lineTo(10, -20); c.lineTo(9, -8); c.fill();
      c.fillStyle = '#e53935'; circ(c, 0, -12, 2); c.fillStyle = '#1e88e5'; circ(c, -5.5, -11, 1.5); circ(c, 5.5, -11, 1.5);
      c.fillStyle = '#fff59d'; circ(c, -10, -20, 1.5); circ(c, 0, -22, 1.5); circ(c, 10, -20, 1.5);
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 4)})`; star(c, 4, -18, 2.5, 4, 0.3);
    },
    xGiftBox(c) {
      c.fillStyle = '#ab47bc'; c.fillRect(-9, -15, 18, 15);
      c.fillStyle = '#ce93d8'; c.fillRect(-10, -18, 20, 4);
      c.fillStyle = '#ffd54f'; c.fillRect(-2, -18, 4, 18);
      c.strokeStyle = '#ffd54f'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(-4, -21, 4, 2.5, 0.4, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(4, -21, 4, 2.5, -0.4, 0, TAU); c.stroke();
    },
  });

  // =================== Світи ===================
  THEMES.push(
    // 29
    {
      name: 'Бананова фабрика', icon: '🏭',
      sky: ['#7fb6c8', '#e6f2ef'],
      ground: { style: 'stone', body: '#6f7c88', dark: '#5d6873', top: '#ffcf33', topDark: '#3a3f45', texture: 'bricks' },
      block: { fill: '#ff9800', light: '#ffc166', dark: '#c26a00' },
      oneway: { fill: '#90a4ae', dark: '#546e7a' },
      enemy: 'xGearBot', enemyColor: '#ff7043', flyer: 'xPropBot',
      decor: ['xGear', 'xCrate', 'xPipe', 'xCrate'],
      particles: 'none', gravity: 1,
      music: { bpm: 126, root: 60, minor: false, lead: 'square', bass: 'square', drums: true, rest: 0.2, seed: 29 },
      skyDraw(c, w, h) { sun(c, w * 0.78, 64, 24, '#fffbe6', 'rgba(255,250,220,0.55)'); },
      far(c, w, h, r) {
        for (const x of spread(w, 4, r)) { const y = 200 + r() * 70, R = 34 + r() * 26; wrap(w, x, R * 1.3, X => gear(c, X, y, R, 10, '#a9cbd5', '#c5dde3', 0.2)); }
        for (const x of spread(w, 5, r, 0.5)) {
          const bw = 120 + r() * 50, bh = 80 + r() * 50, ch = r();
          wrap(w, x, bw, X => {
            c.fillStyle = '#93b7c3';
            c.fillRect(X - bw / 2, 330 - bh, bw, bh);
            for (let i = 0; i < 4; i++) tri(c, X - bw / 2 + i * bw / 4, 330 - bh, X - bw / 2 + (i + 1) * bw / 4, 330 - bh, X - bw / 2 + (i + 1) * bw / 4, 330 - bh - 18);
            c.fillStyle = '#b9d5de';
            for (let i = 0; i < 4; i++) c.fillRect(X - bw / 2 + 8 + i * bw / 4, 340 - bh, bw / 4 - 16, 14);
            const cx = X + bw * (ch - 0.5) * 0.6;
            c.fillStyle = '#86aab7'; c.fillRect(cx - 7, 330 - bh - 70, 14, 70);
            c.fillStyle = '#e57373'; c.fillRect(cx - 7, 330 - bh - 62, 14, 6);
            c.fillStyle = 'rgba(255,255,255,0.75)';
            circ(c, cx, 330 - bh - 82, 10); circ(c, cx + 12, 330 - bh - 96, 13); circ(c, cx + 28, 330 - bh - 112, 16);
          });
        }
        c.fillStyle = '#93b7c3'; c.fillRect(0, 328, w, h - 328);
      },
      mid(c, w, h, r) {
        c.fillStyle = '#78909c'; c.fillRect(0, 52, w, 14);
        c.fillStyle = '#90a4ae'; c.fillRect(0, 55, w, 3);
        for (let x = 0; x < w; x += 128) { c.fillStyle = '#607d8b'; c.fillRect(x + 60, 48, 10, 22); }
        for (const x of spread(w, 4, r)) {
          const bot = 230 + r() * 60;
          wrap(w, x, 30, X => {
            c.fillStyle = '#78909c'; c.fillRect(X - 9, 66, 18, bot - 66);
            c.fillStyle = '#90a4ae'; c.fillRect(X - 5, 66, 4, bot - 66);
            c.fillStyle = '#607d8b'; for (let y = 90; y < bot; y += 60) c.fillRect(X - 12, y, 24, 6);
            c.fillStyle = 'rgba(255,255,255,0.6)'; circ(c, X, bot + 8, 9); circ(c, X - 8, bot + 18, 11); circ(c, X + 9, bot + 20, 10);
          });
        }
        for (const x of spread(w, 3, r)) { const y = 140 + r() * 80, R = 26 + r() * 14; wrap(w, x, R * 1.3, X => gear(c, X, y, R, 9, '#d7a467', '#cfe3e6', r() * 2)); }
        // конвеєр
        c.fillStyle = '#5f7480'; for (let x = 16; x < w; x += 128) { c.fillRect(x, 334, 8, 50); c.fillRect(x + 56, 334, 8, 50); }
        c.fillStyle = '#37474f'; rr(c, -10, 318, w + 20, 18, 9); c.fill();
        c.fillStyle = '#546e7a'; c.fillRect(0, 318, w, 4);
        c.fillStyle = '#90a4ae'; for (let x = 16; x < w; x += 32) circ(c, x, 328, 4);
        for (const x of spread(w, 7, r)) {
          const k = r();
          wrap(w, x, 20, X => {
            if (k < 0.65) {
              c.fillStyle = '#b07a43'; c.fillRect(X - 15, 294, 30, 24);
              c.strokeStyle = '#7a4f26'; c.lineWidth = 2; c.strokeRect(X - 14, 295, 28, 22);
              Art.banana(c, X, 306, 1.3, 0.85);
            } else for (let i = 0; i < 3; i++) Art.banana(c, X - 8 + i * 8, 312 - (i % 2) * 6, 1.3 + i, 0.9);
          });
        }
        haze(c, w, 372, 'rgba(190,220,228,0.32)');
        c.fillStyle = '#7d8f99'; c.fillRect(0, 372, w, h - 372);
        c.fillStyle = '#ffcf33'; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 372); c.lineTo(x + 16, 372); c.lineTo(x + 8, 380); c.lineTo(x - 8, 380); c.fill(); }
      },
    },
    // 30
    {
      name: 'Іграшкова кімната', icon: '🧸',
      sky: ['#a9def7', '#e8f7ff'],
      ground: { style: 'road', body: '#c68a4c', dark: '#a46c35', top: '#e4ad6e', topDark: '#a46c35', texture: 'bricks' },
      block: { fill: '#e53935', light: '#ff8a80', dark: '#a31515' },
      oneway: { fill: '#42a5f5', dark: '#1565c0' },
      enemy: 'xToySoldier', enemyColor: '#e53935', flyer: 'xToyPlane',
      decor: ['xToyBlocks', 'xTeddy', 'xCrayon', 'xBall', 'xTeddy'],
      particles: 'none', gravity: 1,
      music: { bpm: 120, root: 64, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.25, seed: 30, bell: true },
      skyDraw(c, w, h) {
        c.fillStyle = 'rgba(255,255,255,0.35)';
        for (let x = 0; x < w; x += 60) c.fillRect(x, 0, 26, h);
        c.fillStyle = 'rgba(255,214,90,0.55)';
        for (let y = 30; y < h; y += 60) for (let x = (y / 60 % 2) * 30 + 13; x < w; x += 60) star(c, x, y, 5, 5, 0.5);
        const cols = ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc'];
        c.strokeStyle = '#8d6e63'; c.lineWidth = 1.5;
        c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, 14 + Math.abs(Math.sin(x / 120 * Math.PI)) * 16); c.stroke();
        for (let x = 10, i = 0; x < w; x += 24, i++) { const y = 14 + Math.abs(Math.sin(x / 120 * Math.PI)) * 16; c.fillStyle = cols[i % 5]; tri(c, x - 7, y, x + 7, y, x, y + 14); }
      },
      far(c, w, h, r) {
        wrap(w, w * 0.22, 110, X => {
          c.fillStyle = '#fff'; c.fillRect(X - 80, 90, 160, 150);
          c.fillStyle = '#7fd0ff'; c.fillRect(X - 72, 98, 68, 64); c.fillRect(X + 4, 98, 68, 64); c.fillRect(X - 72, 170, 68, 62); c.fillRect(X + 4, 170, 68, 62);
          cloudShape(c, X - 60, 130, 0.6, '#ffffff'); cloudShape(c, X + 20, 190, 0.5, '#ffffff');
          c.fillStyle = '#ff8a80'; c.beginPath(); c.moveTo(X - 100, 78); c.quadraticCurveTo(X - 60, 160, X - 92, 260); c.lineTo(X - 110, 260); c.lineTo(X - 110, 78); c.fill();
          c.beginPath(); c.moveTo(X + 100, 78); c.quadraticCurveTo(X + 60, 160, X + 92, 260); c.lineTo(X + 110, 260); c.lineTo(X + 110, 78); c.fill();
          c.fillStyle = '#c9a27a'; c.fillRect(X - 115, 72, 230, 8);
        });
        wrap(w, w * 0.6, 100, X => {
          c.fillStyle = '#d7a77a'; c.fillRect(X - 80, 130, 160, 205);
          c.fillStyle = '#c08d5e'; for (let i = 0; i < 4; i++) c.fillRect(X - 74, 136 + i * 50, 148, 44);
          const bc = ['#ef9a9a', '#90caf9', '#a5d6a7', '#fff59d', '#ce93d8'];
          for (let i = 0; i < 3; i++) for (let k = 0; k < 9; k++) { c.fillStyle = bc[(i * 3 + k) % 5]; const bh = 30 + ((k * 7 + i * 3) % 3) * 5; c.fillRect(X - 70 + k * 15, 180 + i * 50 - bh, 12, bh); }
          c.fillStyle = '#ffcc80'; circ(c, X - 30, 323, 10); circ(c, X + 30, 323, 10);
        });
        wrap(w, w * 0.88, 80, X => {
          c.fillStyle = '#ffe082'; c.fillRect(X - 50, 150, 100, 70); c.strokeStyle = '#c9a27a'; c.lineWidth = 6; c.strokeRect(X - 50, 150, 100, 70);
          c.fillStyle = '#81c784'; tri(c, X - 44, 214, X - 10, 170, X + 24, 214); c.fillStyle = '#ffb74d'; circ(c, X + 26, 172, 9);
        });
        c.fillStyle = '#fbf3e4'; c.fillRect(0, 330, w, h - 330);
        c.fillStyle = '#e6d3b4'; c.fillRect(0, 330, w, 5);
      },
      mid(c, w, h, r) {
        c.fillStyle = '#d99a5c'; c.fillRect(0, 366, w, h - 366);
        c.strokeStyle = '#b87b42'; c.lineWidth = 2;
        for (let y = 382; y < h; y += 16) line(c, 0, y, w, y);
        for (let x = 0; x < w; x += 128) line(c, x + ((x / 128) % 2) * 64, 366, x + ((x / 128) % 2) * 64, h);
        c.fillStyle = 'rgba(244,143,177,0.7)'; ell(c, w * 0.45, 380, 150, 14);
        const bc = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc'];
        c.font = 'bold 26px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        const letters = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОП';
        for (const x of spread(w, 5, r)) {
          const n = 1 + Math.floor(r() * 3), s0 = Math.floor(r() * 20);
          wrap(w, x, 70, X => {
            for (let i = 0; i < n; i++) {
              const bx = X - 22 + (i % 2) * 18 - (i === 2 ? 9 : 0), by = 368 - 46 * (i + 1) + (i === 1 ? 0 : 0), col = bc[(s0 + i) % 5];
              c.fillStyle = Art.shade(col, -45); rr(c, bx, by, 46, 46, 6); c.fill();
              c.fillStyle = col; rr(c, bx, by, 46, 41, 6); c.fill();
              c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillText(letters[(s0 + i * 3) % letters.length], bx + 23, by + 22);
            }
          });
        }
        for (const x of spread(w, 4, r)) {
          const k = r();
          wrap(w, x, 60, X => {
            c.save(); c.translate(X + 50, 372);
            if (k < 0.5) { c.scale(2.6, 2.6); Art.decors.xTeddy(c, 0); }
            else { c.scale(2.4, 2.4); Art.decors.xBall(c, k * 3); }
            c.restore();
          });
        }
        haze(c, w, 366, 'rgba(225,242,255,0.42)');
      },
    },
    // 31
    {
      name: 'Грозова буря', icon: '⛈️',
      sky: ['#1f2433', '#56647a'],
      ground: { style: 'grass', body: '#5b4636', dark: '#47362a', top: '#3f9a5c', topDark: '#2a6b40', topLight: 'rgba(190,225,255,0.3)' },
      block: { fill: '#8095a1', light: '#b4c6cf', dark: '#4b5f69', bricks: true },
      oneway: { fill: '#9a7652', dark: '#5d452c' },
      enemy: 'xSnail', enemyColor: '#ffca28', flyer: 'xRaincloud',
      decor: ['xRainUmbrella', 'xPuddle', 'mushroom', 'xBoots', 'xPuddle'],
      particles: 'none', gravity: 1,
      music: { bpm: 112, root: 57, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 31 },
      skyDraw(c, w, h) {
        const g = c.createRadialGradient(w * 0.62, 120, 10, w * 0.62, 120, 260);
        g.addColorStop(0, 'rgba(255,250,210,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        bolt(c, w * 0.62, 40, 250, 7);
        bolt(c, w * 0.18, 60, 150, 3);
        const r = mulberry32(31);
        for (let i = 0; i < 22; i++) { const x = r() * w, y = 10 + r() * 70, s = 1 + r() * 1.2; cloudShape(c, x - 30 * s, y, s, i % 2 ? '#2a3042' : '#333b50'); }
        for (let x = -20; x < w + 40; x += 46) cloudShape(c, x - 20, 6 + (x % 3) * 4, 1.2, '#262b3c');
      },
      far(c, w, h, r) {
        clouds(c, w, 6, r, 90, 160, 'rgba(60,70,92,0.9)', 1, 1.8);
        const wv = [[2, 18, 0.4], [3, 10, 1.7]];
        band(c, w, h, 300, wv, '#3d4c5c');
        wrap(w, w * 0.7, 40, X => {
          const y = bandY(w, 300, wv, X);
          c.fillStyle = '#4c3f3a'; c.fillRect(X - 16, y - 24, 32, 26);
          c.fillStyle = '#6b3a32'; tri(c, X - 22, y - 22, X, y - 42, X + 22, y - 22);
          c.fillStyle = '#ffd54f'; c.fillRect(X - 8, y - 16, 7, 7); c.fillRect(X + 3, y - 16, 7, 7);
          glow(c, X, y - 12, 34, 'rgba(255,213,79,0.25)');
        });
        rain(c, w, 260, r, 0, h, 18, 'rgba(190,210,240,0.28)', 1.2);
      },
      mid(c, w, h, r) {
        const wv = [[3, 12, 0], [5, 6, 2]];
        band(c, w, h, 348, wv, '#2c4c43');
        onBand(c, w, 348, wv, 7, r, 60, (x, y, k) => {
          const s = 70 + k * 50;
          c.strokeStyle = '#3e2f27'; c.lineWidth = s * 0.08; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x - 2, y - s * 0.4, x + s * 0.18, y - s * 0.7); c.stroke();
          c.fillStyle = '#28513f';
          ell(c, x + s * 0.25, y - s * 0.78, s * 0.32, s * 0.2, 0.25); ell(c, x + s * 0.05, y - s * 0.68, s * 0.2, s * 0.14, 0.2);
          c.fillStyle = '#336650'; ell(c, x + s * 0.3, y - s * 0.85, s * 0.15, s * 0.08, 0.3);
        });
        rain(c, w, 150, r, 0, h, 30, 'rgba(210,228,255,0.4)', 1.6);
      },
    },
    // 32
    {
      name: 'Захід сонця над морем', icon: '🌅',
      sky: ['#4a2f80', '#ffa865'],
      ground: { style: 'sand', body: '#d9925f', dark: '#c07a4a', top: '#f7c58f', topDark: '#d99a66' },
      block: { fill: '#a0694a', light: '#c98e6a', dark: '#6e4630', bricks: true },
      oneway: { fill: '#8d5a3e', dark: '#5a3524' },
      enemy: 'xHermit', enemyColor: '#ff5a6e', flyer: 'xSeagull',
      decor: ['xLighthouse', 'shell', 'starfish', 'xBuoy', 'shell'],
      particles: 'none', gravity: 1, pit: '#5b3f8f',
      music: { bpm: 92, root: 62, minor: false, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 32 },
      skyDraw(c, w, h) {
        stars(c, w, h, 50, mulberry32(32), 90);
        const r = mulberry32(320);
        for (let i = 0; i < 9; i++) {
          c.fillStyle = i % 2 ? 'rgba(255,150,170,0.55)' : 'rgba(190,120,200,0.5)';
          const x = r() * w, y = 70 + r() * 150;
          ell(c, x, y, 60 + r() * 90, 6 + r() * 6); ell(c, x + 30, y - 6, 40, 6);
        }
      },
      far(c, w, h, r) {
        const sx = w * 0.5;
        glow(c, sx, 262, 210, 'rgba(255,200,120,0.55)');
        c.fillStyle = '#ffe08a'; circ(c, sx, 262, 58);
        c.fillStyle = '#ffd166'; circ(c, sx, 268, 50);
        const g = c.createLinearGradient(0, 262, 0, h);
        g.addColorStop(0, '#8e4f8c'); g.addColorStop(1, '#3a3a7c');
        c.fillStyle = g; c.fillRect(0, 262, w, h - 262);
        c.fillStyle = 'rgba(255,220,140,0.85)'; c.fillRect(0, 262, w, 2);
        for (let i = 0; i < 12; i++) { const y = 270 + i * 9, hw = 56 - i * 3.6; c.fillStyle = `rgba(255,${200 - i * 6},120,${0.8 - i * 0.05})`; c.fillRect(sx - hw + (i % 2) * 8, y, hw * 2 - 16, 3); }
        c.fillStyle = 'rgba(255,190,200,0.35)';
        for (let i = 0; i < 40; i++) { const x = r() * w, y = 280 + r() * 120; wrap(w, x, 30, X => c.fillRect(X, y, 10 + r() * 16, 2)); }
        wrap(w, w * 0.2, 30, X => {
          c.fillStyle = '#3a2350';
          c.beginPath(); c.moveTo(X - 22, 270); c.lineTo(X + 22, 270); c.lineTo(X + 15, 278); c.lineTo(X - 15, 278); c.fill();
          tri(c, X, 268, X, 228, X + 20, 268); tri(c, X - 2, 268, X - 2, 236, X - 16, 268);
        });
        wrap(w, w * 0.84, 90, X => {
          c.fillStyle = '#3a2350';
          c.beginPath(); c.moveTo(X - 80, 266); c.quadraticCurveTo(X - 30, 236, X, 240); c.quadraticCurveTo(X + 40, 236, X + 80, 266); c.fill();
          c.fillStyle = 'rgba(255,240,170,0.28)'; tri(c, X - 4, 182, X - 150, 160, X - 150, 206);
          c.fillStyle = '#4b2e60'; c.beginPath(); c.moveTo(X - 9, 242); c.lineTo(X - 6, 188); c.lineTo(X + 6, 188); c.lineTo(X + 9, 242); c.fill();
          c.fillStyle = '#c94b6d'; c.fillRect(X - 8, 222, 16, 7); c.fillRect(X - 7, 202, 14, 7);
          glow(c, X, 182, 26, 'rgba(255,240,170,0.8)');
          c.fillStyle = '#fff3b0'; c.fillRect(X - 4, 178, 8, 9);
          c.fillStyle = '#4b2e60'; tri(c, X - 7, 178, X, 168, X + 7, 178);
        });
      },
      mid(c, w, h, r) {
        const wv = [[2, 10, 0.5], [5, 5, 1]];
        band(c, w, h, 352, wv, '#6a3a63');
        c.fillStyle = 'rgba(255,190,150,0.25)';
        for (const x of spread(w, 8, r)) wrap(w, x, 30, X => ell(c, X, bandY(w, 352, wv, X) + 4, 26, 3));
        onBand(c, w, 352, wv, 4, r, 70, (x, y, k) => palmSil(c, x, y + 6, 80 + k * 40, '#3f2142'));
        onBand(c, w, 352, wv, 5, r, 30, (x, y, k) => { c.fillStyle = '#4e2a4c'; ell(c, x, y + 4, 18 + k * 14, 10 + k * 6); });
      },
    },
    // 33
    {
      name: 'Підземна шахта', icon: '⛏️',
      sky: ['#1b120d', '#3b2a1f'],
      ground: { style: 'stone', body: '#6b5444', dark: '#55402f', top: '#8f7258', topDark: '#5d4636', texture: 'gems', glow: '#4fe0ff' },
      block: { fill: '#a0703c', light: '#cf9f62', dark: '#6b4520', bricks: true },
      oneway: { fill: '#9c7a50', dark: '#5d452c' },
      enemy: 'xMole', enemyColor: '#8f86b0', flyer: 'bat',
      decor: ['xLantern', 'xGem', 'xMineCart', 'rock', 'xGem'],
      particles: 'none', gravity: 1,
      music: { bpm: 100, root: 55, minor: true, lead: 'triangle', bass: 'square', drums: true, rest: 0.3, seed: 33 },
      skyDraw(c, w, h) {},
      far(c, w, h, r) {
        for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * 330, s = 10 + r() * 26; wrap(w, x, s * 1.5, X => { c.fillStyle = '#2e2119'; ell(c, X, y, s * 1.4, s, r() * 3); }); }
        const gc = ['#4fe0ff', '#ff5ec4', '#69f0ae', '#ffd54f'];
        c.save();
        for (let i = 0; i < 24; i++) { const x = r() * w, y = 40 + r() * 270, col = gc[i % 4]; wrap(w, x, 10, X => { c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col; c.beginPath(); c.moveTo(X, y - 5); c.lineTo(X + 3.5, y); c.lineTo(X, y + 5); c.lineTo(X - 3.5, y); c.fill(); }); }
        c.restore();
        for (let x = 0; x < w; x += 256) {
          c.fillStyle = '#4a3322'; c.fillRect(x + 60, 110, 12, 225); c.fillRect(x + 196, 110, 12, 225); c.fillRect(x + 50, 100, 168, 14);
          glow(c, x + 134, 140, 60, 'rgba(255,180,80,0.35)');
          c.strokeStyle = '#3a2a1e'; c.lineWidth = 1.5; line(c, x + 134, 114, x + 134, 128);
          c.fillStyle = '#ffcf6b'; rr(c, x + 128, 128, 12, 15, 3); c.fill();
        }
        c.fillStyle = '#3a2a1e'; c.fillRect(0, 330, w, h - 330);
        c.fillStyle = '#5a4535'; for (let x = 0; x < w; x += 32) c.fillRect(x + 4, 332, 18, 5);
        c.fillStyle = '#8d8d98'; c.fillRect(0, 329, w, 2.5);
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 10, r)) { const l = 30 + r() * 60; wrap(w, x, 20, X => { c.fillStyle = '#2a1d15'; tri(c, X - 14, 0, X, l, X + 14, 0); }); }
        c.fillStyle = '#2a1d15'; c.fillRect(0, 0, w, 10);
        for (let x = 0; x < w; x += 512) {
          c.fillStyle = '#7a5432'; c.fillRect(x + 120, 54, 18, 320); c.fillRect(x + 380, 54, 18, 320);
          c.fillStyle = '#8f6640'; c.fillRect(x + 104, 40, 310, 20);
          c.fillStyle = '#5d3f24'; c.fillRect(x + 104, 56, 310, 4); c.fillRect(x + 126, 54, 4, 320); c.fillRect(x + 386, 54, 4, 320);
          for (const lx of [x + 200, x + 330]) {
            glow(c, lx, 92, 60, 'rgba(255,190,90,0.45)');
            c.strokeStyle = '#3a2a1e'; c.lineWidth = 2; line(c, lx, 60, lx, 78);
            c.fillStyle = '#3a2a1e'; c.fillRect(lx - 8, 78, 16, 3); c.fillRect(lx - 8, 98, 16, 3);
            c.fillStyle = '#ffd36b'; rr(c, lx - 6, 81, 12, 17, 3); c.fill();
          }
        }
        haze(c, w, h, 'rgba(25,16,10,0.3)');
        const wv = [[3, 8, 0], [7, 4, 1]];
        band(c, w, h, 362, wv, '#46321f');
        wrap(w, w * 0.62, 40, X => { const y = bandY(w, 362, wv, X); c.save(); c.translate(X, y + 4); c.scale(2.2, 2.2); Art.decors.xMineCart(c, 0); c.restore(); });
        onBand(c, w, 362, wv, 6, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 4); c.scale(1.8, 1.8); Art.decors.xGem(c, k * 4); c.restore(); });
      },
    },
    // 34
    {
      name: 'Таємниці пірамід', icon: '🔺',
      sky: ['#2b1a0e', '#6b4520'],
      ground: { style: 'sand', body: '#c9995a', dark: '#ad7f44', top: '#ebc47e', topDark: '#c49a55', texture: 'bricks' },
      block: { fill: '#d9a95b', light: '#f3cf8a', dark: '#9c6f2e', bricks: true },
      oneway: { fill: '#2f6fb3', dark: '#1d4a80' },
      enemy: 'xMummy', enemyColor: '#f5efe0', flyer: 'xScarab',
      decor: ['xTorch', 'xVase', 'xCatStatue', 'xGoldPile', 'xVase'],
      particles: 'dust', gravity: 1,
      music: { bpm: 104, root: 62, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 34 },
      skyDraw(c, w, h) {
        c.fillStyle = 'rgba(255,220,150,0.07)';
        for (let i = 0; i < 4; i++) tri(c, w * (0.15 + i * 0.25), 0, w * (0.05 + i * 0.25), h, w * (0.22 + i * 0.25), h);
      },
      far(c, w, h, r) {
        c.fillStyle = '#7d5730'; c.fillRect(0, 34, w, h - 34);
        c.strokeStyle = '#6a4826'; c.lineWidth = 2;
        for (let y = 34, i = 0; y < h; y += 30, i++) { line(c, 0, y, w, y); for (let x = (i % 2) * 32; x < w; x += 64) line(c, x, y, x, y + 30); }
        const sym = [
          (x, y) => { ell(c, x, y, 9, 5); c.fillStyle = '#7d5730'; circ(c, x, y, 3); c.fillStyle = '#4e3218'; c.fillRect(x - 2, y + 4, 2, 8); },
          (x, y) => { circ(c, x, y - 6, 4); c.fillRect(x - 1.5, y - 2, 3, 14); c.fillRect(x - 7, y + 1, 14, 3); },
          (x, y) => { ell(c, x, y, 8, 5); circ(c, x + 7, y - 5, 3.5); tri(c, x + 9, y - 6, x + 15, y - 4, x + 9, y - 3); c.fillRect(x - 2, y + 4, 2, 6); },
          (x, y) => { for (let i = 0; i < 3; i++) { c.beginPath(); for (let k = 0; k <= 16; k++) c.lineTo(x - 8 + k, y - 6 + i * 6 + Math.sin(k) * 2); c.stroke(); } },
          (x, y) => { circ(c, x, y, 6); c.fillStyle = '#7d5730'; circ(c, x, y, 3); },
          (x, y) => { tri(c, x - 8, y + 8, x, y - 8, x + 8, y + 8); },
        ];
        for (const x of spread(w, 5, r, 0.4)) {
          wrap(w, x, 60, X => {
            c.fillStyle = '#946a3c'; c.fillRect(X - 48, 110, 96, 170);
            c.strokeStyle = '#b88a4f'; c.lineWidth = 3; c.strokeRect(X - 44, 114, 88, 162);
            c.fillStyle = '#4e3218'; c.strokeStyle = '#4e3218'; c.lineWidth = 2;
            for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) sym[(i * 3 + k + Math.floor(X)) % sym.length](X - 26 + k * 26, 144 + i * 48);
          });
        }
        c.fillStyle = '#5e3f20'; c.fillRect(0, 34, w, 10); c.fillRect(0, 330, w, h - 330);
      },
      mid(c, w, h, r) {
        for (let x = 0; x < w; x += 256) {
          const X = x + 128;
          c.fillStyle = '#c49a5c'; c.fillRect(X - 22, 70, 44, 300);
          c.fillStyle = '#a97f45'; for (let i = -1; i <= 1; i++) c.fillRect(X + i * 12 - 2, 96, 4, 260);
          c.fillStyle = '#d9b27a'; c.beginPath(); c.moveTo(X - 22, 70); c.quadraticCurveTo(X - 40, 50, X - 36, 30); c.lineTo(X + 36, 30); c.quadraticCurveTo(X + 40, 50, X + 22, 70); c.fill();
          c.fillStyle = '#2f6fb3'; c.fillRect(X - 30, 40, 60, 6); c.fillStyle = '#c0392b'; c.fillRect(X - 26, 50, 52, 5);
          c.fillStyle = '#1b8a5a'; c.fillRect(X - 24, 76, 48, 6);
          c.fillStyle = '#b08350'; c.fillRect(X - 30, 0, 60, 30); c.fillRect(X - 28, 356, 56, 16);
          glow(c, X + 34, 170, 70, 'rgba(255,170,60,0.4)');
          c.fillStyle = '#6d4c41'; c.fillRect(X + 22, 176, 14, 4); c.fillRect(X + 30, 168, 5, 14);
          c.fillStyle = '#ff8f00'; c.beginPath(); c.moveTo(X + 26, 168); c.quadraticCurveTo(X + 30, 146, X + 33, 140); c.quadraticCurveTo(X + 40, 156, X + 39, 168); c.fill();
          c.fillStyle = '#ffd740'; c.beginPath(); c.moveTo(X + 29.5, 168); c.quadraticCurveTo(X + 32, 154, X + 33, 150); c.quadraticCurveTo(X + 36, 160, X + 36, 168); c.fill();
        }
        const wv = [[4, 4, 0]];
        band(c, w, h, 366, wv, '#5a3c1f');
        for (const x of spread(w, 4, r)) {
          const k = r();
          wrap(w, x, 50, X => { c.save(); c.translate(X, bandY(w, 366, wv, X) + 4); c.scale(2.2, 2.2); (k < 0.5 ? Art.decors.xGoldPile : Art.decors.xCatStatue)(c, k * 3); c.restore(); });
        }
      },
    },
    // 35
    {
      name: 'Морські глибини', icon: '🦑',
      sky: ['#0b2f5e', '#020a1c'],
      ground: { style: 'coral', body: '#2c3d63', dark: '#223152', top: '#4a6aa0', topDark: '#33507f', topLight: 'rgba(130,230,255,0.4)', texture: 'dots' },
      block: { fill: '#26a69a', light: '#64d8cb', dark: '#00695c' },
      oneway: { fill: '#7e6bd6', dark: '#4a3aa0' },
      enemy: 'xOctopus', enemyColor: '#ff6e9c', flyer: 'xAnglerfish',
      decor: ['xAnemone', 'xTubeWorm', 'seaweed', 'chest', 'xAnemone'],
      particles: 'bubbles', gravity: 0.6, jumpBoost: 1.1, fallMul: 0.55,
      music: { bpm: 76, root: 57, minor: true, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 35, bell: true },
      skyDraw(c, w, h) {
        c.fillStyle = 'rgba(140,210,255,0.06)';
        for (let i = 0; i < 5; i++) tri(c, w * (0.1 + i * 0.2), 0, w * (0.02 + i * 0.2), h * 0.8, w * (0.16 + i * 0.2), h * 0.8);
        const r = mulberry32(35);
        for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(200,230,255,${0.15 + r() * 0.3})`; circ(c, r() * w, r() * h, 0.8 + r() * 1.2); }
      },
      far(c, w, h, r) {
        const cols = ['rgba(255,110,220,A)', 'rgba(90,240,255,A)', 'rgba(180,140,255,A)'];
        for (const x of spread(w, 6, r)) { const y = 70 + r() * 170, s = 0.7 + r() * 0.6, col = cols[Math.floor(r() * 3)]; wrap(w, x, 50, X => jelly(c, X, y, s, col, 0.55)); }
        for (const x of spread(w, 4, r)) {
          const y = 120 + r() * 140;
          wrap(w, x, 30, X => {
            c.fillStyle = '#0d2448'; ell(c, X, y, 18, 13); tri(c, X - 16, y, X - 28, y - 9, X - 28, y + 9);
            c.strokeStyle = '#0d2448'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X + 6, y - 11); c.quadraticCurveTo(X + 14, y - 26, X + 24, y - 16); c.stroke();
            glow(c, X + 24, y - 15, 14, 'rgba(220,255,130,0.8)');
            c.fillStyle = '#f4ff81'; circ(c, X + 24, y - 15, 2.5);
          });
        }
        const wv = [[2, 26, 0], [5, 10, 1]];
        band(c, w, h, 330, wv, '#0a2245');
        onBand(c, w, 330, wv, 9, r, 40, (x, y, k) => { c.fillStyle = '#0a2245'; ell(c, x, y + 10, 20 + k * 30, 30 + k * 30); });
      },
      mid(c, w, h, r) {
        const wv = [[3, 9, 0], [7, 4, 1]];
        band(c, w, h, 366, wv, '#0f2d5a');
        onBand(c, w, 366, wv, 6, r, 70, (x, y, k) => {
          c.fillStyle = '#12356a';
          c.beginPath(); c.moveTo(x - 60, y + 10); c.quadraticCurveTo(x - 40, y - 60 - k * 40, x, y - 70 - k * 40); c.quadraticCurveTo(x + 40, y - 60 - k * 40, x + 60, y + 10); c.fill();
          c.save(); c.shadowColor = '#69f0ff'; c.shadowBlur = 8; c.fillStyle = '#7ff6ff';
          for (let i = 0; i < 6; i++) circ(c, x - 34 + i * 13, y - 20 - Math.sin(i * 1.3) * 18 - k * 10, 1.8);
          c.restore();
        });
        onBand(c, w, 366, wv, 9, r, 30, (x, y, k) => {
          c.save(); c.translate(x, y + 4); c.scale(2, 2);
          (k < 0.5 ? Art.decors.xAnemone : Art.decors.xTubeWorm)(c, k * 5);
          c.restore();
        });
      },
    },
    // 36
    {
      name: 'Місяць', icon: '🌙',
      sky: ['#04040e', '#191935'],
      ground: { style: 'moon', body: '#9a9aae', dark: '#7c7c92', top: '#d0d0de', topDark: '#a4a4ba', light: '#b4b4c6', texture: 'craters' },
      block: { fill: '#cfd8dc', light: '#ffffff', dark: '#8a9aa3' },
      oneway: { fill: '#ffca28', dark: '#c79100' },
      enemy: 'xMoonBunny', enemyColor: '#f3d9ff', flyer: 'xComet',
      decor: ['moonRock', 'xLander', 'flagUA', 'xRocket', 'moonRock'],
      particles: 'none', gravity: 0.5, jumpBoost: 1.15,
      music: { bpm: 88, root: 59, minor: false, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 36, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 240, mulberry32(36), h * 0.85);
        const ex = w * 0.76, ey = 100;
        glow(c, ex, ey, 90, 'rgba(100,180,255,0.35)');
        c.fillStyle = '#1e88e5'; circ(c, ex, ey, 48);
        c.fillStyle = '#4caf50';
        ell(c, ex - 14, ey - 12, 18, 12, 0.4); ell(c, ex + 18, ey + 12, 12, 17, -0.3); ell(c, ex - 8, ey + 26, 10, 6); ell(c, ex + 20, ey - 22, 8, 5);
        c.fillStyle = 'rgba(255,255,255,0.75)'; ell(c, ex + 4, ey - 32, 18, 4); ell(c, ex - 20, ey + 8, 14, 3, 0.2); ell(c, ex + 10, ey + 34, 12, 3);
        c.fillStyle = 'rgba(0,0,40,0.35)'; c.beginPath(); c.arc(ex, ey, 48, -1.2, 1.9); c.arc(ex - 18, ey, 46, 1.9, -1.2, true); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.lineCap = 'round'; line(c, w * 0.2, 60, w * 0.26, 80);
      },
      far(c, w, h, r) {
        peaks(c, w, h, 318, 6, 80, 150, '#46465a', null, r);
        for (let i = 0; i < 14; i++) { const x = r() * w, y = 290 + r() * 30, s = 6 + r() * 12; wrap(w, x, 20, X => crater(c, X, y, s, '#38384a', '#55556a')); }
        wrap(w, w * 0.35, 60, X => {
          c.fillStyle = '#8a8aa0'; c.fillRect(X - 50, 300, 100, 16);
          c.fillStyle = 'rgba(210,230,255,0.85)'; c.beginPath(); c.arc(X - 18, 302, 26, Math.PI, 0); c.fill(); c.beginPath(); c.arc(X + 26, 302, 16, Math.PI, 0); c.fill();
          c.fillStyle = '#ffd54f'; for (let i = 0; i < 4; i++) c.fillRect(X - 34 + i * 10, 296, 4, 4);
          c.strokeStyle = '#8a8aa0'; c.lineWidth = 2; line(c, X + 44, 300, X + 44, 270);
          c.fillStyle = '#ff5252'; circ(c, X + 44, 268, 3);
        });
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [6, 5, 1]];
        band(c, w, h, 360, wv, '#6c6c84');
        for (const x of spread(w, 10, r)) { const s = 10 + r() * 20; wrap(w, x, 40, X => crater(c, X, bandY(w, 360, wv, X) + 12 + s * 0.3, s, '#53536a', '#8686a0')); }
        wrap(w, w * 0.15, 50, X => { c.save(); c.translate(X, bandY(w, 360, wv, X) + 4); c.scale(2.4, 2.4); Art.decors.xLander(c, 0); c.restore(); });
        wrap(w, w * 0.62, 30, X => { c.save(); c.translate(X, bandY(w, 360, wv, X) + 4); c.scale(2, 2); Art.decors.flagUA(c, 0); c.restore(); });
        onBand(c, w, 360, wv, 5, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 5); c.scale(1.6 + k, 1.6 + k); Art.decors.moonRock(c); c.restore(); });
      },
    },
    // 37
    {
      name: 'Марс', icon: '🔴',
      sky: ['#d26f45', '#f7cba3'],
      ground: { style: 'sand', body: '#a8472a', dark: '#8a3820', top: '#e2794c', topDark: '#b65733', light: '#c25a38', texture: 'craters' },
      block: { fill: '#eceff1', light: '#ffffff', dark: '#90a4ae' },
      oneway: { fill: '#546e7a', dark: '#37474f' },
      enemy: 'xMarsRover', enemyColor: '#eceff1', flyer: 'xDrone',
      decor: ['xMarsRock', 'xDome', 'antenna', 'xMarsRock'],
      particles: 'dust', gravity: 0.7, jumpBoost: 1.1,
      music: { bpm: 98, root: 57, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 37 },
      skyDraw(c, w, h) {
        sun(c, w * 0.22, 70, 16, '#fff6e8', 'rgba(255,240,220,0.6)');
        c.fillStyle = '#c7a594'; circ(c, w * 0.62, 56, 7); c.fillStyle = '#b48f7d'; circ(c, w * 0.64, 54, 2);
        c.fillStyle = '#d4b4a0'; circ(c, w * 0.86, 96, 4);
      },
      far(c, w, h, r) {
        for (const x of spread(w, 4, r, 0.6)) {
          const mw = 70 + r() * 70, mh = 70 + r() * 60;
          wrap(w, x, mw * 1.3, X => {
            c.fillStyle = '#c86a45';
            c.beginPath(); c.moveTo(X - mw * 1.25, 318); c.lineTo(X - mw * 0.7, 318 - mh); c.lineTo(X + mw * 0.7, 318 - mh); c.lineTo(X + mw * 1.25, 318); c.fill();
            c.fillStyle = '#b75a38'; c.fillRect(X - mw * 0.7, 318 - mh, mw * 1.4, 7);
            c.fillStyle = 'rgba(150,60,30,0.35)'; c.fillRect(X - mw * 0.85, 318 - mh * 0.55, mw * 1.7, 5);
          });
        }
        band(c, w, h, 316, [[2, 10, 0.3], [4, 5, 1]], '#d27a52');
        c.fillStyle = 'rgba(255,220,190,0.25)'; c.fillRect(0, 250, w, 50);
      },
      mid(c, w, h, r) {
        const wv = [[2, 16, 0.4], [3, 9, 2], [7, 3, 1]];
        band(c, w, h, 356, wv, '#a9472c');
        c.fillStyle = 'rgba(255,170,120,0.25)';
        for (const x of spread(w, 6, r)) wrap(w, x, 60, X => { const y = bandY(w, 356, wv, X); ell(c, X, y + 3, 50, 4); });
        wrap(w, w * 0.3, 50, X => {
          const y = bandY(w, 356, wv, X) + 4;
          c.save(); c.translate(X, y); c.scale(2.4, 2.4); Art.decors.xDome(c, 0); c.restore();
          c.save(); c.translate(X + 70, y); c.scale(2.4, 2.4); Art.decors.antenna(c, 0); c.restore();
        });
        wrap(w, w * 0.75, 50, X => {
          const y = bandY(w, 356, wv, X) + 4;
          c.save(); c.translate(X, y); c.scale(2.2, 2.2); Art.enemies.xMarsRover(c, 0, '#f5f5f5'); c.restore();
          c.fillStyle = 'rgba(120,40,20,0.35)'; for (let i = 1; i < 6; i++) c.fillRect(X - 30 - i * 16, y - 4, 10, 3);
        });
        onBand(c, w, 356, wv, 6, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 5); c.scale(1.6 + k, 1.6 + k); Art.decors.xMarsRock(c); c.restore(); });
      },
    },
    // 38
    {
      name: 'Космічна станція', icon: '🛰️',
      sky: ['#04061a', '#12183a'],
      ground: { style: 'road', body: '#5a6880', dark: '#48556b', top: '#a7b8cc', topDark: '#6f8098', texture: 'bricks' },
      block: { fill: '#4fc3f7', light: '#b3e9ff', dark: '#0277bd' },
      oneway: { fill: '#b0bec5', dark: '#607d8b' },
      enemy: 'xAstroBot', enemyColor: '#ff8a50', flyer: 'xSatellite',
      decor: ['xConsole', 'xOxyTank', 'xSpacePlant', 'xConsole'],
      particles: 'none', gravity: 0.6, jumpBoost: 1.1,
      music: { bpm: 116, root: 60, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 38 },
      skyDraw(c, w, h) {
        for (const [x, y, col] of [[0.2, 0.3, 'rgba(80,160,255,0.35)'], [0.8, 0.35, 'rgba(255,90,190,0.3)']]) glow(c, w * x, h * y, 260, col);
        stars(c, w, h, 260, mulberry32(38));
        c.fillStyle = '#7fd6ff'; circ(c, w * 0.85, 110, 22); c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, w * 0.85, 104, 20, 4);
        const px = w * 0.5, py = 150;
        glow(c, px, py, 160, 'rgba(120,90,255,0.35)');
        const g = c.createLinearGradient(px - 90, py - 90, px + 90, py + 90);
        g.addColorStop(0, '#ff9a6b'); g.addColorStop(1, '#7c3f9e');
        c.fillStyle = g; circ(c, px, py, 90);
        c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, px, py - 30, 88, 10); ell(c, px, py + 20, 86, 8);
      },
      far(c, w, h, r) {
        c.fillStyle = '#34405c'; c.fillRect(0, 0, w, h);
        c.strokeStyle = '#2b3550'; c.lineWidth = 2;
        for (let x = 0; x < w; x += 64) line(c, x, 0, x, h);
        for (let y = 0; y < h; y += 56) line(c, 0, y, w, y);
        c.save(); c.globalCompositeOperation = 'destination-out';
        for (let x = 128; x < w; x += 256) { circ(c, x, 150, 56); rr(c, x + 72, 110, 70, 90, 16); c.fill(); }
        c.restore();
        c.lineWidth = 8; c.strokeStyle = '#8796b0';
        for (let x = 128; x < w; x += 256) {
          c.beginPath(); c.arc(x, 150, 58, 0, TAU); c.stroke();
          rr(c, x + 70, 108, 74, 94, 18); c.stroke();
          c.fillStyle = '#5c6a88'; for (let i = 0; i < 8; i++) circ(c, x + Math.cos(i * TAU / 8) * 58, 150 + Math.sin(i * TAU / 8) * 58, 2.5);
        }
        c.fillStyle = '#56657f'; c.fillRect(0, 238, w, 10);
        c.fillStyle = '#ffcf33'; for (let x = 0; x < w; x += 32) c.fillRect(x, 252, 16, 4);
        c.fillStyle = '#2a3550'; c.fillRect(0, 320, w, h - 320);
      },
      mid(c, w, h, r) {
        c.fillStyle = '#5b6b88'; c.fillRect(0, 18, w, 14); c.fillStyle = '#76869f'; c.fillRect(0, 21, w, 3);
        c.fillStyle = '#4a5874'; for (let x = 0; x < w; x += 64) c.fillRect(x, 14, 8, 22);
        for (let x = 0; x < w; x += 256) {
          c.fillStyle = '#4b5a78'; c.fillRect(x + 6, 0, 36, h);
          c.fillStyle = '#5f6f8f'; c.fillRect(x + 10, 0, 6, h);
          c.fillStyle = '#3a4762'; for (let y = 60; y < h; y += 70) circ(c, x + 24, y, 7);
        }
        const led = ['#ff5252', '#69f0ae', '#ffeb3b', '#40c4ff'];
        for (const x of spread(w, 5, r, 0.5)) {
          const y = 250 + r() * 40, pw = 70 + r() * 30;
          wrap(w, x, pw, X => {
            c.fillStyle = '#3d4864'; rr(c, X - pw / 2, y, pw, 100, 6); c.fill();
            c.fillStyle = '#4e5b7a'; rr(c, X - pw / 2 + 4, y + 4, pw - 8, 92, 4); c.fill();
            c.fillStyle = '#0f1d30'; c.fillRect(X - pw / 2 + 10, y + 10, pw - 20, 30);
            c.strokeStyle = '#4ff3ff'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i <= pw - 24; i += 3) c.lineTo(X - pw / 2 + 12 + i, y + 25 + Math.sin(i * 0.3 + X) * 8); c.stroke();
            for (let i = 0; i < 5; i++) { const col = led[(i + Math.floor(X)) % 4]; c.save(); c.shadowColor = col; c.shadowBlur = 6; c.fillStyle = col; circ(c, X - pw / 2 + 14 + i * (pw - 28) / 4, y + 54, 3); c.restore(); }
            c.fillStyle = '#26324a'; for (let i = 0; i < 3; i++) c.fillRect(X - pw / 2 + 12, y + 68 + i * 8, pw - 24, 3);
          });
        }
        c.fillStyle = '#3b4762'; c.fillRect(0, 362, w, h - 362);
        c.fillStyle = '#ffcf33'; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 362); c.lineTo(x + 16, 362); c.lineTo(x + 8, 370); c.lineTo(x - 8, 370); c.fill(); }
      },
    },
    // 39
    {
      name: 'Чарівна туманність', icon: '✨',
      sky: ['#14062e', '#3a1466'],
      ground: { style: 'crystal', body: '#5b3a92', dark: '#4a2e7a', top: '#b38cff', topDark: '#7c4dff', glow: '#ff8cf5', texture: 'gems' },
      block: { fill: '#26c6da', light: '#9cf0ff', dark: '#00838f' },
      oneway: { fill: '#f3e8ff', dark: '#c4a8f0', style: 'cloud' },
      enemy: 'xStarBlob', enemyColor: '#ffd54f', flyer: 'xStarMoth',
      decor: ['xStarCrystal', 'crystal', 'xOrb', 'xStarCrystal'],
      particles: 'twinkle', gravity: 0.55, jumpBoost: 1.15,
      music: { bpm: 86, root: 64, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.35, seed: 39, bell: true },
      skyDraw(c, w, h) {
        for (const [x, y, rad, col] of [[0.2, 0.25, 260, 'rgba(255,80,200,0.35)'], [0.55, 0.45, 300, 'rgba(60,200,255,0.25)'], [0.85, 0.2, 240, 'rgba(255,170,80,0.25)'], [0.4, 0.1, 200, 'rgba(160,90,255,0.35)']]) {
          const g = c.createRadialGradient(w * x, h * y, 10, w * x, h * y, rad);
          g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.fillRect(0, 0, w, h);
        }
        const r = mulberry32(39);
        stars(c, w, h, 200, r);
        c.save(); c.shadowColor = '#fff'; c.shadowBlur = 10; c.fillStyle = '#fff';
        for (let i = 0; i < 7; i++) star(c, r() * w, 20 + r() * 200, 4 + r() * 4, 4, 0.25);
        c.restore();
      },
      far(c, w, h, r) {
        const cols = ['rgba(255,120,220,0.4)', 'rgba(120,220,255,0.3)', 'rgba(190,140,255,0.4)'];
        for (let i = 0; i < 30; i++) { const x = r() * w, y = 80 + r() * 200, s = 30 + r() * 50, col = cols[i % 3]; wrap(w, x, s * 1.6, X => glow(c, X, y, s * 1.6, col)); }
        for (const x of spread(w, 4, r)) {
          const y = 150 + r() * 90, s = 0.6 + r() * 0.4;
          wrap(w, x, 60, X => {
            c.fillStyle = '#3c2166'; c.beginPath(); c.moveTo(X - 46 * s, y); c.lineTo(X + 46 * s, y); c.lineTo(X + 12 * s, y + 40 * s); c.lineTo(X - 8 * s, y + 50 * s); c.closePath(); c.fill();
            c.fillStyle = '#6a45a8'; ell(c, X, y, 47 * s, 7 * s);
            crystalShard(c, X - 14 * s, y - 14 * s, s, '#9ef5ff'); crystalShard(c, X + 12 * s, y - 20 * s, s * 1.3, '#ff9ef0');
          });
        }
        band(c, w, h, 320, [[2, 14, 0], [5, 6, 1]], 'rgba(120,70,200,0.55)');
      },
      mid(c, w, h, r) {
        const cc = ['#ff9ef0', '#9ef5ff', '#c9a6ff', '#fff59d'];
        for (const x of spread(w, 6, r)) {
          const y = 110 + r() * 150, s = 0.8 + r() * 0.7, col = cc[Math.floor(r() * 4)];
          wrap(w, x, 40, X => { glow(c, X, y, 46 * s, 'rgba(255,255,255,0.18)'); c.save(); c.shadowColor = col; c.shadowBlur = 16; crystalShard(c, X, y, s, col); c.restore(); });
        }
        const wv = [[4, 10, 0], [9, 4, 2]];
        band(c, w, h, 356, wv, '#3b1f6e');
        onBand(c, w, 356, wv, 16, r, 40, (x, y, k) => { c.fillStyle = '#4a2a85'; circ(c, x, y + 6, 18 + k * 18); });
        onBand(c, w, 356, wv, 9, r, 30, (x, y, k) => {
          const col = cc[Math.floor(k * 4)];
          c.save(); c.shadowColor = col; c.shadowBlur = 14;
          crystalShard(c, x - 8, y - 6, 0.8 + k * 0.6, col); crystalShard(c, x + 8, y, 0.6 + k * 0.4, cc[(Math.floor(k * 4) + 1) % 4]);
          c.restore();
        });
      },
    },
    // 40
    {
      name: 'Бананове королівство', icon: '🍌',
      sky: ['#5ec4ff', '#fff4c2'],
      ground: { style: 'grass', body: '#d99a3e', dark: '#b97e2a', top: '#6fd34f', topDark: '#3fa83a', texture: 'dots' },
      block: { fill: '#9c5bd6', light: '#c99af0', dark: '#6a2fa0', bricks: true },
      oneway: { fill: '#e53958', dark: '#a3173a' },
      enemy: 'xPineapple', enemyColor: '#ffb300', flyer: 'xButterflyGold',
      decor: ['xBananaTree', 'xCrown', 'flower', 'xGiftBox', 'tulip', 'xBananaTree'],
      particles: 'sparkle', gravity: 1,
      music: { bpm: 136, root: 65, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.2, seed: 40, bell: true },
      skyDraw(c, w, h) {
        sun(c, w * 0.1, 66, 28, '#fff9c4', 'rgba(255,250,200,0.7)');
        const cols = ['#ff5252', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#ab47bc'];
        c.globalAlpha = 0.5; c.lineWidth = 12;
        cols.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(w * 0.55, 400, 330 - i * 12, Math.PI, 0); c.stroke(); });
        c.globalAlpha = 1;
        firework(c, w * 0.25, 90, 34, ['#ff4081', '#ffd740']);
        firework(c, w * 0.88, 70, 40, ['#40c4ff', '#b2ff59']);
        firework(c, w * 0.7, 150, 24, ['#ffd740', '#ff6e40']);
        const r = mulberry32(40);
        c.fillStyle = '#fff';
        for (let i = 0; i < 18; i++) star(c, r() * w, 20 + r() * 180, 2 + r() * 3, 4, 0.3);
      },
      far(c, w, h, r) {
        clouds(c, w, 4, r, 40, 120, 'rgba(255,255,255,0.9)');
        band(c, w, h, 300, [[2, 18, 0.5], [3, 10, 1.2]], '#a8e08a');
        const X0 = w * 0.55;
        wrap(w, X0, 230, X => {
          const G = '#ffd54f', D = '#e0a800', B = 330;
          const dome = (x, y, s) => {
            c.fillStyle = '#ffe135'; c.beginPath(); c.moveTo(x - s, y); c.quadraticCurveTo(x - s, y - s * 1.4, x + s * 0.2, y - s * 2); c.quadraticCurveTo(x + s * 0.3, y - s * 1.3, x + s, y); c.fill();
            c.fillStyle = '#6b4a1a'; c.fillRect(x + s * 0.1, y - s * 2.2, 3, s * 0.4);
            c.strokeStyle = '#c99a00'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.stroke();
          };
          const tower = (x, tw, th) => {
            c.fillStyle = G; c.fillRect(x - tw / 2, B - th, tw, th);
            c.fillStyle = D; for (let i = 0; i < 3; i++) c.fillRect(x - tw / 2 + i * tw / 2.5, B - th - 8, tw / 5, 8);
            c.fillStyle = '#6a2fa0'; rr(c, x - 6, B - th + 20, 12, 18, 6); c.fill();
            dome(x, B - th - 8, tw * 0.55);
            c.strokeStyle = '#8d6e63'; c.lineWidth = 2; line(c, x + tw * 0.06, B - th - 8 - tw * 1.2, x + tw * 0.06, B - th - 8 - tw * 1.2 - 26);
            c.fillStyle = '#0057b7'; c.fillRect(x + tw * 0.06, B - th - 8 - tw * 1.2 - 26, 18, 6);
            c.fillStyle = '#ffd700'; c.fillRect(x + tw * 0.06, B - th - 8 - tw * 1.2 - 20, 18, 6);
          };
          tower(X - 170, 46, 150); tower(X + 170, 46, 150);
          c.fillStyle = G; c.fillRect(X - 150, B - 110, 300, 110);
          c.fillStyle = D; for (let i = 0; i < 12; i++) c.fillRect(X - 150 + i * 26, B - 120, 13, 10);
          tower(X - 70, 40, 170); tower(X + 70, 40, 170);
          tower(X, 70, 210);
          c.fillStyle = '#ffe9a0'; for (const dx of [-115, -40, 40, 115]) { rr(c, X + dx - 9, B - 90, 18, 26, 9); c.fill(); }
          c.fillStyle = '#6a2fa0'; rr(c, X - 22, B - 54, 44, 54, 22); c.fill();
          c.fillStyle = '#ffd23f'; circ(c, X + 12, B - 24, 3);
          Art.banana(c, X, B - 170, 1.2, 1.8);
        });
        haze(c, w, h, 'rgba(255,250,235,0.22)');
        c.fillStyle = '#a8e08a'; c.fillRect(0, 328, w, h - 328);
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0.4], [5, 5, 1.5]];
        band(c, w, h, 352, wv, '#5cbf47');
        c.strokeStyle = '#8d6e63'; c.lineWidth = 1.5;
        c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, 96 + Math.abs(Math.sin(Math.PI * x / 128)) * 24); c.stroke();
        const fc = ['#ff5252', '#ffd740', '#40c4ff', '#b2ff59', '#ff80ab', '#ab47bc'];
        for (let x = 8, i = 0; x < w; x += 16, i++) { const y = 96 + Math.abs(Math.sin(Math.PI * x / 128)) * 24; c.fillStyle = fc[i % 6]; tri(c, x - 6, y, x + 6, y, x, y + 12); }
        onBand(c, w, 352, wv, 5, r, 70, (x, y, k) => bananaPalm(c, x, y + 8, 100 + k * 40, '#a1774a', '#3fae49', '#2e8b3a'));
        haze(c, w, 340, 'rgba(235,250,255,0.25)');
        onBand(c, w, 352, wv, 10, r, 30, (x, y, k) => { c.fillStyle = '#48a838'; circ(c, x, y + 4, 14 + k * 10); c.fillStyle = ['#ff5252', '#ffd740', '#ff80ab'][Math.floor(k * 3)]; circ(c, x - 5, y - 2, 3); circ(c, x + 6, y + 1, 3); });
      },
    },
  );
})();
