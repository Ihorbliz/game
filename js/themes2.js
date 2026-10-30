'use strict';
// Світи 16–28: нові декорації, вороги та фони. Підключається одразу після themes.js.
(function () {
  // додає лише нові імена — нічого вже наявного не перезаписує
  const addTo = (obj, add) => { for (const k in add) if (!(k in obj)) obj[k] = add[k]; };
  const R = k => mulberry32((k * 1e9) | 0);
  const pick = (arr, v) => arr[Math.floor(v * arr.length) % arr.length];
  const eye = (c, x, y, r, lx = 0.6) => {
    c.fillStyle = '#fff'; circ(c, x, y, r);
    c.fillStyle = '#111'; circ(c, x + lx, y + 0.2, r * 0.56);
    c.fillStyle = '#fff'; circ(c, x + lx + r * 0.22, y - r * 0.28, r * 0.22);
  };
  const legs = (c, t, xs, col, h = 4.5, w = 3.4) => {
    c.fillStyle = col;
    xs.forEach((x, i) => { const s = Math.sin(t * 12 + i * Math.PI) * 1.6; rr(c, x + s - w / 2, -h, w, h, 1.3); c.fill(); });
  };
  const blush = (c, x, y, r = 1.7) => { c.fillStyle = 'rgba(255,110,130,0.5)'; circ(c, x, y, r); };

  // ======================= Декорації =======================
  addTo(Art.decors, {
    leafPile(c) {
      c.fillStyle = '#c8602a'; ell(c, 0, 0, 15, 6);
      const cols = ['#e8662c', '#f29a2e', '#d84a2a', '#f5c03a'];
      for (let i = 0; i < 10; i++) { c.fillStyle = cols[i % 4]; ell(c, -12 + i * 2.7, -3 - Math.sin(i / 9 * Math.PI) * 5, 4.5, 2.2, i * 0.9); }
    },
    pumpkin(c) {
      c.fillStyle = '#ef6c00'; ell(c, -5, -7, 6, 7); ell(c, 5, -7, 6, 7);
      c.fillStyle = '#ff9800'; ell(c, 0, -7, 5.5, 7.5);
      c.fillStyle = '#5d4037'; c.fillRect(-1, -17, 2.5, 4);
      c.fillStyle = '#7cb342'; ell(c, 4, -15, 3.5, 1.6, -0.4);
    },
    autumnBush(c) {
      c.fillStyle = '#d9542b'; circ(c, -10, -8, 9); circ(c, 11, -8, 9);
      c.fillStyle = '#f29a2e'; circ(c, 0, -13, 11);
      c.fillStyle = '#f5c03a'; circ(c, -3, -16, 4.5); circ(c, 7, -10, 3);
    },
    hayBale(c) {
      c.fillStyle = '#d8a93a'; rr(c, -15, -19, 30, 19, 6); c.fill();
      c.fillStyle = '#f0cd62'; rr(c, -14, -19, 28, 15, 6); c.fill();
      c.strokeStyle = '#c4952e'; c.lineWidth = 1.2;
      for (const y of [-14, -9]) line(c, -11, y, 11, y + 1);
      c.fillStyle = '#b0413e'; c.fillRect(-7, -19, 2, 19); c.fillRect(5, -19, 2, 19);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-10, -17, 20, 2);
    },
    sunflower(c, t) {
      const sw = Math.sin(t * 1.6) * 1.5;
      c.strokeStyle = '#3e8e2f'; c.lineWidth = 2.5; line(c, 0, 0, sw, -32);
      c.fillStyle = '#4caf50'; ell(c, -4, -11, 5, 2.2, 0.5); ell(c, 4, -18, 5, 2.2, -0.5);
      c.fillStyle = '#ffc928';
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ell(c, sw + Math.cos(a) * 7, -35 + Math.sin(a) * 7, 4, 1.9, a); }
      c.fillStyle = '#6d4c2a'; circ(c, sw, -35, 5);
      c.fillStyle = '#4e3420'; circ(c, sw - 1.5, -36, 1); circ(c, sw + 1.5, -34, 1); circ(c, sw + 1, -37, 0.9);
    },
    chicken(c, t) {
      const p = Math.sin(t * 4) > 0.6 ? 4 : 0;
      c.strokeStyle = '#ffa000'; c.lineWidth = 1.6; line(c, -2, 0, -2, -5); line(c, 2, 0, 2, -5);
      c.fillStyle = '#e0e6ea'; tri(c, -6, -12, -12, -19, -5, -7);
      c.fillStyle = '#ffffff'; ell(c, 0, -10, 8, 6.5); circ(c, 6, -16 + p, 4.2);
      c.fillStyle = '#e3e9ee'; ell(c, -1, -10, 4.5, 3, 0.2);
      c.fillStyle = '#e53935'; circ(c, 5, -20.5 + p, 1.7); circ(c, 7.3, -20.6 + p, 1.5); circ(c, 9.2, -13.8 + p, 1.1);
      c.fillStyle = '#ffa000'; tri(c, 9.8, -17 + p, 13, -15.8 + p, 9.8, -14.8 + p);
      c.fillStyle = '#111'; circ(c, 7.2, -17 + p, 1.1);
    },
    fence(c) {
      c.fillStyle = '#e0a86a'; c.fillRect(-16, -15, 32, 3.5); c.fillRect(-16, -8, 32, 3.5);
      c.fillStyle = '#b97a42';
      for (const x of [-14, 10]) { c.fillRect(x, -18, 5, 18); tri(c, x, -18, x + 2.5, -21, x + 5, -18); }
    },
    dryGrass(c, t) {
      c.strokeStyle = '#c9a03a'; c.lineWidth = 1.6; c.lineCap = 'round';
      for (let i = -3; i <= 3; i++) { const sw = Math.sin(t * 2 + i) * 1.5; c.beginPath(); c.moveTo(i * 2, 0); c.quadraticCurveTo(i * 3, -8, i * 5 + sw, -14 + Math.abs(i) * 2); c.stroke(); }
      c.fillStyle = '#e8c35a'; ell(c, 1 + Math.sin(t * 2) * 1.5, -15, 1.6, 3.5);
    },
    termiteMound(c) {
      c.fillStyle = '#c8794a';
      c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-9, -16, -4, -22); c.lineTo(-2, -32); c.lineTo(1, -25); c.lineTo(4, -29); c.quadraticCurveTo(10, -12, 12, 0); c.fill();
      c.fillStyle = '#a95f36'; ell(c, 3, -14, 1.6, 3); ell(c, -4, -8, 1.4, 2.4);
    },
    bambooShoot(c) {
      c.fillStyle = '#6a9f3a'; tri(c, -7, 0, 0, -24, 7, 0);
      c.fillStyle = '#9ccc65'; tri(c, -5, -4, 0, -26, 2, -4); tri(c, -6, 0, -1, -10, 4, 0);
      c.fillStyle = '#c5e1a5'; tri(c, -1, -18, 0, -28, 1.5, -18);
    },
    stoneLantern(c) {
      c.fillStyle = '#8a8a8a'; rr(c, -9, -5, 18, 5, 1.5); c.fill(); c.fillRect(-3, -17, 6, 12);
      c.fillStyle = '#a7a7a7'; rr(c, -7, -25, 14, 9, 2); c.fill();
      c.save(); c.shadowColor = '#ffd54f'; c.shadowBlur = 10; c.fillStyle = '#ffe082'; c.fillRect(-4, -23, 8, 5); c.restore();
      c.fillStyle = '#7a7a7a'; tri(c, -12, -24, 0, -32, 12, -24); circ(c, 0, -33, 2);
    },
    blossomBush(c) {
      c.fillStyle = '#ff8fbf'; circ(c, -10, -8, 9); circ(c, 11, -8, 9);
      c.fillStyle = '#ffb3d1'; circ(c, 0, -13, 11);
      c.fillStyle = '#fff'; for (const [x, y] of [[-8, -10], [4, -16], [9, -7], [-2, -6], [-4, -17]]) circ(c, x, y, 1.6);
    },
    birdhouse(c) {
      c.fillStyle = '#8d6e63'; c.fillRect(-1.5, -27, 3, 27);
      c.fillStyle = '#4fc3f7'; rr(c, -7, -39, 14, 13, 2); c.fill();
      c.fillStyle = '#e53935'; tri(c, -10, -38, 0, -46, 10, -38);
      c.fillStyle = '#3e2723'; circ(c, 0, -33, 2.4);
      c.fillStyle = '#6d4c41'; c.fillRect(-1, -29, 2, 3);
    },
    anchor(c) {
      c.strokeStyle = '#546e7a'; c.lineWidth = 3.2; c.lineCap = 'round';
      line(c, 0, -5, 0, -27); line(c, -6, -23, 6, -23);
      c.beginPath(); c.arc(0, -13, 10, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      c.beginPath(); c.arc(0, -30.5, 3.2, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#546e7a'; tri(c, 7, -10, 12, -12, 10, -5); tri(c, -7, -10, -12, -12, -10, -5);
    },
    barrel(c) {
      c.fillStyle = '#a0662f'; rr(c, -9, -22, 18, 22, 5); c.fill();
      c.strokeStyle = '#7a4a22'; c.lineWidth = 1; line(c, -4, -21, -4, -1); line(c, 4, -21, 4, -1);
      c.fillStyle = '#4e342e'; c.fillRect(-9.5, -18, 19, 2.4); c.fillRect(-9.5, -6, 19, 2.4);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-6, -16, 2, 9);
    },
    treasure(c, t) {
      c.fillStyle = '#7a4a22'; c.beginPath(); c.moveTo(-12, -12); c.lineTo(-10, -23); c.lineTo(10, -23); c.lineTo(12, -12); c.fill();
      c.fillStyle = '#ffd23f'; for (let i = 0; i < 7; i++) circ(c, -9 + i * 3, -13 - (i % 2) * 2.5, 3);
      c.fillStyle = '#e53935'; circ(c, 1, -16, 2);
      c.fillStyle = '#8d5524'; rr(c, -12, -12, 24, 12, 2); c.fill();
      c.fillStyle = '#ffca28'; c.fillRect(-12, -12, 24, 2.2); c.fillRect(-2, -10, 4, 5);
      c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 5) * 0.5})`; star(c, 6, -19, 3, 4, 0.35);
    },
    reed(c, t) {
      c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const sw = Math.sin(t * 1.8 + i) * 2, top = -24 - (i === 0 ? 8 : 0);
        c.strokeStyle = '#5d7f3a'; c.lineWidth = 1.8; line(c, i * 5, 0, i * 5 + sw, top);
        c.fillStyle = '#6d4c2a'; rr(c, i * 5 + sw - 2, top, 4, 9, 2); c.fill();
      }
      c.strokeStyle = '#7cb342'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-2, 0); c.quadraticCurveTo(-10, -10, -14, -18); c.stroke();
      c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(10, -8, 13, -14); c.stroke();
    },
    lily(c) {
      c.fillStyle = '#3b8f3e'; ell(c, 0, -2, 13, 4);
      c.fillStyle = '#5cb85c'; ell(c, 0, -3, 12, 3.4);
      c.fillStyle = '#f48fb1';
      for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI; ell(c, 2 + Math.cos(a) * 4, -7 + Math.sin(a) * 3, 3.6, 1.8, a); }
      c.fillStyle = '#fff59d'; circ(c, 2, -8, 2);
    },
    swampLog(c) {
      c.fillStyle = '#6d4c2a'; rr(c, -16, -10, 32, 10, 5); c.fill();
      c.fillStyle = '#a1887f'; ell(c, 14, -5, 3, 5);
      c.strokeStyle = '#6d4c2a'; c.lineWidth = 1; c.beginPath(); c.ellipse(14, -5, 1.4, 2.6, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#7cb342'; ell(c, -7, -10, 6, 2.5); ell(c, 4, -10, 4, 2);
      c.fillStyle = '#ffcc80'; c.fillRect(-1, -15, 2, 5); c.fillStyle = '#ff7043'; c.beginPath(); c.ellipse(0, -15, 4, 3, 0, Math.PI, 0); c.fill();
    },
    redRock(c) {
      c.fillStyle = '#a8452a'; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-11, -12); c.lineTo(-3, -18); c.lineTo(7, -16); c.lineTo(13, -7); c.lineTo(14, 0); c.fill();
      c.fillStyle = '#d0653c'; c.beginPath(); c.moveTo(-11, -12); c.lineTo(-3, -18); c.lineTo(7, -16); c.lineTo(5, -12); c.lineTo(-6, -10); c.fill();
      c.strokeStyle = '#8f3a22'; c.lineWidth = 1.2; line(c, -12, -6, 13, -5);
    },
    dinoEgg(c, t) {
      c.strokeStyle = '#8d6e4a'; c.lineWidth = 1.6;
      for (let i = -2; i <= 2; i++) line(c, -12, -3 + i, 12, -2 - i);
      c.save(); c.rotate(Math.sin(t * 3) * 0.07);
      c.fillStyle = '#f1f8e9'; ell(c, 0, -11, 7.5, 10);
      c.fillStyle = '#81c784'; circ(c, -3, -14, 2); circ(c, 3, -9, 2.4); circ(c, 2, -17, 1.4); circ(c, -2, -6, 1.5);
      c.restore();
    },
    cycad(c, t) {
      c.fillStyle = '#8d6e4a'; rr(c, -3.5, -14, 7, 14, 2); c.fill();
      c.strokeStyle = '#6d5236'; c.lineWidth = 1; for (let y = -12; y < 0; y += 4) line(c, -3, y, 3, y + 2);
      c.fillStyle = '#43a047';
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.45 + Math.sin(t * 1.5) * 0.04;
        c.save(); c.translate(0, -14); c.rotate(a + Math.PI / 2); ell(c, 0, -10, 2.8, 11); c.restore();
      }
      c.fillStyle = '#ff8a65'; circ(c, 0, -15, 2.5);
    },
    bone(c) {
      c.fillStyle = '#f5ecd7'; c.fillRect(-9, -5, 18, 3.4);
      for (const x of [-9, 9]) { circ(c, x, -5.5, 2.6); circ(c, x, -2, 2.6); }
    },
    giantShroom(c) {
      c.fillStyle = '#f6ead7'; c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-2, -16, -3, -30); c.lineTo(3, -30); c.quadraticCurveTo(2, -16, 4, 0); c.fill();
      c.fillStyle = '#d7c6ad'; ell(c, 0, -30, 13, 3);
      c.fillStyle = '#4fc3f7'; c.beginPath(); c.ellipse(0, -30, 16, 13, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; circ(c, -7, -36, 2.6); circ(c, 3, -40, 2.2); circ(c, 9, -34, 1.8); circ(c, -1, -33, 1.4);
    },
    shroomCluster(c) {
      for (const [x, hh, r, col] of [[-8, 9, 6, '#ffd54f'], [8, 7, 5, '#ba68c8'], [0, 15, 8, '#ff5d73']]) {
        c.fillStyle = '#f6ead7'; c.fillRect(x - 1.8, -hh, 3.6, hh);
        c.fillStyle = col; c.beginPath(); c.ellipse(x, -hh, r, r * 0.8, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#fff'; circ(c, x - r * 0.35, -hh - r * 0.4, r * 0.18); circ(c, x + r * 0.35, -hh - r * 0.25, r * 0.14);
      }
    },
    igloo(c) {
      c.fillStyle = '#f4f9ff'; c.beginPath(); c.arc(0, 0, 20, Math.PI, 0); c.fill();
      c.save(); c.beginPath(); c.arc(0, 0, 20, Math.PI, 0); c.clip();
      c.strokeStyle = '#c5d8ec'; c.lineWidth = 1.2;
      for (const y of [-6, -12, -17]) line(c, -20, y, 20, y);
      for (let i = 0; i < 4; i++) for (let x = -18 + (i % 2) * 5; x < 20; x += 10) line(c, x, -i * 6 + 0, x, -i * 6 - 6);
      c.restore();
      c.fillStyle = '#dfeaf7'; rr(c, 4, -11, 16, 11, 5); c.fill();
      c.save(); c.shadowColor = '#ffb74d'; c.shadowBlur = 8; c.fillStyle = '#ffcf6b'; c.beginPath(); c.arc(13, 0, 5, Math.PI, 0); c.fill(); c.restore();
    },
    iceSpike(c) {
      c.fillStyle = '#7fc8ef'; tri(c, -10, 0, -5, -22, 0, 0); tri(c, -2, 0, 4, -30, 10, 0); tri(c, 7, 0, 11, -14, 14, 0);
      c.fillStyle = '#e3f7ff'; tri(c, -5, -22, -3, -2, 0, 0); tri(c, 4, -30, 6, -4, 10, 0);
    },
    iceCluster(c, t) {
      c.save(); c.shadowColor = '#9ff0ff'; c.shadowBlur = 6 + Math.sin(t * 2.5) * 3;
      c.fillStyle = '#9ff0ff'; c.beginPath(); c.moveTo(-4, 0); c.lineTo(-6, -15); c.lineTo(-1, -24); c.lineTo(3, -15); c.lineTo(2, 0); c.fill();
      c.fillStyle = '#c5b8ff'; c.beginPath(); c.moveTo(2, 0); c.lineTo(6, -11); c.lineTo(11, -15); c.lineTo(11, -4); c.lineTo(9, 0); c.fill();
      c.fillStyle = '#e8fbff'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-11, -9); c.lineTo(-8, 0); c.fill();
      c.restore();
    },
    snowPile(c) {
      c.fillStyle = '#d6e6f5'; circ(c, -7, -3, 7); circ(c, 7, -3, 6);
      c.fillStyle = '#ffffff'; circ(c, 0, -6, 8); circ(c, -8, -2, 5);
    },
    torch(c, t) {
      c.fillStyle = '#5d4037'; c.fillRect(-1.5, -28, 3, 28);
      c.fillStyle = '#8d6e63'; tri(c, -6, -30, 6, -30, 0, -23);
      const f = Math.sin(t * 13) * 1.5;
      c.save(); c.shadowColor = '#ff9800'; c.shadowBlur = 14;
      c.fillStyle = '#ff7a00'; c.beginPath(); c.moveTo(-5, -30); c.quadraticCurveTo(-4 + f, -40, f * 0.6, -45); c.quadraticCurveTo(5, -38, 5, -30); c.fill();
      c.fillStyle = '#ffe14d'; c.beginPath(); c.moveTo(-2.5, -30); c.quadraticCurveTo(f * 0.5, -38, 0.5, -40); c.quadraticCurveTo(2.5, -35, 2.5, -30); c.fill();
      c.restore();
    },
    shieldStand(c) {
      c.fillStyle = '#6d4c41'; c.fillRect(-1.5, -14, 3, 14);
      c.fillStyle = '#1e88e5'; c.strokeStyle = '#0d47a1'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-9, -32); c.lineTo(9, -32); c.lineTo(9, -22); c.quadraticCurveTo(9, -12, 0, -8); c.quadraticCurveTo(-9, -12, -9, -22); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffd23f'; c.fillRect(-1.5, -30, 3, 19); c.fillRect(-7, -25, 14, 3);
    },
    banner(c, t) {
      c.fillStyle = '#9e9e9e'; c.fillRect(-1, -42, 2, 42); c.fillRect(-1, -40, 17, 2);
      c.fillStyle = '#ffd23f'; circ(c, 0, -43, 2);
      const s = Math.sin(t * 2.5) * 1.5;
      c.fillStyle = '#c62828'; c.beginPath(); c.moveTo(1, -38); c.lineTo(15, -38); c.lineTo(15 + s, -18); c.lineTo(8 + s, -22); c.lineTo(1 + s, -18); c.closePath(); c.fill();
      c.fillStyle = '#ffd23f'; star(c, 8 + s * 0.5, -30, 3.5, 5, 0.45);
    },
  });

  // ======================= Вороги =======================
  addTo(Art.enemies, {
    hedgehog(c, t, col = '#8d6e63') {
      legs(c, t, [-8, -1, 5], '#4e342e', 4);
      c.fillStyle = Art.shade(col, -35);
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * 0.95 + i / 8 * Math.PI * 0.95, x = -3 + Math.cos(a) * 10, y = -9 + Math.sin(a) * 8;
        tri(c, x - Math.sin(a) * 3, y + Math.cos(a) * 3, -3 + Math.cos(a) * 17, -9 + Math.sin(a) * 15, x + Math.sin(a) * 3, y - Math.cos(a) * 3);
      }
      c.fillStyle = col; ell(c, -3, -9, 12, 9);
      c.fillStyle = Art.shade(col, 25); ell(c, -6, -13, 4, 2, -0.4);
      c.fillStyle = '#f3d9b5'; ell(c, 7, -8, 7.5, 6.5);
      c.fillStyle = '#222'; circ(c, 14.5, -8.5, 2.2);
      eye(c, 8.5, -11.5, 3.4);
      blush(c, 9, -5.5);
    },
    piglet(c, t, col = '#ffb3c1') {
      legs(c, t, [-8, -3, 3, 8], Art.shade(col, -40), 5);
      c.strokeStyle = Art.shade(col, -30); c.lineWidth = 1.6;
      c.beginPath(); c.arc(-14, -13, 2.6, 0, Math.PI * 1.6); c.stroke();
      c.fillStyle = col; ell(c, -1, -11, 12, 8.5); circ(c, 8, -15, 8);
      c.fillStyle = Art.shade(col, -25); tri(c, 2, -20, 3, -27, 8, -22); tri(c, 9, -22, 12, -28, 14, -20);
      c.fillStyle = Art.shade(col, -18); ell(c, 15, -13, 3.8, 3.2);
      c.fillStyle = Art.shade(col, -70); circ(c, 14, -13, 0.9); circ(c, 16.3, -13, 0.9);
      eye(c, 9, -17.5, 3);
      blush(c, 9.5, -11.5);
    },
    lionCub(c, t, col = '#f2b84b') {
      legs(c, t, [-8, -3, 3, 7], Art.shade(col, -30), 5);
      c.strokeStyle = col; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-11, -11); c.quadraticCurveTo(-17, -12, -18, -19 + Math.sin(t * 6) * 2); c.stroke();
      c.fillStyle = '#b5651d'; circ(c, -18, -20 + Math.sin(t * 6) * 2, 2.5);
      c.fillStyle = col; ell(c, -2, -10, 11, 7.5);
      c.fillStyle = '#c9772a';
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; circ(c, 8 + Math.cos(a) * 8, -17 + Math.sin(a) * 8, 3.5); }
      c.fillStyle = col; circ(c, 8.5, -16.5, 7.5);
      c.fillStyle = '#fde3b0'; ell(c, 11.5, -13, 4.2, 3.2);
      c.fillStyle = '#5d3a1a'; tri(c, 12, -15, 15, -15, 13.5, -13);
      eye(c, 6.5, -18.5, 2.7); eye(c, 12.5, -18.5, 2.7);
      blush(c, 5, -13.5, 1.4);
    },
    pandaCub(c, t, col = '#ffffff') {
      legs(c, t, [-6, 5], '#222', 5, 5);
      c.fillStyle = col; ell(c, 0, -11, 11, 8.5);
      c.fillStyle = '#222'; ell(c, -1, -10, 4, 6, 0.3 + Math.sin(t * 12) * 0.2); ell(c, 8, -10, 3.5, 5, -0.3);
      circ(c, 0, -26, 3.4); circ(c, 11, -26, 3.4);
      c.fillStyle = col; circ(c, 5.5, -20, 8);
      c.fillStyle = '#222'; ell(c, 2.5, -20.5, 3, 3.6, 0.5); ell(c, 9, -20.5, 3, 3.6, -0.5);
      c.fillStyle = '#fff'; circ(c, 3, -21, 1.9); circ(c, 9, -21, 1.9);
      c.fillStyle = '#111'; circ(c, 3.6, -21, 1.1); circ(c, 9.6, -21, 1.1);
      c.fillStyle = '#222'; ell(c, 6.5, -16.5, 1.6, 1.1);
      blush(c, 1.5, -16.5, 1.3); blush(c, 11, -16.5, 1.3);
    },
    snail(c, t, col = '#ffb74d') {
      const st = Math.sin(t * 6) * 1.5;
      c.fillStyle = '#c5e1a5'; rr(c, -13, -6, 28 + st, 6, 3); c.fill(); rr(c, 9 + st, -15, 7, 14, 3.5); c.fill();
      c.strokeStyle = '#9ccc65'; c.lineWidth = 1.5; line(c, 11 + st, -14, 9 + st, -22); line(c, 14 + st, -14, 16 + st, -22);
      eye(c, 9 + st, -23, 2.8, 0.5); eye(c, 16 + st, -23, 2.8, 0.5);
      c.fillStyle = col; circ(c, -2, -14, 10.5);
      c.strokeStyle = Art.shade(col, -50); c.lineWidth = 1.8;
      c.beginPath(); for (let a = 0; a < 13; a += 0.3) c.lineTo(-2 + Math.cos(a) * a * 0.65, -14 + Math.sin(a) * a * 0.65); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -6, -20, 3, 1.6, -0.5);
      blush(c, 14 + st, -9, 1.3);
    },
    pirateCrab(c, t, col = '#ff5a3c') {
      Art.enemies.crab(c, t, col);
      c.fillStyle = '#222'; ell(c, 0, -27.5, 10.5, 2.4); rr(c, -6.5, -34, 13, 7, 3.5); c.fill();
      c.fillStyle = '#fff'; circ(c, 0, -30.8, 1.6); c.fillRect(-2.4, -29.2, 4.8, 0.9);
      c.fillStyle = '#222'; circ(c, -5, -23, 3.3);
      c.strokeStyle = '#222'; c.lineWidth = 1; line(c, -8, -25, -2, -21);
    },
    frog(c, t, col = '#7bd44a') {
      const hp = Math.max(0, Math.sin(t * 5)) * 4;
      c.translate(0, -hp);
      c.fillStyle = Art.shade(col, -30); ell(c, -9, -4, 6.5, 4); ell(c, 9, -2, 4, 2.2);
      c.fillStyle = col; ell(c, 0, -9, 13, 8); circ(c, -2, -17, 5); circ(c, 8, -17, 5);
      c.fillStyle = '#e6f7b0'; ell(c, 3, -6, 8, 3.8);
      eye(c, -2, -17.5, 3.6); eye(c, 8, -17.5, 3.6);
      c.strokeStyle = Art.shade(col, -70); c.lineWidth = 1.3;
      c.beginPath(); c.arc(4, -11, 4.5, 0.25, Math.PI - 0.25); c.stroke();
      blush(c, -4, -10, 1.6); blush(c, 11, -10, 1.6);
    },
    armadillo(c, t, col = '#c9a27a') {
      legs(c, t, [-8, -2, 4], '#8d6e4a', 4);
      c.fillStyle = Art.shade(col, -25); tri(c, -12, -6, -19, -2, -12, -2);
      c.fillStyle = col; c.beginPath(); c.ellipse(-2, -4, 13, 13, 0, Math.PI, 0); c.fill();
      c.strokeStyle = Art.shade(col, -40); c.lineWidth = 1.4;
      for (const x of [-8, -3, 2, 7]) { c.beginPath(); c.moveTo(x, -4); c.quadraticCurveTo(x + 0.5, -14, x - (x + 2) * 0.15, -16.5 + Math.abs(x + 2) * 0.35); c.stroke(); }
      c.fillStyle = Art.shade(col, 30); ell(c, -6, -12, 3.5, 1.8, -0.5);
      c.fillStyle = '#e8c9a0'; ell(c, 13, -7, 6, 4.5, 0.2);
      tri(c, 9, -10, 9, -17, 12, -10);
      eye(c, 13, -9, 2.6);
      c.fillStyle = '#5d4037'; circ(c, 18.5, -6, 1.3);
      blush(c, 14, -5.5, 1.2);
    },
    dinoBaby(c, t, col = '#ff9f43') {
      legs(c, t, [-4, 3], Art.shade(col, -35), 6, 4.5);
      c.fillStyle = col; tri(c, -7, -14, -21, -4, -6, -6);
      c.fillStyle = Art.shade(col, 40);
      for (const [x, y] of [[-10, -15], [-4, -19], [3, -21]]) tri(c, x - 3, y + 2, x, y - 4, x + 3, y + 2);
      c.fillStyle = col; ell(c, -1, -11, 10, 8); circ(c, 9, -19, 7.5); ell(c, 13, -16, 5, 3.5);
      c.fillStyle = '#fff3c4'; ell(c, 2, -8, 5.5, 4);
      eye(c, 9.5, -21, 3.6);
      c.fillStyle = Art.shade(col, -60); circ(c, 16.5, -17, 0.9);
      c.strokeStyle = Art.shade(col, -70); c.lineWidth = 1.2; c.beginPath(); c.arc(13, -16, 3, 0.3, Math.PI * 0.8); c.stroke();
      blush(c, 7, -15.5, 1.5);
    },
    mushroomGuy(c, t, col = '#ff5d73') {
      const s = Math.sin(t * 12) * 1.5;
      c.fillStyle = '#6d4c41'; ell(c, -5 + s, -2.2, 4.2, 2.6); ell(c, 5 - s, -2.2, 4.2, 2.6);
      c.fillStyle = '#fbeedd'; rr(c, -8, -17, 16, 15, 6); c.fill();
      eye(c, -0.5, -10, 3); eye(c, 5.5, -10, 3);
      blush(c, -3, -6.5, 1.4); blush(c, 8, -6.5, 1.4);
      c.fillStyle = col; c.beginPath(); c.ellipse(0, -16, 15, 12, 0, Math.PI, 0); c.fill();
      c.fillStyle = Art.shade(col, -35); c.fillRect(-15, -17, 30, 2);
      c.fillStyle = '#fff'; circ(c, -7, -21, 2.6); circ(c, 3, -25, 2.2); circ(c, 9, -20, 1.8); circ(c, -1, -19, 1.3);
    },
    penguin(c, t, col = '#263850') {
      c.rotate(Math.sin(t * 9) * 0.08);
      c.fillStyle = '#ff9800'; ell(c, -4, -1.2, 4.5, 2); ell(c, 5, -1.2, 4.5, 2);
      c.fillStyle = col; ell(c, 0, -13, 10.5, 12.5);
      c.save(); c.translate(-9, -12); c.rotate(0.35 + Math.sin(t * 9) * 0.3); ell(c, 0, 0, 3, 7.5); c.restore();
      c.fillStyle = '#fff'; ell(c, 2.5, -11, 7, 10);
      eye(c, 2, -19, 3); eye(c, 7.5, -19, 3);
      c.fillStyle = '#ff9800'; tri(c, 8, -16.5, 14, -15.5, 8, -13.8);
      blush(c, 1, -14.5, 1.4); blush(c, 9.5, -12.5, 1.2);
    },
    yetiBaby(c, t, col = '#f4f8ff') {
      legs(c, t, [-5, 5], '#9fb7d6', 4, 6);
      const sh = Art.shade(col, -30);
      c.fillStyle = sh;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; circ(c, Math.cos(a) * 10, -13 + Math.sin(a) * 10, 4); }
      c.fillStyle = col; circ(c, 0, -13, 11.5);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.25; circ(c, Math.cos(a) * 9, -13 + Math.sin(a) * 9.5, 3.5); }
      c.fillStyle = '#d7c9a8'; tri(c, -6, -22, -8, -29, -2, -23); tri(c, 6, -23, 9, -29, 9, -21);
      c.fillStyle = '#a9c8f0'; ell(c, 4, -14, 6.5, 5.5);
      eye(c, 2, -15.5, 2.6); eye(c, 7, -15.5, 2.6);
      c.fillStyle = '#5a7fa8'; ell(c, 5, -11, 1.8, 1);
      blush(c, 0, -12, 1.2); blush(c, 9.5, -12, 1.2);
    },
    knight(c, t, col = '#b0bec5') {
      legs(c, t, [-4, 4], Art.shade(col, -40), 6, 4.5);
      c.fillStyle = '#2e7dd1'; rr(c, -9, -19, 18, 14, 4); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-9, -9, 18, 2);
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(-3, -33); c.quadraticCurveTo(-12, -38, -13, -28); c.quadraticCurveTo(-8, -32, -3, -30); c.fill();
      c.fillStyle = col; rr(c, -9, -32, 18, 15, 7); c.fill();
      c.fillStyle = Art.shade(col, 35); c.fillRect(-1, -32, 2, 4);
      c.fillStyle = '#ffdcb0'; rr(c, -1, -28, 10, 8, 3.5); c.fill();
      eye(c, 2, -24, 2.3, 0.4); eye(c, 6.5, -24, 2.3, 0.4);
      c.fillStyle = '#e53935'; c.strokeStyle = '#8e1b1b'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(8, -19); c.lineTo(16, -19); c.lineTo(16, -13); c.quadraticCurveTo(16, -8, 12, -6); c.quadraticCurveTo(8, -8, 8, -13); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffd23f'; c.fillRect(11.2, -18, 1.6, 10); c.fillRect(9, -15, 6, 1.6);
    },

    // ---- літаючі (центр у 0,0) ----
    owl(c, t) { owlDraw(c, t, '#8d6e63', '#ecd9bd', '#6d4c41', '#ffb300'); },
    snowyOwl(c, t) {
      owlDraw(c, t, '#ffffff', '#eef3f8', '#d5dee8', '#ffca28');
      c.fillStyle = '#90a4ae'; for (const [x, y] of [[-5, 5], [3, 7], [-1, 9], [5, 3]]) ell(c, x, y, 1.2, 0.7);
    },
    butterfly(c, t) {
      const fl = 0.3 + 0.7 * Math.abs(Math.sin(t * 11));
      c.save(); c.scale(fl, 1);
      c.fillStyle = '#ff6fb0'; ell(c, -8, -5, 8, 7, -0.3); ell(c, 8, -5, 8, 7, 0.3);
      c.fillStyle = '#ffb74d'; ell(c, -6, 5, 5.5, 5, 0.4); ell(c, 6, 5, 5.5, 5, -0.4);
      c.fillStyle = '#fff'; circ(c, -9, -6, 2.2); circ(c, 9, -6, 2.2);
      c.restore();
      c.fillStyle = '#4a2b5c'; ell(c, 0, 1, 2.2, 8);
      c.strokeStyle = '#4a2b5c'; c.lineWidth = 1; line(c, 0, -7, -3, -13); line(c, 0, -7, 3, -13);
      circ(c, -3, -13, 1.2); circ(c, 3, -13, 1.2);
      c.fillStyle = '#fff'; circ(c, 0.8, -5, 1.2);
    },
    parrot(c, t) {
      const fl = Math.sin(t * 16);
      c.fillStyle = '#1e88e5'; tri(c, -7, 2, -20, 9, -18, 3);
      c.fillStyle = '#43a047'; tri(c, -7, 0, -19, 2, -17, -3);
      c.fillStyle = '#e53935'; ell(c, 0, 1, 9, 8); circ(c, 5, -4, 6);
      c.fillStyle = '#1e88e5';
      c.beginPath(); c.moveTo(-3, -1); c.quadraticCurveTo(-8, -14 * fl, -15, -6 * fl - 2); c.quadraticCurveTo(-8, 3, -3, 4); c.fill();
      c.fillStyle = '#ffd54f'; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-7, -8 * fl, -10, -4 * fl); c.quadraticCurveTo(-6, 2, -3, 2); c.fill();
      c.fillStyle = '#fff'; ell(c, 6, -5, 3.4, 3.4);
      c.fillStyle = '#111'; circ(c, 6.8, -5, 1.7);
      c.fillStyle = '#ffe082'; c.beginPath(); c.moveTo(10, -6); c.quadraticCurveTo(16, -6, 14, 1); c.lineTo(10, -1); c.fill();
      c.fillStyle = '#333'; tri(c, 12, -1, 14, 1, 11, 0);
    },
    dragonfly(c, t) {
      const fl = Math.sin(t * 34) * 3;
      c.fillStyle = 'rgba(200,245,255,0.7)';
      ell(c, -3, -6 - fl, 9, 3, -0.3); ell(c, 2, -6 + fl, 8, 2.6, 0.25);
      c.fillStyle = '#00acc1'; rr(c, -20, -1.5, 16, 3.4, 1.7); c.fill();
      c.fillStyle = '#ffeb3b'; for (let x = -18; x < -6; x += 4) c.fillRect(x, -1.5, 1.4, 3.4);
      c.fillStyle = '#26c6da'; ell(c, -1, 0, 5, 3.5);
      c.fillStyle = '#26c6da'; circ(c, 6, -0.5, 4);
      eye(c, 7, -2, 2.7, 0.5);
      c.strokeStyle = '#00838f'; c.lineWidth = 1; c.beginPath(); c.arc(7.5, 1, 1.8, 0.2, Math.PI - 0.2); c.stroke();
    },
    pterodactyl(c, t) {
      const fl = Math.sin(t * 10);
      c.fillStyle = '#4db6ac';
      c.beginPath(); c.moveTo(-4, -1); c.lineTo(-20, -6 - fl * 9); c.lineTo(-12, 3); c.lineTo(-3, 3); c.fill();
      c.fillStyle = '#80cbc4';
      c.beginPath(); c.moveTo(3, -1); c.lineTo(12, -10 - fl * 9); c.lineTo(14, 1); c.lineTo(3, 3); c.fill();
      c.fillStyle = '#26a69a'; ell(c, 0, 1, 8, 5);
      c.fillStyle = '#ff8a65'; tri(c, 4, -5, -4, -12, 2, -2);
      c.fillStyle = '#26a69a'; ell(c, 8, -3, 5.5, 4.5);
      c.fillStyle = '#ffcc80'; tri(c, 11, -4, 21, -1, 11, 0);
      eye(c, 8, -4, 2.6, 0.5);
      c.fillStyle = '#b2dfdb'; ell(c, 1, 3, 4.5, 2);
    },
    shroomFly(c, t) {
      const fl = Math.abs(Math.sin(t * 20));
      c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, -10, 2, 6, 2 + fl * 3, -0.4); ell(c, 10, 2, 6, 2 + fl * 3, 0.4);
      c.fillStyle = '#fbeedd'; rr(c, -6, -1, 12, 10, 4.5); c.fill();
      eye(c, -2, 3, 2.4, 0.5); eye(c, 3.5, 3, 2.4, 0.5);
      c.fillStyle = '#ba68c8'; c.beginPath(); c.ellipse(0, 0, 12, 10, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; circ(c, -5, -5, 2.2); circ(c, 3, -7, 1.8); circ(c, 7, -3, 1.5);
    },
    ghost(c, t) {
      const w = Math.sin(t * 6);
      c.fillStyle = 'rgba(248,250,255,0.96)';
      c.beginPath(); c.arc(0, -2, 10.5, Math.PI, 0); c.lineTo(10.5, 9);
      for (let i = 0; i <= 4; i++) c.quadraticCurveTo(10.5 - i * 5.25 + 2.6, 13 + (i % 2 ? w : -w) * 2, 10.5 - i * 5.25, 9);
      c.closePath(); c.fill();
      ell(c, 11, 2 + w, 3.5, 2.2, -0.5); ell(c, -11, 2 - w, 3.5, 2.2, 0.5);
      c.fillStyle = '#263238'; ell(c, 0.5, -3, 2.6, 3.5); ell(c, 6.5, -3, 2.6, 3.5);
      c.fillStyle = '#fff'; circ(c, 1.3, -4.5, 1); circ(c, 7.3, -4.5, 1);
      c.fillStyle = '#263238'; ell(c, 4, 3, 1.6, 1.8);
      blush(c, -2.5, 1, 1.6); blush(c, 9.5, 1, 1.4);
    },
  });

  function owlDraw(c, t, body, belly, wing, beak) {
    const fl = Math.sin(t * 14);
    c.fillStyle = wing;
    ell(c, -10, -1 - fl * 3, 4.5, 9, -0.5 - fl * 0.35); ell(c, 10, -1 - fl * 3, 4.5, 9, 0.5 + fl * 0.35);
    c.fillStyle = body; ell(c, 0, 0, 10, 11);
    tri(c, -8, -7, -7, -14, -3, -9); tri(c, 8, -7, 7, -14, 3, -9);
    c.fillStyle = belly; ell(c, 0.5, 4, 6, 6);
    eye(c, -3.5, -3, 4, 0.8); eye(c, 4.5, -3, 4, 0.8);
    c.fillStyle = beak; tri(c, -0.5, 0, 2.5, 0, 1, 3.5);
  }

  // ======================= Фонові помічники =======================
  function mapleTree(c, x, y, s, col, r) {
    c.strokeStyle = '#6b4428'; c.lineCap = 'round';
    c.lineWidth = s * 0.09; line(c, x, y, x, y - s * 0.55);
    c.lineWidth = s * 0.04; line(c, x, y - s * 0.4, x - s * 0.2, y - s * 0.62); line(c, x, y - s * 0.45, x + s * 0.18, y - s * 0.66);
    c.fillStyle = Art.shade(col, -28);
    circ(c, x - s * 0.22, y - s * 0.6, s * 0.2); circ(c, x + s * 0.22, y - s * 0.6, s * 0.2);
    c.fillStyle = col;
    for (let i = 0; i < 6; i++) circ(c, x + (r() - 0.5) * s * 0.5, y - s * 0.7 - r() * s * 0.25, s * (0.14 + r() * 0.08));
    c.fillStyle = Art.shade(col, 30); circ(c, x - s * 0.1, y - s * 0.85, s * 0.08); circ(c, x + s * 0.12, y - s * 0.74, s * 0.06);
  }
  function acacia(c, x, y, s, trunk, leaf) {
    c.strokeStyle = trunk; c.lineCap = 'round';
    c.lineWidth = s * 0.07; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - s * 0.05, y - s * 0.4, x + s * 0.05, y - s * 0.6); c.stroke();
    c.lineWidth = s * 0.04; line(c, x + s * 0.03, y - s * 0.45, x - s * 0.3, y - s * 0.72); line(c, x + s * 0.05, y - s * 0.55, x + s * 0.35, y - s * 0.74);
    c.fillStyle = leaf;
    ell(c, x, y - s * 0.78, s * 0.55, s * 0.1); ell(c, x - s * 0.25, y - s * 0.82, s * 0.3, s * 0.1); ell(c, x + s * 0.22, y - s * 0.84, s * 0.3, s * 0.09);
  }
  function giraffe(c, x, y, s, col, spot) {
    c.fillStyle = col;
    for (const lx of [-0.32, -0.18, 0.2, 0.32]) c.fillRect(x + lx * s, y - s * 0.95, s * 0.06, s * 0.95);
    ell(c, x, y - s * 1.0, s * 0.42, s * 0.2);
    c.beginPath(); c.moveTo(x + s * 0.2, y - s * 1.1); c.lineTo(x + s * 0.48, y - s * 2.05); c.lineTo(x + s * 0.62, y - s * 2.0); c.lineTo(x + s * 0.42, y - s * 0.95); c.fill();
    ell(c, x + s * 0.66, y - s * 2.05, s * 0.16, s * 0.08, 0.3);
    c.fillRect(x + s * 0.52, y - s * 2.22, s * 0.03, s * 0.12); c.fillRect(x + s * 0.6, y - s * 2.22, s * 0.03, s * 0.12);
    c.strokeStyle = col; c.lineWidth = s * 0.03; line(c, x - s * 0.4, y - s * 1.0, x - s * 0.55, y - s * 0.7);
    if (spot) { c.fillStyle = spot; for (const [a, b] of [[-0.2, 1.02], [0.05, 0.96], [0.25, 1.05], [0.4, 1.4], [0.5, 1.75]]) circ(c, x + a * s, y - b * s, s * 0.05); }
  }
  function bambooStalk(c, x, y0, y1, wd, col, r) {
    c.fillStyle = col; c.fillRect(x - wd / 2, y0, wd, y1 - y0);
    c.fillStyle = Art.shade(col, 30); c.fillRect(x - wd / 2 + wd * 0.18, y0, wd * 0.18, y1 - y0);
    c.fillStyle = Art.shade(col, -30);
    const step = 34 + wd;
    for (let y = y1 - step * (0.5 + r() * 0.5); y > y0; y -= step) {
      c.fillRect(x - wd / 2 - 1, y, wd + 2, 3);
      if (r() < 0.45) {
        c.fillStyle = Art.shade(col, 10);
        const sd = r() < 0.5 ? -1 : 1;
        for (let i = 0; i < 3; i++) ell(c, x + sd * (wd * 0.5 + 9), y - 2 + i * 5, 10, 2.4, sd * (0.35 + i * 0.25));
        c.fillStyle = Art.shade(col, -30);
      }
    }
  }
  function blossomTree(c, x, y, s, r) {
    c.strokeStyle = '#7a5040'; c.lineCap = 'round';
    c.lineWidth = s * 0.08; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * 0.06, y - s * 0.3, x - s * 0.02, y - s * 0.55); c.stroke();
    c.lineWidth = s * 0.035; line(c, x, y - s * 0.4, x - s * 0.28, y - s * 0.6); line(c, x, y - s * 0.45, x + s * 0.26, y - s * 0.66);
    const cols = ['#ffb3d1', '#ff94c0', '#ffd1e3', '#ffffff', '#ffc4dc'];
    for (let i = 0; i < 16; i++) {
      c.fillStyle = cols[Math.floor(r() * cols.length)];
      circ(c, x + (r() - 0.5) * s * 0.75, y - s * 0.62 - (r() - 0.3) * s * 0.3, s * (0.07 + r() * 0.08));
    }
  }
  function ship(c, x, y, s) {
    c.fillStyle = '#6d4426';
    c.beginPath(); c.moveTo(x - 62 * s, y - 24 * s); c.lineTo(x + 58 * s, y - 20 * s); c.lineTo(x + 44 * s, y); c.lineTo(x - 50 * s, y); c.closePath(); c.fill();
    c.fillRect(x - 62 * s, y - 36 * s, 26 * s, 14 * s);
    c.fillStyle = '#ffca28'; c.fillRect(x - 56 * s, y - 15 * s, 104 * s, 3 * s);
    c.fillStyle = '#3e2715'; for (let i = 0; i < 5; i++) circ(c, x - 34 * s + i * 18 * s, y - 8 * s, 2.6 * s);
    c.fillStyle = '#4e2f18'; c.fillRect(x - 12 * s, y - 120 * s, 4 * s, 100 * s); c.fillRect(x + 26 * s, y - 100 * s, 3.5 * s, 80 * s);
    c.fillStyle = '#f5ead0';
    for (const [mx, top, hw, hh] of [[-10, -112, 30, 40], [-10, -66, 36, 38], [28, -92, 24, 34], [28, -54, 28, 28]]) {
      c.beginPath(); c.moveTo(x + (mx - hw) * s, y + top * s); c.lineTo(x + (mx + hw) * s, y + top * s);
      c.quadraticCurveTo(x + (mx + hw + 8) * s, y + (top + hh / 2) * s, x + (mx + hw) * s, y + (top + hh) * s);
      c.lineTo(x + (mx - hw) * s, y + (top + hh) * s); c.quadraticCurveTo(x + (mx - hw + 8) * s, y + (top + hh / 2) * s, x + (mx - hw) * s, y + top * s); c.fill();
    }
    c.fillStyle = '#222'; c.fillRect(x - 8 * s, y - 132 * s, 22 * s, 13 * s);
    c.fillStyle = '#fff'; circ(c, x + 3 * s, y - 127 * s, 3.4 * s); c.fillRect(x + 0.5 * s, y - 125 * s, 5 * s, 3 * s);
    c.fillStyle = '#222'; circ(c, x + 1.8 * s, y - 127.5 * s, 0.9 * s); circ(c, x + 4.2 * s, y - 127.5 * s, 0.9 * s);
  }
  function willow(c, x, y, s, col) {
    c.fillStyle = Art.shade(col, -15); c.fillRect(x - s * 0.05, y - s * 0.6, s * 0.1, s * 0.6);
    c.fillStyle = col; ell(c, x, y - s * 0.7, s * 0.42, s * 0.25);
    c.strokeStyle = col; c.lineWidth = Math.max(2, s * 0.03);
    for (let i = -4; i <= 4; i++) { const sx = x + i * s * 0.09; c.beginPath(); c.moveTo(sx, y - s * 0.6); c.quadraticCurveTo(sx + i * 2, y - s * 0.35, sx + i * s * 0.03, y - s * (0.1 + Math.abs(i) * 0.04)); c.stroke(); }
  }
  function mesa(c, x, base, wd, hh, col, stripe) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - wd, base); c.lineTo(x - wd * 0.72, base - hh * 0.85); c.lineTo(x - wd * 0.62, base - hh); c.lineTo(x + wd * 0.6, base - hh); c.lineTo(x + wd * 0.7, base - hh * 0.8); c.lineTo(x + wd, base); c.fill();
    c.fillStyle = stripe;
    for (const f of [0.35, 0.62]) c.fillRect(x - wd * (0.95 - f * 0.3), base - hh * f, wd * (1.9 - f * 0.6), hh * 0.06);
    c.fillStyle = Art.shade(col, -22); c.fillRect(x - wd * 0.62, base - hh, wd * 1.22, hh * 0.05);
  }
  function rockArch(c, x, base, wd, hh, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - wd / 2, base); c.lineTo(x - wd / 2 + 4, base - hh + wd * 0.18);
    c.quadraticCurveTo(x, base - hh - wd * 0.12, x + wd / 2 - 4, base - hh + wd * 0.18); c.lineTo(x + wd / 2, base); c.closePath();
    c.moveTo(x + wd * 0.3, base); c.lineTo(x + wd * 0.3, base - hh * 0.5);
    c.ellipse(x, base - hh * 0.5, wd * 0.3, hh * 0.28, 0, 0, Math.PI, true); c.lineTo(x - wd * 0.3, base); c.closePath();
    c.fill('evenodd');
    c.fillStyle = Art.shade(col, 25); c.fillRect(x - wd / 2 + 4, base - hh * 0.72, wd * 0.12, hh * 0.04); c.fillRect(x + wd * 0.32, base - hh * 0.45, wd * 0.14, hh * 0.04);
  }
  function hoodoo(c, x, base, hh, col) {
    c.fillStyle = col;
    for (let i = 0; i < 4; i++) ell(c, x + (i % 2 ? 3 : -2), base - hh * (0.12 + i * 0.24), 12 - i, hh * 0.16);
    c.fillStyle = Art.shade(col, -25); ell(c, x, base - hh * 0.98, 15, 6);
  }
  function longNeck(c, x, y, s, col, eyeCol) {
    c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
    for (const lx of [-0.35, -0.18, 0.2, 0.36]) rr(c, x + lx * s - s * 0.06, y - s * 0.55, s * 0.12, s * 0.55, s * 0.04), c.fill();
    ell(c, x, y - s * 0.6, s * 0.58, s * 0.3);
    c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.75); c.quadraticCurveTo(x - s * 1.0, y - s * 0.6, x - s * 1.35, y - s * 0.3); c.quadraticCurveTo(x - s * 0.9, y - s * 0.4, x - s * 0.45, y - s * 0.45); c.fill();
    c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(x + s * 0.35, y - s * 0.7); c.quadraticCurveTo(x + s * 0.75, y - s * 1.0, x + s * 0.85, y - s * 1.65); c.stroke();
    ell(c, x + s * 0.95, y - s * 1.72, s * 0.17, s * 0.1, 0.15);
    if (eyeCol) { c.fillStyle = eyeCol; circ(c, x + s * 0.97, y - s * 1.76, s * 0.035); }
  }
  function bigShroom(c, x, y, s, cap, r) {
    c.fillStyle = '#f6ead7';
    c.beginPath(); c.moveTo(x - s * 0.1, y); c.quadraticCurveTo(x - s * 0.04, y - s * 0.5, x - s * 0.07, y - s * 0.9); c.lineTo(x + s * 0.07, y - s * 0.9); c.quadraticCurveTo(x + s * 0.04, y - s * 0.5, x + s * 0.1, y); c.fill();
    c.fillStyle = Art.shade(cap, -45); ell(c, x, y - s * 0.9, s * 0.42, s * 0.07);
    c.fillStyle = cap; c.beginPath(); c.ellipse(x, y - s * 0.9, s * 0.48, s * 0.36, 0, Math.PI, 0); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) circ(c, x + (r() - 0.5) * s * 0.7, y - s * (0.97 + r() * 0.22), s * (0.03 + r() * 0.035));
  }
  function tower(c, x, base, wd, hh, wall, roof, flag, lit) {
    c.fillStyle = wall; c.fillRect(x - wd / 2, base - hh, wd, hh);
    c.fillStyle = Art.shade(wall, -18); c.fillRect(x + wd / 2 - 5, base - hh, 5, hh);
    c.fillStyle = Art.shade(wall, -10); c.fillRect(x - wd / 2 - 3, base - hh, wd + 6, 6);
    const rt = base - hh - wd * 1.1;
    c.fillStyle = roof; tri(c, x - wd / 2 - 6, base - hh, x, rt, x + wd / 2 + 6, base - hh);
    c.fillStyle = Art.shade(roof, -25); tri(c, x, rt, x + wd / 2 + 6, base - hh, x + wd * 0.15, base - hh);
    c.fillStyle = '#5d4037'; c.fillRect(x - 1, rt - 18, 2, 18);
    c.fillStyle = flag; c.beginPath(); c.moveTo(x + 1, rt - 18); c.quadraticCurveTo(x + 10, rt - 19, x + 18, rt - 14); c.quadraticCurveTo(x + 10, rt - 11, x + 1, rt - 9); c.fill();
    if (lit) for (let wy = base - hh + 22; wy < base - 30; wy += 40) {
      c.fillStyle = lit; rr(c, x - 5, wy, 10, 16, 5); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x - 0.75, wy + 2, 1.5, 14);
    }
  }
  function glowDot(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; circ(c, x, y, rad);
  }

  // ======================= Світи =======================
  THEMES.push(
    // 16
    {
      name: 'Осінній парк', icon: '🍂',
      sky: ['#86c3ec', '#ffe4c0'],
      ground: { style: 'grass', body: '#8a5a32', dark: '#6f4524', top: '#ec9a32', topDark: '#c8681e', topLight: 'rgba(255,235,160,0.45)' },
      block: { fill: '#c57a3e', light: '#eaa968', dark: '#8a4f22', bricks: true },
      oneway: { fill: '#a8703f', dark: '#6f4524' },
      enemy: 'hedgehog', enemyColor: '#9a7458', flyer: 'owl',
      decor: ['leafPile', 'pumpkin', 'autumnBush', 'bench', 'mushroom'],
      particles: 'leaves', gravity: 1,
      music: { bpm: 100, root: 62, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.3, seed: 16 },
      skyDraw(c, w, h) { sun(c, w * 0.78, 72, 28, '#fff3c4', 'rgba(255,220,150,0.55)'); },
      far(c, w, h, r) {
        clouds(c, w, 5, r, 40, 130, 'rgba(255,255,255,0.9)');
        const wv = [[2, 18, 0.3], [3, 9, 1.5]];
        band(c, w, h, 300, wv, '#efd2a2');
        const cols = ['#eab07a', '#e59a66', '#f0c77a', '#dd8a60'];
        onBand(c, w, 300, wv, 22, r, 40, (x, y, k) => {
          c.fillStyle = '#b58a64'; c.fillRect(x - 2, y - 14, 4, 18);
          c.fillStyle = pick(cols, k); circ(c, x, y - 22, 13 + k * 10); circ(c, x - 9, y - 14, 9);
        });
      },
      mid(c, w, h, r) {
        const wv = [[3, 12, 1], [5, 6, 0]];
        band(c, w, h, 342, wv, '#c9a65a');
        const cols = ['#e8662c', '#f29a2e', '#d84a2a', '#f5b83a'];
        onBand(c, w, 342, wv, 8, r, 70, (x, y, k) => mapleTree(c, x, y + 6, 100 + k * 50, pick(cols, k), R(k)));
        onBand(c, w, 342, wv, 4, r, 20, (x, y) => {
          c.fillStyle = '#2f4f3f'; c.fillRect(x - 2, y - 62, 4, 66); c.fillRect(x - 7, y - 66, 14, 4);
          c.fillStyle = '#fff3c4'; ell(c, x, y - 70, 5, 6);
        });
        c.fillStyle = '#d98a3a';
        for (const x of spread(w, 40, r)) wrap(w, x, 10, X => ell(c, X, bandY(w, 342, wv, X) + 6, 4, 1.8, X));
      },
    },
    // 17
    {
      name: 'Весела ферма', icon: '🚜',
      sky: ['#74c4ff', '#e8f8ff'],
      ground: { style: 'grass', body: '#a0703f', dark: '#845a30', top: '#7ed957', topDark: '#4fae3a' },
      block: { fill: '#e8c35a', light: '#fbe39a', dark: '#b28a2e' },
      oneway: { fill: '#d39459', dark: '#9a6634' },
      enemy: 'piglet', enemyColor: '#ffa8bb', flyer: 'butterfly',
      decor: ['hayBale', 'sunflower', 'chicken', 'fence', 'flower2'],
      particles: 'none', gravity: 1,
      music: { bpm: 126, root: 64, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 17 },
      skyDraw(c, w, h) { sun(c, w * 0.85, 70, 28, '#fff59d', 'rgba(255,245,157,0.6)'); },
      far(c, w, h, r) {
        clouds(c, w, 6, r, 35, 130, 'rgba(255,255,255,0.95)');
        const wv = [[2, 20, 0.8], [3, 8, 2]];
        band(c, w, h, 300, wv, '#bfe58f');
        c.strokeStyle = 'rgba(120,170,70,0.35)'; c.lineWidth = 3;
        for (let i = 1; i < 6; i++) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 300 + i * 10, wv, x)); c.stroke(); }
        wrap(w, w * 0.2, 60, X => {
          const y = bandY(w, 300, wv, X);
          c.fillStyle = '#f4f1ea'; c.beginPath(); c.moveTo(X - 9, y + 4); c.lineTo(X - 5, y - 58); c.lineTo(X + 5, y - 58); c.lineTo(X + 9, y + 4); c.fill();
          c.fillStyle = '#c62828'; tri(c, X - 7, y - 58, X, y - 68, X + 7, y - 58);
          c.strokeStyle = '#8d6e63'; c.lineWidth = 3;
          for (let i = 0; i < 4; i++) { const a = 0.4 + i * Math.PI / 2; line(c, X, y - 60, X + Math.cos(a) * 30, y - 60 + Math.sin(a) * 30); }
        });
        for (const fx of [0.5, 0.82]) wrap(w, w * fx, 30, X => {
          const y = bandY(w, 300, wv, X);
          c.fillStyle = '#e57373'; c.fillRect(X - 14, y - 16, 28, 20);
          c.fillStyle = '#a84444'; tri(c, X - 17, y - 15, X, y - 27, X + 17, y - 15);
        });
      },
      mid(c, w, h, r) {
        const wv = [[2, 10, 0], [4, 5, 1]];
        band(c, w, h, 346, wv, '#8ccf5f');
        for (const [fx, bw] of [[0.28, 120], [0.76, 100]]) wrap(w, w * fx, bw, X => {
          const y = bandY(w, 346, wv, X) + 8, bh = bw * 0.62;
          c.fillStyle = '#cfd8dc'; c.fillRect(X + bw * 0.55, y - bh * 1.35, bw * 0.28, bh * 1.35);
          c.fillStyle = '#90a4ae'; c.beginPath(); c.arc(X + bw * 0.69, y - bh * 1.35, bw * 0.14, Math.PI, 0); c.fill();
          c.fillStyle = '#d9443a'; c.fillRect(X - bw / 2, y - bh, bw, bh);
          c.fillStyle = '#8e2b25'; tri(c, X - bw / 2 - 8, y - bh, X, y - bh - bw * 0.45, X + bw / 2 + 8, y - bh);
          c.fillStyle = '#fff'; c.fillRect(X - bw * 0.2, y - bh * 0.62, bw * 0.4, bh * 0.62);
          c.fillStyle = '#b5332b'; c.fillRect(X - bw * 0.17, y - bh * 0.58, bw * 0.34, bh * 0.58);
          c.strokeStyle = '#fff'; c.lineWidth = 3;
          line(c, X - bw * 0.17, y - bh * 0.58, X + bw * 0.17, y); line(c, X + bw * 0.17, y - bh * 0.58, X - bw * 0.17, y);
          c.fillStyle = '#fff'; c.fillRect(X - 8, y - bh - bw * 0.25, 16, 12);
          c.fillStyle = '#ffd54f'; c.fillRect(X - 6, y - bh - bw * 0.25 + 2, 12, 8);
        });
        for (const x of spread(w, 5, r)) {
          const k = r();
          wrap(w, x, 30, X => { const y = bandY(w, 346, wv, X) + 6; c.fillStyle = '#e8b84a'; c.beginPath(); c.arc(X, y, 16 + k * 8, Math.PI, 0); c.fill(); c.fillStyle = '#f6d77a'; c.beginPath(); c.arc(X - 3, y - 4, 9 + k * 4, Math.PI, 0); c.fill(); });
        }
        const n = 64, fy = x => bandY(w, 346, wv, x) + 2;
        c.fillStyle = '#f2e4cf';
        for (let i = 0; i < n; i++) { const x = i * w / n; c.fillRect(x - 2, fy(x) - 22, 4, 24); }
        c.strokeStyle = '#f2e4cf'; c.lineWidth = 3;
        for (const dy of [-17, -8]) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, fy(x) + dy); c.stroke(); }
      },
    },
    // 18
    {
      name: 'Савана', icon: '🦒',
      sky: ['#ff8f52', '#ffe7a8'],
      ground: { style: 'grass', body: '#b8703f', dark: '#9a5a32', top: '#e0bd4c', topDark: '#b8923a' },
      block: { fill: '#cf8c4c', light: '#f0b67a', dark: '#94582a', bricks: true },
      oneway: { fill: '#a9744a', dark: '#70482a' },
      enemy: 'lionCub', enemyColor: '#f2b84b', flyer: 'bee',
      decor: ['dryGrass', 'termiteMound', 'rock', 'dryGrass'],
      particles: 'dust', gravity: 1,
      music: { bpm: 104, root: 60, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.3, seed: 18 },
      skyDraw(c, w, h) {
        sun(c, w * 0.62, 215, 48, '#fff1b8', 'rgba(255,200,120,0.6)');
        c.fillStyle = 'rgba(255,170,140,0.55)';
        ell(c, w * 0.2, 90, 90, 7); ell(c, w * 0.28, 104, 60, 5); ell(c, w * 0.75, 70, 110, 6); ell(c, w * 0.9, 130, 70, 5);
      },
      far(c, w, h, r) {
        const wv = [[2, 5, 0], [5, 3, 1]];
        band(c, w, h, 305, wv, '#e8a35e');
        onBand(c, w, 305, wv, 6, r, 70, (x, y, k) => acacia(c, x, y + 4, 70 + k * 30, '#b0643c', '#b0643c'));
        for (const [fx, s] of [[0.12, 30], [0.17, 24], [0.45, 34], [0.86, 28]]) wrap(w, w * fx, 30, X => giraffe(c, X, bandY(w, 305, wv, X) + 3, s, '#b0643c'));
      },
      mid(c, w, h, r) {
        const wv = [[2, 10, 0], [4, 6, 1]];
        band(c, w, h, 348, wv, '#d9a441');
        onBand(c, w, 348, wv, 4, r, 110, (x, y, k) => acacia(c, x, y + 6, 150 + k * 60, '#5d3d22', '#748f35'));
        wrap(w, w * 0.62, 40, X => giraffe(c, X, bandY(w, 348, wv, X) + 6, 52, '#e0a447', '#9a5a2a'));
        c.strokeStyle = '#b8862e'; c.lineWidth = 2; c.lineCap = 'round';
        for (const x of spread(w, 60, r)) wrap(w, x, 10, X => { const y = bandY(w, 348, wv, X) + 4; line(c, X, y, X - 3, y - 9); line(c, X, y, X + 2, y - 11); line(c, X, y, X + 5, y - 7); });
      },
    },
    // 19
    {
      name: 'Бамбуковий гай', icon: '🎋',
      sky: ['#c4e6cf', '#f4fbef'],
      ground: { style: 'grass', body: '#7a5a3a', dark: '#5f452c', top: '#79c25a', topDark: '#4c9a3a' },
      block: { fill: '#9ccf62', light: '#c8eb94', dark: '#5e9a34' },
      oneway: { fill: '#b5d977', dark: '#6b9a3a' },
      enemy: 'pandaCub', enemyColor: '#ffffff', flyer: 'dragonfly',
      decor: ['bambooShoot', 'stoneLantern', 'fern', 'bambooShoot', 'bush'],
      particles: 'none', gravity: 1,
      music: { bpm: 92, root: 62, minor: true, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 19, bell: true },
      skyDraw(c, w, h) { sun(c, w * 0.7, 80, 30, 'rgba(255,255,240,0.95)', 'rgba(255,255,230,0.5)'); },
      far(c, w, h, r) {
        peaks(c, w, h, 300, 5, 110, 180, '#bcd8c2', null, r);
        for (const x of spread(w, 34, r)) { const wd = 4 + r() * 3, top = 30 + r() * 120; wrap(w, x, 10, X => { c.fillStyle = '#a2c9a4'; c.fillRect(X - wd / 2, top, wd, 330 - top); c.fillStyle = '#8dbb90'; for (let y = 330 - 30; y > top; y -= 32) c.fillRect(X - wd / 2 - 0.5, y, wd + 1, 2); }); }
        const g = c.createLinearGradient(0, 180, 0, 330);
        g.addColorStop(0, 'rgba(244,251,239,0)'); g.addColorStop(1, 'rgba(244,251,239,0.85)');
        c.fillStyle = g; c.fillRect(0, 180, w, 150);
        band(c, w, h, 322, [[2, 6, 0], [5, 3, 2]], '#b2d4ad');
      },
      mid(c, w, h, r) {
        const cols = ['#5fa64a', '#6cb555', '#4f9640', '#7cbf5a'];
        for (const x of spread(w, 15, r)) {
          const wd = 10 + r() * 6, col = pick(cols, r()), k = r();
          wrap(w, x, 40, X => bambooStalk(c, X, -10, 370, wd, col, R(k)));
        }
        const g = c.createLinearGradient(0, 250, 0, 350);
        g.addColorStop(0, 'rgba(240,250,240,0)'); g.addColorStop(1, 'rgba(240,250,240,0.55)');
        c.fillStyle = g; c.fillRect(0, 250, w, 100);
        const wv = [[3, 8, 0], [7, 3, 1]];
        band(c, w, h, 352, wv, '#5d9e4a');
        onBand(c, w, 352, wv, 12, r, 20, (x, y, k) => { c.fillStyle = '#4c8a3c'; tri(c, x - 6, y + 4, x, y - 14 - k * 10, x + 6, y + 4); });
      },
    },
    // 20
    {
      name: 'Квітучий сад', icon: '🌸',
      sky: ['#9ed6ff', '#ffecf5'],
      ground: { style: 'grass', body: '#9a6a48', dark: '#7d5236', top: '#8fdc6a', topDark: '#5fb24a' },
      block: { fill: '#f8a5c2', light: '#ffd3e4', dark: '#cc6890' },
      oneway: { fill: '#fff4f8', dark: '#d9a7bd' },
      enemy: 'snail', enemyColor: '#ffa94d', flyer: 'butterfly',
      decor: ['blossomBush', 'tulip', 'flower', 'birdhouse', 'flower2'],
      particles: 'leaves', gravity: 1,
      music: { bpm: 112, root: 65, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.3, seed: 20, bell: true },
      skyDraw(c, w, h) { sun(c, w * 0.2, 70, 26, '#fffde7', 'rgba(255,240,245,0.6)'); },
      far(c, w, h, r) {
        clouds(c, w, 5, r, 40, 130, 'rgba(255,245,250,0.95)');
        const wv = [[2, 16, 0.2], [3, 9, 1]];
        band(c, w, h, 302, wv, '#cfe8b0');
        const cols = ['#f7c6da', '#fbd9e6', '#f2b3cf'];
        onBand(c, w, 302, wv, 18, r, 30, (x, y, k) => {
          c.fillStyle = '#b58f80'; c.fillRect(x - 1.5, y - 12, 3, 16);
          c.fillStyle = pick(cols, k); circ(c, x, y - 18, 10 + k * 8); circ(c, x + 8, y - 12, 7);
        });
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0.5], [5, 5, 2]];
        band(c, w, h, 346, wv, '#a2d97f');
        onBand(c, w, 346, wv, 7, r, 70, (x, y, k) => blossomTree(c, x, y + 6, 110 + k * 50, R(k)));
        const cols = ['#ffb3d1', '#ffffff', '#ff94c0'];
        for (const x of spread(w, 50, r)) { const col = pick(cols, r()), dy = r() * 14; wrap(w, x, 8, X => { c.fillStyle = col; ell(c, X, bandY(w, 346, wv, X) + 6 + dy, 3, 1.6, X); }); }
      },
    },
    // 21
    {
      name: 'Піратська бухта', icon: '🏴‍☠️',
      sky: ['#4cb6ee', '#d4f1ff'],
      ground: { style: 'sand', body: '#e2b56a', dark: '#c99a4e', top: '#f7dc9b', topDark: '#e3bf74' },
      block: { fill: '#b7793f', light: '#dca46a', dark: '#7a4a22', bricks: true },
      oneway: { fill: '#a0703f', dark: '#6b4423' },
      enemy: 'pirateCrab', enemyColor: '#ff5a3c', flyer: 'parrot',
      decor: ['anchor', 'barrel', 'treasure', 'starfish', 'shell'],
      particles: 'none', gravity: 1, pit: '#1e88e5',
      music: { bpm: 116, root: 62, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 21 },
      skyDraw(c, w, h) { sun(c, w * 0.18, 70, 28, '#fff59d', 'rgba(255,240,150,0.6)'); },
      far(c, w, h, r) {
        clouds(c, w, 5, r, 40, 120, 'rgba(255,255,255,0.95)');
        const g = c.createLinearGradient(0, 262, 0, h);
        g.addColorStop(0, '#1976d2'); g.addColorStop(1, '#4fc3f7');
        c.fillStyle = g; c.fillRect(0, 262, w, h - 262);
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(0, 262, w, 2);
        for (let i = 0; i < 40; i++) { const x = r() * w, y = 278 + r() * 120, ww = 8 + r() * 14; wrap(w, x, 30, X => c.fillRect(X, y, ww, 2)); }
        wrap(w, w * 0.55, 80, X => ship(c, X, 290, 0.75));
        wrap(w, w * 0.12, 70, X => { c.fillStyle = '#e8c47d'; ell(c, X, 266, 46, 8); palm(c, X - 10, 264, 50); palm(c, X + 14, 266, 36); });
        wrap(w, w * 0.86, 40, X => { c.fillStyle = '#6d7f8c'; tri(c, X - 30, 266, X - 8, 236, X + 10, 266); tri(c, X - 4, 266, X + 14, 246, X + 34, 266); });
      },
      mid(c, w, h, r) {
        const wv = [[3, 4, 0], [8, 2, 1]];
        c.fillStyle = '#7a4f2a';
        for (let i = 0; i < 16; i++) { const x = (i + 0.5) * w / 16; c.fillRect(x - 5, 350, 10, h - 350); }
        band(c, w, h, 392, wv, 'rgba(25,118,210,0.85)');
        c.fillStyle = 'rgba(255,255,255,0.6)'; for (let x = 0; x < w; x += 32) c.fillRect(x + 6, bandY(w, 392, wv, x + 6) + 3, 14, 2);
        c.fillStyle = '#6b4423'; c.fillRect(0, 352, w, 10);
        c.fillStyle = '#a87443'; c.fillRect(0, 346, w, 8);
        c.fillStyle = '#7a4f2a'; for (let i = 0; i < 64; i++) c.fillRect(i * w / 64, 346, 1.5, 8);
        c.fillStyle = '#5d3a1e'; for (let i = 0; i < 8; i++) { const x = (i + 0.5) * w / 8; c.fillRect(x - 3, 318, 6, 30); circ(c, x, 318, 4); }
        c.strokeStyle = '#d7b98a'; c.lineWidth = 2;
        for (let i = 0; i < 8; i++) { const x0 = (i + 0.5) * w / 8, x1 = x0 + w / 8; c.beginPath(); c.moveTo(x0, 322); c.quadraticCurveTo((x0 + x1) / 2, 334, x1, 322); c.stroke(); }
        for (const x of spread(w, 5, r)) {
          const k = r();
          wrap(w, x, 40, X => {
            if (k < 0.5) { c.save(); c.translate(X, 346); c.scale(1.5, 1.5); Art.decors.barrel(c); c.translate(16, 0); Art.decors.barrel(c); c.restore(); }
            else { c.fillStyle = '#b7793f'; c.fillRect(X - 14, 318, 28, 28); c.strokeStyle = '#7a4a22'; c.lineWidth = 2; c.strokeRect(X - 13, 319, 26, 26); line(c, X - 13, 319, X + 13, 345); }
          });
        }
      },
    },
    // 22
    {
      name: 'Чарівне болото', icon: '🐸',
      sky: ['#2b4a3c', '#a2c493'],
      ground: { style: 'jungle', body: '#4e3b2a', dark: '#3a2b1e', top: '#6aa83c', topDark: '#467a2a' },
      block: { fill: '#76875c', light: '#9db07e', dark: '#4a5838' },
      oneway: { fill: '#7a5a3a', dark: '#4e3822' },
      enemy: 'frog', enemyColor: '#8be04e', flyer: 'dragonfly',
      decor: ['reed', 'lily', 'swampLog', 'mushroomGlow', 'reed'],
      particles: 'fireflies', gravity: 1, pit: '#3d6b3a',
      music: { bpm: 88, root: 57, minor: true, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 22 },
      skyDraw(c, w, h) {
        sun(c, w * 0.76, 78, 24, 'rgba(240,255,220,0.95)', 'rgba(220,255,200,0.4)');
        c.fillStyle = 'rgba(255,255,255,0.06)'; ell(c, w * 0.3, 160, w * 0.4, 18); ell(c, w * 0.7, 210, w * 0.35, 14);
      },
      far(c, w, h, r) {
        const wv = [[2, 10, 0], [5, 4, 1]];
        band(c, w, h, 300, wv, '#557a5c');
        onBand(c, w, 300, wv, 9, r, 60, (x, y, k) => willow(c, x, y + 6, 90 + k * 50, '#4a6e52'));
        const g = c.createLinearGradient(0, 240, 0, 320);
        g.addColorStop(0, 'rgba(200,230,200,0)'); g.addColorStop(1, 'rgba(200,230,200,0.35)');
        c.fillStyle = g; c.fillRect(0, 240, w, 80);
      },
      mid(c, w, h, r) {
        const g = c.createLinearGradient(0, 350, 0, h);
        g.addColorStop(0, '#4c7c5c'); g.addColorStop(1, '#2e5040');
        c.fillStyle = g; c.fillRect(0, 350, w, h - 350);
        c.strokeStyle = 'rgba(200,240,200,0.3)'; c.lineWidth = 1.5;
        for (let i = 0; i < 18; i++) { const x = r() * w, y = 362 + r() * 70, rw = 10 + r() * 16; wrap(w, x, 30, X => { c.beginPath(); c.ellipse(X, y, rw, rw * 0.25, 0, 0, Math.PI * 2); c.stroke(); }); }
        const wv = [[3, 10, 0], [7, 5, 1]];
        for (const x of spread(w, 6, r)) { const wd = 50 + r() * 50; wrap(w, x, wd, X => { c.fillStyle = '#35573a'; ell(c, X, 352, wd, 14); }); }
        for (const x of spread(w, 4, r)) { const s = 90 + r() * 50; wrap(w, x, 40, X => {
          c.fillStyle = '#3a3428'; c.beginPath(); c.moveTo(X - 8, 352); c.lineTo(X - 5, 352 - s); c.lineTo(X + 4, 352 - s * 0.9); c.lineTo(X + 8, 352); c.fill();
          c.strokeStyle = '#3a3428'; c.lineWidth = 4; line(c, X - 3, 352 - s * 0.6, X - 26, 352 - s * 0.85); line(c, X + 2, 352 - s * 0.75, X + 22, 352 - s * 1.0);
        }); }
        c.fillStyle = '#2f4a2c';
        onBand(c, w, 340, wv, 22, r, 20, (x, y, k) => {
          for (let i = -2; i <= 2; i++) { c.fillRect(x + i * 4, y - 30 - k * 20 + Math.abs(i) * 6, 2, 50); }
          c.fillStyle = '#4e3626'; rr(c, x - 1.5, y - 38 - k * 20, 5, 12, 2.5); c.fill(); c.fillStyle = '#2f4a2c';
        });
        for (const x of spread(w, 12, r)) { const y = 372 + r() * 40, f = r() < 0.4; wrap(w, x, 20, X => { c.fillStyle = '#5cb85c'; ell(c, X, y, 13, 4); if (f) { c.fillStyle = '#f48fb1'; circ(c, X + 3, y - 2, 3); } }); }
        for (let i = 0; i < 14; i++) { const x = r() * w, y = 180 + r() * 150; wrap(w, x, 12, X => glowDot(c, X, y, 7, 'rgba(230,255,120,0.75)')); }
      },
    },
    // 23
    {
      name: 'Червоний каньйон', icon: '🪨',
      sky: ['#5fb0e8', '#ffd9a8'],
      ground: { style: 'sand', body: '#b8542e', dark: '#9a4424', top: '#e48d52', topDark: '#c06a38', texture: 'stripes' },
      block: { fill: '#c76a3f', light: '#ea9a68', dark: '#8a4022', bricks: true },
      oneway: { fill: '#8d6e4a', dark: '#5d452c' },
      enemy: 'armadillo', enemyColor: '#b8aec6', flyer: 'bird',
      decor: ['redRock', 'cactus', 'tumbleweed', 'skullRock', 'redRock'],
      particles: 'dust', gravity: 1,
      music: { bpm: 108, root: 59, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 23 },
      skyDraw(c, w, h) { sun(c, w * 0.82, 66, 30, '#fff3c4', 'rgba(255,235,190,0.6)'); },
      far(c, w, h, r) {
        clouds(c, w, 3, r, 40, 100, 'rgba(255,255,255,0.8)', 0.6, 1);
        for (const x of spread(w, 5, r, 0.6)) { const wd = 70 + r() * 60, hh = 90 + r() * 80; wrap(w, x, wd, X => mesa(c, X, 330, wd, hh, '#d98058', '#e9a07a')); }
        band(c, w, h, 326, [[2, 4, 0]], '#e6a272');
      },
      mid(c, w, h, r) {
        const wv = [[3, 8, 0], [6, 4, 1]];
        band(c, w, h, 358, wv, '#a8472c');
        const g = c.createLinearGradient(0, 378, 0, h);
        g.addColorStop(0, 'rgba(90,30,18,0)'); g.addColorStop(1, 'rgba(70,22,12,0.9)');
        c.fillStyle = g; c.fillRect(0, 378, w, h - 378);
        for (const [fx, wd, hh] of [[0.22, 170, 170], [0.7, 130, 130]]) wrap(w, w * fx, wd, X => rockArch(c, X, bandY(w, 358, wv, X) + 6, wd, hh, '#b5502f'));
        for (const x of spread(w, 5, r)) { const hh = 60 + r() * 60; wrap(w, x, 20, X => hoodoo(c, X, bandY(w, 358, wv, X) + 6, hh, '#c45e38')); }
        c.globalAlpha = 0.7;
        onBand(c, w, 358, wv, 4, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 6); c.scale(1.6 + k, 1.6 + k); Art.decors.cactus(c); c.restore(); });
        c.globalAlpha = 1;
      },
    },
    // 24
    {
      name: 'Країна динозаврів', icon: '🦕',
      sky: ['#ffae66', '#fff2c6'],
      ground: { style: 'jungle', body: '#8a5a35', dark: '#6d4526', top: '#7cc04a', topDark: '#4f8f2e' },
      block: { fill: '#b39b7a', light: '#d9c6a2', dark: '#7d6a50' },
      oneway: { fill: '#f1e6cf', dark: '#b8a585' },
      enemy: 'dinoBaby', enemyColor: '#ff9f43', flyer: 'pterodactyl',
      decor: ['dinoEgg', 'cycad', 'bone', 'fern', 'cycad'],
      particles: 'dust', gravity: 1,
      music: { bpm: 112, root: 60, minor: false, lead: 'triangle', bass: 'square', drums: true, rest: 0.25, seed: 24 },
      skyDraw(c, w, h) { sun(c, w * 0.22, 80, 30, '#fff8d6', 'rgba(255,230,170,0.6)'); },
      far(c, w, h, r) {
        wrap(w, w * 0.68, 220, X => {
          c.fillStyle = 'rgba(200,185,175,0.35)';
          for (let i = 0; i < 6; i++) circ(c, X - 10 + i * 9 + Math.sin(i * 2) * 8, 150 - i * 18, 18 + i * 5);
          c.fillStyle = '#a07e6a';
          c.beginPath(); c.moveTo(X - 210, 320); c.lineTo(X - 40, 168); c.lineTo(X + 40, 168); c.lineTo(X + 210, 320); c.fill();
          c.fillStyle = '#8a6a58'; tri(c, X + 10, 168, X + 40, 168, X + 210, 320);
          c.save(); c.shadowColor = '#ff7b1a'; c.shadowBlur = 16; c.fillStyle = '#ff8a3d'; ell(c, X, 170, 38, 6);
          c.fillStyle = '#ffa04d'; c.beginPath(); c.moveTo(X - 14, 172); c.quadraticCurveTo(X - 24, 200, X - 30, 226); c.lineTo(X - 22, 226); c.quadraticCurveTo(X - 12, 200, X - 4, 172); c.fill(); c.restore();
        });
        const wv = [[2, 14, 0.4], [3, 7, 1.7]];
        band(c, w, h, 306, wv, '#a9cf87');
        for (const [fx, s] of [[0.15, 44], [0.32, 34], [0.9, 38]]) wrap(w, w * fx, 70, X => longNeck(c, X, bandY(w, 306, wv, X) + 4, s, '#86b376'));
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [6, 5, 1]];
        band(c, w, h, 350, wv, '#5ea845');
        wrap(w, w * 0.45, 150, X => longNeck(c, X, bandY(w, 350, wv, X) + 6, 82, '#4f9a4a', '#e8ffe0'));
        onBand(c, w, 350, wv, 7, r, 70, (x, y, k) => {
          const s = 90 + k * 50;
          c.strokeStyle = '#7a5a3a'; c.lineWidth = s * 0.08; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + s * 0.1, y - s * 0.4, x, y - s * 0.75); c.stroke();
          c.fillStyle = k < 0.5 ? '#3f8a3a' : '#4a9a40';
          for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + (i - 3) * 0.48;
            c.save(); c.translate(x, y - s * 0.75); c.rotate(a + Math.PI / 2);
            ell(c, 0, -s * 0.24, s * 0.06, s * 0.26);
            c.restore();
          }
        });
        onBand(c, w, 350, wv, 14, r, 20, (x, y, k) => { c.save(); c.translate(x, y + 5); c.scale(2, 2); Art.decors.fern(c, k * 6); c.restore(); });
      },
    },
    // 25
    {
      name: 'Грибний ліс', icon: '🍄',
      sky: ['#5c4a9e', '#f6c4e4'],
      ground: { style: 'grass', body: '#6d4a3a', dark: '#563828', top: '#a6dc5e', topDark: '#6fae3a' },
      block: { fill: '#e8505b', light: '#ff9aa2', dark: '#a8323c' },
      oneway: { fill: '#ffcf5c', dark: '#c99a2a' },
      enemy: 'mushroomGuy', enemyColor: '#ff4f64', flyer: 'shroomFly',
      decor: ['giantShroom', 'shroomCluster', 'mushroom', 'mushroomGlow', 'shroomCluster'],
      particles: 'fireflies', gravity: 1,
      music: { bpm: 98, root: 64, minor: false, lead: 'sine', bass: 'triangle', drums: true, rest: 0.35, seed: 25, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 50, mulberry32(25), h * 0.4);
        sun(c, w * 0.8, 74, 24, '#fff0fa', 'rgba(255,220,250,0.5)');
      },
      far(c, w, h, r) {
        const wv = [[2, 12, 0], [5, 5, 1]];
        band(c, w, h, 312, wv, '#9a7fcf');
        onBand(c, w, 312, wv, 9, r, 60, (x, y, k) => {
          const s = 90 + k * 90;
          c.fillStyle = '#b29ae0'; c.fillRect(x - s * 0.06, y - s * 0.9, s * 0.12, s * 0.95);
          c.beginPath(); c.ellipse(x, y - s * 0.9, s * 0.4, s * 0.28, 0, Math.PI, 0); c.fill();
        });
        band(c, w, h, 322, [[3, 6, 2]], '#8a6fc0');
      },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0.3], [5, 5, 1.4]];
        band(c, w, h, 352, wv, '#5e4e98');
        const caps = ['#ff5d73', '#4fc3f7', '#ffd54f', '#ba68c8', '#ff9f43', '#66d9a8'];
        onBand(c, w, 352, wv, 8, r, 70, (x, y, k) => bigShroom(c, x, y + 6, 100 + k * 90, pick(caps, k * 5.3 % 1), R(k)));
        for (let i = 0; i < 16; i++) { const x = r() * w, y = 150 + r() * 200, col = pick(['rgba(255,240,150,0.7)', 'rgba(160,255,230,0.7)', 'rgba(255,180,240,0.7)'], r()); wrap(w, x, 10, X => glowDot(c, X, y, 6, col)); }
        c.strokeStyle = '#4a3d80'; c.lineWidth = 2; c.lineCap = 'round';
        for (const x of spread(w, 50, r)) wrap(w, x, 10, X => { const y = bandY(w, 352, wv, X) + 5; line(c, X, y, X - 3, y - 8); line(c, X, y, X + 3, y - 9); });
      },
    },
    // 26
    {
      name: 'Північне сяйво', icon: '🌌',
      sky: ['#050d26', '#1b3d66'],
      ground: { style: 'snow', body: '#5d7392', dark: '#4a5f7c', top: '#ffffff', topDark: '#cfe0f2' },
      block: { fill: '#9fd3f0', light: '#d6f1ff', dark: '#5c9cc6' },
      oneway: { fill: '#e3f2fd', dark: '#8fb2cf' },
      enemy: 'penguin', enemyColor: '#263850', flyer: 'snowyOwl',
      decor: ['igloo', 'snowPine', 'snowman', 'crystalIce', 'snowPile'],
      particles: 'snow', gravity: 1,
      music: { bpm: 90, root: 64, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.35, seed: 26, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 160, mulberry32(26), h * 0.7);
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [y0, col, ph, len] of [[70, 'rgba(90,255,170,', 0, 80], [55, 'rgba(190,110,255,', 2.2, 60], [120, 'rgba(70,220,255,', 4.1, 50]]) {
          for (let x = 0; x < w; x += 3) {
            const y = y0 + Math.sin(x * 0.006 + ph) * 28 + Math.sin(x * 0.017 + ph * 2) * 10;
            const a = (0.22 + 0.16 * Math.sin(x * 0.025 + ph)).toFixed(3);
            const g = c.createLinearGradient(0, y, 0, y + len);
            g.addColorStop(0, col + '0)'); g.addColorStop(0.3, col + a + ')'); g.addColorStop(1, col + '0)');
            c.fillStyle = g; c.fillRect(x, y, 3.5, len);
          }
        }
        c.restore();
        c.fillStyle = '#f4f8ff'; circ(c, w * 0.85, 60, 16);
      },
      far(c, w, h, r) { peaks(c, w, h, 322, 5, 120, 190, '#2e4a70', '#d4e3f3', r); },
      mid(c, w, h, r) {
        const wv = [[3, 10, 0], [5, 5, 2]];
        band(c, w, h, 348, wv, '#e4eefa');
        onBand(c, w, 348, wv, 11, r, 50, (x, y, k) => pineTree(c, x, y + 8, 70 + k * 60, '#1d3b4c', '#f4f9ff'));
        wrap(w, w * 0.43, 60, X => { c.save(); c.translate(X, bandY(w, 348, wv, X) + 6); c.scale(2.4, 2.4); Art.decors.igloo(c); c.restore(); });
        c.fillStyle = 'rgba(255,255,255,0.8)';
        for (const x of spread(w, 30, r)) wrap(w, x, 6, X => circ(c, X, bandY(w, 348, wv, X) + 2, 2));
      },
    },
    // 27
    {
      name: 'Льодяна печера', icon: '🧊',
      sky: ['#0a2238', '#1f5f8c'],
      ground: { style: 'crystal', body: '#3d6f9a', dark: '#2f5a80', top: '#a8def5', topDark: '#6fb6dd', glow: '#e0fbff', texture: 'gems', topLight: 'rgba(255,255,255,0.6)' },
      block: { fill: '#8fd3f5', light: '#e0f7ff', dark: '#4a9ccc' },
      oneway: { fill: '#cdeffd', dark: '#6aaed6' },
      enemy: 'yetiBaby', enemyColor: '#f4f8ff', flyer: 'bat',
      decor: ['iceSpike', 'iceCluster', 'crystalIce', 'snowPile'],
      particles: 'sparkle', gravity: 1,
      music: { bpm: 86, root: 62, minor: true, lead: 'sine', bass: 'triangle', drums: false, rest: 0.4, seed: 27, bell: true },
      skyDraw(c, w, h) {
        const g = c.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, w * 0.6);
        g.addColorStop(0, 'rgba(120,220,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      },
      far(c, w, h, r) {
        for (const x of spread(w, 20, r)) { const l = 30 + r() * 90; wrap(w, x, 20, X => { c.fillStyle = '#2a6d99'; tri(c, X - 13, 0, X, l, X + 13, 0); }); }
        band(c, w, h, 318, [[3, 18, 0], [7, 8, 1]], '#1e527a');
        for (const x of spread(w, 12, r)) { const l = 30 + r() * 60; wrap(w, x, 20, X => { c.fillStyle = '#2b6c98'; tri(c, X - 12, 330, X - 2, 330 - l, X + 10, 330); c.fillStyle = '#3a82b0'; tri(c, X - 2, 330 - l, X + 10, 330, X + 2, 330); }); }
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 10, r)) {
          const l = 60 + r() * 110, wd = 16 + r() * 12;
          wrap(w, x, 30, X => {
            c.fillStyle = '#7cc6ea'; tri(c, X - wd, 0, X, l, X + wd, 0);
            c.fillStyle = '#c8ecfb'; tri(c, X - wd * 0.6, 0, X, l, X - wd * 0.1, 0);
            c.fillStyle = '#5aaad6'; tri(c, X + wd * 0.35, 0, X + wd * 0.55, l * 0.4, X + wd * 0.75, 0);
          });
        }
        const wv = [[4, 10, 0], [9, 4, 2]];
        band(c, w, h, 354, wv, '#2c6a96');
        const cols = ['#9ff0ff', '#c5b8ff', '#7fd8ff', '#e0fbff'];
        onBand(c, w, 354, wv, 10, r, 30, (x, y, k) => {
          const col = pick(cols, k), s = 1 + k;
          c.save(); c.shadowColor = col; c.shadowBlur = 12; c.fillStyle = col;
          c.beginPath(); c.moveTo(x - 6 * s, y + 4); c.lineTo(x - 8 * s, y - 20 * s); c.lineTo(x - 2 * s, y - 34 * s); c.lineTo(x + 4 * s, y - 20 * s); c.lineTo(x + 3 * s, y + 4); c.fill();
          c.beginPath(); c.moveTo(x + 3 * s, y + 4); c.lineTo(x + 8 * s, y - 14 * s); c.lineTo(x + 14 * s, y - 20 * s); c.lineTo(x + 13 * s, y + 4); c.fill();
          c.restore();
          c.fillStyle = 'rgba(255,255,255,0.55)'; tri(c, x - 6 * s, y, x - 2 * s, y - 32 * s, x - 3 * s, y);
        });
      },
    },
    // 28
    {
      name: 'Старовинний замок', icon: '🏰',
      sky: ['#4f64a6', '#f6cfa0'],
      ground: { style: 'stone', body: '#76727e', dark: '#5c5864', top: '#c9bfa8', topDark: '#968c78', texture: 'bricks' },
      block: { fill: '#a39e94', light: '#cfc9bd', dark: '#6e6960', bricks: true },
      oneway: { fill: '#8d5a32', dark: '#5a3618' },
      enemy: 'knight', enemyColor: '#c3ced6', flyer: 'ghost',
      decor: ['torch', 'shieldStand', 'banner', 'barrel'],
      particles: 'none', gravity: 1,
      music: { bpm: 110, root: 60, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.25, seed: 28 },
      skyDraw(c, w, h) {
        stars(c, w, h, 40, mulberry32(28), h * 0.3);
        sun(c, w * 0.24, 230, 34, '#ffe0a0', 'rgba(255,190,120,0.55)');
      },
      far(c, w, h, r) {
        clouds(c, w, 4, r, 50, 150, 'rgba(255,215,190,0.55)', 0.7, 1.3);
        const wv = [[2, 14, 0], [3, 8, 1]];
        band(c, w, h, 312, wv, '#7d8fb5');
        wrap(w, w * 0.62, 120, X => {
          const b = bandY(w, 312, wv, X) + 6;
          c.fillStyle = '#6f7fa6'; c.fillRect(X - 70, b - 70, 140, 70);
          for (let i = 0; i < 7; i++) c.fillRect(X - 70 + i * 22, b - 78, 12, 8);
          tower(c, X - 78, b, 24, 100, '#6f7fa6', '#8b6aa8', '#ffd23f');
          tower(c, X + 78, b, 24, 90, '#6f7fa6', '#8b6aa8', '#ffd23f');
          tower(c, X, b, 32, 130, '#6f7fa6', '#8b6aa8', '#ffd23f');
        });
      },
      mid(c, w, h, r) {
        const top = 300;
        c.fillStyle = '#a19cae'; c.fillRect(0, top, w, h - top);
        const n = 32;
        for (let i = 0; i < n; i++) c.fillRect(i * w / n, top - 12, w / n * 0.55, 12);
        c.strokeStyle = '#8b869a'; c.lineWidth = 1.5;
        for (let y = top + 12, row = 0; y < h; y += 14, row++) {
          line(c, 0, y, w, y);
          for (let i = 0; i < 40; i++) { const x = (i + (row % 2) * 0.5) * w / 40; line(c, x, y, x, y + 14); }
        }
        c.fillStyle = '#8b869a'; c.fillRect(0, top, w, 5);
        for (const fx of [0.12, 0.45, 0.78]) wrap(w, w * fx, 60, X => tower(c, X, 360, 56, 150, '#9c98a3', '#c0453a', pick(['#ffd23f', '#2e7dd1', '#e53935'], fx), '#ffcf6b'));
        for (const fx of [0.28, 0.62, 0.95]) wrap(w, w * fx, 30, X => {
          glowDot(c, X, top + 18, 26, 'rgba(255,190,90,0.55)');
          c.fillStyle = '#4e342e'; c.fillRect(X - 2, top + 22, 4, 16); c.fillRect(X - 6, top + 22, 12, 3);
          c.fillStyle = '#ff9100'; c.beginPath(); c.moveTo(X - 5, top + 22); c.quadraticCurveTo(X, top + 6, X + 5, top + 22); c.fill();
          c.fillStyle = '#ffe14d'; c.beginPath(); c.moveTo(X - 2.5, top + 22); c.quadraticCurveTo(X, top + 13, X + 2.5, top + 22); c.fill();
        });
        for (const fx of [0.36, 0.86]) wrap(w, w * fx, 20, X => {
          c.fillStyle = '#c62828'; c.fillRect(X - 12, top + 4, 24, 40);
          tri(c, X - 12, top + 44, X, top + 36, X + 12, top + 44);
          c.fillStyle = '#ffd23f'; star(c, X, top + 22, 7, 5, 0.45);
        });
      },
    },
  );
})();
