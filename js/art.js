'use strict';
// Уся графіка малюється кодом — жодних картинок завантажувати не треба.
const T = 32;          // розмір клітинки рівня
const ROWS = 14;       // висота рівня в клітинках
const VIEW_H = ROWS * T;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fill(); }
function line(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function tri(c, x1, y1, x2, y2, x3, y3) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill(); }
function star(c, x, y, r, n = 5, inner = 0.45) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n;
    const rad = i % 2 ? r * inner : r;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath();
  c.fill();
}

const Art = {
  // ---------------- Міньйон ----------------
  minion(c, x, y, o) {
    const t = o.t || 0, run = o.state === 'run', air = o.state === 'air';
    const ph = t * 15;
    c.save();
    c.translate(x, y);
    c.scale((o.facing || 1) * (o.sx || 1), o.sy || 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    const bob = run ? -Math.abs(Math.sin(ph)) * 2 : (air ? 0 : Math.sin(t * 3) * 0.6);

    // ноги
    const legs = [[-8, run ? Math.sin(ph) : 0], [2, run ? -Math.sin(ph) : 0]];
    for (const [lx, s] of legs) {
      const lift = air ? 2 : Math.max(0, s) * 3;
      const fx = s * 3;
      c.fillStyle = '#2f62a8';
      c.fillRect(lx + fx * 0.5, -11 - lift, 6, 7);
      c.fillStyle = '#1e1e1e';
      rr(c, lx - 1 + fx, -5 - lift, 9, 5, 2.5);
      c.fill();
    }

    const by = -47 + bob;
    const body = () => rr(c, -15, by, 30, 40, 14);
    const g = c.createLinearGradient(-15, 0, 15, 0);
    g.addColorStop(0, '#ffe35c');
    g.addColorStop(1, '#efbb14');
    body();
    c.fillStyle = g;
    c.fill();

    c.save();
    body();
    c.clip();
    // комбінезон
    c.fillStyle = '#2f6db5';
    c.fillRect(-16, by + 31, 32, 12);
    c.fillRect(-9, by + 27, 18, 6);
    c.fillStyle = '#24569a';
    rr(c, -4, by + 28, 8, 4.5, 1.5);
    c.fill();
    c.strokeStyle = '#2f6db5';
    c.lineWidth = 3;
    line(c, -8, by + 28, -15, by + 22);
    line(c, 8, by + 28, 15, by + 22);
    c.fillStyle = '#1e1e1e';
    circ(c, -7, by + 28.5, 1.3);
    circ(c, 7, by + 28.5, 1.3);
    // ремінець окулярів
    c.fillStyle = '#2b2b2b';
    c.fillRect(-16, by + 9.5, 32, 5);
    c.restore();

    // окуляр
    const ex = 4, ey = by + 12;
    c.fillStyle = '#aab0b6';
    circ(c, ex, ey, 8.5);
    c.strokeStyle = '#6c7278';
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(ex, ey, 8.5, 0, Math.PI * 2); c.stroke();
    if (o.blink) {
      c.fillStyle = '#f0c020';
      circ(c, ex, ey, 6.2);
      c.strokeStyle = '#5a3a10';
      c.lineWidth = 1.4;
      line(c, ex - 4.5, ey + 1, ex + 4.5, ey + 1);
    } else {
      c.fillStyle = '#fff';
      circ(c, ex, ey, 6.2);
      const lx = o.look || 1.5;
      c.fillStyle = '#7a4a22';
      circ(c, ex + lx, ey + 0.5, 3.2);
      c.fillStyle = '#111';
      circ(c, ex + lx, ey + 0.5, 1.6);
      c.fillStyle = '#fff';
      circ(c, ex + lx + 1.1, ey - 0.8, 0.9);
    }
    // рот
    c.strokeStyle = '#5a2d0c';
    c.fillStyle = '#5a2d0c';
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    if (air || o.happy) {
      ell(c, 4.5, by + 23.5, 2.6, 2.4);
    } else {
      c.beginPath();
      c.arc(4.5, by + 20, 3.6, Math.PI * 0.15, Math.PI * 0.85);
      c.stroke();
    }
    // волосинки
    c.strokeStyle = '#222';
    c.lineWidth = 1.3;
    line(c, -3, by + 1, -5, by - 5);
    line(c, 1, by, 1, by - 6);
    line(c, 5, by + 1, 7, by - 4);
    // руки
    for (const side of [-1, 1]) {
      let ax, ay;
      if (air || o.happy) { ax = side * 20; ay = by + 12; }
      else if (run) {
        const a = Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.9;
        ax = side * 15 + Math.sin(a) * 8;
        ay = by + 24 + Math.cos(a) * 9;
      } else { ax = side * 18; ay = by + 33 + Math.sin(t * 3 + side) * 0.5; }
      c.strokeStyle = '#efbb14';
      c.lineWidth = 4;
      line(c, side * 13.5, by + 24, ax, ay);
      c.fillStyle = '#222';
      circ(c, ax, ay, 3);
    }
    c.restore();
  },

  // ---------------- Руда білка ----------------
  squirrel(c, x, y, o) {
    const t = o.t || 0, run = o.moving;
    const ph = t * 16;
    const FUR = '#e2771f', FUR_D = '#b5530f', FUR_L = '#f59a45', CREAM = '#fde6c4';
    c.save();
    c.translate(x, y);
    c.scale(o.facing || 1, 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    const bob = run ? -Math.abs(Math.sin(ph)) * 2.5 : Math.sin(t * 2.5) * 0.5;

    // великий пухнастий хвіст
    c.save();
    c.translate(-8, -9 + bob);
    c.rotate(-0.15 + Math.sin(t * (run ? 12 : 3.5)) * 0.14);
    const tg = c.createLinearGradient(0, 0, -10, -34);
    tg.addColorStop(0, FUR_D);
    tg.addColorStop(1, FUR_L);
    c.fillStyle = tg;
    c.beginPath();
    c.moveTo(2, -2);
    c.bezierCurveTo(-16, 2, -22, -16, -14, -28);
    c.bezierCurveTo(-8, -38, 6, -36, 5, -26);
    c.bezierCurveTo(4, -20, -4, -22, -4, -26);
    c.bezierCurveTo(-8, -18, -2, -8, 6, -4);
    c.closePath();
    c.fill();
    // пухнасті кінчики
    c.fillStyle = FUR_L;
    circ(c, -13, -26, 5);
    circ(c, -6, -33, 5);
    circ(c, 2, -31, 4);
    c.fillStyle = 'rgba(255,240,220,0.5)';
    circ(c, -8, -31, 2.5);
    c.restore();

    // лапки
    c.fillStyle = FUR_D;
    const legY = -4 + bob * 0.3;
    const lp = [[-6, 0], [-2, Math.PI], [6, Math.PI], [9, 0]];
    for (const [lx, p] of lp) {
      const s = run ? Math.sin(ph + p) * 2.5 : 0;
      rr(c, lx + s - 1.5, legY, 3.5, 4 - Math.max(0, s) * 0.4, 1.5);
      c.fill();
    }

    // тіло
    const bg = c.createLinearGradient(0, -20, 0, -2);
    bg.addColorStop(0, FUR_L);
    bg.addColorStop(1, FUR);
    c.fillStyle = bg;
    ell(c, 0, -11 + bob, 11.5, 8.5);
    // пузико
    c.fillStyle = CREAM;
    ell(c, 4, -8 + bob, 6.5, 4.5);
    // голова
    c.fillStyle = FUR;
    circ(c, 10, -18 + bob, 7.5);
    // вушко з китичкою
    tri(c, 5.5, -23 + bob, 7.5, -32 + bob, 11.5, -23.5 + bob);
    c.fillStyle = '#ffb38a';
    tri(c, 7, -24 + bob, 8, -29.5 + bob, 10, -24 + bob);
    c.fillStyle = FUR_D;
    tri(c, 6.6, -30 + bob, 7.5, -35 + bob, 9, -30 + bob);
    // світла мордочка
    c.fillStyle = CREAM;
    ell(c, 14, -15 + bob, 4, 3);
    // щічка
    c.fillStyle = 'rgba(255,110,110,0.45)';
    circ(c, 11, -14.5 + bob, 1.8);
    // око
    if (o.blink) {
      c.strokeStyle = '#222'; c.lineWidth = 1.2;
      line(c, 10.5, -19.5 + bob, 14, -19.5 + bob);
    } else {
      c.fillStyle = '#1a1a1a';
      circ(c, 12, -19.5 + bob, 2.7);
      c.fillStyle = '#fff';
      circ(c, 12.9, -20.5 + bob, 1);
    }
    // носик і зубки
    c.fillStyle = '#3a1f10';
    circ(c, 17.2, -16.5 + bob, 1.5);
    c.fillStyle = '#fff';
    c.fillRect(14.8, -13.6 + bob, 2.2, 2.4);
    // передня лапка тримає жолудь
    if (!run) {
      c.fillStyle = '#8d5a2b';
      ell(c, 12, -9 + bob, 2.6, 3);
      c.fillStyle = '#5d3a1a';
      c.fillRect(9.5, -12.5 + bob, 5, 1.8);
    }
    c.restore();
  },

  // ---------------- Вороги ----------------
  enemy(c, e, t, col) {
    c.save();
    c.translate(e.x, e.y);
    const f = e.vx > 0 ? 1 : -1;
    if (e.type === 'flyer') c.scale(e.face || 1, 1);
    else if (e.type === 'shooter') c.scale(e.dir || -1, 1);
    else c.scale(f, 1);
    if (e.dead) {
      c.globalAlpha = Math.max(0, 1 - e.dead * 1.8);
      if (e.type === 'flyer') c.rotate(e.dead * 8);
      else c.scale(1.2, 0.35);
    }
    const fn = Art.enemies[e.style] || (e.type === 'shooter' ? Art.enemies.turret : Art.enemies.beetle);
    fn(c, t + (e.seed || 0), col);
    c.restore();
  },

  enemies: {
    // стрілець за замовчуванням: мила гармата з очима, дуло праворуч
    turret(c, t, col) {
      const k = Math.max(0, Math.sin(t * 3)) * 1.5;
      c.fillStyle = '#5d4037';
      rr(c, -13, -8, 26, 8, 3); c.fill();
      c.fillStyle = col || '#78909c';
      circ(c, -2, -16, 11);
      c.fillStyle = Art.shade(col && col.length === 7 ? col : '#78909c', -30);
      rr(c, 4, -20 - k * 0.3, 14 + k, 9, 3); c.fill();
      c.fillStyle = '#263238'; ell(c, 18 + k, -15.5, 2, 3.5);
      c.fillStyle = '#fff'; circ(c, -1, -19, 3.4);
      c.fillStyle = '#111'; circ(c, 0, -19, 1.7);
      c.strokeStyle = '#111'; c.lineWidth = 1.4; line(c, -4, -24, 2, -23);
    },
    beetle(c, t, col) {
      c.strokeStyle = '#222';
      c.lineWidth = 2;
      c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const lx = -9 + i * 7;
        line(c, lx, -5, lx + Math.sin(t * 12 + i * 2) * 3, 0);
      }
      c.fillStyle = '#3a2a2a';
      c.fillRect(-12, -10, 22, 5);
      c.fillStyle = col || '#e53935';
      c.beginPath();
      c.ellipse(-2, -9, 13, 11, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = '#222';
      c.fillRect(-2.5, -20, 1.5, 11);
      circ(c, -8, -13, 2.2);
      circ(c, 3, -15, 2.2);
      circ(c, 4, -11, 1.8);
      circ(c, 12, -9, 6);
      c.fillStyle = '#fff';
      circ(c, 14, -11, 2.6);
      c.fillStyle = '#111';
      circ(c, 15, -11, 1.3);
      c.strokeStyle = '#111';
      c.lineWidth = 1.5;
      line(c, 11.5, -15.5, 16.5, -13.5);
    },
    crab(c, t, col) {
      c.strokeStyle = col || '#e8503a';
      c.lineWidth = 2;
      c.lineCap = 'round';
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        line(c, s * (5 + i * 3), -6, s * (10 + i * 3), Math.sin(t * 14 + i) * 1.5);
      }
      c.fillStyle = col || '#e8503a';
      ell(c, 0, -10, 13, 8);
      const snap = Math.abs(Math.sin(t * 6)) * 0.5;
      for (const s of [-1, 1]) {
        c.save();
        c.translate(s * 15, -17);
        c.rotate(s * snap);
        circ(c, 0, 0, 5.5);
        c.fillStyle = '#ffd7c9';
        tri(c, s * 1, -1, s * 7, -4, s * 7, 2);
        c.fillStyle = col || '#e8503a';
        c.restore();
      }
      c.strokeStyle = col || '#e8503a';
      c.lineWidth = 2;
      line(c, -4, -16, -5, -22);
      line(c, 4, -16, 5, -22);
      c.fillStyle = '#fff';
      circ(c, -5, -23, 3);
      circ(c, 5, -23, 3);
      c.fillStyle = '#111';
      circ(c, -4.4, -23, 1.5);
      circ(c, 5.6, -23, 1.5);
      c.strokeStyle = '#7a1d10';
      c.lineWidth = 1.5;
      c.beginPath(); c.arc(0, -10, 3.5, 0.2, Math.PI - 0.2); c.stroke();
    },
    snowball(c, t, col) {
      const g = c.createRadialGradient(-4, -18, 2, 0, -13, 14);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, col || '#b9d4ee');
      c.fillStyle = g;
      circ(c, 0, -13, 13);
      c.strokeStyle = '#6b4a2a';
      c.lineWidth = 2;
      const w = Math.sin(t * 8) * 3;
      line(c, -12, -13, -19, -19 + w);
      line(c, 11, -13, 18, -19 - w);
      c.fillStyle = '#222';
      circ(c, 3, -17, 1.8);
      circ(c, 9, -17, 1.8);
      c.lineWidth = 1.5;
      c.strokeStyle = '#222';
      line(c, 1, -21, 5, -20);
      line(c, 11, -21, 7, -20);
      c.fillStyle = '#ff8a1e';
      tri(c, 6, -15, 6, -12, 15, -13.5);
      c.fillStyle = '#333';
      for (let i = 0; i < 4; i++) circ(c, 1 + i * 2.5, -8 + Math.abs(i - 1.5) * 0.6, 0.9);
    },
    robot(c, t, col) {
      c.fillStyle = '#333';
      circ(c, -6, -5, 5);
      circ(c, 6, -5, 5);
      c.strokeStyle = '#999';
      c.lineWidth = 1.5;
      for (const wx of [-6, 6]) {
        const a = t * 10;
        line(c, wx - Math.cos(a) * 3.5, -5 - Math.sin(a) * 3.5, wx + Math.cos(a) * 3.5, -5 + Math.sin(a) * 3.5);
      }
      c.fillStyle = col || '#9aa6b2';
      rr(c, -11, -27, 22, 19, 4);
      c.fill();
      c.fillStyle = '#263238';
      rr(c, -7, -24, 14, 9, 2);
      c.fill();
      const blink = Math.sin(t * 3) > 0.95;
      c.fillStyle = '#ff3d3d';
      if (!blink) { circ(c, -3, -19.5, 1.8); circ(c, 3, -19.5, 1.8); }
      c.strokeStyle = '#555';
      c.lineWidth = 1.5;
      line(c, 0, -27, 0, -33);
      c.fillStyle = Math.sin(t * 6) > 0 ? '#ff5252' : '#ffd54f';
      circ(c, 0, -34, 2.5);
      c.fillStyle = '#607d8b';
      c.fillRect(-7, -12, 14, 2);
    },
    slime(c, t, col) {
      const j = Math.sin(t * 7);
      const g = c.createLinearGradient(0, -24, 0, 0);
      g.addColorStop(0, col || '#7ee26b');
      g.addColorStop(1, Art.shade(col || '#7ee26b', -40));
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-14 - j, 0);
      c.quadraticCurveTo(-15 - j, -20 + j * 2, 0, -21 + j * 2);
      c.quadraticCurveTo(15 + j, -20 + j * 2, 14 + j, 0);
      c.closePath();
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      ell(c, -6, -14 + j, 3, 4.5, -0.4);
      c.fillStyle = '#fff';
      circ(c, -1, -11 + j, 3.5);
      circ(c, 7, -11 + j, 3.5);
      c.fillStyle = '#111';
      circ(c, 0, -10.5 + j, 1.8);
      circ(c, 8, -10.5 + j, 1.8);
      c.strokeStyle = '#111';
      c.lineWidth = 1.3;
      c.beginPath(); c.arc(4, -6 + j, 2.5, 0.2, Math.PI - 0.2); c.stroke();
    },
    alien(c, t, col) {
      c.fillStyle = col || '#8be36a';
      c.strokeStyle = col || '#8be36a';
      c.lineWidth = 2;
      line(c, -4, -22, -7, -31);
      line(c, 4, -22, 7, -31);
      c.fillStyle = Math.sin(t * 5) > 0 ? '#ff6ef0' : '#fff176';
      circ(c, -7, -32, 2.5);
      circ(c, 7, -32, 2.5);
      c.fillStyle = col || '#8be36a';
      const s = Math.sin(t * 10) * 2;
      rr(c, -12, -24, 24, 20, 10);
      c.fill();
      ell(c, -7 + s, -2, 4, 2.5);
      ell(c, 7 - s, -2, 4, 2.5);
      c.fillStyle = '#fff';
      circ(c, 0, -15, 7);
      c.fillStyle = '#3949ab';
      circ(c, 1.5, -15, 4);
      c.fillStyle = '#111';
      circ(c, 2, -15, 2);
      c.fillStyle = '#fff';
      circ(c, 3, -16.5, 1);
    },
    // літаючі (центр у 0,0)
    bee(c, t) {
      const fl = Math.abs(Math.sin(t * 30));
      c.fillStyle = 'rgba(255,255,255,0.8)';
      ell(c, -2, -9, 6, 4 + fl * 3, -0.3);
      ell(c, 4, -9, 5, 3 + fl * 3, 0.3);
      c.fillStyle = '#ffd23f';
      ell(c, 0, 0, 12, 9);
      c.fillStyle = '#222';
      c.fillRect(-5, -8.5, 3.5, 17);
      c.fillRect(1, -8.8, 3.5, 17.6);
      tri(c, -12, -2, -18, 0, -12, 2);
      circ(c, 9, -2, 1.8);
      c.fillStyle = '#fff';
      circ(c, 9.6, -2.6, 0.7);
    },
    bat(c, t) {
      const fl = Math.sin(t * 18);
      c.fillStyle = '#6a4c93';
      c.beginPath();
      c.moveTo(-4, -2);
      c.lineTo(-18, -8 - fl * 8);
      c.lineTo(-14, 2);
      c.lineTo(-9, 0);
      c.lineTo(-6, 5);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(4, -2);
      c.lineTo(18, -8 - fl * 8);
      c.lineTo(14, 2);
      c.lineTo(9, 0);
      c.lineTo(6, 5);
      c.closePath();
      c.fill();
      c.fillStyle = '#4a3470';
      circ(c, 0, 0, 7.5);
      tri(c, -6, -4, -4, -11, -1, -6);
      tri(c, 6, -4, 4, -11, 1, -6);
      c.fillStyle = '#ffeb3b';
      circ(c, -2.5, -1, 1.8);
      circ(c, 2.5, -1, 1.8);
      c.fillStyle = '#fff';
      tri(c, -2, 3, -1, 6, 0, 3);
      tri(c, 0, 3, 1, 6, 2, 3);
    },
    fish(c, t) {
      const w = Math.sin(t * 10) * 0.25;
      c.fillStyle = '#ff9f43';
      c.save();
      c.translate(-10, 0);
      c.rotate(w);
      tri(c, 0, 0, -9, -8, -9, 8);
      c.restore();
      c.fillStyle = '#ffb35c';
      circ(c, 0, 0, 10);
      c.fillStyle = '#ff9f43';
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        tri(c, Math.cos(a) * 9, Math.sin(a) * 9, Math.cos(a + 0.2) * 13, Math.sin(a + 0.2) * 13, Math.cos(a + 0.4) * 9, Math.sin(a + 0.4) * 9);
      }
      c.fillStyle = '#fff';
      circ(c, 4, -3, 3.5);
      c.fillStyle = '#111';
      circ(c, 5, -3, 1.8);
      c.fillStyle = '#c0392b';
      ell(c, 9, 3, 2, 1.5);
    },
    bird(c, t) {
      const fl = Math.sin(t * 16);
      c.fillStyle = '#42a5f5';
      circ(c, 0, 0, 9);
      c.fillStyle = '#1e88e5';
      c.beginPath();
      c.moveTo(-3, -2);
      c.quadraticCurveTo(-8, -14 * fl, -14, -6 * fl - 2);
      c.quadraticCurveTo(-8, 2, -3, 3);
      c.fill();
      c.fillStyle = '#fff';
      ell(c, 2, 4, 5, 3.5);
      circ(c, 4, -3, 3);
      c.fillStyle = '#111';
      circ(c, 5, -3, 1.5);
      c.fillStyle = '#ffa000';
      tri(c, 8, -1, 14, 1, 8, 3);
      c.fillStyle = '#1e88e5';
      tri(c, -8, -1, -15, -4, -14, 3);
    },
    ufo(c, t) {
      c.fillStyle = 'rgba(160,240,255,0.7)';
      c.beginPath();
      c.arc(0, -3, 8, Math.PI, 0);
      c.fill();
      c.fillStyle = '#8be36a';
      circ(c, 0, -4, 3.5);
      c.fillStyle = '#111';
      circ(c, 0.8, -4.5, 1.2);
      c.fillStyle = '#9aa6b2';
      ell(c, 0, 0, 16, 5);
      c.fillStyle = '#607d8b';
      ell(c, 0, 2, 10, 2.5);
      for (let i = 0; i < 5; i++) {
        c.fillStyle = (Math.floor(t * 6) + i) % 2 ? '#ffeb3b' : '#ff5252';
        circ(c, -12 + i * 6, 0.5, 1.5);
      }
    },
  },

  shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // ---------------- Білочка: жолудь, нірка, тунель, кнопка ----------------
  acorn(c, x, y, rot = 0, s = 1) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(s, s);
    c.fillStyle = '#b5651d';
    ell(c, 0, 2, 5, 6);
    c.fillStyle = 'rgba(255,255,255,0.35)';
    ell(c, -1.8, 1, 1.4, 2.6);
    c.fillStyle = '#6d4c41';
    c.beginPath(); c.ellipse(0, -2, 6, 3.6, 0, Math.PI, 0); c.fill();
    c.fillRect(-6, -2.2, 12, 1.8);
    c.strokeStyle = '#4e342e'; c.lineWidth = 1.6;
    line(c, 0, -5, 1.5, -8);
    c.restore();
  },

  burrow(c, x, y) {
    c.fillStyle = '#5d4037';
    ell(c, x, y - 1, 14, 5);
    c.fillStyle = '#1b0f0a';
    ell(c, x, y, 10, 3.5);
    c.fillStyle = '#795548';
    circ(c, x - 13, y - 2, 2.2); circ(c, x + 12, y - 1.5, 2.6); circ(c, x + 6, y - 4, 1.6);
  },

  tunnel(c, x0, x1, y) {
    // підземний хід білочки (видно крізь землю)
    c.save();
    c.globalAlpha = 0.85;
    c.strokeStyle = '#2b1810';
    c.lineCap = 'round';
    c.lineWidth = 16;
    c.beginPath();
    c.moveTo(x0, y - 36);
    c.quadraticCurveTo(x0, y, x0 + 18, y);
    c.lineTo(x1 - 18, y);
    c.quadraticCurveTo(x1, y, x1, y - 36);
    c.stroke();
    c.globalAlpha = 0.5;
    c.strokeStyle = '#4e342e';
    c.lineWidth = 3;
    c.setLineDash([3, 7]);
    c.beginPath(); c.moveTo(x0 + 16, y + 6); c.lineTo(x1 - 16, y + 6); c.stroke();
    c.setLineDash([]);
    c.restore();
  },

  button(c, x, y, pressed) {
    c.fillStyle = '#607d8b';
    rr(c, x - 12, y - 6, 24, 6, 2); c.fill();
    const h = pressed ? 2 : 7;
    c.fillStyle = pressed ? '#2e7d32' : '#e53935';
    rr(c, x - 9, y - 6 - h, 18, h + 1, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.fillRect(x - 6, y - 5 - h, 8, 1.6);
  },

  projectile(c, x, y, col, t) {
    c.save();
    c.shadowColor = col; c.shadowBlur = 8;
    c.fillStyle = col;
    circ(c, x, y, 6 + Math.sin(t * 20) * 0.6);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    circ(c, x - 2, y - 2, 2);
  },

  // ---------------- Предмети ----------------
  banana(c, x, y, t, s = 1) {
    c.save();
    c.translate(x, y + Math.sin(t * 3) * 1.5);
    c.rotate(Math.sin(t * 2.5) * 0.18 - 0.2);
    c.scale(s, s);
    c.fillStyle = '#ffe135';
    c.strokeStyle = '#c99a00';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-10, -5);
    c.quadraticCurveTo(-2, 9, 10, -6);
    c.quadraticCurveTo(0, 2, -10, -5);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.6)';
    c.beginPath();
    c.moveTo(-6, -2);
    c.quadraticCurveTo(-1, 4, 5, 0);
    c.quadraticCurveTo(-1, 2.5, -6, -2);
    c.fill();
    c.fillStyle = '#6b4a1a';
    c.fillRect(9, -9, 2.4, 4);
    circ(c, -10, -5, 1.3);
    c.restore();
  },

  heart(c, x, y, s, col) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = col || '#ff3b5c';
    c.beginPath();
    c.moveTo(0, 9);
    c.bezierCurveTo(-14, 0, -11, -12, 0, -5);
    c.bezierCurveTo(11, -12, 14, 0, 0, 9);
    c.fill();
    if (!col || col === '#ff3b5c') {
      c.fillStyle = 'rgba(255,255,255,0.6)';
      ell(c, -5, -4, 2.5, 1.6, -0.6);
    }
    c.restore();
  },

  spring(c, x, y, comp) {
    const h = 14 - comp * 6;
    c.fillStyle = '#555';
    rr(c, x - 14, y - 4, 28, 4, 1.5);
    c.fill();
    c.strokeStyle = '#9e9e9e';
    c.lineWidth = 2.5;
    c.beginPath();
    for (let i = 0; i <= 4; i++) {
      const yy = y - 4 - (h - 4) * i / 4;
      c.lineTo(x + (i % 2 ? 8 : -8), yy);
    }
    c.stroke();
    c.fillStyle = '#e53935';
    rr(c, x - 15, y - h - 4, 30, 6, 3);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.fillRect(x - 12, y - h - 3, 24, 1.5);
  },

  checkpoint(c, x, y, active, t) {
    c.fillStyle = '#6d4c41';
    rr(c, x - 8, y - 6, 16, 6, 2);
    c.fill();
    c.fillStyle = '#d7ccc8';
    c.fillRect(x - 1.5, y - 62, 3, 58);
    c.fillStyle = active ? '#ffd23f' : '#b0bec5';
    circ(c, x, y - 63, 3.5);
    const wv = Math.sin(t * 6) * 3;
    c.fillStyle = active ? '#ffd23f' : '#90a4ae';
    c.beginPath();
    c.moveTo(x + 1.5, y - 60);
    c.quadraticCurveTo(x + 14, y - 62 + wv, x + 26, y - 56 + wv);
    c.lineTo(x + 1.5, y - 44);
    c.closePath();
    c.fill();
    if (active) Art.banana(c, x + 11, y - 54, 0, 0.55);
  },

  goal(c, x, y, t) {
    // постамент
    c.fillStyle = '#8d6e63';
    rr(c, x - 22, y - 14, 44, 14, 3);
    c.fill();
    c.fillStyle = '#a1887f';
    c.fillRect(x - 20, y - 13, 40, 3);
    // жердина
    const pg = c.createLinearGradient(x - 3, 0, x + 3, 0);
    pg.addColorStop(0, '#e0e0e0');
    pg.addColorStop(1, '#9e9e9e');
    c.fillStyle = pg;
    c.fillRect(x - 3, y - 200, 6, 186);
    c.fillStyle = '#ffd23f';
    circ(c, x, y - 204, 7);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    circ(c, x - 2, y - 206, 2);
    // прапор
    c.save();
    c.translate(x + 3, y - 192);
    const g = c.createLinearGradient(0, 0, 70, 0);
    g.addColorStop(0, '#ffcd38');
    g.addColorStop(1, '#ff9f1c');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 0);
    for (let i = 0; i <= 10; i++) c.lineTo(i * 7, Math.sin(t * 5 - i * 0.6) * 4 * (i / 10));
    for (let i = 10; i >= 0; i--) c.lineTo(i * 7, 44 + Math.sin(t * 5 - i * 0.6) * 4 * (i / 10));
    c.closePath();
    c.fill();
    Art.banana(c, 34, 22 + Math.sin(t * 5 - 3) * 2, 0, 1.3);
    c.restore();
  },

  mover(c, m, th) {
    const b = th.block;
    if (th.moverStyle === 'cloud') {
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) circ(c, m.x + 12 + i * 24, m.y + 6, 11);
      c.fillStyle = '#e3ecff';
      c.fillRect(m.x + 4, m.y + 8, m.w - 8, 8);
      return;
    }
    c.fillStyle = b.dark;
    rr(c, m.x, m.y, m.w, 16, 5);
    c.fill();
    c.fillStyle = b.fill;
    rr(c, m.x, m.y, m.w, 12, 5);
    c.fill();
    c.fillStyle = b.light;
    c.fillRect(m.x + 6, m.y + 2, m.w - 12, 2.5);
    c.fillStyle = b.dark;
    for (let i = 1; i < 3; i++) circ(c, m.x + i * m.w / 3, m.y + 7.5, 1.6);
  },

  // ---------------- Декорації ----------------
  decor(c, d, t) {
    const fn = Art.decors[d.kind];
    if (!fn) return;
    c.save();
    c.translate(d.x, d.y);
    c.scale(d.s, d.s);
    fn(c, t + d.x * 0.01);
    c.restore();
  },

  decors: {
    flower(c, t) {
      c.strokeStyle = '#3e9a3a'; c.lineWidth = 2;
      const sw = Math.sin(t * 2) * 1.5;
      line(c, 0, 0, sw, -16);
      c.fillStyle = '#ff6fa8';
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + t * 0.3; circ(c, sw + Math.cos(a) * 4, -16 + Math.sin(a) * 4, 3); }
      c.fillStyle = '#ffd23f'; circ(c, sw, -16, 2.5);
    },
    flower2(c, t) {
      c.strokeStyle = '#3e9a3a'; c.lineWidth = 2;
      line(c, 0, 0, 0, -12);
      c.fillStyle = '#fff';
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; circ(c, Math.cos(a) * 3.5, -12 + Math.sin(a) * 3.5, 2.5); }
      c.fillStyle = '#ffc107'; circ(c, 0, -12, 2);
    },
    tulip(c, t) {
      c.strokeStyle = '#3e9a3a'; c.lineWidth = 2;
      line(c, 0, 0, 0, -14);
      c.fillStyle = '#e53935';
      c.beginPath(); c.moveTo(-5, -20); c.lineTo(-2.5, -15); c.lineTo(0, -20); c.lineTo(2.5, -15); c.lineTo(5, -20); c.lineTo(4, -13); c.quadraticCurveTo(0, -9, -4, -13); c.fill();
    },
    bush(c) {
      c.fillStyle = '#4caf50'; circ(c, -10, -8, 9); circ(c, 0, -13, 11); circ(c, 11, -8, 9);
      c.fillStyle = '#66bb6a'; circ(c, -3, -15, 5);
      c.fillStyle = '#e53935'; circ(c, -6, -9, 1.8); circ(c, 6, -12, 1.8); circ(c, 2, -6, 1.8);
    },
    mushroom(c) {
      c.fillStyle = '#fff3e0'; rr(c, -3, -10, 6, 10, 2); c.fill();
      c.fillStyle = '#e53935'; c.beginPath(); c.ellipse(0, -10, 10, 8, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; circ(c, -4, -13, 1.8); circ(c, 3, -15, 1.6); circ(c, 5, -11, 1.3);
    },
    fern(c, t) {
      c.strokeStyle = '#2e7d32'; c.lineWidth = 2;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(i * 5, -14, i * 9 + Math.sin(t * 2 + i) * 1.5, -18 + Math.abs(i) * 4); c.stroke(); }
    },
    stump(c) {
      c.fillStyle = '#795548'; rr(c, -9, -12, 18, 12, 2); c.fill();
      c.fillStyle = '#d7a86e'; ell(c, 0, -12, 9, 3);
      c.strokeStyle = '#a1764a'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -12, 5, 1.6, 0, 0, Math.PI * 2); c.stroke();
    },
    rock(c) {
      c.fillStyle = '#8d939a'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-9, -9); c.lineTo(-1, -13); c.lineTo(9, -8); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#b0b6bd'; tri(c, -8, -8, -1, -12, -2, -6);
    },
    shell(c) {
      c.fillStyle = '#ffccbc'; c.beginPath(); c.arc(0, 0, 8, Math.PI, 0); c.fill();
      c.strokeStyle = '#e8a090'; c.lineWidth = 1;
      for (let i = -2; i <= 2; i++) line(c, 0, 0, i * 3.5, -7 + Math.abs(i));
    },
    starfish(c) { c.fillStyle = '#ff8a65'; c.save(); c.translate(0, -5); c.rotate(0.3); star(c, 0, 0, 7, 5, 0.45); c.restore(); },
    umbrella(c) {
      c.fillStyle = '#eee'; c.fillRect(-1, -34, 2, 34);
      const cols = ['#ff5252', '#fff', '#ff5252', '#fff'];
      for (let i = 0; i < 4; i++) { c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, -36); c.arc(0, -30, 20, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); c.closePath(); c.fill(); }
    },
    cactus(c) {
      c.fillStyle = '#43a047';
      rr(c, -4, -28, 8, 28, 4); c.fill();
      rr(c, -12, -20, 5, 11, 2.5); c.fill();
      c.fillRect(-12, -12, 8, 4);
      rr(c, 7, -24, 5, 11, 2.5); c.fill();
      c.fillRect(3, -16, 8, 4);
      c.fillStyle = '#ff80ab'; circ(c, 0, -29, 2.5);
    },
    skullRock(c) { // кістка-камінь пустелі (мило)
      c.fillStyle = '#d7a65f'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-10, -10); c.lineTo(8, -12); c.lineTo(14, 0); c.fill();
    },
    tumbleweed(c, t) {
      c.save(); c.translate(0, -8); c.rotate(t * 0.5);
      c.strokeStyle = '#a1773d'; c.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(0, 0, 4 + i, i, i + 3.5); c.stroke(); }
      c.restore();
    },
    pine(c) {
      c.fillStyle = '#5d4037'; c.fillRect(-2, -8, 4, 8);
      c.fillStyle = '#2e7d4f';
      tri(c, -12, -6, 0, -26, 12, -6); tri(c, -9, -16, 0, -34, 9, -16);
    },
    snowPine(c) {
      Art.decors.pine(c);
      c.fillStyle = '#fff'; tri(c, -5, -27, 0, -34, 5, -27); tri(c, -6, -16, 0, -22, 6, -16);
    },
    snowman(c) {
      c.fillStyle = '#fff'; circ(c, 0, -9, 9); circ(c, 0, -23, 7);
      c.fillStyle = '#222'; circ(c, -2.5, -25, 1.2); circ(c, 2.5, -25, 1.2); circ(c, 0, -11, 1.2); circ(c, 0, -7, 1.2);
      c.fillStyle = '#ff8a1e'; tri(c, 0, -23, 0, -21, 7, -22);
      c.fillStyle = '#e53935'; c.fillRect(-6, -17.5, 12, 3);
      c.fillStyle = '#333'; c.fillRect(-5, -33, 10, 4); c.fillRect(-7, -30, 14, 2);
    },
    crystalIce(c) { c.fillStyle = '#b3e5fc'; tri(c, -6, 0, -2, -18, 2, 0); tri(c, 0, 0, 5, -12, 8, 0); },
    lamp(c, t) {
      c.fillStyle = '#37474f'; c.fillRect(-2, -56, 4, 56); c.fillRect(-6, -3, 12, 3);
      c.fillRect(-2, -56, 14, 3);
      c.fillStyle = '#fff59d'; ell(c, 11, -51, 5, 3);
    },
    hydrant(c) {
      c.fillStyle = '#e53935'; rr(c, -6, -18, 12, 18, 3); c.fill(); c.fillRect(-9, -12, 18, 4);
      c.fillStyle = '#b71c1c'; ell(c, 0, -18, 6, 3);
    },
    bench(c) {
      c.fillStyle = '#8d6e63'; c.fillRect(-16, -12, 32, 3); c.fillRect(-16, -20, 32, 3);
      c.fillStyle = '#455a64'; c.fillRect(-14, -12, 2.5, 12); c.fillRect(11.5, -12, 2.5, 12);
    },
    sign(c) {
      c.fillStyle = '#607d8b'; c.fillRect(-1.5, -30, 3, 30);
      c.fillStyle = '#ffd23f'; c.save(); c.translate(0, -34); c.rotate(Math.PI / 4); c.fillRect(-7, -7, 14, 14); c.restore();
      Art.banana(c, 0, -34, 0, 0.45);
    },
    neonLamp(c, t) {
      c.fillStyle = '#263238'; c.fillRect(-2, -56, 4, 56);
      c.save(); c.shadowColor = '#ff4fd8'; c.shadowBlur = 10;
      c.fillStyle = '#ff9df0'; circ(c, 0, -58, 5); c.restore();
    },
    jungleFlower(c, t) {
      c.strokeStyle = '#1b5e20'; c.lineWidth = 2; line(c, 0, 0, 0, -14);
      c.fillStyle = '#2e7d32'; ell(c, -6, -6, 6, 2.5, 0.5); ell(c, 6, -8, 6, 2.5, -0.5);
      c.fillStyle = '#ff5722';
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ell(c, Math.cos(a) * 5, -16 + Math.sin(a) * 5, 4, 2.5, a); }
      c.fillStyle = '#ffeb3b'; circ(c, 0, -16, 2.5);
    },
    bigLeaf(c, t) {
      c.fillStyle = '#388e3c';
      for (const s of [-1, 1]) { c.save(); c.rotate(s * 0.6 + Math.sin(t * 1.5) * 0.05); ell(c, 0, -14, 5, 14); c.restore(); }
      c.fillStyle = '#43a047'; ell(c, 0, -16, 5, 16);
    },
    coral(c, t) {
      c.strokeStyle = '#ff7aa2'; c.lineWidth = 4; c.lineCap = 'round';
      line(c, 0, 0, 0, -18); line(c, 0, -10, -8, -20); line(c, 0, -13, 8, -24); line(c, -8, -20, -10, -26);
    },
    coral2(c) {
      c.fillStyle = '#ffa94d'; for (let i = 0; i < 5; i++) circ(c, -8 + i * 4, -6 - (i % 2) * 5, 5);
    },
    seaweed(c, t) {
      c.strokeStyle = '#2fbf71'; c.lineWidth = 3.5; c.lineCap = 'round';
      for (const ox of [-4, 4]) {
        c.beginPath(); c.moveTo(ox, 0);
        for (let i = 1; i <= 6; i++) c.lineTo(ox + Math.sin(t * 2 + i * 0.9 + ox) * 3, -i * 6);
        c.stroke();
      }
    },
    chest(c) {
      c.fillStyle = '#8d5524'; rr(c, -12, -14, 24, 14, 2); c.fill();
      c.fillStyle = '#a0662f'; c.beginPath(); c.arc(0, -14, 12, Math.PI, 0); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-2, -16, 4, 6);
    },
    crystal(c, t) {
      c.save(); c.shadowColor = '#4ef0ff'; c.shadowBlur = 8 + Math.sin(t * 3) * 3;
      c.fillStyle = '#7df3ff'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-5, -14); c.lineTo(-1, -22); c.lineTo(3, -14); c.lineTo(2, 0); c.fill();
      c.fillStyle = '#ff8ef2'; c.beginPath(); c.moveTo(2, 0); c.lineTo(5, -10); c.lineTo(9, -14); c.lineTo(10, -5); c.lineTo(8, 0); c.fill();
      c.restore();
    },
    stalagmite(c) { c.fillStyle = '#4a3470'; tri(c, -7, 0, 0, -22, 7, 0); c.fillStyle = '#5d4590'; tri(c, -3, 0, 0, -14, 2, 0); },
    mushroomGlow(c, t) {
      c.save(); c.shadowColor = '#69f0ae'; c.shadowBlur = 10;
      c.fillStyle = '#e0f7fa'; c.fillRect(-1.5, -9, 3, 9);
      c.fillStyle = '#69f0ae'; c.beginPath(); c.ellipse(0, -9, 7, 5, 0, Math.PI, 0); c.fill();
      c.restore();
    },
    lavaRock(c, t) {
      c.fillStyle = '#3e2723'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-8, -12); c.lineTo(2, -16); c.lineTo(11, -7); c.lineTo(12, 0); c.fill();
      c.strokeStyle = `rgba(255,${120 + Math.sin(t * 4) * 40 | 0},0,0.9)`; c.lineWidth = 1.5;
      line(c, -6, -9, -1, -4); line(c, -1, -4, 4, -11);
    },
    fireFlower(c, t) {
      c.strokeStyle = '#5d4037'; c.lineWidth = 2; line(c, 0, 0, 0, -10);
      c.save(); c.shadowColor = '#ff6d00'; c.shadowBlur = 8;
      c.fillStyle = '#ff9100'; c.beginPath(); c.moveTo(-5, -10); c.quadraticCurveTo(0, -26 - Math.sin(t * 8) * 3, 5, -10); c.fill();
      c.fillStyle = '#ffd740'; c.beginPath(); c.moveTo(-2.5, -10); c.quadraticCurveTo(0, -19, 2.5, -10); c.fill();
      c.restore();
    },
    lollipop(c) {
      c.fillStyle = '#fff'; c.fillRect(-1.5, -26, 3, 26);
      c.fillStyle = '#ff4f9a'; circ(c, 0, -30, 9);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath();
      for (let a = 0; a < 12; a += 0.3) c.lineTo(Math.cos(a) * a * 0.7, -30 + Math.sin(a) * a * 0.7);
      c.stroke();
    },
    candyCane(c) {
      c.lineCap = 'round';
      c.strokeStyle = '#fff'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -24); c.arc(6, -24, 6, Math.PI, 0); c.stroke();
      c.strokeStyle = '#e53935'; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
    },
    cupcake(c) {
      c.fillStyle = '#ba68c8'; c.beginPath(); c.moveTo(-9, -10); c.lineTo(9, -10); c.lineTo(6, 0); c.lineTo(-6, 0); c.fill();
      c.fillStyle = '#fff0f6'; circ(c, -5, -12, 5); circ(c, 5, -12, 5); circ(c, 0, -16, 6);
      c.fillStyle = '#e53935'; circ(c, 0, -23, 3);
    },
    gumdrop(c) {
      c.fillStyle = '#69f0ae'; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-9, -16, 0, -16); c.quadraticCurveTo(9, -16, 9, 0); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.6)'; circ(c, -3, -10, 1.3); circ(c, 2, -6, 1.3); circ(c, 4, -12, 1.3);
    },
    cloudPuff(c) { c.fillStyle = '#ffffff'; circ(c, -8, -6, 7); circ(c, 0, -10, 9); circ(c, 9, -6, 7); },
    rainbowFlower(c, t) {
      c.strokeStyle = '#66bb6a'; c.lineWidth = 2; line(c, 0, 0, 0, -14);
      const cols = ['#ff5252', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; c.fillStyle = cols[i]; circ(c, Math.cos(a) * 4, -14 + Math.sin(a) * 4, 3); }
      c.fillStyle = '#fff'; circ(c, 0, -14, 2);
    },
    moonRock(c) {
      c.fillStyle = '#9e9eb0'; c.beginPath(); c.moveTo(-11, 0); c.lineTo(-8, -9); c.lineTo(3, -12); c.lineTo(11, -4); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#7d7d90'; circ(c, -2, -6, 2.5);
    },
    antenna(c, t) {
      c.strokeStyle = '#b0bec5'; c.lineWidth = 2; line(c, 0, 0, 0, -26); line(c, -6, 0, 0, -12); line(c, 6, 0, 0, -12);
      c.fillStyle = '#cfd8dc'; c.save(); c.translate(0, -26); c.rotate(-0.5); c.beginPath(); c.arc(0, 0, 10, 0, Math.PI); c.fill(); c.restore();
      c.fillStyle = Math.sin(t * 4) > 0 ? '#ff5252' : '#ffeb3b'; circ(c, 0, -28, 2);
    },
    flagUA(c, t) {
      c.fillStyle = '#ddd'; c.fillRect(-1, -34, 2, 34);
      const w = Math.sin(t * 4) * 2;
      c.fillStyle = '#0057b7'; c.beginPath(); c.moveTo(1, -34); c.lineTo(21, -34 + w); c.lineTo(21, -27 + w); c.lineTo(1, -27); c.fill();
      c.fillStyle = '#ffd700'; c.beginPath(); c.moveTo(1, -27); c.lineTo(21, -27 + w); c.lineTo(21, -20 + w); c.lineTo(1, -20); c.fill();
    },
  },

  // ---------------- Клітинки землі / блоків (малюються один раз у кеш) ----------------
  makeTiles(th, px) {
    const S = Math.max(4, Math.ceil(T * px));
    const mk = fn => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = S;
      const c = cv.getContext('2d');
      c.scale(S / T, S / T);
      fn(c);
      return cv;
    };
    const g = th.ground, b = th.block;
    const body = c => {
      c.fillStyle = g.body;
      c.fillRect(0, 0, T, T);
      const r = mulberry32(17);
      const tex = g.texture || 'dots';
      c.fillStyle = g.dark;
      c.strokeStyle = g.dark;
      if (tex === 'dots') {
        for (let i = 0; i < 6; i++) { rr(c, r() * 27, r() * 27, 3 + r() * 3, 2 + r() * 2, 1); c.fill(); }
      } else if (tex === 'bricks') {
        c.lineWidth = 1.5;
        line(c, 0, 16, T, 16); line(c, 0, 0.75, T, 0.75);
        line(c, 10, 0, 10, 16); line(c, 24, 16, 24, T);
      } else if (tex === 'craters') {
        for (let i = 0; i < 3; i++) { const x = 5 + r() * 22, y = 5 + r() * 22, rad = 2 + r() * 3; circ(c, x, y, rad); c.fillStyle = g.light || '#aaa'; circ(c, x + 0.8, y + 0.8, rad * 0.6); c.fillStyle = g.dark; }
      } else if (tex === 'cracks') {
        c.strokeStyle = g.glow || '#ff6d00';
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(3, 6); c.lineTo(11, 13); c.lineTo(9, 22); c.lineTo(17, 28); c.stroke();
        c.beginPath(); c.moveTo(22, 2); c.lineTo(26, 12); c.lineTo(31, 15); c.stroke();
      } else if (tex === 'puffs') {
        c.fillStyle = g.dark;
        circ(c, 8, 10, 6); circ(c, 24, 22, 7); circ(c, 4, 28, 4);
      } else if (tex === 'gems') {
        for (let i = 0; i < 4; i++) { rr(c, r() * 27, r() * 27, 3 + r() * 2, 2 + r() * 2, 1); c.fill(); }
        c.fillStyle = g.glow || '#7df3ff';
        c.save(); c.shadowColor = c.fillStyle; c.shadowBlur = 4;
        tri(c, 20, 14, 22, 8, 24, 14); tri(c, 6, 24, 7.5, 19, 9, 24);
        c.restore();
      } else if (tex === 'stripes') {
        c.lineWidth = 3;
        for (let i = -T; i < T * 2; i += 10) line(c, i, 0, i + T, T);
      }
    };
    const cap = c => {
      const st = g.style;
      c.fillStyle = g.top;
      if (st === 'grass' || st === 'jungle') {
        c.fillRect(0, 0, T, 6);
        for (let x = 0; x < T; x += 8) circ(c, x + 4, 6, 4.2);
        c.fillStyle = g.topLight || 'rgba(255,255,255,0.25)';
        c.fillRect(0, 0, T, 2);
        c.fillStyle = g.topDark;
        for (let x = 2; x < T; x += 8) tri(c, x, 3, x + 1.5, -0.5, x + 3, 3);
      } else if (st === 'snow' || st === 'frost') {
        c.fillRect(0, 0, T, 8);
        circ(c, 6, 8, 3.5); circ(c, 19, 9, 4.5); circ(c, 28, 8, 2.5);
        c.fillStyle = g.topDark;
        c.fillRect(0, 0, T, 1.5);
      } else if (st === 'candy') {
        c.fillRect(0, 0, T, 7);
        circ(c, 5, 8, 4); circ(c, 16, 10, 4); circ(c, 27, 8, 4);
        c.fillRect(13, 8, 6, 3);
        const cols = ['#fff176', '#81d4fa', '#a5d6a7', '#fff'];
        for (let i = 0; i < 5; i++) { c.fillStyle = cols[i % 4]; c.fillRect(3 + i * 6, 2 + (i % 2) * 2, 3, 1.5); }
      } else if (st === 'cloud') {
        c.fillRect(0, 0, T, 6);
        circ(c, 6, 6, 6); circ(c, 18, 7, 7); circ(c, 29, 5, 5);
      } else if (st === 'road') {
        c.fillRect(0, 0, T, 7);
        c.fillStyle = g.topDark;
        c.fillRect(0, 7, T, 2);
        c.fillRect(15, 0, 1.5, 7);
        c.fillStyle = 'rgba(255,255,255,0.35)';
        c.fillRect(0, 0, T, 1.5);
      } else {
        // sand / stone / moon / lava / crystal / coral
        c.fillRect(0, 0, T, 6);
        c.fillStyle = g.topDark;
        c.fillRect(0, 5, T, 2);
        c.fillStyle = g.topLight || 'rgba(255,255,255,0.3)';
        c.fillRect(0, 0, T, 1.5);
        if (st === 'coral') { c.fillStyle = '#ff8fb1'; circ(c, 8, 3, 1.5); c.fillStyle = '#fff'; circ(c, 22, 3, 1.2); }
        if (st === 'crystal') { c.fillStyle = g.glow; c.save(); c.shadowColor = g.glow; c.shadowBlur = 5; tri(c, 7, 1, 9, -4, 11, 1); c.restore(); }
      }
    };
    const bevel = (c, fill, light, dark) => {
      c.fillStyle = dark;
      rr(c, 0, 0, T, T, 4); c.fill();
      c.fillStyle = fill;
      rr(c, 1, 1, T - 2, T - 3.5, 3.5); c.fill();
      c.fillStyle = light;
      c.fillRect(4, 2.5, T - 8, 2.5);
      c.fillRect(2.5, 4, 2.5, T - 10);
    };
    const tiles = {
      top: mk(c => { body(c); cap(c); }),
      fill: mk(body),
      block: mk(c => {
        bevel(c, b.fill, b.light, b.dark);
        if (b.bricks) {
          c.strokeStyle = b.dark; c.lineWidth = 1.5;
          line(c, 2, 15, T - 2, 15); line(c, 16, 2, 16, 15); line(c, 9, 15, 9, T - 3); line(c, 24, 15, 24, T - 3);
        } else {
          c.fillStyle = b.dark;
          circ(c, 6, 6, 1.4); circ(c, T - 6, 6, 1.4); circ(c, 6, T - 8, 1.4); circ(c, T - 6, T - 8, 1.4);
        }
      }),
      box: mk(c => {
        bevel(c, '#ffc83d', '#ffe48a', '#c98a00');
        Art.banana(c, 16, 16, 0, 0.95);
        c.fillStyle = '#c98a00';
        circ(c, 5, 5, 1.4); circ(c, T - 5, 5, 1.4); circ(c, 5, T - 7, 1.4); circ(c, T - 5, T - 7, 1.4);
      }),
      used: mk(c => {
        bevel(c, '#a47148', '#c08a5c', '#6e4526');
        c.fillStyle = '#6e4526';
        circ(c, 5, 5, 1.4); circ(c, T - 5, 5, 1.4); circ(c, 5, T - 7, 1.4); circ(c, T - 5, T - 7, 1.4);
      }),
      spike: mk(c => {
        // шипи: стоять на землі в нижній частині клітинки
        c.fillStyle = '#5f6670';
        c.fillRect(1, T - 5, T - 2, 5);
        for (let i = 0; i < 4; i++) {
          const x = 1 + i * 7.5;
          const g = c.createLinearGradient(x, 0, x + 7.5, 0);
          g.addColorStop(0, '#f1f3f5');
          g.addColorStop(1, '#9aa3ad');
          c.fillStyle = g;
          tri(c, x, T - 4, x + 3.75, T - 19, x + 7.5, T - 4);
        }
        c.fillStyle = '#e53935';
        for (let i = 0; i < 4; i++) circ(c, 1 + i * 7.5 + 3.75, T - 18, 1.1);
      }),
      crumble: mk(c => {
        bevel(c, Art.shade(b.fill, -10), b.light, b.dark);
        c.strokeStyle = b.dark;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(4, 9); c.lineTo(12, 15); c.lineTo(9, 24);
        c.moveTo(12, 15); c.lineTo(21, 12); c.lineTo(27, 19);
        c.moveTo(21, 12); c.lineTo(19, 4);
        c.moveTo(15, 28); c.lineTo(18, 21); c.lineTo(25, 26);
        c.stroke();
        c.fillStyle = 'rgba(0,0,0,0.18)';
        c.fillRect(2, T - 6, T - 4, 3);
      }),
      gate: mk(c => {
        // ворота, які відчиняє білочка: дерев'яні дошки з металевими смугами
        c.fillStyle = '#6d4c41';
        c.fillRect(0, 0, T, T);
        c.fillStyle = '#8d6e63';
        for (let i = 0; i < 3; i++) c.fillRect(2 + i * 10, 0, 8, T);
        c.fillStyle = '#5d4037';
        c.fillRect(0, 0, 2, T); c.fillRect(T - 2, 0, 2, T);
        c.fillStyle = '#90a4ae';
        c.fillRect(0, 12, T, 4);
        c.fillStyle = '#546e7a';
        circ(c, 5, 14, 1.3); circ(c, 16, 14, 1.3); circ(c, 27, 14, 1.3);
      }),
      gateSign: mk(c => {
        // нижня дошка воріт зі знаком білочки
        c.fillStyle = '#6d4c41'; c.fillRect(0, 0, T, T);
        c.fillStyle = '#8d6e63';
        for (let i = 0; i < 3; i++) c.fillRect(2 + i * 10, 0, 8, T);
        c.fillStyle = '#fff3e0'; circ(c, 16, 15, 10);
        c.strokeStyle = '#e2771f'; c.lineWidth = 2; c.beginPath(); c.arc(16, 15, 10, 0, Math.PI * 2); c.stroke();
        Art.acorn(c, 16, 16, 0, 1.1);
      }),
      belt: mk(c => {
        c.fillStyle = '#37474f';
        rr(c, 0, 1, T, T - 2, 6); c.fill();
        c.fillStyle = '#263238';
        c.fillRect(0, 8, T, T - 12);
        c.fillStyle = '#90a4ae';
        circ(c, 8, 18, 5); circ(c, 24, 18, 5);
        c.fillStyle = '#546e7a';
        circ(c, 8, 18, 2); circ(c, 24, 18, 2);
        c.fillStyle = '#455a64';
        c.fillRect(0, 1, T, 6);
      }),
      bounce: mk(c => {
        const bc = th.bounce || { fill: '#ff6fb5', dark: '#c2407e', light: '#ffc1df' };
        c.fillStyle = bc.dark;
        rr(c, 0, 2, T, T - 2, 8); c.fill();
        c.fillStyle = bc.fill;
        rr(c, 1, 2, T - 2, T - 7, 8); c.fill();
        c.fillStyle = bc.light || 'rgba(255,255,255,0.6)';
        ell(c, 10, 9, 6, 3, -0.2);
        c.fillStyle = 'rgba(255,255,255,0.85)';
        // стрілочки «вгору»
        tri(c, 16, 12, 11, 19, 21, 19);
        tri(c, 16, 18, 11, 25, 21, 25);
      }),
      oneway: mk(c => {
        const o = th.oneway;
        if (o.style === 'cloud') {
          c.fillStyle = o.dark; circ(c, 8, 9, 8); circ(c, 24, 9, 8); c.fillRect(0, 5, T, 8);
          c.fillStyle = o.fill; circ(c, 8, 7, 7.5); circ(c, 24, 7, 7.5); c.fillRect(0, 3, T, 7);
        } else {
          c.fillStyle = o.dark; rr(c, 0, 0, T, 12, 3); c.fill();
          c.fillStyle = o.fill; rr(c, 0, 0, T, 9, 3); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(3, 1.5, T - 6, 2);
          c.fillStyle = o.dark; c.fillRect(6, 12, 3, 6); c.fillRect(T - 9, 12, 3, 6);
        }
      }),
    };
    return tiles;
  },
};
