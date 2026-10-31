'use strict';
// MISC-пакет: 16 різних світів (острів, квіти, цирк, каток, шоколад, дахи, гарбузи, Новий рік,
// годинникова вежа, сни, аркада, загублене місто, оазис, льодовик, лавова печера, райдужний водоспад).
// Нові вороги й декорації мають префікс «m». Нічого наявного не перезаписуємо.
(function () {
  const TAU = Math.PI * 2;
  const addTo = (obj, add) => { for (const k in add) if (!(k in obj)) obj[k] = add[k]; };
  const pick = (arr, v) => arr[Math.floor(v * arr.length) % arr.length];
  const sh = (col, a) => Art.shade(col, a);

  // ---------- маленькі помічники ----------
  function eye(c, x, y, r, look = 0.35) {
    c.fillStyle = '#fff'; circ(c, x, y, r);
    c.fillStyle = '#1a1a1a'; circ(c, x + r * look, y + r * 0.08, r * 0.58);
    c.fillStyle = '#fff'; circ(c, x + r * look + r * 0.24, y - r * 0.24, r * 0.22);
  }
  function sleepy(c, x, y, r, col = '#2a1a3a') {
    c.strokeStyle = col; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y - r * 0.3, r, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
  }
  function smile(c, x, y, r, col = '#3a1a10', lw = 1.4) {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, r, 0.2, Math.PI - 0.2); c.stroke();
  }
  function blush(c, x, y, r = 1.8) { c.fillStyle = 'rgba(255,105,135,0.5)'; circ(c, x, y, r); }
  function legs(c, t, xs, col, h = 5, w = 3.6, sp = 12) {
    c.fillStyle = col;
    xs.forEach((x, i) => { const s = Math.sin(t * sp + i * Math.PI) * 1.8; rr(c, x + s - w / 2, -h, w, h, 1.4); c.fill(); });
  }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function gearShape(c, x, y, R, n, col, hole, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = col;
    for (let i = 0; i < n; i++) { c.save(); c.rotate(i * TAU / n); c.fillRect(-R * 0.17, -R * 1.2, R * 0.34, R * 0.42); c.restore(); }
    circ(c, 0, 0, R);
    if (hole) { c.fillStyle = hole; circ(c, 0, 0, R * 0.32); }
    c.restore();
  }
  // декорація в масштабі на фоні
  function dec(c, name, x, y, s, t = 0) {
    const fn = Art.decors[name]; if (!fn) return;
    c.save(); c.translate(x, y); c.scale(s, s); fn(c, t); c.restore();
  }
  // піксельний малюнок: рядки з символів, '.' — порожньо
  function pix(c, rows, x0, y0, p, pal) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i]; if (ch === '.' || !pal[ch]) continue;
      c.fillStyle = pal[ch]; c.fillRect(x0 + i * p, y0 + j * p, p + 0.3, p + 0.3);
    }
  }
  function haze(c, w, y, col) {
    const g = c.createLinearGradient(0, y - 60, 0, y + 10);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, col);
    c.fillStyle = g; c.fillRect(0, y - 60, w, 70);
  }
  // місяць-серпик без «фарбування фоном»: внутрішнє коло вирізаємо кліпом
  function crescent(c, x, y, r, col, k = 0.85, ox = 0.45, oy = -0.2) {
    c.save();
    c.beginPath(); c.rect(x - r * 3, y - r * 3, r * 6, r * 6); c.arc(x + r * ox, y + r * oy, r * k, 0, TAU, true);
    c.clip('evenodd');
    c.fillStyle = col; circ(c, x, y, r);
    c.restore();
  }
  function stripeBunting(c, w, y0, amp, period, cols, seg = 26) {
    seg = w / Math.max(1, Math.round(w / seg));
    c.strokeStyle = 'rgba(80,50,40,0.6)'; c.lineWidth = 1.3;
    const Y = x => y0 + Math.abs(Math.sin(x / period * Math.PI)) * amp;
    c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, Y(x)); c.stroke();
    for (let x = seg / 2, i = 0; x < w; x += seg, i++) { c.fillStyle = cols[i % cols.length]; const y = Y(x); tri(c, x - 8, y, x + 8, y, x, y + 14); }
  }
  function bulbs(c, w, y0, amp, period, cols, step = 22, r = 3.2) {
    step = w / Math.max(1, Math.round(w / step));
    c.strokeStyle = 'rgba(40,40,40,0.55)'; c.lineWidth = 1.2;
    const Y = x => y0 + Math.abs(Math.sin(x / period * Math.PI)) * amp;
    c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, Y(x)); c.stroke();
    for (let x = step / 2, i = 0; x < w; x += step, i++) {
      const col = cols[i % cols.length], y = Y(x) + r + 1;
      c.save(); c.shadowColor = col; c.shadowBlur = 8; c.fillStyle = col; ell(c, x, y, r * 0.8, r); c.restore();
    }
  }

  // ======================= Вороги =======================
  addTo(Art.enemies, {
    // ---- ходунці (дивляться праворуч, точка — низ ніг) ----
    mCoconut(c, t, col) {
      col = col || '#8a5a32';
      legs(c, t, [-5, 5], '#5d3a1c', 5, 4.2);
      const b = Math.abs(Math.sin(t * 8)) * 1.2, y = -16 - b;
      c.fillStyle = col; circ(c, 0, y, 12);
      c.strokeStyle = sh(col, -28); c.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.6; line(c, Math.cos(a) * 8, y + Math.sin(a) * 8, Math.cos(a) * 11.5, y + Math.sin(a) * 11.5 + 1); }
      c.fillStyle = sh(col, 35); ell(c, -5, y - 5, 4, 2.6, -0.6);
      c.fillStyle = '#3a2410'; circ(c, -6, y + 3, 1.3); circ(c, -3, y + 6, 1.1);
      eye(c, 3, y - 1, 3.2); eye(c, 9.5, y - 1, 2.7);
      smile(c, 6.5, y + 3.5, 3, '#2a1608');
      blush(c, 11, y + 4, 1.5);
      const sw = Math.sin(t * 3) * 0.2;
      c.save(); c.translate(0, y - 11); c.rotate(sw);
      c.fillStyle = '#3fae3a'; ell(c, -5, -3, 6, 2.2, 0.5); ell(c, 5, -3, 6, 2.2, -0.5); ell(c, 0, -5, 2.2, 5);
      c.restore();
    },
    mCaterpillar(c, t, col) {
      col = col || '#7bd148';
      const seg = [-13, -7, -1, 5];
      seg.forEach((x, i) => {
        const b = Math.max(0, Math.sin(t * 9 - i * 1.1)) * 3;
        c.fillStyle = '#5b3b8f'; ell(c, x, -1.2, 1.8, 1.2);
        c.fillStyle = i % 2 ? col : sh(col, -22); circ(c, x, -7 - b, 6.2);
        c.fillStyle = 'rgba(255,255,255,0.35)'; circ(c, x - 1.8, -9.5 - b, 1.8);
        c.fillStyle = '#ffd23f'; circ(c, x, -11.5 - b, 1.1);
      });
      const hb = Math.max(0, Math.sin(t * 9 - 4.4)) * 2;
      c.fillStyle = col; circ(c, 11, -12 - hb, 8);
      c.strokeStyle = '#3d2b1f'; c.lineWidth = 1.4;
      line(c, 9, -19 - hb, 7, -25 - hb); line(c, 14, -19 - hb, 16, -25 - hb);
      c.fillStyle = '#ff5c8a'; circ(c, 7, -25.5 - hb, 1.8); circ(c, 16, -25.5 - hb, 1.8);
      eye(c, 11, -14 - hb, 2.6); eye(c, 16, -14 - hb, 2.3);
      smile(c, 14, -10 - hb, 2.4); blush(c, 9, -9.5 - hb, 1.4);
    },
    mClownBot(c, t, col) {
      col = col || '#7e57c2';
      const s = Math.sin(t * 12);
      // великі черевики
      c.fillStyle = '#e53935';
      ell(c, -5 + s * 2.5 + 2, -2.2, 6, 2.8); ell(c, 5 - s * 2.5 + 2, -2.2, 6, 2.8);
      c.fillStyle = col; rr(c, -9, -17, 18, 13, 6); c.fill();
      c.fillStyle = '#ffd23f'; circ(c, -4, -12, 1.6); circ(c, 3, -8, 1.6); circ(c, 4, -14, 1.4);
      // комір
      c.fillStyle = '#fff';
      for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 5; ell(c, Math.cos(a) * 9, -17 + Math.sin(a) * 2, 3.5, 2.6); }
      // голова
      c.fillStyle = '#fff4e8'; circ(c, 1, -24, 7.5);
      c.fillStyle = '#29b6f6'; circ(c, -7, -26, 4); circ(c, -6, -21, 3.4); circ(c, 8.5, -27.5, 2.6);
      eye(c, 2.5, -26, 2.2); eye(c, 7, -26, 2);
      c.fillStyle = '#ff1744'; circ(c, 8.5, -22.5, 2.6);
      c.fillStyle = 'rgba(255,255,255,0.7)'; circ(c, 7.8, -23.4, 0.8);
      smile(c, 4, -21, 3.2, '#c62828', 1.6);
      // капелюшок
      c.fillStyle = '#ffd23f'; tri(c, -4, -30, 4, -31, 1, -40);
      c.fillStyle = '#ff4081'; circ(c, 1, -40.5, 2);
    },
    mPenguinSkater(c, t, col) {
      col = col || '#26355a';
      const g = Math.sin(t * 5);
      // ковзани
      c.fillStyle = '#b0bec5'; c.fillRect(-9 + g * 2, -1.6, 9, 1.6); c.fillRect(1 - g * 2, -1.6, 9, 1.6);
      c.fillStyle = '#ff8f00'; ell(c, -4.5 + g * 2, -3.5, 4, 2); ell(c, 5.5 - g * 2, -3.5, 4, 2);
      c.save(); c.translate(0, -3); c.rotate(0.12);
      c.fillStyle = col; ell(c, 0, -13, 10, 13);
      c.fillStyle = '#fff'; ell(c, 3, -11, 6.5, 10);
      c.fillStyle = col; ell(c, -9, -12 + g, 3, 7, 0.5);
      eye(c, 3, -20, 2.2); eye(c, 7.5, -20, 2);
      c.fillStyle = '#ffa000'; tri(c, 8.5, -18, 15, -16.5, 8.5, -15);
      blush(c, 2, -16, 1.3);
      // шарф
      c.fillStyle = '#e53935'; rr(c, -8, -12.5, 16, 3.5, 1.7); c.fill();
      c.save(); c.translate(-7, -11); c.rotate(-0.4 + Math.sin(t * 10) * 0.25);
      c.fillRect(-9, -1.5, 9, 3.2); c.fillStyle = '#fff'; c.fillRect(-5, -1.5, 1.5, 3.2); c.restore();
      c.fillStyle = '#fff'; c.fillRect(-2, -12.5, 1.5, 3.5); c.fillRect(3, -12.5, 1.5, 3.5);
      // шапочка
      c.fillStyle = '#e53935'; c.beginPath(); c.arc(1, -23, 6.5, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-5.5, -24, 13, 2.4); circ(c, 1, -30.5, 2.4);
      c.restore();
    },
    mChocoBlob(c, t, col) {
      col = col || '#7b4a2e';
      const j = Math.sin(t * 7) * 1.2;
      // кругла шоколадна цукерка-желе з рожевою глазур'ю та вишенькою
      const g = c.createLinearGradient(0, -24, 0, 0);
      g.addColorStop(0, sh(col, 30)); g.addColorStop(1, sh(col, -25));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-14 - j, 0);
      c.quadraticCurveTo(-15 - j, -22 + j, 0, -22 + j);
      c.quadraticCurveTo(15 + j, -22 + j, 14 + j, 0); c.closePath(); c.fill();
      c.fillStyle = sh(col, -30); ell(c, 0, -0.5, 13 + j, 1.6);
      // глазур з патьоками
      c.fillStyle = '#ff9ec7';
      c.beginPath(); c.moveTo(-11.5 - j * 0.7, -12 + j);
      c.quadraticCurveTo(-12, -22 + j, 0, -22 + j); c.quadraticCurveTo(12, -22 + j, 11.5 + j * 0.7, -12 + j);
      const dr = [[9, -9], [5, -13], [1, -8], [-3, -12.5], [-7, -9.5]];
      for (const [x, y] of dr) { c.quadraticCurveTo(x + 2, y + j, x, y + j); c.quadraticCurveTo(x - 1.5, -13 + j, x - 2, -13 + j); }
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -6, -18 + j, 3, 1.4, -0.3);
      const sp = ['#fff176', '#81d4fa', '#a5d6a7', '#ffffff'];
      [[-7, -15], [-2, -19], [4, -17], [8, -14], [-4, -14.5]].forEach(([x, y], i) => { c.save(); c.translate(x, y + j); c.rotate(i * 1.3); c.fillStyle = sp[i % 4]; c.fillRect(-1.5, -0.6, 3, 1.2); c.restore(); });
      c.strokeStyle = '#3e8e2f'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, -24 + j); c.quadraticCurveTo(2, -28 + j, 4, -29 + j); c.stroke();
      c.fillStyle = '#e53935'; circ(c, 0.5, -24 + j, 2.6); c.fillStyle = 'rgba(255,255,255,0.7)'; circ(c, -0.3, -24.8 + j, 0.8);
      eye(c, 3, -7 + j * 0.5, 2.7); eye(c, 9, -7 + j * 0.5, 2.4);
      smile(c, 6, -3.5 + j * 0.5, 2.2, '#2a1006');
      blush(c, 0, -3.5 + j * 0.5, 1.4);
    },
    mRoofCat(c, t, col) {
      col = col || '#8e8ea0';
      const s = Math.sin(t * 12);
      c.fillStyle = sh(col, -30);
      for (const [x, p] of [[-9, 0], [-4, Math.PI], [5, Math.PI], [9, 0]]) { const o = Math.sin(t * 12 + p) * 1.6; rr(c, x + o - 1.8, -6, 3.6, 6, 1.5); c.fill(); }
      // хвіст
      c.strokeStyle = col; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-11, -10); c.quadraticCurveTo(-19, -12, -17 + Math.sin(t * 4) * 2, -24); c.stroke();
      c.fillStyle = col; ell(c, -1, -10, 12, 6.5);
      c.fillStyle = sh(col, -22); c.fillRect(-6, -16, 2, 5); c.fillRect(-1, -16.5, 2, 5); c.fillRect(-11, -14, 2, 4);
      c.fillStyle = '#f4f1ee'; ell(c, 3, -7, 6, 3);
      // голова
      c.fillStyle = col; circ(c, 10, -16 + s * 0.4, 7);
      tri(c, 4.5, -19, 6, -27, 10, -21); tri(c, 10, -21, 15, -27, 16, -18.5);
      c.fillStyle = '#ffb3c6'; tri(c, 6, -20.5, 6.8, -25, 9, -21.5); tri(c, 11.5, -21.5, 14.6, -25, 14.8, -19.5);
      eye(c, 9.5, -17, 2.2, 0.4); eye(c, 14, -17, 2, 0.4);
      c.fillStyle = '#ff7aa0'; tri(c, 15.5, -13.5, 17.5, -13.5, 16.5, -12);
      c.strokeStyle = 'rgba(60,60,60,0.6)'; c.lineWidth = 0.8;
      line(c, 15, -12, 21, -13); line(c, 15, -11.5, 21, -10);
    },
    mPumpkinKid(c, t, col) {
      col = col || '#ff8f1f';
      legs(c, t, [-5, 5], '#4e7d2a', 5, 3.6);
      const b = Math.abs(Math.sin(t * 9)) * 1.4, y = -14 - b;
      c.fillStyle = sh(col, -30); ell(c, -6, y, 6.5, 9.5); ell(c, 6, y, 6.5, 9.5);
      c.fillStyle = col; ell(c, 0, y, 7.5, 10);
      c.fillStyle = sh(col, 25); ell(c, -8, y - 3, 2.4, 5, 0.2);
      c.fillStyle = '#5d4037'; rr(c, -1.5, y - 14, 3.5, 5, 1); c.fill();
      c.fillStyle = '#7cb342'; ell(c, -5, y - 11.5, 5, 2.2, 0.4);
      c.strokeStyle = '#7cb342'; c.lineWidth = 1.2; c.beginPath(); c.arc(4, y - 12, 2.5, Math.PI, TAU * 0.9); c.stroke();
      // мила мордочка
      c.fillStyle = '#5a2a00'; ell(c, 3, y - 2.5, 2.2, 2.6); ell(c, 9, y - 2.5, 1.9, 2.4);
      c.fillStyle = '#ffe9a8'; circ(c, 3.6, y - 3.5, 0.8); circ(c, 9.5, y - 3.5, 0.7);
      c.fillStyle = '#5a2a00'; c.beginPath(); c.moveTo(1, y + 2.5); c.quadraticCurveTo(6, y + 8, 11, y + 2.5); c.quadraticCurveTo(6, y + 5, 1, y + 2.5); c.fill();
      blush(c, 0, y + 1.5, 1.5);
    },
    mGingerbread(c, t, col) {
      col = col || '#c77a3a';
      const s = Math.sin(t * 11);
      c.fillStyle = col;
      c.save(); c.translate(-3.5, -11); c.rotate(s * 0.4); rr(c, -3, 0, 6, 11, 3); c.fill(); c.restore();
      c.save(); c.translate(3.5, -11); c.rotate(-s * 0.4); rr(c, -3, 0, 6, 11, 3); c.fill(); c.restore();
      rr(c, -6.5, -22, 13, 13, 5); c.fill();
      c.save(); c.translate(-6, -19); c.rotate(-0.9 - s * 0.3); rr(c, -2.8, -10, 5.6, 10, 2.8); c.fill(); c.restore();
      c.save(); c.translate(6, -19); c.rotate(0.9 + s * 0.3); rr(c, -2.8, -10, 5.6, 10, 2.8); c.fill(); c.restore();
      circ(c, 1, -28, 7.2);
      // глазур
      c.strokeStyle = '#fff'; c.lineWidth = 1.3; c.lineCap = 'round';
      c.beginPath(); for (let x = -4; x <= 4; x += 2) c.lineTo(x - 0.5, -12.5 + (x / 2 % 2 ? 1 : -1)); c.stroke();
      c.fillStyle = '#e53935'; circ(c, 0.5, -19, 1.5); c.fillStyle = '#43a047'; circ(c, 0.5, -15, 1.5);
      c.fillStyle = '#2b1606'; circ(c, 1.5, -29.5, 1.4); circ(c, 6, -29.5, 1.3);
      c.fillStyle = '#fff'; circ(c, 1.9, -30, 0.5); circ(c, 6.4, -30, 0.5);
      smile(c, 4, -26.5, 2.6, '#fff', 1.3);
      blush(c, -1.5, -26, 1.4); blush(c, 8, -26, 1.2);
    },
    mClockMouse(c, t, col) {
      col = col || '#9aa7b4';
      const w = t * 9;
      // колеса
      c.fillStyle = '#5d4037'; circ(c, -6, -3, 3); circ(c, 6, -3, 3);
      c.strokeStyle = '#d7a64a'; c.lineWidth = 1;
      for (const x of [-6, 6]) line(c, x - Math.cos(w) * 2.4, -3 - Math.sin(w) * 2.4, x + Math.cos(w) * 2.4, -3 + Math.sin(w) * 2.4);
      // хвостик
      c.strokeStyle = '#d7a64a'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-12, -6); c.bezierCurveTo(-18, -4, -18, -12, -14, -11); c.stroke();
      // тіло-краплинка
      const g = c.createLinearGradient(0, -20, 0, -2);
      g.addColorStop(0, sh(col, 40)); g.addColorStop(1, sh(col, -30));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-12, -5); c.quadraticCurveTo(-12, -20, 2, -18); c.quadraticCurveTo(12, -16, 16, -7); c.quadraticCurveTo(10, -4, -12, -5); c.fill();
      c.strokeStyle = sh(col, -40); c.lineWidth = 0.8; line(c, -4, -18, -4, -5); line(c, 3, -17.5, 3, -5);
      c.fillStyle = '#d7a64a'; for (const x of [-8, -1, 6]) circ(c, x, -6.5, 0.9);
      // вушко
      c.fillStyle = sh(col, -10); circ(c, 5, -19, 4.2); c.fillStyle = '#ffb3c6'; circ(c, 5, -19, 2.4);
      eye(c, 10, -12, 2, 0.4);
      c.fillStyle = '#ff7aa0'; circ(c, 16.2, -7.5, 1.6);
      c.strokeStyle = '#555'; c.lineWidth = 0.7; line(c, 15, -7.5, 20, -9); line(c, 15, -7, 20, -6);
      // заводний ключик
      c.save(); c.translate(-6, -17); c.fillStyle = '#d7a64a'; c.fillRect(-0.8, -4, 1.6, 4);
      c.translate(0, -5); c.scale(Math.cos(t * 6), 1);
      ell(c, -3, 0, 3, 2); ell(c, 3, 0, 3, 2); c.fillStyle = '#9b6f1e'; circ(c, 0, 0, 1.2);
      c.restore();
    },
    mSleepySheep(c, t, col) {
      col = col || '#ffffff';
      c.fillStyle = '#4a3b55';
      for (const [x, p] of [[-8, 0], [-3, Math.PI], [4, Math.PI], [8, 0]]) { const o = Math.sin(t * 8 + p) * 1.3; rr(c, x + o - 1.6, -6, 3.2, 6, 1.4); c.fill(); }
      const b = Math.sin(t * 8) * 0.6;
      c.fillStyle = sh(col, -28);
      for (const [x, y, r] of [[-9, -11, 5.5], [-3, -15, 6], [4, -14, 6], [-5, -8, 5], [5, -8, 5]]) circ(c, x, y + b + 1, r);
      c.fillStyle = col;
      for (const [x, y, r] of [[-9, -12, 5.5], [-3, -16, 6], [4, -15, 6], [-5, -9, 5], [5, -9, 5], [-1, -11, 6]]) circ(c, x, y + b, r);
      // мордочка
      c.fillStyle = '#4a3b55'; ell(c, 11, -14 + b, 5, 6, 0.2);
      c.fillStyle = col; circ(c, 9.5, -20 + b, 3.4);
      c.fillStyle = '#4a3b55'; ell(c, 7.5, -16 + b, 2.2, 1.2, -0.5);
      c.fillStyle = '#fff'; sleepy(c, 11, -14.5 + b, 1.6, '#fff'); sleepy(c, 14, -14.5 + b, 1.4, '#fff');
      c.fillStyle = '#ff9ec7'; circ(c, 13.6, -10.5 + b, 1.2);
      // нічний ковпак
      c.fillStyle = '#5c7cfa'; c.beginPath(); c.moveTo(5, -21 + b); c.quadraticCurveTo(9, -31 + b, 0, -29 + b); c.lineTo(13, -21 + b); c.fill();
      c.fillStyle = '#fff59d'; circ(c, -0.5, -29 + b, 2);
      c.fillStyle = '#fff'; rr(c, 4.5, -22.5 + b, 9, 2.6, 1.3); c.fill();
    },
    mPixelInvader(c, t, col) {
      col = col || '#39ff14';
      const f = Math.floor(t * 4) % 2;
      const rows = f ? [
        '..x.....x..',
        '...x...x...',
        '..xxxxxxx..',
        '.xxwbxxwbx.',
        'xxxxxxxxxxx',
        'x.xxxxxxx.x',
        'x.x.....x.x',
        '...xx.xx...',
      ] : [
        '..x.....x..',
        'x..x...x..x',
        'x.xxxxxxx.x',
        'xxxwbxxwbxx',
        'xxxxxxxxxxx',
        '.xxxxxxxxx.',
        '..x.....x..',
        '.x.......x.',
      ];
      c.save(); c.shadowColor = col; c.shadowBlur = 8;
      pix(c, rows, -14.3, -22 - (f ? 0 : 1), 2.6, { x: col, w: '#ffffff', b: '#111' });
      c.restore();
    },
    mStoneIdol(c, t, col) {
      col = col || '#8f9a86';
      const s = Math.sin(t * 9);
      c.fillStyle = sh(col, -35); rr(c, -9 + s * 1.5, -5, 7, 5, 1.5); c.fill(); rr(c, 2 - s * 1.5, -5, 7, 5, 1.5); c.fill();
      const b = Math.abs(s) * 1;
      c.fillStyle = sh(col, -18); rr(c, -11, -29 - b, 22, 25, 4); c.fill();
      c.fillStyle = col; rr(c, -10, -29 - b, 20, 23, 4); c.fill();
      c.fillStyle = sh(col, -30); c.fillRect(-10, -21 - b, 20, 2);
      c.fillStyle = sh(col, 25); c.fillRect(-8, -27 - b, 4, 2);
      // мох
      c.fillStyle = '#5fae3e'; circ(c, -7, -29 - b, 3); circ(c, -2, -30 - b, 3.4); circ(c, 4, -29 - b, 2.6);
      c.strokeStyle = '#4e9a32'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, -28 - b); c.quadraticCurveTo(-12, -22 - b, -10, -16 - b); c.stroke();
      // різьблене обличчя
      c.fillStyle = sh(col, -45); rr(c, 1, -19 - b, 4, 4, 1); c.fill(); rr(c, 7, -19 - b, 3, 4, 1); c.fill();
      c.fillStyle = '#7df3ff'; c.save(); c.shadowColor = '#7df3ff'; c.shadowBlur = 5; circ(c, 3.4, -17 - b, 1.2); circ(c, 8.6, -17 - b, 1); c.restore();
      c.fillStyle = sh(col, -45); c.fillRect(2, -11 - b, 8, 2.2);
      c.fillStyle = sh(col, 18); tri(c, 5, -15 - b, 9, -11.5 - b, 5, -11.5 - b);
    },
    mCamelCalf(c, t, col) {
      col = col || '#d9a35a';
      c.fillStyle = sh(col, -25);
      for (const [x, p] of [[-8, 0], [-5, Math.PI], [3, Math.PI], [6, 0]]) { const o = Math.sin(t * 10 + p) * 1.8; c.fillRect(x + o - 1.3, -9, 2.6, 9); }
      c.fillStyle = col; ell(c, -1, -12, 10, 5.5);
      c.fillStyle = sh(col, 10); ell(c, -2, -17, 6, 5.5);
      c.strokeStyle = sh(col, -40); c.lineWidth = 1.5; c.beginPath(); c.moveTo(-11, -12); c.quadraticCurveTo(-15, -10, -14, -6); c.stroke();
      // шия та голова
      c.fillStyle = col; c.beginPath(); c.moveTo(5, -14); c.quadraticCurveTo(9, -18, 9, -24); c.lineTo(13, -24); c.quadraticCurveTo(13, -16, 9, -10); c.fill();
      ell(c, 13, -25, 5.5, 3.6, 0.1);
      c.fillStyle = sh(col, -20); ell(c, 8.5, -28, 1.6, 2.4, -0.3);
      eye(c, 13, -26.5, 1.8, 0.4);
      c.strokeStyle = '#3a2410'; c.lineWidth = 1.1; line(c, 11.7, -28.8, 14.5, -28.6);
      c.fillStyle = '#5a3a1e'; circ(c, 17.6, -25.4, 0.8);
      smile(c, 16, -23.6, 1.4);
      c.fillStyle = '#e57373'; rr(c, -5, -21, 6, 3, 1.4); c.fill();
      c.fillStyle = '#ffd23f'; circ(c, -2, -18.3, 1);
    },
    mMammothCalf(c, t, col) {
      col = col || '#8d5a3c';
      c.fillStyle = sh(col, -30);
      for (const [x, p] of [[-8, 0], [-3, Math.PI], [3, Math.PI], [8, 0]]) { const o = Math.sin(t * 9 + p) * 1.5; rr(c, x + o - 2.4, -7, 4.8, 7, 1.8); c.fill(); }
      c.fillStyle = sh(col, -15); ell(c, -1, -13, 12.5, 9);
      c.fillStyle = col;
      for (let i = 0; i < 7; i++) ell(c, -11 + i * 3.5, -7 + (i % 2), 2.2, 3.4);
      ell(c, -1, -14, 12, 8.5);
      c.fillStyle = sh(col, 18); ell(c, -4, -19, 6, 2.6);
      // голова
      c.fillStyle = col; circ(c, 9, -16, 7.2);
      c.fillStyle = sh(col, -25); ell(c, 4, -15, 4, 5.5, 0.2);
      // хобот
      c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round';
      const sw = Math.sin(t * 4) * 2;
      c.beginPath(); c.moveTo(14, -13); c.quadraticCurveTo(18, -8, 16 + sw * 0.5, -4); c.quadraticCurveTo(15 + sw, -1, 19 + sw, -3); c.stroke();
      // ікла
      c.strokeStyle = '#fff6e0'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(12, -10.5); c.quadraticCurveTo(16, -6, 20, -9); c.stroke();
      eye(c, 11, -18, 1.9, 0.4);
      c.fillStyle = sh(col, 22); circ(c, 8, -23, 2.2); circ(c, 11, -23.5, 1.8); circ(c, 5.5, -22, 1.7);
    },
    mLavaTurtle(c, t, col) {
      col = col || '#ff7a1a';
      const s = Math.sin(t * 8);
      c.fillStyle = '#6b8f3a';
      for (const [x, p] of [[-8, 0], [6, Math.PI]]) { const o = Math.sin(t * 8 + p) * 1.6; rr(c, x + o - 3, -6, 6, 6, 2.5); c.fill(); }
      c.fillStyle = '#6b8f3a'; tri(c, -13, -6, -18, -4, -13, -3);
      // голова
      c.fillStyle = '#7da844'; circ(c, 13, -10 + s * 0.6, 5.5);
      eye(c, 14, -12 + s * 0.6, 2, 0.4);
      smile(c, 15, -9 + s * 0.6, 1.8, '#2e3a12');
      // панцир з обсидіану
      c.fillStyle = '#2a2230'; c.beginPath(); c.arc(-1, -5, 13, Math.PI, 0); c.fill();
      c.fillStyle = '#3d3248'; c.beginPath(); c.arc(-1, -5.5, 11, Math.PI, 0); c.fill();
      c.save(); c.shadowColor = col; c.shadowBlur = 8; c.strokeStyle = col; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-9, -6); c.lineTo(-5, -12); c.lineTo(2, -11); c.lineTo(6, -6);
      c.moveTo(-5, -12); c.lineTo(-3, -16); c.moveTo(2, -11); c.lineTo(3, -16); c.stroke();
      c.restore();
      c.fillStyle = '#1c1622'; c.fillRect(-14, -6, 26, 2.4);
      c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, -6, -13, 3, 1.4, -0.4);
    },
    mUnicorn(c, t, col) {
      col = col || '#ffffff';
      c.fillStyle = '#e1d7f2';
      for (const [x, p] of [[-8, 0], [-4, Math.PI], [4, Math.PI], [8, 0]]) { const o = Math.sin(t * 11 + p) * 1.8; c.fillRect(x + o - 1.5, -9, 3, 9); }
      c.fillStyle = '#b39ddb'; for (const [x, p] of [[-8, 0], [-4, Math.PI], [4, Math.PI], [8, 0]]) { const o = Math.sin(t * 11 + p) * 1.8; c.fillRect(x + o - 1.6, -2, 3.2, 2); }
      // хвіст-веселка
      const rb = ['#ff6b9a', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      rb.forEach((cl, i) => { c.strokeStyle = cl; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-10, -14 + i * 0.6); c.quadraticCurveTo(-18, -16 + i, -15 + Math.sin(t * 6) * 1.5, -5 + i * 0.6); c.stroke(); });
      c.fillStyle = '#c3b2ec'; ell(c, 0, -12, 12, 7);
      c.fillStyle = col; ell(c, 0, -12.4, 11, 6);
      c.fillStyle = 'rgba(200,180,255,0.35)'; ell(c, 0, -9, 9, 2.5);
      // шия + голова
      c.fillStyle = '#c3b2ec'; ell(c, 12, -24, 7, 5.5, 0.25);
      c.fillStyle = col; c.beginPath(); c.moveTo(4, -14); c.lineTo(8, -24); c.lineTo(13, -22); c.lineTo(10, -11); c.fill();
      ell(c, 12, -24, 6, 4.5, 0.25);
      c.fillStyle = '#ffd1e6'; ell(c, 16.5, -22.5, 2.6, 2.4);
      eye(c, 12, -25.5, 2, 0.4);
      blush(c, 11, -22, 1.3);
      // ріжок
      c.fillStyle = '#ffd54f'; tri(c, 10, -28, 13, -28.5, 13.5, -37);
      c.strokeStyle = '#ffb300'; c.lineWidth = 0.8; line(c, 11, -30, 13.3, -30.5); line(c, 11.8, -33, 13.4, -33.4);
      // грива
      rb.slice(0, 4).forEach((cl, i) => { c.fillStyle = cl; circ(c, 8.5 - i * 1.8, -27 + i * 3.2, 2.6); });
      c.fillStyle = '#ff9ec7'; tri(c, 9, -27.5, 8, -31.5, 11, -28.5);
    },

    // ---- літуни (центр, дивляться праворуч) ----
    mToucan(c, t) {
      const f = Math.sin(t * 14);
      c.fillStyle = '#1d1d2b'; tri(c, -10, -1, -18, 3, -16, -4);
      c.fillStyle = '#26263a'; ell(c, -2, 1, 10, 7);
      c.fillStyle = '#ffe066'; ell(c, 4, 1, 4.5, 5);
      c.fillStyle = '#1d1d2b'; c.save(); c.translate(-3, -2); c.rotate(-0.4 - f * 0.6); ell(c, -4, -5, 4.5, 9, 0.4); c.restore();
      // великий дзьоб
      c.fillStyle = '#ff8f1f'; c.beginPath(); c.moveTo(6, -4); c.quadraticCurveTo(18, -6, 21, 0); c.quadraticCurveTo(14, 1, 6, 2); c.fill();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(6, -4); c.quadraticCurveTo(13, -5.5, 16, -3); c.lineTo(6, -1); c.fill();
      c.fillStyle = '#e53935'; tri(c, 19, -1.5, 21.5, 0, 18, 0.5);
      c.fillStyle = '#6fdcff'; circ(c, 4.5, -3.5, 3);
      c.fillStyle = '#111'; circ(c, 5.2, -3.5, 1.5); c.fillStyle = '#fff'; circ(c, 5.8, -4.1, 0.5);
    },
    mBalloon(c, t) {
      const sw = Math.sin(t * 2.5) * 0.12;
      c.save(); c.rotate(sw);
      c.strokeStyle = 'rgba(80,80,80,0.8)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(-4, 17, 1, 21); c.quadraticCurveTo(4, 24, 0, 28); c.stroke();
      const g = c.createRadialGradient(-4, -6, 2, 0, 0, 14);
      g.addColorStop(0, '#ff8aa8'); g.addColorStop(1, '#e8335f');
      c.fillStyle = g; ell(c, 0, -1, 11, 13);
      c.fillStyle = '#e8335f'; tri(c, -2.5, 13, 2.5, 13, 0, 10.5);
      c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -5, -6, 2.6, 4.2, 0.4);
      eye(c, 2, -3, 2.4); eye(c, 7, -3, 2.1);
      smile(c, 5, 1, 2.6, '#7a1030');
      // маленькі крильця
      c.fillStyle = 'rgba(255,255,255,0.9)';
      const f = Math.sin(t * 16) * 0.5;
      c.save(); c.translate(-10, -2); c.rotate(-0.4 - f); ell(c, -4, 0, 5, 2.5); c.restore();
      c.save(); c.translate(10, -2); c.rotate(0.4 + f); ell(c, 4, 0, 5, 2.5); c.restore();
      c.restore();
    },
    mPigeon(c, t) {
      const f = Math.sin(t * 14);
      c.fillStyle = '#5f6878'; tri(c, -9, 0, -17, -3, -16, 4);
      c.fillStyle = '#9aa3b2'; ell(c, -1, 1, 10, 6.5);
      c.fillStyle = '#c0c8d4'; ell(c, 1, 3, 6, 3.5);
      c.fillStyle = '#7d8696'; c.save(); c.translate(-2, -1); c.rotate(-0.3 - f * 0.7); ell(c, -2, -6, 5, 9, 0.35); c.fillStyle = '#5f6878'; c.fillRect(-5, -14, 6, 2); c.restore();
      c.fillStyle = '#6a9a8a'; ell(c, 7, -2, 4, 4.4);
      c.fillStyle = '#a07ab8'; ell(c, 6.5, 0.5, 3, 2);
      c.fillStyle = '#9aa3b2'; circ(c, 9, -5, 4);
      c.fillStyle = '#ff8f3a'; circ(c, 10.3, -6, 1.6); c.fillStyle = '#111'; circ(c, 10.6, -6, 0.8);
      c.fillStyle = '#f2c6a0'; tri(c, 12.5, -5.5, 16, -4.4, 12.5, -3.8);
    },
    mBatGhost(c, t) {
      const f = Math.sin(t * 13), b = Math.sin(t * 3) * 1.5;
      c.fillStyle = '#7e57c2';
      for (const s of [-1, 1]) {
        c.save(); c.translate(s * 7, -2 + b); c.scale(s, 1); c.rotate(-f * 0.5);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, -9, 14, -4); c.quadraticCurveTo(11, -1, 12, 3); c.quadraticCurveTo(8, 0, 6, 4); c.quadraticCurveTo(3, 1, 0, 3); c.fill();
        c.restore();
      }
      c.fillStyle = 'rgba(255,255,255,0.97)';
      c.beginPath(); c.moveTo(-8, 8 + b); c.lineTo(-8, -2 + b); c.arc(0, -2 + b, 8, Math.PI, 0); c.lineTo(8, 8 + b);
      for (let i = 0; i < 4; i++) c.quadraticCurveTo(8 - i * 4 - 2, 11 + b + Math.sin(t * 8 + i) * 1.5, 8 - (i + 1) * 4, 8 + b);
      c.fill();
      c.fillStyle = '#2a1a4a'; ell(c, 1.5, -2 + b, 1.6, 2.2); ell(c, 6, -2 + b, 1.4, 2);
      c.fillStyle = '#fff'; circ(c, 2, -2.8 + b, 0.6); circ(c, 6.4, -2.8 + b, 0.5);
      c.fillStyle = '#2a1a4a'; ell(c, 4, 2.5 + b, 1.6, 1.2);
      blush(c, -1, 1 + b, 1.4); blush(c, 8, 1 + b, 1.2);
    },
    mBullfinch(c, t) {
      const f = Math.sin(t * 15);
      c.fillStyle = '#2e2e3a'; tri(c, -9, -1, -17, -3, -16, 3);
      c.fillStyle = '#7f8794'; ell(c, -1, 0, 9.5, 7);
      c.fillStyle = '#ef4b4b'; ell(c, 2.5, 2.5, 7, 5.5);
      c.fillStyle = '#f7f7f7'; ell(c, -4, 5, 3.5, 2);
      c.fillStyle = '#2e2e3a'; c.save(); c.translate(-2, -1); c.rotate(-0.3 - f * 0.7); ell(c, -2, -6, 4.6, 8.5, 0.35); c.fillStyle = '#fff'; c.fillRect(-4.5, -4, 5, 1.6); c.restore();
      c.fillStyle = '#ef4b4b'; circ(c, 7, -3, 5);
      c.fillStyle = '#1f1f28'; c.beginPath(); c.arc(7, -3.5, 5.2, Math.PI * 0.95, Math.PI * 2.1); c.fill();
      c.fillStyle = '#fff'; circ(c, 9, -3.5, 1.5); c.fillStyle = '#111'; circ(c, 9.4, -3.4, 0.9);
      c.fillStyle = '#2e2e3a'; tri(c, 11.5, -3, 15, -1.8, 11.5, -0.4);
    },
    mCuckooBird(c, t) {
      const f = Math.sin(t * 14);
      // пружинка замість ніжок
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1.2;
      c.beginPath(); for (let i = 0; i <= 6; i++) c.lineTo(-2 + (i % 2 ? 3 : -3), 6 + i * 1.6); c.stroke();
      c.fillStyle = '#1565c0'; tri(c, -9, -1, -17, -6, -16, 1);
      c.fillStyle = '#29b6f6'; ell(c, -1, 0, 10, 7);
      c.fillStyle = '#fff3c4'; ell(c, 3, 2, 6, 4.5);
      c.strokeStyle = '#ff8f00'; c.lineWidth = 0.9; for (let i = 0; i < 3; i++) line(c, 0 + i * 2.5, 0, 1.5 + i * 2.5, 5);
      c.fillStyle = '#1e88e5'; c.save(); c.translate(-2, -1); c.rotate(-0.3 - f * 0.7); ell(c, -2, -6, 4.8, 9, 0.35); c.restore();
      c.fillStyle = '#29b6f6'; circ(c, 8, -4, 5);
      eye(c, 9.5, -5, 2, 0.4);
      c.fillStyle = '#ffb300'; c.beginPath(); c.moveTo(12, -5); c.lineTo(17.5, -3.5 - Math.max(0, Math.sin(t * 5)) * 2); c.lineTo(12, -2.5); c.fill();
      c.fillStyle = '#ffb300'; tri(c, 12, -2.8, 17, -2.2, 12, -1.5);
    },
    mMagicOwl(c, t) {
      const f = Math.sin(t * 12);
      c.fillStyle = '#5e4a9e';
      for (const s of [-1, 1]) { c.save(); c.translate(s * 7, -1); c.rotate(s * (0.6 + f * 0.5)); ell(c, s * 5, 0, 7, 4); c.restore(); }
      c.fillStyle = '#7e64c8'; ell(c, 1, 1, 9, 10);
      c.fillStyle = '#c9b8ff'; ell(c, 2.5, 4, 5.5, 6);
      c.strokeStyle = '#a28ae8'; c.lineWidth = 0.9; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(2.5, 2 + i * 3, 2, 0.2, Math.PI - 0.2); c.stroke(); }
      c.fillStyle = '#fff'; circ(c, 1, -4, 3.6); circ(c, 7, -4, 3.3);
      c.fillStyle = '#ffd23f'; circ(c, 1.6, -4, 2.3); circ(c, 7.6, -4, 2.1);
      c.fillStyle = '#111'; circ(c, 2, -4, 1.2); circ(c, 8, -4, 1.1);
      c.fillStyle = '#ffa000'; tri(c, 3.5, -1.5, 5.5, -1.5, 4.5, 1.5);
      // ковпак зі зіркою
      c.fillStyle = '#3949ab'; c.beginPath(); c.moveTo(-6, -7); c.quadraticCurveTo(-4, -17, -12, -18); c.quadraticCurveTo(2, -16, 9, -8); c.fill();
      c.fillStyle = '#fff59d'; star(c, -12, -18, 2.8, 5, 0.5);
      c.fillStyle = `rgba(255,250,200,${0.5 + Math.sin(t * 6) * 0.5})`; star(c, 13, -10, 2, 4, 0.35); star(c, -14, 4, 1.6, 4, 0.35);
    },
    mPixelGhost(c, t) {
      const f = Math.floor(t * 4) % 2;
      const rows = [
        '...xxxx...',
        '.xxxxxxxx.',
        'xxxxxwbxwb',
        'xxxxxwbxwb',
        'xxxxxxxxxx',
        'xxxxxxxxxx',
        'xxxxxxxxxx',
        f ? 'xx.xxx.xxx' : 'x.xxx.xxx.',
        f ? 'x...x...x.' : '..x...x..x',
      ];
      c.save(); c.shadowColor = '#ff6ad5'; c.shadowBlur = 8;
      pix(c, rows, -13, -12 + Math.sin(t * 3) * 1.5, 2.6, { x: '#ff6ad5', w: '#ffffff', b: '#2b1cff' });
      c.restore();
    },
    mFireflyLantern(c, t) {
      const f = Math.sin(t * 22);
      const k = 0.65 + Math.sin(t * 4) * 0.35;
      glow(c, -5, 3, 16, `rgba(220,255,120,${0.45 * k})`);
      c.fillStyle = 'rgba(220,240,255,0.75)';
      c.save(); c.translate(0, -4); c.rotate(-0.5 - f * 0.5); ell(c, -2, -5, 3.4, 7, 0.3); c.restore();
      c.save(); c.translate(2, -4); c.rotate(0.4 + f * 0.5); ell(c, 2, -5, 3.4, 7, -0.3); c.restore();
      c.fillStyle = `rgb(${200 + 55 * k},255,${90 + 60 * k})`; ell(c, -5, 3, 6.5, 5);
      c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, -7, 1.5, 2, 1.4);
      c.fillStyle = '#6d4c2a'; c.fillRect(-1, -1, 2, 8); c.fillStyle = '#8d6e3c'; c.fillRect(-12, -1, 2, 8);
      c.fillStyle = '#3a4a2a'; ell(c, 4, -1, 5, 4);
      c.fillStyle = '#3a4a2a'; circ(c, 9, -2, 4);
      eye(c, 10, -3, 1.8, 0.4);
      c.strokeStyle = '#3a4a2a'; c.lineWidth = 1; line(c, 9, -5.5, 12, -10); line(c, 10, -5.5, 15, -8);
    },
    mPuffin(c, t) {
      const f = Math.sin(t * 16);
      c.fillStyle = '#ff7043'; ell(c, -5, 7, 3, 1.4); ell(c, -1, 7.5, 3, 1.4);
      c.fillStyle = '#1f2330'; tri(c, -9, -1, -16, -2, -14, 3);
      c.fillStyle = '#1f2330'; ell(c, -1, 0, 10, 7);
      c.fillStyle = '#fff'; ell(c, 2.5, 2.5, 6.5, 4.5);
      c.fillStyle = '#2b3042'; c.save(); c.translate(-2, -1); c.rotate(-0.3 - f * 0.8); ell(c, -2, -5, 4.4, 8, 0.35); c.restore();
      c.fillStyle = '#1f2330'; circ(c, 8, -4, 5.5);
      c.fillStyle = '#f2f2f2'; ell(c, 9, -3.5, 3.8, 3.4);
      c.fillStyle = '#111'; circ(c, 9.5, -4.6, 1.1);
      c.strokeStyle = '#ff5252'; c.lineWidth = 0.7; line(c, 10, -3.6, 11.5, -2.8);
      c.fillStyle = '#ff6a2a'; c.beginPath(); c.moveTo(12, -7); c.quadraticCurveTo(18, -5, 17, -1); c.lineTo(12, -1.5); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(13, -6.5, 1.3, 5);
      c.fillStyle = '#5c7cfa'; c.fillRect(12, -6.5, 1.2, 5);
    },
    mFireSprite(c, t) {
      const fl = Math.sin(t * 12) * 1.5;
      glow(c, 0, 0, 18, 'rgba(255,140,40,0.45)');
      c.fillStyle = '#ff5a1f';
      c.beginPath(); c.moveTo(-9, 4); c.quadraticCurveTo(-12, -6, -6, -8 + fl); c.quadraticCurveTo(-11, -15, -14 - fl, -17); c.quadraticCurveTo(-1, -16, 1, -10);
      c.quadraticCurveTo(4, -16, 2 + fl, -19); c.quadraticCurveTo(11, -12, 9, -3); c.quadraticCurveTo(12, 6, 0, 9); c.quadraticCurveTo(-8, 9, -9, 4); c.fill();
      c.fillStyle = '#ffb030'; c.beginPath(); c.moveTo(-6, 4); c.quadraticCurveTo(-8, -4, -2, -6 + fl * 0.5); c.quadraticCurveTo(3, -9, 6, -2); c.quadraticCurveTo(8, 6, 0, 7); c.fill();
      c.fillStyle = '#fff3b0'; ell(c, 1, 2, 4.5, 4);
      c.fillStyle = '#5a1a00'; circ(c, 1.5, 0.5, 1.2); circ(c, 5, 0.5, 1.1);
      smile(c, 3.5, 2.5, 1.6, '#5a1a00', 1);
    },
    mRainbowBird(c, t) {
      const f = Math.sin(t * 14);
      const rb = ['#ff6b9a', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      rb.forEach((cl, i) => {
        c.strokeStyle = cl; c.lineWidth = 2.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-6, -2 + i * 1.2); c.quadraticCurveTo(-14, -4 + i * 1.6 + Math.sin(t * 8 + i * 0.4) * 2, -22, 1 + i * 2.2 + Math.sin(t * 8 + i * 0.5) * 3); c.stroke();
      });
      c.fillStyle = '#ffffff'; ell(c, 0, 0, 9, 6.5);
      c.fillStyle = '#ffe3f1'; ell(c, 2, 2, 5, 3.5);
      c.fillStyle = '#f0e8ff'; c.save(); c.translate(-2, -1); c.rotate(-0.3 - f * 0.7); ell(c, -2, -6, 4.6, 8.5, 0.35); c.restore();
      c.fillStyle = '#ffffff'; circ(c, 7.5, -3.5, 4.8);
      c.fillStyle = '#ff9ec7'; tri(c, 6, -8, 8, -12, 9.5, -7.5);
      eye(c, 9, -4, 1.9, 0.4);
      blush(c, 8, -1.3, 1.2);
      c.fillStyle = '#ffb300'; tri(c, 12, -3.5, 15.5, -2.4, 12, -1.2);
    },
    mCandyFly(c, t) {
      const f = Math.sin(t * 16) * 0.35;
      c.fillStyle = '#ff9ec7';
      for (const s of [-1, 1]) { c.save(); c.translate(s * 9, 0); c.scale(s, 1); c.rotate(f);
        c.beginPath(); c.moveTo(0, 0); c.lineTo(9, -7); c.quadraticCurveTo(7, 0, 9, 7); c.closePath(); c.fill();
        c.strokeStyle = '#e8659e'; c.lineWidth = 0.8; line(c, 2, 0, 8, -4); line(c, 2, 0, 8, 4); c.restore(); }
      const g = c.createLinearGradient(0, -7, 0, 7);
      g.addColorStop(0, '#a8643a'); g.addColorStop(1, '#5d3016');
      c.fillStyle = g; ell(c, 0, 0, 10, 7.5);
      c.strokeStyle = '#ffd1e6'; c.lineWidth = 1.4;
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-6 + i * 4, -6); c.quadraticCurveTo(-4 + i * 4, 0, -7 + i * 4, 6); c.stroke(); }
      eye(c, 3, -2, 2.4); eye(c, 7.5, -2, 2);
      smile(c, 5.5, 1.8, 2, '#2a1006');
    },

    // ---- стрільці (точка — низ, «рот» праворуч на y≈-14) ----
    mTikiHead(c, t, col) {
      col = '#a0662f'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4)) ;
      c.fillStyle = sh(col, -25); rr(c, -11, -4, 22, 4, 1.5); c.fill();
      c.fillStyle = col; rr(c, -10, -32, 20, 29, 5); c.fill();
      c.fillStyle = sh(col, -22); for (const y of [-26, -9]) c.fillRect(-10, y, 20, 1.6);
      c.fillStyle = sh(col, 25); c.fillRect(-8, -30, 3, 25);
      // листя на маківці
      c.fillStyle = '#2fa84f'; ell(c, -5, -34, 6, 2.2, -0.6); ell(c, 5, -34, 6, 2.2, 0.6); ell(c, 0, -36, 2.2, 5.5);
      // брови та очі
      c.fillStyle = sh(col, -45); c.fillRect(-1, -25, 11, 2.4);
      eye(c, 2, -21, 2.6); eye(c, 7.5, -21, 2.3);
      // трубочка-рот
      c.fillStyle = sh(col, -50); ell(c, 8, -14, 3.2 + p, 3.2 + p * 0.5);
      c.fillStyle = '#c8e07a'; rr(c, 9, -16.2, 7 + p * 2, 4.4, 1.5); c.fill();
      c.fillStyle = '#7da844'; c.fillRect(13 + p * 2, -16.2, 1.4, 4.4);
      c.fillStyle = '#ff6b4a'; for (const y of [-6, -3]) circ(c, 0, y, 1.2);
    },
    mPeaFlower(c, t, col) {
      col = '#ff6fae'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.strokeStyle = '#3e9a3a'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-3, -8, 0, -12); c.stroke();
      c.fillStyle = '#4caf50'; ell(c, -6, -4, 6, 2.5, 0.4); ell(c, 6, -5, 6, 2.5, -0.4);
      c.save(); c.translate(1, -16); c.rotate(-0.1 + p * 0.05);
      c.fillStyle = col;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ell(c, Math.cos(a) * 9, Math.sin(a) * 9, 5, 3.3, a); }
      c.fillStyle = sh(col, 30); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circ(c, Math.cos(a) * 9.5, Math.sin(a) * 9.5, 1.3); }
      c.fillStyle = '#ffd23f'; circ(c, 0, 0, 7.5);
      eye(c, 0, -2, 2.2); eye(c, 4.5, -2, 2);
      // носик-трубочка
      c.fillStyle = '#ffb300'; rr(c, 4, 0.4, 8 + p * 2, 4.2, 2); c.fill();
      c.fillStyle = '#8a5a00'; ell(c, 12 + p * 2, 2.5, 1.3, 1.9);
      c.restore();
    },
    mClownCannon(c, t, col) {
      col = '#1e88e5'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4)) * 2;
      // ствол
      c.save(); c.translate(-2, -14);
      c.fillStyle = col; rr(c, -6 - p, -6, 22, 12, 4); c.fill();
      c.fillStyle = '#ffd23f'; star(c, 3 - p, 0, 3.2, 5, 0.45); circ(c, 11 - p, -3, 1.2); circ(c, 11 - p, 3, 1.2);
      c.fillStyle = sh(col, -35); rr(c, 14 - p, -7, 5, 14, 2); c.fill();
      c.fillStyle = '#1b1b2a'; ell(c, 18 - p, 0, 1.6, 4.5);
      c.restore();
      // колеса
      for (const x of [-7, 5]) {
        c.fillStyle = '#e53935'; circ(c, x, -5.5, 5.5);
        c.fillStyle = '#fff'; circ(c, x, -5.5, 2.2);
        c.strokeStyle = '#fff'; c.lineWidth = 1; const a = t * 0.5; line(c, x - Math.cos(a) * 5, -5.5 - Math.sin(a) * 5, x + Math.cos(a) * 5, -5.5 + Math.sin(a) * 5);
      }
      // клоун визирає ззаду
      c.fillStyle = '#fff4e8'; circ(c, -8, -24, 5.5);
      c.fillStyle = '#ff7043'; circ(c, -13, -26, 3); circ(c, -12, -21, 2.6);
      eye(c, -7, -25.5, 1.7); eye(c, -3.8, -25.5, 1.5);
      c.fillStyle = '#ff1744'; circ(c, -3, -22.5, 1.9);
      c.fillStyle = '#ab47bc'; tri(c, -12, -28.5, -4, -28.5, -9, -36); c.fillStyle = '#fff176'; circ(c, -9, -36.5, 1.5);
    },
    mSnowThrower(c, t, col) {
      col = '#ffffff'; // стрілець має власні кольори
      const ph = (t * 0.4) % 1, wind = ph < 0.7 ? ph / 0.7 : 1 - (ph - 0.7) / 0.3;
      c.fillStyle = '#d6e6f5'; ell(c, 0, -1, 12, 3);
      c.fillStyle = col; circ(c, -1, -9, 9.5);
      c.fillStyle = '#e3eef8'; ell(c, 1, -6, 6, 3);
      c.fillStyle = '#e53935'; circ(c, -1, -12, 1.4); circ(c, -1, -7, 1.4);
      c.fillStyle = col; circ(c, -1, -23, 7.5);
      eye(c, 0.5, -25, 1.8); eye(c, 4.5, -25, 1.6);
      c.fillStyle = '#ff8a1e'; tri(c, 4, -22.5, 4, -20.5, 11, -21.5);
      blush(c, -2.5, -20.5, 1.3);
      // шапка з помпоном
      c.fillStyle = '#43a047'; c.beginPath(); c.arc(-1, -27, 7, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; rr(c, -8.5, -28.5, 15, 3, 1.5); c.fill(); circ(c, -1, -35, 2.4);
      c.fillStyle = '#e53935'; rr(c, -7, -17.5, 13, 3, 1.5); c.fill(); c.fillRect(-7, -17, 3, 7);
      // рука-гілочка зі сніжкою
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 2; c.lineCap = 'round';
      const ax = 9 + wind * 3, ay = -14 - (1 - wind) * 8;
      line(c, 6, -13, ax, ay);
      line(c, -9, -12, -15, -17);
      c.fillStyle = '#f4fbff'; circ(c, ax + 1.5, ay - 1, 3.2);
      c.fillStyle = '#c9dcef'; circ(c, ax + 2.5, ay, 1.4);
    },
    mChocoKettle(c, t, col) {
      col = '#ff8fb1'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = sh(col, -35); rr(c, -11, -3, 22, 3, 1.5); c.fill();
      // носик
      c.fillStyle = col; c.beginPath(); c.moveTo(6, -10); c.quadraticCurveTo(13, -11, 15, -17); c.lineTo(18, -16); c.quadraticCurveTo(16, -8, 7, -5); c.fill();
      c.fillStyle = '#5d3016'; ell(c, 16.5, -16.4, 1.8, 1.2, -0.4);
      // ручка
      c.strokeStyle = sh(col, -25); c.lineWidth = 3; c.beginPath(); c.arc(-11, -14, 5, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
      c.fillStyle = col; ell(c, 0, -13, 11, 10.5);
      c.fillStyle = sh(col, 30); ell(c, -5, -18, 3, 4, -0.4);
      // шоколадна шапка
      c.fillStyle = '#6d3f22'; c.beginPath(); c.ellipse(0, -21, 9, 4, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.moveTo(-9, -21); for (let i = 0; i <= 6; i++) c.lineTo(-9 + i * 3, -21 + (i % 2 ? 3 + (i % 3) : 1)); c.lineTo(9, -21); c.fill();
      c.fillStyle = '#5d3016'; rr(c, -2.5, -28, 5, 4, 2); c.fill();
      eye(c, 2, -13, 2.4); eye(c, 7, -13, 2.1);
      smile(c, 4.5, -9, 2.4, '#5d2a1a');
      // пара
      c.fillStyle = `rgba(255,255,255,${0.5 * p})`; circ(c, 18, -21 - p * 4, 2 + p * 2);
    },
    mChimneyPuffer(c, t, col) {
      col = '#b5543a'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = col; c.fillRect(-9, -26, 18, 26);
      c.strokeStyle = sh(col, -35); c.lineWidth = 1;
      for (let y = -22, r = 0; y < 0; y += 5, r++) { line(c, -9, y, 9, y); for (let x = -9 + (r % 2) * 4.5; x < 9; x += 9) line(c, x, y, x, y + 5); }
      c.fillStyle = '#5d6d7e'; c.fillRect(-11, -30, 22, 5);
      c.fillStyle = '#3e4a57'; c.fillRect(-11, -26, 22, 1.5);
      // коліно-труба
      c.fillStyle = '#7f8c9a'; rr(c, 6, -17, 8 + p * 2, 6, 2); c.fill();
      c.fillStyle = '#9aa7b4'; c.fillRect(12 + p * 2, -18, 3, 8);
      c.fillStyle = '#2b2b33'; ell(c, 15.3 + p * 2, -14, 1, 3);
      eye(c, -4, -18, 2.4); eye(c, 1.5, -18, 2.1);
      smile(c, -1.5, -11, 2.6, '#4a1e10');
      blush(c, -6, -12, 1.4);
      c.fillStyle = `rgba(200,200,210,${0.8 - p * 0.4})`; circ(c, -2, -35 - p * 3, 3.5); circ(c, 2, -39 - p * 4, 2.6);
    },
    mJackLantern(c, t, col) {
      col = '#ff8f1f'; // стрілець має власні кольори
      const k = 0.7 + Math.sin(t * 5) * 0.3;
      glow(c, 4, -12, 20, `rgba(255,190,60,${0.35 * k})`);
      c.fillStyle = '#4e7d2a'; ell(c, -9, -1.5, 6, 2.2); ell(c, 8, -1.5, 5, 2);
      c.fillStyle = sh(col, -32); ell(c, -7, -12, 8, 11); ell(c, 7, -12, 8, 11);
      c.fillStyle = col; ell(c, 0, -12, 9, 12);
      c.fillStyle = sh(col, 22); ell(c, -10, -15, 2.5, 6);
      c.fillStyle = '#5d4037'; rr(c, -2, -28, 4, 6, 1.5); c.fill();
      c.fillStyle = '#7cb342'; ell(c, 4, -25, 4.5, 2, -0.3);
      const lit = `rgb(255,${200 + 40 * k},${80 + 60 * k})`;
      c.fillStyle = lit;
      ell(c, 2, -17, 2.4, 2.8); ell(c, 8.5, -17, 2.1, 2.6);
      // широка усмішка-рот праворуч
      c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(8, -6, 15, -14); c.quadraticCurveTo(8, -10, 0, -12); c.fill();
      c.fillStyle = col; c.fillRect(6, -12, 2, 3);
    },
    mNutcracker(c, t, col) {
      col = '#d32f2f'; // стрілець має власні кольори
      const jaw = Math.max(0, Math.sin(t * 2.4)) * 2.5;
      c.fillStyle = '#212121'; rr(c, -7, -4, 6, 4, 1.5); c.fill(); rr(c, 1, -4, 7, 4, 1.5); c.fill();
      c.fillStyle = '#eceff1'; c.fillRect(-6, -9, 4, 5); c.fillRect(2, -9, 4, 5);
      c.fillStyle = col; rr(c, -8, -19, 16, 11, 2); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-1, -19, 2, 11); c.fillRect(-8, -10, 16, 1.6);
      c.fillStyle = '#ffd23f'; circ(c, 3, -16, 0.9); circ(c, 3, -13, 0.9);
      // голова
      c.fillStyle = '#ffe0c2'; rr(c, -6, -28, 13, 10, 2); c.fill();
      eye(c, 2, -25, 1.8); eye(c, 5.5, -25, 1.6);
      c.fillStyle = '#e57373'; circ(c, 7.5, -22.5, 1.5);
      // щелепа
      c.fillStyle = '#fafafa'; c.fillRect(-6, -19.5, 13, 2);
      c.fillStyle = '#ffe0c2'; c.fillRect(1, -17 + jaw, 10, 3);
      c.fillStyle = '#3a1a10'; c.fillRect(7, -18.5, 6, 1.5 + jaw);
      c.fillStyle = '#fafafa'; c.beginPath(); c.moveTo(-6, -19); c.quadraticCurveTo(-9, -13, -5, -11); c.lineTo(-3, -19); c.fill();
      // ківер
      c.fillStyle = '#263238'; c.fillRect(-6, -38, 13, 10);
      c.fillStyle = '#ffd23f'; c.fillRect(-6, -30, 13, 2); star(c, 0.5, -34, 2.6, 5, 0.45);
      c.fillStyle = '#e53935'; ell(c, 0.5, -40, 2.5, 3);
    },
    mCuckooClock(c, t, col) {
      col = '#c9783a'; // стрілець має власні кольори
      const ph = (t * 0.42) % 1, out = ph < 0.25 ? Math.sin(ph / 0.25 * Math.PI) : 0;
      const sw = Math.sin(t * 3) * 0.35;
      // маятник
      c.save(); c.translate(-2, -6); c.rotate(sw);
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1.2; line(c, 0, 0, 0, 4);
      c.fillStyle = '#ffd23f'; circ(c, 0, 4.5, 1.8); c.restore();
      c.fillStyle = sh(col, -20); rr(c, -11, -26, 20, 21, 2); c.fill();
      c.fillStyle = col; rr(c, -10, -26, 18, 19, 2); c.fill();
      c.fillStyle = '#5d3a1e'; c.beginPath(); c.moveTo(-14, -24); c.lineTo(-1, -36); c.lineTo(12, -24); c.closePath(); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-14, -25, 26, 1.6);
      // циферблат
      c.fillStyle = '#fff8e1'; circ(c, -3, -16, 6);
      c.strokeStyle = '#5d3a1e'; c.lineWidth = 1.1; line(c, -3, -16, -3 + Math.cos(t) * 3.5, -16 + Math.sin(t) * 3.5); line(c, -3, -16, -3, -20);
      c.fillStyle = '#5d3a1e'; for (let i = 0; i < 4; i++) circ(c, -3 + Math.cos(i * Math.PI / 2) * 4.6, -16 + Math.sin(i * Math.PI / 2) * 4.6, 0.7);
      // дверцята збоку + зозуля
      c.fillStyle = '#3e2410'; rr(c, 4, -18, 5, 8, 1.5); c.fill();
      if (out > 0) {
        const bx = 6 + out * 7;
        c.strokeStyle = '#c9a24a'; c.lineWidth = 1; line(c, 5, -14, bx - 2, -14);
        c.fillStyle = '#ffcc80'; circ(c, bx, -14, 3.2);
        c.fillStyle = '#111'; circ(c, bx + 1, -15, 0.8);
        c.fillStyle = '#ff8f00'; tri(c, bx + 2.5, -15, bx + 6, -13.8, bx + 2.5, -12.8);
      }
      // гирі
      c.fillStyle = '#c9a24a'; c.fillRect(4, -7, 1, 4); ell(c, 4.5, -2, 1.6, 2.6);
    },
    mSnoreCloud(c, t, col) {
      col = '#f3e8ff'; // стрілець має власні кольори
      const br = Math.sin(t * 2.4) * 0.6;
      c.fillStyle = '#b39ddb'; rr(c, -12, -6, 24, 6, 3); c.fill();
      c.fillStyle = '#d1c4e9'; rr(c, -12, -6, 24, 3, 2); c.fill();
      c.fillStyle = sh(col, -22);
      for (const [x, y, r] of [[-8, -11, 6], [0, -17, 8], [7, -12, 6.5]]) circ(c, x, y + 1, r + br);
      c.fillStyle = col;
      for (const [x, y, r] of [[-8, -12, 6], [0, -18, 8], [7, -13, 6.5], [-2, -10, 6]]) circ(c, x, y, r + br);
      sleepy(c, 1, -16, 1.8); sleepy(c, 6.5, -16, 1.6);
      blush(c, -1, -12.5, 1.5); blush(c, 9.5, -12.5, 1.3);
      // кругленький ротик праворуч
      c.fillStyle = '#7e57c2'; ell(c, 11, -14, 2 + br, 2.4 + br);
      c.fillStyle = '#5c7cfa'; c.beginPath(); c.moveTo(-9, -24); c.quadraticCurveTo(-4, -32, 4, -25); c.lineTo(-9, -22); c.fill();
      c.fillStyle = '#fff'; circ(c, 4.5, -25, 1.8);
    },
    mPixelTurret(c, t, col) {
      col = '#00e5ff'; // стрілець має власні кольори
      const f = Math.floor(t * 2.4) % 2;
      const rows = [
        '....xxxx....',
        '...xxxxxxccc',
        '..xxwbxxxccc',
        '..xxxxxxx...',
        '.xxxxxxxxx..',
        '.yyyyyyyyy..',
        'xxxxxxxxxxx.',
        'x.x.x.x.x.x.',
        'xxxxxxxxxxx.',
      ];
      c.save(); c.shadowColor = col; c.shadowBlur = 8;
      pix(c, rows, -15, -27, 2.75, { x: col, c: f ? '#ff3cac' : '#ffffff', w: '#ffffff', b: '#111', y: '#ff3cac' });
      c.restore();
    },
    mSeedTotem(c, t, col) {
      col = '#b98a5e'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = sh(col, -30); rr(c, -11, -5, 22, 5, 1.5); c.fill();
      // нижня голова
      // нижня голова з ротом-трубкою
      c.fillStyle = sh(col, -10); rr(c, -9, -19, 18, 14, 3); c.fill();
      c.fillStyle = sh(col, -40); c.fillRect(-7, -9, 6, 2);
      c.fillStyle = sh(col, -50); rr(c, 3, -16.5, 11 + p * 2, 5, 2); c.fill();
      c.fillStyle = '#3a2a10'; ell(c, 14 + p * 2, -14, 1.2, 2);
      // верхня голова з очима
      c.fillStyle = col; rr(c, -9, -32, 18, 13, 3); c.fill();
      c.fillStyle = '#ffd23f'; c.fillRect(-9, -21, 18, 2);
      c.fillStyle = sh(col, -45); rr(c, 0, -29, 3.5, 3.5, 1); c.fill(); rr(c, 5, -29, 3.5, 3.5, 1); c.fill();
      c.fillStyle = '#9cff6a'; circ(c, 1.8, -27.3, 1); circ(c, 6.8, -27.3, 1);
      c.fillStyle = sh(col, -40); c.fillRect(1, -24.5, 8, 1.6);
      // листя й ліани
      c.fillStyle = '#3fae3a'; ell(c, -6, -33, 6, 2.5, -0.5); ell(c, 4, -34, 6, 2.5, 0.5); ell(c, -1, -36, 2.4, 5);
      c.strokeStyle = '#3fae3a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-9, -30); c.quadraticCurveTo(-13, -20, -9, -8); c.stroke();
      c.fillStyle = '#5fd14a'; ell(c, -11.5, -22, 2.6, 1.4, 0.6); ell(c, -11, -14, 2.6, 1.4, -0.6);
    },
    mCactusSpitter(c, t, col) {
      col = '#43a047'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = '#c56b3a'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-10, -7); c.lineTo(10, -7); c.lineTo(9, 0); c.fill();
      c.fillStyle = '#e08a52'; c.fillRect(-11, -9, 22, 3);
      c.fillStyle = col; rr(c, -8, -30, 16, 23, 8); c.fill();
      c.fillStyle = sh(col, 25); c.fillRect(-4, -27, 2, 18); c.fillRect(2, -27, 2, 18);
      // рука
      c.fillStyle = col; rr(c, -14, -22, 6, 10, 3); c.fill(); rr(c, -11, -15, 5, 4, 2); c.fill();
      c.fillStyle = '#fff59d'; for (const [x, y] of [[-7, -22], [6, -26], [-6, -12], [-12, -19]]) circ(c, x, y, 0.7);
      eye(c, 1, -23, 2.2); eye(c, 5.5, -23, 1.9);
      blush(c, 0, -18, 1.4);
      c.fillStyle = '#2e5e20'; ell(c, 7, -14, 2.6 + p, 2.8 + p * 0.6);
      c.fillStyle = '#ff6fae';
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; circ(c, -1 + Math.cos(a) * 3, -31 + Math.sin(a) * 3, 2.2); }
      c.fillStyle = '#ffd23f'; circ(c, -1, -31, 1.6);
    },
    mWalrus(c, t, col) {
      col = '#a1785c'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = sh(col, -25); ell(c, -12, -2, 5, 2.4, 0.3); ell(c, 4, -1.5, 6, 2.4);
      c.fillStyle = col; c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-15, -20, -2, -24); c.quadraticCurveTo(12, -26, 13, -14); c.quadraticCurveTo(13, -2, 6, 0); c.fill();
      c.fillStyle = sh(col, 20); ell(c, -6, -18, 4, 6, -0.3);
      eye(c, 3, -20, 2, 0.4); eye(c, 7.5, -20, 1.8, 0.4);
      // вусата морда
      c.fillStyle = sh(col, 15); circ(c, 8, -14, 3.6); circ(c, 13, -14, 3.6);
      c.fillStyle = '#4a2e1e'; ell(c, 10.5, -17, 2, 1.3);
      c.fillStyle = '#3a1e14'; ell(c, 16, -13 + p, 1.8 + p, 1.6 + p);
      c.strokeStyle = '#fff8e8'; c.lineWidth = 2; c.lineCap = 'round';
      line(c, 8, -11, 8.5, -4); line(c, 12, -11, 12.5, -4);
      c.fillStyle = '#5a3a28'; for (const [x, y] of [[7, -14], [9, -13], [12, -14], [14, -13]]) circ(c, x, y, 0.5);
      c.fillStyle = '#5c7cfa'; c.beginPath(); c.arc(0, -23, 6, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-6.5, -24, 13, 2.2); circ(c, 0, -30, 2);
    },
    mLavaFlower(c, t, col) {
      col = '#ff7a1a'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4)), k = 0.7 + Math.sin(t * 6) * 0.3;
      c.fillStyle = '#2a2230'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-7, -6); c.lineTo(-2, -4); c.lineTo(3, -7); c.lineTo(10, 0); c.fill();
      c.strokeStyle = '#3d3248'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-4, -10, 0, -14); c.stroke();
      c.fillStyle = '#4a3a58'; ell(c, -6, -9, 5, 2.2, 0.5); ell(c, 5, -8, 5, 2.2, -0.5);
      glow(c, 3, -18, 18, `rgba(255,120,30,${0.4 * k})`);
      c.save(); c.translate(2, -18);
      c.fillStyle = '#c62828';
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; ell(c, Math.cos(a) * 8, Math.sin(a) * 8, 5.2, 3.2, a); }
      c.fillStyle = col;
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; ell(c, Math.cos(a) * 6.5, Math.sin(a) * 6.5, 3.6, 2.2, a); }
      c.fillStyle = '#ffd54f'; circ(c, 0, 0, 6);
      eye(c, -1, -1.5, 1.9); eye(c, 3, -1.5, 1.7);
      c.fillStyle = '#ff3d00'; rr(c, 3, 2, 8 + p * 2, 4, 2); c.fill();
      c.fillStyle = '#5a1000'; ell(c, 11 + p * 2, 4, 1.1, 1.7);
      c.restore();
    },
    mBubbleFrog(c, t, col) {
      col = '#7be0b0'; // стрілець має власні кольори
      const p = Math.max(0, Math.sin(t * 2.4));
      c.fillStyle = sh(col, -25); ell(c, -9, -2, 6, 2.6); ell(c, 7, -2, 5, 2.4);
      c.fillStyle = col; c.beginPath(); c.moveTo(-13, -2); c.quadraticCurveTo(-14, -20, 0, -21); c.quadraticCurveTo(14, -21, 14, -9); c.quadraticCurveTo(13, -1, 0, -2); c.fill();
      c.fillStyle = '#fff9e0'; ell(c, 3, -6, 8, 4);
      const sp = ['#ff6b9a', '#ffb74d', '#64b5f6', '#ba68c8'];
      [[-8, -14], [-4, -18], [-10, -8], [-2, -12]].forEach(([x, y], i) => { c.fillStyle = sp[i]; circ(c, x, y, 1.6); });
      c.fillStyle = col; circ(c, 2, -21, 5); circ(c, 9, -20, 4.6);
      eye(c, 2.5, -22, 3); eye(c, 9.5, -21, 2.7);
      // рот-бульбашка
      c.fillStyle = '#2e6a50'; c.beginPath(); c.moveTo(6, -14); c.quadraticCurveTo(12, -11.5, 15, -14); c.quadraticCurveTo(12, -13, 6, -14); c.fill();
      c.fillStyle = `rgba(200,240,255,${0.5 + p * 0.4})`; circ(c, 16 + p * 2, -14.5, 1.6 + p * 2.4);
      c.fillStyle = 'rgba(255,255,255,0.8)'; circ(c, 15.5 + p * 2, -15.5 - p, 0.6 + p * 0.6);
      blush(c, 1, -16, 1.5);
    },
  });

  // ======================= Декорації (точка — земля, малюємо вгору) =======================
  addTo(Art.decors, {
    // --- тропічний острів ---
    mHibiscus(c, t) {
      c.fillStyle = '#2f9e4f'; circ(c, -8, -7, 7); circ(c, 7, -8, 8); circ(c, 0, -13, 8);
      c.fillStyle = '#4cc066'; circ(c, -3, -15, 3.5);
      for (const [x, y, col] of [[-6, -10, '#ff3d6e'], [6, -13, '#ff7a3d'], [1, -5, '#ff3d6e']]) {
        c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * 0.2; circ(c, x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.4); }
        c.fillStyle = '#ffe14d'; circ(c, x, y, 1.1);
      }
    },
    mCoconutPile(c) {
      c.fillStyle = '#6d4424'; circ(c, -6, -5, 5.5); circ(c, 5, -5, 5.5); circ(c, 0, -12, 5.5);
      c.fillStyle = '#8d5a32'; circ(c, -7, -6.5, 2); circ(c, 4, -6.5, 2); circ(c, -1, -13.5, 2);
      c.fillStyle = '#3a2410'; for (const [x, y] of [[-5, -4], [6, -4], [1, -11]]) { circ(c, x, y, 0.8); circ(c, x + 1.6, y, 0.8); }
    },
    mTikiTorch(c, t) {
      c.fillStyle = '#8d5a32'; c.fillRect(-1.5, -30, 3, 30);
      c.strokeStyle = '#5d3a1e'; c.lineWidth = 1; for (let y = -26; y < -2; y += 5) line(c, -1.5, y, 1.5, y + 2);
      c.fillStyle = '#c69a5a'; c.beginPath(); c.moveTo(-4, -36); c.lineTo(4, -36); c.lineTo(2.5, -29); c.lineTo(-2.5, -29); c.fill();
      const f = Math.sin(t * 12) * 1.2;
      glow(c, 0, -40, 12, 'rgba(255,170,60,0.5)');
      c.fillStyle = '#ff7a1a'; c.beginPath(); c.moveTo(-4, -36); c.quadraticCurveTo(-4, -42, f, -47); c.quadraticCurveTo(4, -42, 4, -36); c.fill();
      c.fillStyle = '#ffe14d'; c.beginPath(); c.moveTo(-2, -36); c.quadraticCurveTo(-2, -40, f * 0.5, -43); c.quadraticCurveTo(2, -40, 2, -36); c.fill();
    },
    mSurfboard(c) {
      c.save(); c.rotate(0.12);
      c.fillStyle = '#29b6f6'; ell(c, 0, -17, 5.5, 17);
      c.fillStyle = '#fff'; c.fillRect(-5.5, -20, 11, 2.5);
      c.fillStyle = '#ff7043'; c.fillRect(-5, -16, 10, 1.6);
      c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -2, -24, 1.4, 6);
      c.restore();
      c.fillStyle = '#e8c47d'; ell(c, 1, 0, 8, 2);
    },
    // --- весняна галявина ---
    mDaisy(c, t) {
      const sw = Math.sin(t * 1.7) * 1.5;
      c.strokeStyle = '#3e9a3a'; c.lineWidth = 2.5; line(c, 0, 0, sw, -30);
      c.fillStyle = '#5cb85c'; ell(c, -5, -9, 6, 2.4, 0.5); ell(c, 5, -15, 6, 2.4, -0.5);
      c.fillStyle = '#fff';
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ell(c, sw + Math.cos(a) * 7, -32 + Math.sin(a) * 7, 4.2, 1.8, a); }
      c.fillStyle = '#ffc928'; circ(c, sw, -32, 4.2);
      c.fillStyle = '#ffe082'; circ(c, sw - 1.2, -33.2, 1.5);
    },
    mDandelion(c, t) {
      const sw = Math.sin(t * 1.5) * 1.5;
      c.strokeStyle = '#6fae3a'; c.lineWidth = 1.6; line(c, 0, 0, sw, -24);
      c.fillStyle = '#4caf50'; tri(c, -1, 0, -9, -6, -2, -4); tri(c, 1, 0, 8, -7, 2, -3);
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.8;
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; line(c, sw, -27, sw + Math.cos(a) * 7, -27 + Math.sin(a) * 7); }
      c.fillStyle = '#fff'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; circ(c, sw + Math.cos(a) * 7, -27 + Math.sin(a) * 7, 1); }
      c.fillStyle = '#c5b358'; circ(c, sw, -27, 1.8);
    },
    mBluebell(c, t) {
      const sw = Math.sin(t * 1.9) * 1;
      c.strokeStyle = '#3e8e2f'; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(2, -16, 9 + sw, -22); c.stroke();
      c.fillStyle = '#5cb85c'; ell(c, -3, -5, 2.4, 7, -0.2);
      for (const [x, y] of [[3, -13], [7, -18], [10 + sw, -21]]) {
        c.fillStyle = '#7c6cf0'; c.beginPath(); c.moveTo(x - 3, y + 1); c.quadraticCurveTo(x, y - 4, x + 3, y + 1); c.lineTo(x + 3.6, y + 5); c.lineTo(x + 1.5, y + 4); c.lineTo(x, y + 5.5); c.lineTo(x - 1.5, y + 4); c.lineTo(x - 3.6, y + 5); c.fill();
      }
    },
    mLadybugLeaf(c, t) {
      c.fillStyle = '#4caf50'; c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-8, -14, 12, -12); c.quadraticCurveTo(6, -1, -14, 0); c.fill();
      c.strokeStyle = '#2e7d32'; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -1); c.quadraticCurveTo(-2, -7, 10, -11); c.stroke();
      const x = -2 + Math.sin(t * 0.8) * 3;
      c.fillStyle = '#e53935'; c.beginPath(); c.arc(x, -8, 4, Math.PI, 0); c.fill();
      c.fillStyle = '#222'; circ(c, x + 4, -8.5, 2); c.fillRect(x - 0.4, -12, 0.8, 4); circ(c, x - 2, -9.5, 0.9); circ(c, x + 1.8, -10, 0.8);
    },
    mWateringCan(c) {
      c.fillStyle = '#5c9fe0'; rr(c, -8, -14, 14, 14, 3); c.fill();
      c.fillStyle = '#4a86c4'; c.beginPath(); c.moveTo(5, -6); c.lineTo(15, -16); c.lineTo(16, -14); c.lineTo(6, -2); c.fill();
      c.fillStyle = '#4a86c4'; ell(c, 15.5, -16, 2.6, 1.3, -0.8);
      c.strokeStyle = '#4a86c4'; c.lineWidth = 2; c.beginPath(); c.arc(-1, -14, 6, Math.PI, 0); c.stroke();
      c.fillStyle = '#ffd23f'; circ(c, -1, -7, 2.4);
    },
    // --- цирк ---
    mCircusBall(c, t) {
      const r = 10, a = Math.sin(t) * 0.3;
      c.save(); c.translate(0, -r); c.rotate(a);
      const cols = ['#e53935', '#fff', '#1e88e5', '#fff', '#ffd23f', '#fff'];
      for (let i = 0; i < 6; i++) { c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, i * TAU / 6, (i + 1) * TAU / 6); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -4, -5, 3, 2, -0.6);
      c.restore();
    },
    mPedestal(c) {
      c.fillStyle = '#b71c1c'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-9, -18); c.lineTo(9, -18); c.lineTo(12, 0); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-4, 0); c.lineTo(-3, -18); c.lineTo(3, -18); c.lineTo(4, 0); c.fill();
      c.fillStyle = '#1e88e5'; rr(c, -12, -22, 24, 5, 2); c.fill();
      c.fillStyle = '#ffd23f'; star(c, 0, -10, 3, 5, 0.45);
      c.fillStyle = '#ffd23f'; c.fillRect(-12, -1.5, 24, 1.5);
    },
    mPopcorn(c) {
      c.fillStyle = '#fff6d8'; for (const [x, y] of [[-5, -18], [0, -21], [5, -18], [-2, -16], [3, -15], [-6, -14], [6, -14]]) circ(c, x, y, 3.2);
      c.fillStyle = '#ffe082'; circ(c, 1, -19, 1.2); circ(c, -4, -16, 1);
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-8, -14); c.lineTo(8, -14); c.lineTo(6, 0); c.lineTo(-6, 0); c.fill();
      c.fillStyle = '#e53935'; for (const x of [-5.5, -1, 3.5]) { c.beginPath(); c.moveTo(x, -14); c.lineTo(x + 2.5, -14); c.lineTo(x + 2, 0); c.lineTo(x + 0.2, 0); c.fill(); }
    },
    mHoop(c, t) {
      c.fillStyle = '#795548'; c.fillRect(-1.5, -12, 3, 12); c.fillRect(-6, -1.5, 12, 1.5);
      c.save(); c.shadowColor = '#ffb300'; c.shadowBlur = 6;
      c.strokeStyle = '#ffb300'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -24, 9, 12, 0, 0, TAU); c.stroke(); c.restore();
      c.strokeStyle = '#e53935'; c.lineWidth = 3; c.setLineDash([4, 4]); c.lineDashOffset = -t * 10;
      c.beginPath(); c.ellipse(0, -24, 9, 12, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    },
    // --- каток ---
    mRinkLamp(c, t) {
      c.fillStyle = '#37474f'; c.fillRect(-1.5, -34, 3, 34); rr(c, -5, -3, 10, 3, 1); c.fill();
      c.strokeStyle = '#37474f'; c.lineWidth = 1.6; c.beginPath(); c.arc(4, -34, 4, Math.PI, 0); c.stroke();
      glow(c, 8, -30, 14, 'rgba(255,214,120,0.55)');
      c.fillStyle = '#263238'; tri(c, 4, -33, 12, -33, 8, -36);
      c.fillStyle = '#ffe9a8'; rr(c, 5, -33, 6, 6, 1.5); c.fill();
      c.fillStyle = '#fff'; ell(c, 8, -36, 5, 1.6);
    },
    mSnowBank(c) {
      c.fillStyle = '#c9dcef'; ell(c, 0, -3, 15, 6);
      c.fillStyle = '#f4f9ff'; circ(c, -7, -6, 6); circ(c, 3, -9, 7.5); circ(c, 10, -5, 5);
      c.fillStyle = '#fff'; circ(c, 1, -12, 3);
    },
    mCocoaCup(c, t) {
      c.fillStyle = '#e53935'; rr(c, -6, -11, 12, 11, 2.5); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-6, -7, 12, 2); for (const x of [-4, 0, 4]) circ(c, x, -3, 0.9);
      c.strokeStyle = '#e53935'; c.lineWidth = 2; c.beginPath(); c.arc(7, -6, 3, -Math.PI / 2, Math.PI / 2); c.stroke();
      c.fillStyle = '#6d3f22'; ell(c, 0, -11, 6, 1.6);
      c.fillStyle = '#fff'; circ(c, -2, -12, 1.8); circ(c, 1.5, -12.5, 1.6);
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2;
      for (const x of [-2, 2]) { c.beginPath(); c.moveTo(x, -14); c.quadraticCurveTo(x + 2 + Math.sin(t * 3 + x) * 1.5, -17, x, -20); c.stroke(); }
    },
    mRinkCone(c) {
      c.fillStyle = '#ff6d00'; c.beginPath(); c.moveTo(-5, -2); c.lineTo(-1.5, -16); c.lineTo(1.5, -16); c.lineTo(5, -2); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-3.6, -7); c.lineTo(-2.6, -11); c.lineTo(2.6, -11); c.lineTo(3.6, -7); c.fill();
      c.fillStyle = '#e65100'; rr(c, -7, -2.5, 14, 2.5, 1); c.fill();
    },
    // --- шоколадна фабрика ---
    mChocoBar(c) {
      c.save(); c.rotate(-0.12);
      c.fillStyle = '#5d3016'; rr(c, -9, -22, 18, 22, 2); c.fill();
      c.fillStyle = '#7b4a2e'; for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { rr(c, -7.5 + i * 8, -20.5 + j * 6.8, 6.5, 5.5, 1); c.fill(); }
      c.fillStyle = '#e53935'; c.fillRect(-9.5, -9, 19, 9);
      c.fillStyle = '#ffd23f'; c.fillRect(-9.5, -9, 19, 1.6);
      c.fillStyle = '#fff'; circ(c, 0, -4.5, 2.2);
      c.restore();
    },
    mTruffle(c) {
      c.fillStyle = '#d7a0c8'; c.beginPath(); c.moveTo(-9, -3); c.lineTo(-6, 0); c.lineTo(6, 0); c.lineTo(9, -3); c.closePath(); c.fill();
      c.fillStyle = '#4e2a14'; ell(c, 0, -8, 8, 7);
      c.fillStyle = '#6d3f22'; ell(c, -2, -10, 3.5, 2.4, -0.4);
      c.strokeStyle = '#f5e1c0'; c.lineWidth = 1.2; c.beginPath(); for (let x = -5; x <= 5; x += 2) c.lineTo(x, -12 + (x % 4 ? 1.2 : -1)); c.stroke();
      c.fillStyle = '#ff4081'; circ(c, 0, -15, 1.8);
    },
    mCocoaPod(c) {
      c.strokeStyle = '#5d3a1e'; c.lineWidth = 2; line(c, 0, 0, 0, -6);
      c.fillStyle = '#c86b2a'; ell(c, 0, -14, 6, 10);
      c.strokeStyle = '#9a4a1a'; c.lineWidth = 1; for (const x of [-3, 0, 3]) { c.beginPath(); c.moveTo(x * 0.6, -23); c.quadraticCurveTo(x * 1.4, -14, x * 0.6, -5); c.stroke(); }
      c.fillStyle = '#4caf50'; ell(c, 5, -6, 5, 2, -0.5);
    },
    mMarshmallow(c) {
      for (const [x, y, col] of [[-6, 0, '#fff3f6'], [6, 0, '#ffd1e6'], [0, -9, '#e3f2fd']]) {
        c.fillStyle = sh(col, -25); rr(c, x - 6, y - 9, 12, 9, 3); c.fill();
        c.fillStyle = col; rr(c, x - 6, y - 9, 12, 7, 3); c.fill();
      }
    },
    // --- дахи міста ---
    mChimney(c, t) {
      c.fillStyle = '#b5543a'; c.fillRect(-7, -24, 14, 24);
      c.strokeStyle = '#8a3a26'; c.lineWidth = 0.9; for (let y = -20, r = 0; y < 0; y += 4, r++) { line(c, -7, y, 7, y); for (let x = -7 + (r % 2) * 3.5; x < 7; x += 7) line(c, x, y, x, y + 4); }
      c.fillStyle = '#5d6d7e'; c.fillRect(-9, -27, 18, 4);
      const k = (t * 0.6) % 1;
      c.fillStyle = `rgba(220,220,230,${0.7 * (1 - k)})`; circ(c, 2 + k * 6, -31 - k * 18, 3 + k * 5);
      c.fillStyle = `rgba(220,220,230,${0.7 * (1 - (k + 0.5) % 1)})`; circ(c, 2 + ((k + 0.5) % 1) * 6, -31 - ((k + 0.5) % 1) * 18, 3 + ((k + 0.5) % 1) * 5);
    },
    mTvAntenna(c) {
      c.strokeStyle = '#546e7a'; c.lineWidth = 1.6; c.lineCap = 'round';
      line(c, 0, 0, 0, -36); line(c, -10, -30, 10, -30); line(c, -7, -24, 7, -24); line(c, -4, -18, 4, -18);
      line(c, 0, -36, 12, -40); line(c, 0, 0, -6, -2); line(c, 0, 0, 6, -2);
      c.fillStyle = '#ef5350'; circ(c, 0, -37, 1.6);
    },
    mSatDish(c) {
      c.fillStyle = '#78909c'; c.fillRect(-1.5, -12, 3, 12); c.fillRect(-5, -2, 10, 2);
      c.save(); c.translate(0, -16); c.rotate(-0.5);
      c.fillStyle = '#eceff1'; c.beginPath(); c.ellipse(0, 0, 9, 4, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#cfd8dc'; ell(c, 0, 0, 9, 1.6);
      c.strokeStyle = '#90a4ae'; c.lineWidth = 1; line(c, 0, 0, 6, -7); c.fillStyle = '#ef5350'; circ(c, 6, -7, 1.4);
      c.restore();
    },
    mRoofPlant(c) {
      c.fillStyle = '#d0703a'; c.beginPath(); c.moveTo(-6, -9); c.lineTo(6, -9); c.lineTo(4.5, 0); c.lineTo(-4.5, 0); c.fill();
      c.fillStyle = '#e8894f'; c.fillRect(-7, -10, 14, 2.5);
      c.fillStyle = '#43a047'; ell(c, -4, -14, 3, 6, -0.5); ell(c, 4, -14, 3, 6, 0.5); ell(c, 0, -17, 2.6, 7);
      c.fillStyle = '#ff5c8a'; circ(c, -3, -20, 2.2); circ(c, 4, -19, 2);
    },
    mVent(c, t) {
      c.fillStyle = '#90a4ae'; c.fillRect(-3, -10, 6, 10);
      c.fillStyle = '#b0bec5'; rr(c, -7, -18, 14, 9, 3); c.fill();
      c.save(); c.translate(0, -13.5); c.scale(Math.cos(t * 5), 1); c.fillStyle = '#607d8b'; c.fillRect(-6, -1, 12, 2); c.restore();
      c.fillStyle = '#78909c'; tri(c, -8, -18, 0, -23, 8, -18);
    },
    // --- гарбузова ніч ---
    mPumpkinSmile(c, t) {
      const k = 0.7 + Math.sin(t * 4) * 0.3;
      glow(c, 0, -9, 16, `rgba(255,180,60,${0.35 * k})`);
      c.fillStyle = '#e65100'; ell(c, -6, -8, 7, 8); ell(c, 6, -8, 7, 8);
      c.fillStyle = '#ff8f1f'; ell(c, 0, -8, 7, 9);
      c.fillStyle = '#5d4037'; c.fillRect(-1.2, -20, 2.5, 4);
      c.fillStyle = `rgb(255,${210 + 30 * k},120)`;
      ell(c, -4, -10, 1.8, 2.2); ell(c, 4, -10, 1.8, 2.2);
      c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(0, -1, 6, -6); c.quadraticCurveTo(0, -3.5, -6, -6); c.fill();
    },
    mPumpkinStack(c) {
      c.fillStyle = '#e65100'; ell(c, -4, -6, 7, 6); ell(c, 4, -6, 7, 6);
      c.fillStyle = '#ff9800'; ell(c, 0, -6, 6, 6.5);
      c.fillStyle = '#ffb74d'; ell(c, -1, -15, 5, 4.5); c.fillStyle = '#ffa726'; ell(c, 1, -15, 3, 4.5);
      c.fillStyle = '#5d4037'; c.fillRect(-0.5, -22, 2, 4);
      c.fillStyle = '#7cb342'; ell(c, -10, -1, 5, 2, 0.2); ell(c, 9, -1.5, 4, 1.6, -0.3);
    },
    mCandyBucket(c) {
      c.fillStyle = '#ff8f1f'; c.beginPath(); c.moveTo(-8, -13); c.lineTo(8, -13); c.lineTo(6.5, 0); c.lineTo(-6.5, 0); c.fill();
      c.fillStyle = '#4a2a00'; ell(c, -3, -8, 1.4, 1.8); ell(c, 3, -8, 1.4, 1.8);
      c.strokeStyle = '#4a2a00'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -6, 3.2, 0.3, Math.PI - 0.3); c.stroke();
      c.strokeStyle = '#7e57c2'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, -13, 8, Math.PI, 0); c.stroke();
      const cols = ['#ff4fa3', '#7df3ff', '#b2ff59', '#ffd740'];
      [[-4, -14], [0, -15.5], [4, -14]].forEach(([x, y], i) => { c.fillStyle = cols[i]; ell(c, x, y, 2.6, 1.8); tri(c, x - 2.4, y, x - 4.5, y - 1.8, x - 4.5, y + 1.8); });
    },
    mGhostPeek(c, t) {
      const b = Math.sin(t * 2.2) * 2;
      c.fillStyle = 'rgba(255,255,255,0.92)';
      c.beginPath(); c.moveTo(-8, -6 + b); c.arc(0, -16 + b, 8, Math.PI, 0); c.lineTo(8, -6 + b);
      for (let i = 0; i < 4; i++) c.quadraticCurveTo(8 - i * 4 - 2, -3 + b, 8 - (i + 1) * 4, -6 + b);
      c.fill();
      c.fillStyle = '#3a2a5a'; ell(c, -2.5, -17 + b, 1.4, 2); ell(c, 2.5, -17 + b, 1.4, 2);
      c.fillStyle = '#3a2a5a'; ell(c, 0, -12.5 + b, 1.4, 1.1);
      blush(c, -5, -13.5 + b, 1.3); blush(c, 5, -13.5 + b, 1.3);
    },
    mLanternPole(c, t) {
      c.fillStyle = '#4a3360'; c.fillRect(-1.2, -30, 2.4, 30);
      c.strokeStyle = '#4a3360'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(8, -34, 10, -28); c.stroke();
      const sw = Math.sin(t * 2) * 0.15;
      c.save(); c.translate(10, -28); c.rotate(sw);
      glow(c, 0, 6, 12, 'rgba(255,170,60,0.5)');
      c.fillStyle = '#ff8f1f'; ell(c, 0, 6, 5, 5);
      c.fillStyle = '#ffe082'; ell(c, -1.6, 5, 1, 1.4); ell(c, 1.6, 5, 1, 1.4); c.fillRect(-2, 8, 4, 1);
      c.restore();
    },
    // --- Новорічна казка ---
    mGiftPile(c) {
      const box = (x, y, w, h, col, rib) => {
        c.fillStyle = col; c.fillRect(x - w / 2, y - h, w, h);
        c.fillStyle = sh(col, 30); c.fillRect(x - w / 2 - 1, y - h - 2.5, w + 2, 3);
        c.fillStyle = rib; c.fillRect(x - 1.2, y - h - 2.5, 2.4, h + 2.5);
        c.strokeStyle = rib; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x - 2.6, y - h - 4, 2.6, 1.6, 0.4, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(x + 2.6, y - h - 4, 2.6, 1.6, -0.4, 0, TAU); c.stroke();
      };
      box(-6, 0, 12, 11, '#e53935', '#ffd23f');
      box(7, 0, 10, 8, '#1e88e5', '#ffffff');
      box(-1, -13, 9, 7, '#43a047', '#ff4081');
    },
    mXmasTree(c, t) {
      c.fillStyle = '#6d4424'; c.fillRect(-2, -5, 4, 5);
      c.fillStyle = '#1f7a45';
      for (let i = 0; i < 3; i++) { const by = -4 - i * 9, hw = 12 - i * 3; tri(c, -hw, by, 0, by - 14, hw, by); }
      c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { const by = -4 - i * 9, hw = 12 - i * 3; ell(c, 0, by - 0.5, hw * 0.9, 1.2); }
      const cols = ['#ff4081', '#ffd23f', '#29b6f6', '#ff7043'];
      [[-6, -8], [5, -9], [-3, -16], [4, -18], [0, -25], [-6, -13]].forEach(([x, y], i) => {
        const on = Math.sin(t * 4 + i * 1.7) > -0.3;
        c.fillStyle = on ? cols[i % 4] : sh(cols[i % 4], -60); circ(c, x, y, 1.7);
      });
      c.fillStyle = '#ffd23f'; star(c, 0, -33, 3.6, 5, 0.45);
    },
    mDidukh(c, t) {
      c.strokeStyle = '#d8a93a'; c.lineWidth = 1.2; c.lineCap = 'round';
      for (let i = -4; i <= 4; i++) { const sw = Math.sin(t * 1.5 + i) * 0.8; line(c, i * 0.9, -12, i * 2.4 + sw, -32 + Math.abs(i) * 1.5); }
      c.fillStyle = '#e8c35a'; for (let i = -4; i <= 4; i++) ell(c, i * 2.4 + Math.sin(t * 1.5 + i) * 0.8, -33 + Math.abs(i) * 1.5, 1.2, 3, i * 0.12);
      c.fillStyle = '#d8a93a'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-3, -13); c.lineTo(3, -13); c.lineTo(5, 0); c.fill();
      c.strokeStyle = '#c4952e'; c.lineWidth = 0.8; for (let x = -3; x <= 3; x += 1.5) line(c, x, -12, x * 1.4, 0);
      c.fillStyle = '#d32f2f'; c.fillRect(-4, -14, 8, 2.6);
      c.fillStyle = '#1e88e5'; circ(c, -4, -12, 1.2); c.fillStyle = '#ffd23f'; circ(c, 4, -12, 1.2);
    },
    mCarolStar(c, t) {
      c.fillStyle = '#8d6e63'; c.fillRect(-1.2, -26, 2.4, 26);
      c.save(); c.translate(0, -32); c.rotate(t * 0.8);
      c.fillStyle = '#ffd23f'; star(c, 0, 0, 10, 8, 0.55);
      c.fillStyle = '#e53935'; star(c, 0, 0, 6, 8, 0.6);
      c.restore();
      c.fillStyle = '#fff59d'; circ(c, 0, -32, 2.4);
      c.strokeStyle = '#1e88e5'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(-5, -16, -3, -10); c.stroke();
      c.strokeStyle = '#ffd23f'; c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(5, -17, 3, -11); c.stroke();
    },
    // --- годинникова вежа ---
    mHourglass(c, t) {
      c.fillStyle = '#6d4424'; rr(c, -8, -3, 16, 3, 1); c.fill(); rr(c, -8, -26, 16, 3, 1); c.fill();
      c.fillStyle = '#8d5a32'; c.fillRect(-7, -23, 2, 20); c.fillRect(5, -23, 2, 20);
      c.fillStyle = 'rgba(210,240,255,0.55)'; c.beginPath(); c.moveTo(-5, -23); c.lineTo(5, -23); c.lineTo(0.8, -13); c.lineTo(5, -3); c.lineTo(-5, -3); c.lineTo(-0.8, -13); c.fill();
      const k = (t * 0.2) % 1;
      c.fillStyle = '#ffcc66';
      c.beginPath(); c.moveTo(-4 + k * 3, -21 + k * 6); c.lineTo(4 - k * 3, -21 + k * 6); c.lineTo(0.6, -14); c.lineTo(-0.6, -14); c.fill();
      c.fillRect(-0.4, -14, 0.8, 10);
      c.beginPath(); c.moveTo(-4.5, -3); c.lineTo(4.5, -3); c.lineTo(0, -3 - 2 - k * 5); c.fill();
    },
    mBrassGear(c, t) {
      gearShape(c, -3, -11, 9, 10, '#c9a24a', '#5d3a1e', t * 0.6);
      gearShape(c, 9, -5, 5, 8, '#a8843a', '#5d3a1e', -t * 1.1);
      c.fillStyle = '#e6c46a'; circ(c, -5, -14, 1.6);
    },
    mSmallPendulum(c, t) {
      c.fillStyle = '#5d3a1e'; c.fillRect(-9, -34, 18, 3); c.fillRect(-9, -34, 2, 34); c.fillRect(7, -34, 2, 34);
      c.save(); c.translate(0, -31); c.rotate(Math.sin(t * 2.5) * 0.4);
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1.2; line(c, 0, 0, 0, 20);
      c.fillStyle = '#ffd23f'; circ(c, 0, 22, 4); c.fillStyle = '#fff3b0'; circ(c, -1.2, 21, 1.3);
      c.restore();
    },
    mOilCan(c) {
      c.fillStyle = '#c62828'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(-7, -9); c.quadraticCurveTo(0, -14, 7, -9); c.lineTo(7, 0); c.fill();
      c.fillStyle = '#9aa7b4'; c.beginPath(); c.moveTo(2, -11); c.lineTo(14, -18); c.lineTo(14.5, -16.5); c.lineTo(4, -9); c.fill();
      c.strokeStyle = '#8e2020'; c.lineWidth = 1.6; c.beginPath(); c.arc(-7, -5, 3.5, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
      c.fillStyle = '#ffd23f'; c.fillRect(-7, -5, 14, 1.4);
    },
    // --- країна снів ---
    mPillowPile(c) {
      const pil = (x, y, w, h, col, rot) => {
        c.save(); c.translate(x, y); c.rotate(rot);
        c.fillStyle = sh(col, -25); rr(c, -w / 2, -h, w, h, h / 2.2); c.fill();
        c.fillStyle = col; rr(c, -w / 2, -h, w, h - 1.6, h / 2.2); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-w / 2 + 4, -h + 2, w - 8, 1.4);
        c.restore();
      };
      pil(0, 0, 26, 8, '#c5b3f0', 0); pil(-2, -7, 22, 7, '#ffc4e1', -0.08); pil(1, -13, 16, 6, '#bfe6ff', 0.1);
    },
    mStarLamp(c, t) {
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.8; line(c, 0, -36, 0, -18);
      const k = 0.7 + Math.sin(t * 2.5) * 0.3;
      glow(c, 0, -14, 14, `rgba(255,240,170,${0.5 * k})`);
      c.fillStyle = '#fff59d'; star(c, 0, -14, 8, 5, 0.5);
      sleepy(c, -2.2, -14, 1.2, '#7a5a20'); sleepy(c, 2.2, -14, 1.2, '#7a5a20');
      c.fillStyle = '#e8eaf6'; ell(c, 0, -1.5, 6, 1.6);
    },
    mMoonFlower(c, t) {
      const sw = Math.sin(t * 1.4) * 1.2;
      c.strokeStyle = '#7e9ad0'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-3, -12, sw, -22); c.stroke();
      c.fillStyle = '#9fb8ea'; ell(c, -4, -8, 5, 2, 0.5);
      c.save(); c.shadowColor = '#e1f5ff'; c.shadowBlur = 8;
      c.fillStyle = '#e8f4ff'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; ell(c, sw + Math.cos(a) * 5, -25 + Math.sin(a) * 5, 4, 2.6, a); }
      c.restore();
      crescent(c, sw, -25, 2.8, '#ffe082');
    },
    mZzzCloud(c, t) {
      c.fillStyle = '#f3e8ff'; circ(c, -7, -5, 5); circ(c, 1, -8, 7); circ(c, 8, -4, 4.5); c.fillRect(-7, -5, 15, 5);
      c.fillStyle = '#9575cd'; c.font = 'bold 8px sans-serif'; c.textAlign = 'center';
      const k = (t * 0.5) % 1;
      c.globalAlpha = 1 - k; c.fillText('z', 6 + k * 4, -16 - k * 10); c.globalAlpha = 1;
      sleepy(c, -1, -7, 1.2, '#7e57c2'); sleepy(c, 4, -7, 1.2, '#7e57c2');
    },
    // --- аркада ---
    mArcadeCab(c, t) {
      c.fillStyle = '#3d1a8a'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-9, -34); c.lineTo(6, -34); c.lineTo(9, -28); c.lineTo(9, 0); c.fill();
      c.fillStyle = '#ff3cac'; c.fillRect(-9, -34, 15, 4);
      c.fillStyle = '#0b0221'; c.fillRect(-7, -28, 14, 11);
      const f = Math.floor(t * 3) % 3;
      c.fillStyle = '#39ff14'; c.fillRect(-5 + f * 3, -24, 3, 3); c.fillStyle = '#00e5ff'; c.fillRect(2 - f, -21, 2, 2);
      c.fillStyle = '#5a2ac0'; c.fillRect(-9, -16, 18, 4);
      c.fillStyle = '#ff1744'; circ(c, -4, -14, 1.4); c.fillStyle = '#ffea00'; circ(c, 1, -14, 1.4); circ(c, 5, -14, 1.4);
      c.fillStyle = '#00e5ff'; c.fillRect(-2, -7, 4, 2);
    },
    mJoystick(c, t) {
      c.fillStyle = '#212121'; rr(c, -9, -6, 18, 6, 2); c.fill();
      c.fillStyle = '#424242'; c.fillRect(-9, -6, 18, 1.5);
      const a = Math.sin(t * 2) * 0.3;
      c.save(); c.translate(-3, -6); c.rotate(a); c.fillStyle = '#9e9e9e'; c.fillRect(-1, -10, 2, 10); c.fillStyle = '#ff1744'; circ(c, 0, -11, 3.4); c.fillStyle = 'rgba(255,255,255,0.6)'; circ(c, -1, -12, 1); c.restore();
      c.fillStyle = '#00e5ff'; circ(c, 5, -7, 1.8);
    },
    mPixelHeart(c, t) {
      const b = Math.round(Math.sin(t * 3) * 1.5);
      c.save(); c.shadowColor = '#ff1744'; c.shadowBlur = 6;
      pix(c, ['.xx.xx.', 'xwxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], -8.75, -18 + b, 2.5, { x: '#ff1744', w: '#ffffff' });
      c.restore();
    },
    mPixelTree(c) {
      pix(c, ['..gg..', '.gGgg.', 'gggGgg', 'gGgggg', '.gggg.', '..bb..', '..bb..'], -9, -28, 3, { g: '#00c853', G: '#69f0ae', b: '#8d6e63' });
    },
    // --- загублене місто ---
    mGoldIdol(c, t) {
      c.fillStyle = '#6f7a66'; rr(c, -8, -8, 16, 8, 1.5); c.fill();
      c.fillStyle = '#8f9a86'; c.fillRect(-8, -8, 16, 2);
      c.save(); c.shadowColor = '#ffe082'; c.shadowBlur = 6 + Math.sin(t * 3) * 3;
      c.fillStyle = '#e8b62c'; rr(c, -5, -23, 10, 15, 3); c.fill(); circ(c, 0, -25, 5);
      c.restore();
      c.fillStyle = '#ffd95a'; c.fillRect(-3.5, -21, 2, 11); circ(c, -1.5, -27, 1.5);
      c.fillStyle = '#9a6a10'; c.fillRect(-2.5, -26, 1.6, 1.6); c.fillRect(1, -26, 1.6, 1.6); c.fillRect(-1.5, -22.5, 3, 1);
      c.fillStyle = '#4ef0ff'; circ(c, 0, -16, 1.6);
      c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 5) * 0.5})`; star(c, 4, -28, 2.2, 4, 0.35);
    },
    mRuinPillar(c) {
      c.fillStyle = '#8a8576'; c.fillRect(-7, -26, 14, 26);
      c.fillStyle = '#a19c8c'; c.fillRect(-7, -26, 3, 26);
      c.strokeStyle = '#6f6a5c'; c.lineWidth = 1; line(c, -1, -24, -1, 0); line(c, 4, -24, 4, 0);
      c.fillStyle = '#9d9888'; c.beginPath(); c.moveTo(-9, -26); c.lineTo(-6, -30); c.lineTo(-1, -27); c.lineTo(4, -32); c.lineTo(9, -26); c.fill();
      c.fillStyle = '#6f6a5c'; c.fillRect(-9, -2, 18, 2);
      c.strokeStyle = '#3f9a3e'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(6, -30); c.bezierCurveTo(-8, -22, 10, -14, -6, -4); c.stroke();
      c.fillStyle = '#5fbf4a'; for (const [x, y] of [[2, -26], [-1, -19], [3, -13], [-3, -7]]) ell(c, x, y, 2.6, 1.4, 0.6);
    },
    mStoneHead(c) {
      c.fillStyle = '#7c8576'; rr(c, -10, -26, 20, 26, 4); c.fill();
      c.fillStyle = '#929c8b'; c.fillRect(-10, -26, 20, 4);
      c.fillStyle = '#5d6458'; c.fillRect(-8, -19, 7, 2.6); c.fillRect(1, -19, 7, 2.6);
      c.fillRect(-7, -16, 5, 3); c.fillRect(2, -16, 5, 3);
      c.fillStyle = '#929c8b'; tri(c, 0, -15, 3, -8, -3, -8);
      c.fillStyle = '#5d6458'; c.fillRect(-5, -5, 10, 2);
      c.fillStyle = '#4caf50'; circ(c, -8, -25, 3); circ(c, -3, -27, 3.2); circ(c, 7, -25, 2.4);
    },
    mVineUrn(c) {
      c.fillStyle = '#b06a3a'; c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-11, -8, -5, -16); c.lineTo(5, -16); c.quadraticCurveTo(11, -8, 4, 0); c.fill();
      c.fillStyle = '#8a4e28'; c.fillRect(-6, -18, 12, 3);
      c.fillStyle = '#e8b62c'; c.fillRect(-7, -10, 14, 1.6);
      c.strokeStyle = '#3f9a3e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3, -18); c.quadraticCurveTo(-12, -24, -10, -8); c.stroke();
      c.fillStyle = '#5fbf4a'; ell(c, -10, -14, 2.5, 1.3, 0.8); ell(c, 2, -21, 3, 1.5, -0.4); ell(c, 5, -20, 2.5, 1.3, 0.5);
    },
    // --- оазис ---
    mWaterJar(c) {
      c.fillStyle = '#c56b3a'; c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-11, -9, -4, -18); c.lineTo(4, -18); c.quadraticCurveTo(11, -9, 4, 0); c.fill();
      c.fillStyle = '#a8562a'; c.fillRect(-5, -21, 10, 3.5);
      c.fillStyle = '#f2d6a2'; c.fillRect(-7.5, -11, 15, 1.4); c.fillRect(-7, -7, 14, 1);
      c.fillStyle = '#4fc3f7'; ell(c, 0, -21, 4, 1);
      c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -4, -11, 1.4, 4);
    },
    mSmallPalm(c, t) {
      c.strokeStyle = '#8d6e4a'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(3, -14, 1, -28); c.stroke();
      c.strokeStyle = '#6d5236'; c.lineWidth = 1; for (let y = -4; y > -26; y -= 4) line(c, -1.5 + y * -0.03, y, 2.5 + y * -0.03, y - 1);
      c.fillStyle = '#3fae4a';
      for (let i = 0; i < 6; i++) { c.save(); c.translate(1, -28); c.rotate(-Math.PI / 2 + (i - 2.5) * 0.6 + Math.sin(t * 1.5 + i) * 0.04); ell(c, 9, 0, 9, 2.4, 0.15); c.restore(); }
      c.fillStyle = '#8a4e28'; circ(c, -1, -26, 1.8); circ(c, 2.5, -25.5, 1.8);
    },
    mDesertTent(c) {
      c.fillStyle = '#e8d2a6'; c.beginPath(); c.moveTo(-16, 0); c.lineTo(-2, -22); c.lineTo(16, 0); c.fill();
      c.fillStyle = '#c62828'; c.beginPath(); c.moveTo(-12, -6); c.lineTo(-8.4, -12); c.lineTo(10.5, -12); c.lineTo(14, -6); c.lineTo(10, -7); c.fill();
      c.fillStyle = '#5d3a1e'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-2, -12); c.lineTo(2, 0); c.fill();
      c.fillStyle = '#8d6e4a'; c.fillRect(-2.5, -26, 1.4, 5);
      c.fillStyle = '#1e88e5'; tri(c, -1.2, -26, 5, -24.5, -1.2, -23);
    },
    mPapyrus(c, t) {
      c.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        const sw = Math.sin(t * 1.6 + i) * 1.5, top = -22 - (2 - Math.abs(i)) * 4;
        c.strokeStyle = '#4e8a2e'; c.lineWidth = 1.5; line(c, i * 2.5, 0, i * 4 + sw, top);
        c.strokeStyle = '#7cc04a'; c.lineWidth = 0.8;
        for (let k = -3; k <= 3; k++) line(c, i * 4 + sw, top, i * 4 + sw + k * 1.5, top - 5 + Math.abs(k) * 0.8);
      }
    },
    // --- льодовик ---
    mIceShard(c) {
      c.fillStyle = '#5aa8e0'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-6, -18); c.lineTo(-1, -32); c.lineTo(3, -16); c.lineTo(9, 0); c.fill();
      c.fillStyle = '#b8e6ff'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-5, -16); c.lineTo(-1, -30); c.lineTo(-2, -2); c.fill();
      c.fillStyle = '#3d86c4'; tri(c, 3, -16, 9, 0, 3, 0);
      c.fillStyle = '#8ccff5'; c.beginPath(); c.moveTo(6, 0); c.lineTo(9, -12); c.lineTo(13, 0); c.fill();
      c.fillStyle = '#fff'; ell(c, 0, -0.5, 13, 1.8);
    },
    mIceBlock(c) {
      c.fillStyle = '#4a90c8'; rr(c, -11, -18, 22, 18, 3); c.fill();
      c.fillStyle = '#9fd8f5'; rr(c, -11, -18, 22, 15, 3); c.fill();
      c.fillStyle = '#d8f2ff'; c.fillRect(-8, -16, 8, 2); c.fillRect(-8, -12, 2, 6);
      c.strokeStyle = 'rgba(70,140,200,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(3, -18); c.lineTo(5, -11); c.lineTo(9, -8); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-12, -17); c.quadraticCurveTo(0, -23, 12, -17); c.quadraticCurveTo(0, -18, -12, -17); c.fill();
    },
    mSnowDrift(c) {
      c.fillStyle = '#d0e6f7'; c.beginPath(); c.moveTo(-18, 0); c.quadraticCurveTo(-8, -14, 6, -10); c.quadraticCurveTo(14, -8, 18, 0); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-16, -1); c.quadraticCurveTo(-8, -13, 5, -10); c.quadraticCurveTo(-4, -8, -16, -1); c.fill();
    },
    mFrozenTwig(c) {
      c.strokeStyle = '#7a6a5a'; c.lineWidth = 2; c.lineCap = 'round';
      line(c, 0, 0, -2, -22); line(c, -1, -10, -8, -16); line(c, -1.5, -16, 5, -24);
      c.fillStyle = '#e8f8ff'; for (const [x, y] of [[-2, -22], [-8, -16], [5, -24], [-1, -10]]) circ(c, x, y, 2.2);
      c.fillStyle = 'rgba(190,235,255,0.9)'; for (const [x, y] of [[-4, -18], [2, -21], [-5, -13]]) tri(c, x - 1, y, x + 1, y, x, y + 4);
    },
    // --- лавова печера ---
    mObsidianShard(c) {
      c.fillStyle = '#1c1622'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-7, -20); c.lineTo(-2, -30); c.lineTo(2, -14); c.lineTo(5, -24); c.lineTo(10, 0); c.fill();
      c.fillStyle = '#4a3a62'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(-6, -19); c.lineTo(-2, -28); c.lineTo(-3, 0); c.fill();
      c.fillStyle = '#6a5a8a'; tri(c, 4, -22, 5, -24, 6, -10);
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.fillStyle = '#ff7a1a'; c.fillRect(-10, -1.6, 20, 1.6); c.restore();
    },
    mMagmaBubble(c, t) {
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 12;
      c.fillStyle = '#ff5a1f'; ell(c, 0, -2, 13, 3.4);
      c.fillStyle = '#ffb030'; ell(c, 0, -2.5, 9, 2);
      const k = (t * 0.7) % 1;
      c.fillStyle = `rgba(255,200,80,${1 - k})`; circ(c, -3, -4 - k * 12, 2.4 * (1 - k * 0.5));
      c.fillStyle = `rgba(255,150,50,${1 - (k + 0.5) % 1})`; circ(c, 4, -4 - ((k + 0.5) % 1) * 10, 1.8);
      c.restore();
      c.fillStyle = '#2a2230'; ell(c, -12, -1.5, 4, 2); ell(c, 12, -1.5, 4, 2);
    },
    mSteamVent(c, t) {
      c.fillStyle = '#2a2230'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-5, -9); c.lineTo(5, -9); c.lineTo(10, 0); c.fill();
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 6; c.fillStyle = '#ff7a1a'; ell(c, 0, -9, 4.5, 1.6); c.restore();
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.5 + i / 3) % 1;
        c.fillStyle = `rgba(255,220,200,${0.45 * (1 - k)})`; circ(c, Math.sin(k * 6 + i) * 3, -12 - k * 28, 3 + k * 6);
      }
    },
    mEmberStone(c, t) {
      c.fillStyle = '#3a2a2a'; c.beginPath(); c.moveTo(-11, 0); c.quadraticCurveTo(-12, -10, -3, -12); c.quadraticCurveTo(8, -14, 11, 0); c.fill();
      const k = 0.6 + Math.sin(t * 3) * 0.4;
      c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8 * k; c.strokeStyle = `rgba(255,${120 + 60 * k},40,1)`; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-7, -2); c.lineTo(-3, -7); c.lineTo(2, -5); c.lineTo(5, -10); c.moveTo(2, -5); c.lineTo(6, -2); c.stroke(); c.restore();
    },
    // --- райдужний водоспад ---
    mSparkleFlower(c, t) {
      const sw = Math.sin(t * 1.6) * 1.3;
      c.strokeStyle = '#4caf88'; c.lineWidth = 2; line(c, 0, 0, sw, -18);
      c.fillStyle = '#6fd6a0'; ell(c, 4, -7, 5, 2, -0.5);
      const rb = ['#ff6b9a', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      rb.forEach((cl, i) => { const a = i / 6 * TAU + t * 0.3; c.fillStyle = cl; circ(c, sw + Math.cos(a) * 4.5, -21 + Math.sin(a) * 4.5, 3); });
      c.fillStyle = '#fff'; circ(c, sw, -21, 2.4);
      c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 5) * 0.5})`; star(c, sw + 8, -27, 2, 4, 0.35);
    },
    mRainbowArc(c) {
      const rb = ['#ff6b9a', '#ffb74d', '#fff176', '#81c784', '#64b5f6', '#ba68c8'];
      c.lineWidth = 2.2;
      rb.forEach((cl, i) => { c.strokeStyle = cl; c.beginPath(); c.arc(0, -2, 14 - i * 2, Math.PI, 0); c.stroke(); });
      c.fillStyle = '#fff'; circ(c, -12, -2, 4); circ(c, -15, -1, 3); circ(c, 12, -2, 4); circ(c, 15, -1, 3);
    },
    mPrism(c, t) {
      c.fillStyle = 'rgba(220,240,255,0.85)'; tri(c, -9, 0, 0, -20, 9, 0);
      c.fillStyle = 'rgba(255,255,255,0.8)'; tri(c, -6, -1, -1, -16, -1, -1);
      const rb = ['#ff6b9a', '#fff176', '#64b5f6'];
      rb.forEach((cl, i) => { c.fillStyle = cl; c.globalAlpha = 0.6 + Math.sin(t * 3 + i) * 0.3; tri(c, 4, -8, 16, -12 + i * 3, 16, -9 + i * 3); });
      c.globalAlpha = 1;
    },
    mCloudBush(c) {
      c.fillStyle = '#c8b8ff'; circ(c, -9, -7, 7); circ(c, 9, -7, 7);
      c.fillStyle = '#ffd1ec'; circ(c, 0, -12, 9);
      c.fillStyle = '#fff'; circ(c, -3, -15, 3); circ(c, 6, -9, 2);
    },
  });

  // ======================= Фонові помічники =======================
  // тропічна пальма з вигнутим стовбуром і кокосами
  function tPalm(c, x, y, s, lean, leaf = '#27a04a', leaf2 = '#46c766') {
    const tx = x + lean * s * 0.35, ty = y - s;
    for (let i = 0; i <= 12; i++) {
      const k = i / 12, px = x + lean * s * 0.35 * k * k, py = y - s * k;
      c.fillStyle = i % 2 ? '#a07848' : '#8a643a';
      ell(c, px, py, s * 0.045 * (1.25 - k * 0.4), s * 0.05);
    }
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI, L = s * (0.42 + (i % 2) * 0.08);
      const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.35 + L * 0.35;
      const cx = tx + Math.cos(a) * L * 0.5, cy = ty - L * 0.28;
      c.fillStyle = i % 2 ? leaf : leaf2;
      c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(cx, cy, ex, ey); c.quadraticCurveTo(cx, cy + L * 0.16, tx, ty + 3); c.fill();
    }
    c.fillStyle = '#6d4424'; circ(c, tx - 3, ty + 4, s * 0.035 + 1.5); circ(c, tx + 4, ty + 5, s * 0.035 + 1.5); circ(c, tx, ty + 8, s * 0.03 + 1.5);
  }
  function bigFlower(c, x, y, h, kind, col, mid, lf = '#4caf50') {
    const bend = h * 0.08, hx = x + bend, hy = y - h, r = h * 0.14 + 6;
    c.strokeStyle = sh(lf, -20); c.lineWidth = Math.max(3, h * 0.035); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - bend, y - h * 0.5, hx, hy); c.stroke();
    c.fillStyle = lf;
    c.save(); c.translate(x - bend * 0.3, y - h * 0.35); c.rotate(-0.7); ell(c, -h * 0.1, 0, h * 0.13, h * 0.04); c.restore();
    c.save(); c.translate(x, y - h * 0.55); c.rotate(0.6); ell(c, h * 0.1, 0, h * 0.12, h * 0.035); c.restore();
    if (kind === 'daisy') {
      c.fillStyle = col;
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; ell(c, hx + Math.cos(a) * r * 0.62, hy + Math.sin(a) * r * 0.62, r * 0.5, r * 0.17, a); }
      c.fillStyle = mid; circ(c, hx, hy, r * 0.34);
      c.fillStyle = 'rgba(255,255,255,0.35)'; circ(c, hx - r * 0.1, hy - r * 0.1, r * 0.12);
    } else if (kind === 'tulip') {
      c.fillStyle = sh(col, -25); c.beginPath(); c.moveTo(hx - r * 0.7, hy - r * 0.4); c.quadraticCurveTo(hx - r * 0.8, hy + r * 0.7, hx, hy + r * 0.7); c.quadraticCurveTo(hx + r * 0.8, hy + r * 0.7, hx + r * 0.7, hy - r * 0.4); c.fill();
      c.fillStyle = col; c.beginPath(); c.moveTo(hx - r * 0.7, hy - r * 0.5); c.lineTo(hx - r * 0.35, hy); c.lineTo(hx, hy - r * 0.75); c.lineTo(hx + r * 0.35, hy); c.lineTo(hx + r * 0.7, hy - r * 0.5); c.quadraticCurveTo(hx + r * 0.6, hy + r * 0.6, hx, hy + r * 0.62); c.quadraticCurveTo(hx - r * 0.6, hy + r * 0.6, hx - r * 0.7, hy - r * 0.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, hx - r * 0.3, hy + r * 0.1, r * 0.1, r * 0.3);
    } else if (kind === 'sun') {
      c.fillStyle = col;
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; c.save(); c.translate(hx, hy); c.rotate(a); tri(c, r * 0.4, -r * 0.18, r * 1.05, 0, r * 0.4, r * 0.18); c.restore(); }
      c.fillStyle = mid; circ(c, hx, hy, r * 0.48);
      c.fillStyle = sh(mid, -25); for (let i = 0; i < 10; i++) { const a = i * 2.4, rr2 = r * 0.35 * Math.sqrt(i / 10); circ(c, hx + Math.cos(a) * rr2, hy + Math.sin(a) * rr2, r * 0.05); }
    } else if (kind === 'puff') {
      c.fillStyle = sh(col, -20); circ(c, hx, hy, r * 0.8);
      c.fillStyle = col; for (let i = 0; i < 26; i++) { const a = i * 2.4, rr2 = r * 0.7 * Math.sqrt(i / 26); circ(c, hx + Math.cos(a) * rr2, hy + Math.sin(a) * rr2, r * 0.15); }
    } else {
      // дзвіночок, що звисає
      c.strokeStyle = sh(lf, -20); c.lineWidth = Math.max(2, h * 0.025);
      c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + r, hy - r * 0.4, hx + r * 1.3, hy + r * 0.3); c.stroke();
      const bx = hx + r * 1.3, by = hy + r * 0.3;
      c.fillStyle = col; c.beginPath(); c.moveTo(bx - r * 0.6, by + r * 0.9); c.quadraticCurveTo(bx - r * 0.6, by, bx, by); c.quadraticCurveTo(bx + r * 0.6, by, bx + r * 0.6, by + r * 0.9);
      for (let i = 0; i < 4; i++) c.lineTo(bx + r * 0.6 - (i + 0.5) * r * 0.3, by + r * (i % 2 ? 0.9 : 1.15));
      c.lineTo(bx - r * 0.6, by + r * 0.9); c.fill();
    }
  }
  function curlTree(c, x, y, s, col) {
    c.strokeStyle = col; c.lineWidth = s * 0.07; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - s * 0.1, y - s * 0.5, x + s * 0.05, y - s * 0.75); c.stroke();
    c.lineWidth = s * 0.04;
    for (const [dx, dy, d] of [[-1, 0.55, -1], [1, 0.62, 1], [-0.6, 0.78, -1], [0.7, 0.85, 1]]) {
      const bx = x + s * 0.02, by = y - s * dy;
      const ex = bx + dx * s * 0.3, ey = by - s * 0.12;
      c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + dx * s * 0.15, by - s * 0.15, ex, ey); c.stroke();
      c.beginPath(); c.arc(ex - d * s * 0.04, ey + s * 0.04, s * 0.05, 0, TAU * 0.75, d < 0); c.stroke();
    }
  }
  function house(c, x, bot, w, h, wall, roof, win, snow) {
    c.fillStyle = wall; c.fillRect(x - w / 2, bot - h, w, h);
    c.fillStyle = roof; tri(c, x - w / 2 - 5, bot - h, x, bot - h - w * 0.55, x + w / 2 + 5, bot - h);
    if (snow) { c.fillStyle = snow; c.beginPath(); c.moveTo(x - w / 2 - 5, bot - h); c.lineTo(x, bot - h - w * 0.55); c.lineTo(x + w / 2 + 5, bot - h); c.lineTo(x + w / 2, bot - h + 3); c.lineTo(x, bot - h - w * 0.45); c.lineTo(x - w / 2, bot - h + 3); c.fill(); }
    c.fillStyle = win; c.fillRect(x - w * 0.3, bot - h * 0.65, w * 0.2, h * 0.28); c.fillRect(x + w * 0.1, bot - h * 0.65, w * 0.2, h * 0.28);
  }
  function rainbow(c, x, y, R, wd, a = 0.5) {
    const rb = ['#ff5a7a', '#ffa64d', '#ffe45c', '#6ed36e', '#4fb0ff', '#a070e0'];
    c.globalAlpha = a; c.lineWidth = wd;
    rb.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(x, y, R - i * wd, Math.PI, 0); c.stroke(); });
    c.globalAlpha = 1;
  }
  function fall(c, x, top, bot, wd, col, foam, t0) {
    const g = c.createLinearGradient(x - wd / 2, 0, x + wd / 2, 0);
    g.addColorStop(0, sh(col, -20)); g.addColorStop(0.5, sh(col, 30)); g.addColorStop(1, sh(col, -10));
    c.fillStyle = g; c.fillRect(x - wd / 2, top, wd, bot - top);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.5;
    for (let i = 0; i < wd / 6; i++) { const lx = x - wd / 2 + 3 + i * 6, o = (i * 37 + t0) % 40; line(c, lx, top + o, lx, Math.min(bot, top + o + 26 + (i % 3) * 14)); }
    c.fillStyle = foam; for (let i = 0; i < 5; i++) circ(c, x - wd / 2 + (i + 0.5) * wd / 5, bot, wd * 0.16 + 4);
  }
  function serac(c, x, bot, w, h, rng) {
    c.fillStyle = '#5aa0d8'; c.beginPath(); c.moveTo(x - w / 2, bot); c.lineTo(x - w / 2 + 2, bot - h * 0.8); c.lineTo(x - w * 0.2, bot - h); c.lineTo(x + w * 0.25, bot - h * 0.9); c.lineTo(x + w / 2, bot - h * 0.7); c.lineTo(x + w / 2, bot); c.fill();
    c.fillStyle = '#9fd6f5'; c.beginPath(); c.moveTo(x - w / 2 + 2, bot); c.lineTo(x - w / 2 + 3, bot - h * 0.8); c.lineTo(x - w * 0.2, bot - h); c.lineTo(x - w * 0.05, bot); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - w / 2, bot - h * 0.8); c.lineTo(x - w * 0.2, bot - h - 4); c.lineTo(x + w * 0.25, bot - h * 0.9 - 4); c.lineTo(x + w / 2 + 2, bot - h * 0.7); c.lineTo(x + w * 0.25, bot - h * 0.86); c.lineTo(x - w * 0.2, bot - h + 2); c.fill();
    c.strokeStyle = 'rgba(40,100,170,0.45)'; c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const lx = x - w * 0.3 + rng() * w * 0.6; line(c, lx, bot - h * 0.75 + rng() * 10, lx + (rng() - 0.5) * 8, bot - 6); }
  }
  function mammoth(c, x, y, s, col) {
    c.fillStyle = col;
    ell(c, x, y - s * 0.55, s * 0.55, s * 0.38); circ(c, x + s * 0.48, y - s * 0.62, s * 0.26);
    c.fillRect(x - s * 0.42, y - s * 0.35, s * 0.14, s * 0.35); c.fillRect(x - s * 0.12, y - s * 0.35, s * 0.14, s * 0.35);
    c.fillRect(x + s * 0.12, y - s * 0.35, s * 0.14, s * 0.35); c.fillRect(x + s * 0.32, y - s * 0.35, s * 0.14, s * 0.35);
    c.strokeStyle = col; c.lineWidth = s * 0.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + s * 0.68, y - s * 0.55); c.quadraticCurveTo(x + s * 0.8, y - s * 0.2, x + s * 0.72, y - s * 0.05); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = s * 0.05;
    c.beginPath(); c.moveTo(x + s * 0.62, y - s * 0.45); c.quadraticCurveTo(x + s * 0.85, y - s * 0.3, x + s * 0.92, y - s * 0.5); c.stroke();
    c.fillStyle = col; ell(c, x + s * 0.02, y - s * 0.9, s * 0.25, s * 0.12);
  }
  function camel(c, x, y, s, col) {
    c.fillStyle = col;
    ell(c, x, y - s * 0.62, s * 0.4, s * 0.17); ell(c, x - s * 0.05, y - s * 0.78, s * 0.2, s * 0.17);
    c.beginPath(); c.moveTo(x + s * 0.3, y - s * 0.65); c.quadraticCurveTo(x + s * 0.45, y - s * 0.75, x + s * 0.45, y - s * 1.0); c.lineTo(x + s * 0.55, y - s * 1.0); c.quadraticCurveTo(x + s * 0.55, y - s * 0.7, x + s * 0.38, y - s * 0.55); c.fill();
    ell(c, x + s * 0.56, y - s * 1.02, s * 0.12, s * 0.07);
    for (const lx of [-0.3, -0.18, 0.18, 0.3]) c.fillRect(x + lx * s - s * 0.03, y - s * 0.55, s * 0.06, s * 0.55);
    c.fillRect(x - s * 0.08, y - s * 1.1, s * 0.1, s * 0.2); circ(c, x - s * 0.03, y - s * 1.14, s * 0.06);
  }

  // ======================= Світи =======================
  window.THEME_PACKS = window.THEME_PACKS || {};
  THEME_PACKS.misc = [
    // 1
    {
      name: 'Тропічний острів', icon: '🏝️',
      sky: ['#14b2e6', '#c8f7ff'],
      ground: { style: 'jungle', body: '#efcf8a', dark: '#dcb46a', top: '#2fbf5a', topDark: '#1f8f42', topLight: 'rgba(255,255,200,0.35)', texture: 'dots' },
      block: { fill: '#c8925a', light: '#e8bf8a', dark: '#8a5a2e', bricks: true },
      oneway: { fill: '#b98a50', dark: '#7a5226' },
      enemy: 'mCoconut', enemyColor: '#8a5a32', flyer: 'mToucan',
      shooter: 'mTikiHead', projectile: '#3fd0ff',
      bounce: { fill: '#ff7043', dark: '#c63f17', light: '#ffccbc' },
      decor: ['mHibiscus', 'mCoconutPile', 'mTikiTorch', 'mSurfboard', 'mHibiscus'],
      particles: 'petals', gravity: 1, pit: '#19c3d6',
      music: { bpm: 116, root: 62, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.25, seed: 65 },
      skyDraw(c, w, h) {
        sun(c, w * 0.82, 66, 30, '#fffbd0', 'rgba(255,250,200,0.6)');
        c.strokeStyle = 'rgba(40,60,80,0.5)'; c.lineWidth = 1.6;
        for (const [x, y, s] of [[0.3, 90, 6], [0.34, 76, 5], [0.62, 120, 4]]) { c.beginPath(); c.moveTo(w * x - s, y); c.quadraticCurveTo(w * x - s / 2, y - s * 0.6, w * x, y); c.quadraticCurveTo(w * x + s / 2, y - s * 0.6, w * x + s, y); c.stroke(); }
      },
      far(c, w, h, r) {
        for (const x of spread(w, 4, r)) { const y = 120 + r() * 60, s = 1.2 + r() * 0.8; wrap(w, x, 110 * s, X => { cloudShape(c, X, y, s, 'rgba(255,255,255,0.95)'); cloudShape(c, X + 18 * s, y - 22 * s, s * 0.8, 'rgba(255,255,255,0.95)'); }); }
        // далекі острови
        wrap(w, w * 0.3, 160, X => {
          c.fillStyle = '#4fae8a'; c.beginPath(); c.moveTo(X - 150, 272); c.quadraticCurveTo(X - 60, 250, X - 28, 196); c.lineTo(X + 18, 194); c.quadraticCurveTo(X + 60, 250, X + 150, 272); c.fill();
          c.fillStyle = '#3e9677'; c.beginPath(); c.moveTo(X - 28, 196); c.lineTo(X - 12, 206); c.lineTo(X + 4, 198); c.lineTo(X + 18, 194); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.7)'; circ(c, X - 2, 184, 8); circ(c, X + 8, 172, 10); circ(c, X + 22, 160, 12);
        });
        for (const fx of [0.68, 0.92]) wrap(w, w * fx, 70, X => {
          c.fillStyle = '#5bbf93'; ell(c, X, 272, 60, 14);
          c.fillStyle = '#f6e3a8'; ell(c, X, 273, 64, 4);
          c.save(); c.translate(X - 18, 266); c.scale(0.4, 0.4); tPalm(c, 0, 0, 120, 0.6, '#3e9a6a', '#55b07a'); c.restore();
          c.save(); c.translate(X + 14, 266); c.scale(0.35, 0.35); tPalm(c, 0, 0, 120, -0.5, '#3e9a6a', '#55b07a'); c.restore();
        });
        const g = c.createLinearGradient(0, 270, 0, h);
        g.addColorStop(0, '#11a7cf'); g.addColorStop(0.5, '#2fd0d8'); g.addColorStop(1, '#7ff0e0');
        c.fillStyle = g; c.fillRect(0, 271, w, h - 271);
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(0, 271, w, 2);
        for (let i = 0; i < 46; i++) { const x = r() * w, y = 282 + r() * 140, l = 8 + r() * 16; wrap(w, x, l, X => c.fillRect(X, y, l, 1.6)); }
      },
      mid(c, w, h, r) {
        // хатинки на палях
        for (const x of spread(w, 2, r, 0.5)) wrap(w, x, 60, X => {
          c.fillStyle = '#7a5226'; for (const dx of [-30, -12, 12, 30]) c.fillRect(X + dx - 2, 300, 4, 50);
          c.fillStyle = '#a0723e'; c.fillRect(X - 40, 296, 80, 6);
          c.fillStyle = '#d9a35a'; c.fillRect(X - 30, 262, 60, 34);
          c.fillStyle = '#5d3a1e'; c.fillRect(X - 6, 274, 12, 22);
          c.fillStyle = '#c9a44a'; c.beginPath(); c.moveTo(X - 44, 266); c.lineTo(X, 228); c.lineTo(X + 44, 266); c.fill();
          c.strokeStyle = '#a0822e'; c.lineWidth = 1.5; for (let i = -36; i <= 36; i += 8) line(c, X + i * 0.3, 238, X + i, 266);
          c.fillStyle = 'rgba(255,255,255,0.5)'; for (const dx of [-30, -12, 12, 30]) ell(c, X + dx, 350, 7, 2);
        });
        const wv = [[2, 8, 0], [5, 4, 1]];
        band(c, w, h, 368, wv, '#f4dc9c');
        const wv2 = [[3, 10, 1], [7, 4, 0]];
        band(c, w, h, 382, wv2, '#2fae55');
        onBand(c, w, 368, wv, 6, r, 80, (x, y, k) => tPalm(c, x, y + 6, 130 + k * 70, k < 0.5 ? 0.7 : -0.6));
        onBand(c, w, 382, wv2, 12, r, 30, (x, y, k) => { c.fillStyle = k < 0.5 ? '#27a04a' : '#3cbf60'; circ(c, x, y + 4, 14 + k * 10); dec(c, 'mHibiscus', x, y + 6, 1.6); });
      },
    },
    // 2
    {
      name: 'Весняна галявина з гігантськими квітами', icon: '🌻',
      sky: ['#86d0ff', '#f6ffe2'],
      ground: { style: 'grass', body: '#8a5a34', dark: '#6e4424', top: '#8ee05a', topDark: '#5cb83a', topLight: 'rgba(255,255,220,0.4)', texture: 'dots' },
      block: { fill: '#e57fa8', light: '#ffb6d0', dark: '#b04a76', bricks: true },
      oneway: { fill: '#7cc04a', dark: '#4e8a2e' },
      enemy: 'mCaterpillar', enemyColor: '#7bd148', flyer: 'butterfly',
      shooter: 'mPeaFlower', projectile: '#ff5fa8',
      bounce: { fill: '#ff7ab8', dark: '#c94a88', light: '#ffd0e6' },
      decor: ['mDaisy', 'mDandelion', 'mBluebell', 'mLadybugLeaf', 'mWateringCan'],
      particles: 'petals', gravity: 1,
      music: { bpm: 108, root: 64, minor: false, lead: 'sine', bass: 'triangle', drums: true, rest: 0.3, seed: 66, bell: true },
      skyDraw(c, w, h) {
        const sx = w * 0.18, sy = 70;
        c.strokeStyle = 'rgba(255,240,150,0.6)'; c.lineWidth = 5; c.lineCap = 'round';
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(c, sx + Math.cos(a) * 40, sy + Math.sin(a) * 40, sx + Math.cos(a) * 54, sy + Math.sin(a) * 54); }
        sun(c, sx, sy, 30, '#fff27a', 'rgba(255,245,160,0.6)');
        c.fillStyle = '#c98a00'; circ(c, sx - 9, sy - 4, 2.6); circ(c, sx + 9, sy - 4, 2.6);
        smile(c, sx, sy + 4, 10, '#c98a00', 2.4);
        blush(c, sx - 16, sy + 6, 4); blush(c, sx + 16, sy + 6, 4);
      },
      far(c, w, h, r) {
        clouds(c, w, 5, r, 40, 130, 'rgba(255,255,255,0.92)', 0.7, 1.2);
        const wv = [[2, 18, 0.6], [3, 10, 1.4]];
        band(c, w, h, 300, wv, '#c6eeae');
        const pc = ['#ffd6e8', '#e6d6ff', '#fff2b0', '#d6f0ff'];
        onBand(c, w, 300, wv, 12, r, 60, (x, y, k) => bigFlower(c, x, y + 10, 90 + k * 110, pick(['daisy', 'puff', 'tulip', 'sun'], k), pick(pc, k * 7), '#f6e6a0', '#a8d898'));
        band(c, w, h, 322, [[3, 8, 2]], '#b2e69a');
      },
      mid(c, w, h, r) {
        const wv = [[2, 10, 0], [5, 5, 1.2]];
        band(c, w, h, 362, wv, '#78d052');
        const kinds = [['sun', '#ffc928', '#8a5a2a'], ['daisy', '#ffffff', '#ffc928'], ['tulip', '#ff5c8a', ''], ['puff', '#b388ff', ''], ['bell', '#7c6cf0', ''], ['daisy', '#ff9ec7', '#fff176'], ['tulip', '#ff8a3d', '']];
        for (const x of spread(w, 7, r, 0.6)) {
          const k = r(), [kd, col, md] = pick(kinds, k), hh = 150 + r() * 90;
          wrap(w, x, 70, X => bigFlower(c, X, bandY(w, 362, wv, X) + 8, hh, kd, col, md));
        }
        onBand(c, w, 362, wv, 18, r, 20, (x, y, k) => { c.fillStyle = k < 0.5 ? '#5cb83a' : '#8ee05a'; for (let i = -2; i <= 2; i++) tri(c, x + i * 4 - 2, y + 6, x + i * 5, y - 10 - (2 - Math.abs(i)) * 5, x + i * 4 + 2, y + 6); });
      },
    },
    // 3
    {
      name: 'Цирк', icon: '🎪',
      sky: ['#5a0f24', '#f0b070'],
      ground: { style: 'sand', body: '#d32f2f', dark: '#b71c1c', top: '#ffe08a', topDark: '#e8a83a', topLight: 'rgba(255,255,255,0.45)', texture: 'stripes' },
      block: { fill: '#1e88e5', light: '#90caf9', dark: '#0d47a1' },
      oneway: { fill: '#f5f5f5', dark: '#c62828' },
      enemy: 'mClownBot', enemyColor: '#7e57c2', flyer: 'mBalloon',
      shooter: 'mClownCannon', projectile: '#ff1744',
      bounce: { fill: '#26c6da', dark: '#00838f', light: '#b2ebf2' },
      decor: ['mCircusBall', 'mPedestal', 'mPopcorn', 'mHoop'],
      particles: 'sparkle', gravity: 1,
      music: { bpm: 138, root: 60, minor: false, lead: 'square', bass: 'triangle', drums: true, rest: 0.2, seed: 67 },
      skyDraw(c, w, h) {
        const cx = w / 2, cy = -50, n = 28;
        for (let i = 0; i < n; i++) {
          const a0 = i / n * Math.PI, a1 = (i + 1) / n * Math.PI;
          c.fillStyle = i % 2 ? '#c62828' : '#fff0d8';
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a0) * 2400, cy + Math.sin(a0) * 2400); c.lineTo(cx + Math.cos(a1) * 2400, cy + Math.sin(a1) * 2400); c.fill();
        }
        const v = c.createRadialGradient(cx, h * 0.55, 80, cx, h * 0.55, Math.max(w, h) * 0.8);
        v.addColorStop(0, 'rgba(60,10,20,0)'); v.addColorStop(1, 'rgba(60,10,20,0.55)');
        c.fillStyle = v; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(60,10,20,0.25)'; c.fillRect(0, 0, w, h);
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [x, a] of [[0.2, 0.35], [0.5, 0], [0.8, -0.35]]) {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, 'rgba(255,240,180,0.22)'); g.addColorStop(1, 'rgba(255,240,180,0.02)');
          c.fillStyle = g; c.beginPath(); c.moveTo(w * x - 10, 0); c.lineTo(w * x + 10, 0); c.lineTo(w * x + Math.sin(a) * h + 120, h); c.lineTo(w * x + Math.sin(a) * h - 120, h); c.fill();
        }
        c.restore();
        c.fillStyle = '#ffd23f'; circ(c, cx, 6, 12);
      },
      far(c, w, h, r) {
        stripeBunting(c, w, 10, 34, 128, ['#ffd23f', '#1e88e5', '#43a047', '#ff4081', '#ffffff'], 20);
        // трибуни з глядачами
        c.fillStyle = '#4a1020'; c.fillRect(0, 236, w, h - 236);
        const fc = ['#ffcc99', '#f1b98a', '#d99a6c', '#a86a44', '#ffe0bd'];
        const hc = ['#3a2410', '#e8b040', '#6d3f22', '#222', '#c0503a'];
        for (let row = 0; row < 5; row++) {
          const y = 252 + row * 18;
          c.fillStyle = row % 2 ? '#7a1a30' : '#6a1428'; c.fillRect(0, y + 4, w, 18);
          for (let x = (row % 2) * 8 + 4; x < w; x += 16) {
            const k = r(); if (k < 0.12) continue;
            const by = y + Math.sin(x * 0.05 + row) * 1;
            c.fillStyle = pick(['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00'], r()); rr(c, x - 5, by + 4, 10, 10, 3); c.fill();
            c.fillStyle = pick(fc, k); circ(c, x, by, 4.4);
            c.fillStyle = pick(hc, r()); c.beginPath(); c.arc(x, by - 1, 4.6, Math.PI, 0); c.fill();
          }
        }
        c.fillStyle = 'rgba(50,6,22,0.5)'; c.fillRect(0, 236, w, 104);
        c.fillStyle = '#ffd23f'; c.fillRect(0, 340, w, 4);
        for (let x = 32; x < w; x += 128) wrap(w, x, 10, X => { c.fillStyle = '#c9a24a'; c.fillRect(X - 4, 0, 8, 344); c.fillStyle = '#fff0b0'; c.fillRect(X - 2, 0, 2, 344); });
      },
      mid(c, w, h, r) {
        // бортик арени
        c.fillStyle = '#f4d27a'; c.fillRect(0, 374, w, h - 374);
        for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? '#ffffff' : '#e53935'; c.fillRect(x, 352, 32, 22); }
        c.fillStyle = '#ffd23f'; c.fillRect(0, 348, w, 5); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(0, 374, w, 4);
        for (let x = 16; x < w; x += 64) { c.fillStyle = '#ffd23f'; star(c, x, 363, 5, 5, 0.45); }
        // реквізит на бортику
        for (const x of spread(w, 5, r, 0.6)) {
          const k = r();
          wrap(w, x, 60, X => {
            if (k < 0.35) { dec(c, 'mPedestal', X, 350, 2.6); dec(c, 'mCircusBall', X, 293, 2.2, k * 9); }
            else if (k < 0.7) { dec(c, 'mCircusBall', X - 16, 350, 2.4, k * 5); dec(c, 'mCircusBall', X + 22, 350, 1.8, k * 7); dec(c, 'mCircusBall', X + 2, 308, 1.8, k * 3); }
            else { dec(c, 'mHoop', X, 350, 2.6, k * 4); }
          });
        }
        haze(c, w, 352, 'rgba(255,220,160,0.18)');
      },
    },
    // 4
    {
      name: 'Льодовий каток', icon: '⛸️',
      sky: ['#1f2c6a', '#f4a8c8'],
      ground: { style: 'stone', body: '#7fb0d8', dark: '#6a9cc8', top: '#e6f8ff', topDark: '#a7d8ef', topLight: 'rgba(255,255,255,0.9)', texture: 'dots' },
      block: { fill: '#6c8fd8', light: '#b6c8f5', dark: '#3f5fa8', bricks: true },
      oneway: { fill: '#ffffff', dark: '#e53935' },
      enemy: 'mPenguinSkater', enemyColor: '#26355a', flyer: 'snowyOwl',
      shooter: 'mSnowThrower', projectile: '#ffffff',
      decor: ['mRinkLamp', 'mSnowBank', 'mCocoaCup', 'mRinkCone'],
      particles: 'snow', gravity: 1, ice: true,
      music: { bpm: 100, root: 65, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.3, seed: 68, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 70, mulberry32(68), h * 0.35);
        crescent(c, w * 0.78, 60, 20, '#fff6d8');
        const g = c.createRadialGradient(w * 0.4, h * 0.75, 20, w * 0.4, h * 0.75, w * 0.6);
        g.addColorStop(0, 'rgba(255,190,210,0.35)'); g.addColorStop(1, 'rgba(255,190,210,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      },
      far(c, w, h, r) {
        let x = 0;
        const walls = ['#4a4f8f', '#55508f', '#43477f', '#5c5a9a'];
        while (x < w) {
          const bw = Math.min(46 + r() * 34, w - x), bh = 70 + r() * 90, col = pick(walls, r()), gable = r() < 0.6;
          c.fillStyle = col; c.fillRect(x, 330 - bh, bw, bh);
          if (gable) { tri(c, x, 330 - bh, x + bw / 2, 330 - bh - bw * 0.5, x + bw, 330 - bh); c.fillStyle = '#f4f8ff'; tri(c, x + bw * 0.2, 330 - bh - bw * 0.1, x + bw / 2, 330 - bh - bw * 0.5, x + bw * 0.8, 330 - bh - bw * 0.1); }
          else { c.fillStyle = '#f4f8ff'; c.fillRect(x - 1, 330 - bh - 3, bw + 2, 4); }
          for (let wy = 330 - bh + 12; wy < 320; wy += 18) for (let wx = x + 7; wx < x + bw - 10; wx += 13) { c.fillStyle = r() < 0.55 ? '#ffd27a' : 'rgba(0,0,0,0.2)'; c.fillRect(wx, wy, 6, 8); }
          x += bw;
        }
        // ратуша з годинником
        wrap(w, w * 0.55, 40, X => {
          c.fillStyle = '#3d4180'; c.fillRect(X - 20, 120, 40, 210); tri(c, X - 24, 122, X, 70, X + 24, 122);
          c.fillStyle = '#fff6d8'; circ(c, X, 145, 11); c.strokeStyle = '#3d4180'; c.lineWidth = 2; line(c, X, 145, X, 138); line(c, X, 145, X + 6, 147);
          c.fillStyle = '#ffd27a'; for (let y = 170; y < 320; y += 24) c.fillRect(X - 5, y, 10, 12);
        });
        c.fillStyle = '#d8e2f6'; c.fillRect(0, 328, w, h - 328);
      },
      mid(c, w, h, r) {
        const wv = [[3, 6, 0]];
        band(c, w, h, 334, wv, '#eef4ff');
        onBand(c, w, 334, wv, 9, r, 40, (x, y, k) => pineTree(c, x, y + 8, 80 + k * 50, '#2f5f5a', '#ffffff'));
        bulbs(c, w, 222, 36, 128, ['#ff5c8a', '#ffd23f', '#5ce1ff', '#9cff6a'], 16, 3);
        // бортик катка
        c.fillStyle = '#ffffff'; c.fillRect(0, 336, w, 30);
        c.fillStyle = '#e53935'; c.fillRect(0, 332, w, 6);
        c.fillStyle = '#c9dff2'; for (let x = 0; x < w; x += 64) c.fillRect(x, 338, 3, 28);
        c.fillStyle = '#1e88e5'; for (let x = 32; x < w; x += 128) { rr(c, x - 22, 344, 44, 14, 3); c.fill(); }
        c.fillStyle = '#fff'; for (let x = 32; x < w; x += 128) { star(c, x - 12, 351, 3.5, 6, 0.45); star(c, x + 12, 351, 3.5, 6, 0.45); circ(c, x, 351, 2.2); }
        for (const x of spread(w, 4, r)) wrap(w, x, 20, X => dec(c, 'mRinkLamp', X, 332, 2.2));
        // лід
        const g = c.createLinearGradient(0, 366, 0, h);
        g.addColorStop(0, '#cdeefc'); g.addColorStop(1, '#9fd2ee');
        c.fillStyle = g; c.fillRect(0, 366, w, h - 366);
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.4;
        for (let i = 0; i < 18; i++) { const x = r() * w, y = 374 + r() * 60, l = 30 + r() * 50; wrap(w, x, l, X => { c.beginPath(); c.moveTo(X, y); c.quadraticCurveTo(X + l / 2, y - 6, X + l, y); c.stroke(); }); }
      },
    },
    // 5
    {
      name: 'Шоколадна фабрика', icon: '🍫',
      sky: ['#f6cfc4', '#fff4ea'],
      ground: { style: 'candy', body: '#f2d6a6', dark: '#d9b47c', top: '#6d3f22', topDark: '#4e2a14', texture: 'bricks' },
      block: { fill: '#8d5a3c', light: '#b98262', dark: '#5d3016', bricks: true },
      oneway: { fill: '#ffb6d0', dark: '#d1477a' },
      enemy: 'mChocoBlob', enemyColor: '#7b4a2e', flyer: 'mCandyFly',
      shooter: 'mChocoKettle', projectile: '#5d3016',
      bounce: { fill: '#fff3f6', dark: '#e0aabc', light: '#ffffff' },
      decor: ['mChocoBar', 'mTruffle', 'mCocoaPod', 'mMarshmallow'],
      particles: 'none', gravity: 1, conveyor: true, pit: '#6d3f22',
      music: { bpm: 120, root: 63, minor: false, lead: 'triangle', bass: 'square', drums: true, rest: 0.25, seed: 69 },
      skyDraw(c, w, h) {
        c.fillStyle = 'rgba(255,255,255,0.35)';
        for (let x = 0; x < w; x += 48) c.fillRect(x, 0, 20, h);
        c.fillStyle = 'rgba(255,140,170,0.18)';
        for (let x = 24; x < w; x += 48) c.fillRect(x, 0, 6, h);
      },
      far(c, w, h, r) {
        // великі чани
        for (const x of spread(w, 3, r, 0.5)) {
          const R = 60 + r() * 20;
          wrap(w, x, R + 30, X => {
            c.fillStyle = '#c98a5a'; c.fillRect(X - R * 0.8, 300, 10, 40); c.fillRect(X + R * 0.8 - 10, 300, 10, 40);
            const g = c.createLinearGradient(X - R, 0, X + R, 0);
            g.addColorStop(0, '#b8743e'); g.addColorStop(0.4, '#f0b27a'); g.addColorStop(1, '#a0602e');
            c.fillStyle = g; rr(c, X - R, 170, R * 2, 140, 30); c.fill();
            c.fillStyle = '#8a4e22'; c.fillRect(X - R, 200, R * 2, 6); c.fillRect(X - R, 280, R * 2, 6);
            c.fillStyle = '#fff6e8'; circ(c, X + R * 0.4, 240, 14); c.strokeStyle = '#8a4e22'; c.lineWidth = 2; line(c, X + R * 0.4, 240, X + R * 0.4 + 8, 234);
            c.fillStyle = '#6d3f22'; ell(c, X, 172, R * 0.9, 12);
            // кран і струмінь шоколаду в річку
            c.fillStyle = '#9aa7b4'; c.fillRect(X + R - 4, 286, 22, 8); c.fillRect(X + R + 10, 286, 8, 14);
            c.fillStyle = '#e53935'; c.fillRect(X + R + 4, 280, 4, 6);
            c.fillStyle = '#5d3016'; c.beginPath(); c.moveTo(X + R + 11, 300); c.quadraticCurveTo(X + R + 8, 312, X + R + 10, 326); c.lineTo(X + R + 20, 326); c.quadraticCurveTo(X + R + 19, 312, X + R + 17, 300); c.fill();
            c.fillStyle = '#7b4a2e'; ell(c, X + R + 15, 326, 12, 4);
            c.fillStyle = '#9a6a4a'; c.fillRect(X - 6, 60, 12, 112);
            c.fillStyle = '#c98a5a'; c.fillRect(X - 10, 60, 20, 8);
          });
        }
        // шоколадна річка з водоспадом
        c.fillStyle = '#6d3f22'; c.fillRect(0, 322, w, h - 322);
        c.fillStyle = '#8a5434'; for (let x = 0; x < w; x += 64) { c.beginPath(); c.ellipse(x + 32, 330, 26, 3, 0, 0, TAU); c.fill(); }
      },
      mid(c, w, h, r) {
        // труби з крапельками зі стелі
        c.fillStyle = '#e48aa8'; c.fillRect(0, 26, w, 16);
        c.fillStyle = '#ffb6d0'; c.fillRect(0, 29, w, 4);
        for (let x = 64; x < w; x += 128) { c.fillStyle = '#c96a8a'; c.fillRect(x - 6, 22, 12, 24); }
        for (const x of spread(w, 5, r)) {
          const len = 60 + r() * 90;
          wrap(w, x, 20, X => {
            c.fillStyle = '#e48aa8'; c.fillRect(X - 7, 42, 14, len);
            c.fillStyle = '#c96a8a'; c.fillRect(X - 10, 42 + len, 20, 8);
            c.fillStyle = '#6d3f22'; c.beginPath(); c.moveTo(X - 6, 50 + len); c.quadraticCurveTo(X - 6, 64 + len, X, 70 + len); c.quadraticCurveTo(X + 6, 64 + len, X + 6, 50 + len); c.fill();
            ell(c, X, 86 + len, 3, 4.5);
          });
        }
        // машини-міксери
        for (const x of spread(w, 3, r, 0.5)) wrap(w, x, 60, X => {
          c.fillStyle = '#ff9ec0'; rr(c, X - 46, 250, 92, 100, 14); c.fill();
          c.fillStyle = '#ffd1e2'; c.fillRect(X - 40, 258, 80, 6);
          c.fillStyle = '#5d3016'; rr(c, X - 36, 272, 72, 26, 6); c.fill();
          const bc = ['#ff4f8b', '#7b4a2e', '#fff3f6', '#4e2a14', '#ffb6d0'];
          for (let i = 0; i < 5; i++) { c.fillStyle = bc[i]; circ(c, X - 26 + i * 13, 286, 5); }
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(X - 34, 274, 68, 4);
          c.fillStyle = '#fff'; circ(c, X - 30, 308, 6); circ(c, X + 30, 308, 6);
          c.strokeStyle = '#c62828'; c.lineWidth = 1.5; line(c, X - 30, 308, X - 27, 304); line(c, X + 30, 308, X + 34, 307);
          c.fillStyle = '#c96a8a'; c.fillRect(X - 46, 320, 92, 6);
          c.strokeStyle = '#b0bec5'; c.lineWidth = 3; line(c, X, 250, X, 210);
          c.lineWidth = 2; for (const d of [-1, 0, 1]) { c.beginPath(); c.moveTo(X, 212); c.quadraticCurveTo(X + d * 16, 194, X, 176); c.stroke(); }
        });
        // шоколадний потік спереду
        const wv = [[4, 4, 0], [9, 2, 1]];
        band(c, w, h, 362, wv, '#7b4a2e');
        c.fillStyle = '#9a6a4a';
        for (const x of spread(w, 14, r)) wrap(w, x, 30, X => { c.beginPath(); c.ellipse(X, bandY(w, 362, wv, X) + 12, 22, 3, 0, 0, TAU); c.fill(); });
        onBand(c, w, 362, wv, 8, r, 30, (x, y, k) => dec(c, k < 0.5 ? 'mTruffle' : 'mMarshmallow', x, y + 4, 1.8));
      },
    },
    // 6
    {
      name: 'Дахи міста', icon: '🏢',
      sky: ['#4a2f86', '#ffb36b'],
      ground: { style: 'stone', body: '#a65a44', dark: '#874635', top: '#5d6d7e', topDark: '#3e4a57', topLight: 'rgba(255,200,150,0.45)', texture: 'bricks' },
      block: { fill: '#8d99a8', light: '#c0cad6', dark: '#5a6676', bricks: true },
      oneway: { fill: '#9a7a5a', dark: '#5d452c' },
      enemy: 'mRoofCat', enemyColor: '#8e8ea0', flyer: 'mPigeon',
      shooter: 'mChimneyPuffer', projectile: '#9aa3b2',
      decor: ['mChimney', 'mTvAntenna', 'mSatDish', 'mRoofPlant', 'mVent'],
      particles: 'none', gravity: 1,
      music: { bpm: 112, root: 58, minor: false, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.3, seed: 70 },
      skyDraw(c, w, h) {
        stars(c, w, h, 30, mulberry32(70), h * 0.18);
        const hg = c.createLinearGradient(0, h * 0.35, 0, h * 0.8);
        hg.addColorStop(0, 'rgba(255,140,90,0)'); hg.addColorStop(1, 'rgba(255,120,80,0.55)');
        c.fillStyle = hg; c.fillRect(0, 0, w, h);
        sun(c, w * 0.62, 236, 50, '#ffe28a', 'rgba(255,170,90,0.6)');
        c.fillStyle = 'rgba(255,120,110,0.5)'; for (let i = 0; i < 3; i++) c.fillRect(w * 0.62 - 60, 236 + 14 + i * 12, 120, 3 + i);
        c.fillStyle = 'rgba(255,130,150,0.55)';
        for (const [x, y, l] of [[0.1, 120, 220], [0.45, 90, 300], [0.72, 150, 260], [0.3, 190, 180]]) { rr(c, w * x, y, l, 9, 4.5); c.fill(); rr(c, w * x + 40, y + 14, l * 0.6, 7, 3.5); c.fill(); }
      },
      far(c, w, h, r) {
        let x = 0;
        while (x < w) {
          const bw = Math.min(30 + r() * 46, w - x), bh = 50 + r() * 100;
          c.fillStyle = r() < 0.5 ? '#6a3f7e' : '#5e3a76';
          c.fillRect(x, 330 - bh, bw, bh);
          for (let wy = 330 - bh + 10; wy < 320; wy += 12) for (let wx = x + 5; wx < x + bw - 6; wx += 9) if (r() < 0.22) { c.fillStyle = '#ffd88a'; c.fillRect(wx, wy, 4, 5); }
          x += bw;
        }
        wrap(w, w * 0.3, 30, X => {
          c.fillStyle = '#5a3570'; c.fillRect(X - 4, 40, 8, 200); tri(c, X - 22, 330, X, 120, X + 22, 330);
          c.fillStyle = '#5a3570'; ell(c, X, 110, 12, 8);
          c.fillStyle = '#ff3d3d'; circ(c, X, 38, 3.5);
        });
        c.fillStyle = '#5e3a76'; c.fillRect(0, 328, w, h - 328);
      },
      mid(c, w, h, r) {
        // дахи з комином, антенами, мансардами (параметри наперед — щоб копії біля країв збігалися)
        const roofs = ['#c0533a', '#4f6272', '#a8432e', '#6a7a8a'], walls = ['#d98a6a', '#e8b07a', '#b8786a', '#caa08a'];
        const segs = [];
        let x = 0;
        while (x < w - 1) {
          let bw = 110 + r() * 60; if (w - x - bw < 90) bw = w - x;
          segs.push({ x0: x + 2, bw: bw - 4, top: 280 + r() * 50, rc: pick(roofs, r()), wc: pick(walls, r()), lit: [r(), r(), r(), r(), r(), r()], dorm: r() < 0.6 ? 0.35 + r() * 0.2 : 0, k: r(), kx: 0.2 + r() * 0.6 });
          x += bw;
        }
        for (const s of segs) wrap(w, s.x0 + s.bw / 2, s.bw / 2 + 12, X => {
          const x0 = X - s.bw / 2, bw = s.bw, top = s.top, rc = s.rc, wc = s.wc;
          c.fillStyle = wc; c.fillRect(x0, top + 20, bw, h - top);
          c.fillStyle = 'rgba(0,0,0,0.12)'; for (let wy = top + 34; wy < h; wy += 30) for (let wx = x0 + 10; wx < x0 + bw - 18; wx += 28) c.fillRect(wx, wy, 12, 16);
          let i = 0; c.fillStyle = '#ffd88a'; for (let wx = x0 + 10; wx < x0 + bw - 18; wx += 28) if (s.lit[i++ % 6] < 0.5) c.fillRect(wx, top + 34, 12, 16);
          c.fillStyle = rc; c.beginPath(); c.moveTo(x0 - 6, top + 22); c.lineTo(x0 + bw * 0.3, top - 10); c.lineTo(x0 + bw * 0.7, top - 10); c.lineTo(x0 + bw + 6, top + 22); c.fill();
          c.strokeStyle = sh(rc, -30); c.lineWidth = 1.2; for (let yy = top - 4; yy < top + 22; yy += 6) line(c, x0 + bw * 0.3 - (yy - top + 10) * 0.9, yy, x0 + bw * 0.7 + (yy - top + 10) * 0.9, yy);
          c.fillStyle = sh(rc, 25); c.fillRect(x0 + bw * 0.3, top - 12, bw * 0.4, 3);
          if (s.dorm) { const dx = x0 + bw * s.dorm; c.fillStyle = wc; c.fillRect(dx, top - 6, 18, 20); c.fillStyle = rc; tri(c, dx - 4, top - 4, dx + 9, top - 18, dx + 22, top - 4); c.fillStyle = '#ffd88a'; c.fillRect(dx + 5, top + 1, 8, 9); }
          if (s.k < 0.5) dec(c, 'mChimney', x0 + bw * s.kx, top - 8, 1.8, s.k * 10);
          else if (s.k < 0.8) dec(c, 'mTvAntenna', x0 + bw * 0.5, top - 10, 1.8);
          else dec(c, 'mSatDish', x0 + bw * 0.6, top - 10, 1.8);
        });
        // мотузка з білизною
        for (const x of spread(w, 3, r)) wrap(w, x, 70, X => {
          c.strokeStyle = '#5d4037'; c.lineWidth = 1; c.beginPath(); c.moveTo(X - 60, 270); c.quadraticCurveTo(X, 290, X + 60, 270); c.stroke();
          const cl = ['#ff5c8a', '#5ce1ff', '#fff176', '#9cff6a', '#ffffff'];
          for (let i = 0; i < 5; i++) { const px = X - 44 + i * 22, py = 270 + 20 * (1 - Math.pow((px - X) / 60, 2)) * 0.9; c.fillStyle = cl[i]; if (i % 2) c.fillRect(px - 6, py, 12, 14); else { c.fillRect(px - 7, py, 14, 6); c.fillRect(px - 5, py + 6, 10, 10); } }
        });
      },
    },
    // 7
    {
      name: 'Гарбузова ніч', icon: '🎃',
      sky: ['#1b0d3c', '#7a3fa0'],
      ground: { style: 'grass', body: '#4a3360', dark: '#3a2650', top: '#5b9a3a', topDark: '#3e7a28', topLight: 'rgba(210,170,255,0.35)', texture: 'dots' },
      block: { fill: '#8e5fc8', light: '#bfa0ec', dark: '#5a3592', bricks: true },
      oneway: { fill: '#8d6e4a', dark: '#5d452c' },
      enemy: 'mPumpkinKid', enemyColor: '#ff8f1f', flyer: 'mBatGhost',
      shooter: 'mJackLantern', projectile: '#ff9a1f',
      decor: ['mPumpkinSmile', 'mPumpkinStack', 'mCandyBucket', 'mGhostPeek', 'mLanternPole'],
      particles: 'fireflies', gravity: 1,
      music: { bpm: 104, root: 57, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 71, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 150, mulberry32(71), h * 0.6);
        const mx = w * 0.72, my = 92;
        sun(c, mx, my, 40, '#fff1c0', 'rgba(255,230,160,0.35)');
        c.fillStyle = 'rgba(220,190,120,0.5)'; circ(c, mx - 14, my - 12, 6); circ(c, mx + 16, my + 14, 4); circ(c, mx + 10, my - 18, 3);
        sleepy(c, mx - 10, my + 2, 4, '#a07a40'); sleepy(c, mx + 10, my + 2, 4, '#a07a40');
        smile(c, mx, my + 10, 8, '#a07a40', 2);
        blush(c, mx - 20, my + 10, 4); blush(c, mx + 20, my + 10, 4);
      },
      far(c, w, h, r) {
        const wv = [[2, 22, 0.4], [3, 10, 1.6]];
        band(c, w, h, 300, wv, '#4a2a7a');
        onBand(c, w, 300, wv, 8, r, 40, (x, y, k) => curlTree(c, x, y + 8, 70 + k * 60, '#3a1f62'));
        wrap(w, w * 0.4, 60, X => {
          const b = bandY(w, 300, wv, X) + 6;
          c.fillStyle = '#3a1f62'; c.fillRect(X - 30, b - 40, 60, 40); tri(c, X - 38, b - 40, X, b - 74, X + 38, b - 40); c.fillRect(X + 14, b - 70, 9, 20);
          c.fillStyle = '#ffcf5a'; c.fillRect(X - 20, b - 30, 12, 12); c.fillRect(X + 8, b - 30, 12, 12); circ(c, X, b - 52, 5);
        });
        band(c, w, h, 330, [[3, 8, 2]], '#3a2266');
      },
      mid(c, w, h, r) {
        bulbs(c, w, 40, 30, 256, ['#ff9a1f', '#b388ff', '#9cff6a'], 24, 4);
        for (const x of spread(w, 3, r)) { const y = 170 + r() * 90; wrap(w, x, 30, X => dec(c, 'mGhostPeek', X, y, 2.2, x * 0.1)); }
        const wv = [[3, 10, 0], [6, 4, 1]];
        band(c, w, h, 360, wv, '#2b1850');
        // штахетник
        c.fillStyle = '#5d4a7a';
        for (let x = 0; x < w; x += 16) { const y = bandY(w, 360, wv, x); c.fillRect(x + 2, y - 24, 8, 30); tri(c, x + 2, y - 24, x + 6, y - 30, x + 10, y - 24); }
        for (let x = 0; x < w; x += 4) { const y = bandY(w, 360, wv, x); c.fillRect(x, y - 16, 4, 3); c.fillRect(x, y - 6, 4, 3); }
        band(c, w, h, 368, wv, '#2b1850');
        c.strokeStyle = '#3e7a28'; c.lineWidth = 3;
        c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 368, wv, x) + 6 + Math.sin(x / w * TAU * 16) * 4); c.stroke();
        onBand(c, w, 368, wv, 9, r, 40, (x, y, k) => dec(c, k < 0.7 ? 'mPumpkinSmile' : 'mPumpkinStack', x, y + 8, 2 + k * 0.8, k * 9));
      },
    },
    // 8
    {
      name: 'Новорічна казка', icon: '🎄',
      sky: ['#0b1a48', '#3b5fae'],
      ground: { style: 'snow', body: '#a8423a', dark: '#8a3028', top: '#ffffff', topDark: '#d6e6f5', texture: 'bricks' },
      block: { fill: '#43a06a', light: '#86d0a0', dark: '#2a6a44', bricks: true },
      oneway: { fill: '#f4f8ff', dark: '#e53935' },
      enemy: 'mGingerbread', enemyColor: '#c77a3a', flyer: 'mBullfinch',
      shooter: 'mNutcracker', projectile: '#a0622a',
      decor: ['mGiftPile', 'mXmasTree', 'mDidukh', 'mCarolStar', 'mSnowBank'],
      particles: 'snow', gravity: 1, ice: true,
      music: { bpm: 126, root: 67, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.25, seed: 72, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 160, mulberry32(72), h * 0.65);
        const sx = w * 0.3, sy = 70;
        glow(c, sx, sy, 60, 'rgba(255,250,200,0.45)');
        c.fillStyle = '#fffbe0'; star(c, sx, sy, 14, 4, 0.25); star(c, sx, sy, 8, 4, 0.3);
        crescent(c, w * 0.85, 56, 18, '#fff8e0');
      },
      far(c, w, h, r) {
        const wv = [[2, 16, 0.3], [3, 8, 1]];
        band(c, w, h, 304, wv, '#c8d8f2');
        const walls = ['#d98a6a', '#e8c07a', '#b0c8e8', '#c8a0d8'];
        onBand(c, w, 304, wv, 7, r, 40, (x, y, k) => {
          house(c, x, y + 8, 30 + k * 14, 22 + k * 10, pick(walls, k), '#7a3a3a', '#ffd27a', '#ffffff');
        });
        // дерев'яна церква з банями
        wrap(w, w * 0.62, 50, X => {
          const b = bandY(w, 304, wv, X) + 8;
          c.fillStyle = '#7a5a4a'; c.fillRect(X - 30, b - 50, 60, 50); c.fillRect(X - 12, b - 82, 24, 34);
          c.fillStyle = '#4a7ac0'; ell(c, X, b - 90, 14, 14); ell(c, X - 22, b - 56, 9, 9); ell(c, X + 22, b - 56, 9, 9);
          c.fillStyle = '#ffd23f'; c.fillRect(X - 1, b - 114, 2, 12); c.fillRect(X - 5, b - 110, 10, 2);
          c.fillStyle = '#fff'; c.beginPath(); c.arc(X, b - 92, 14, Math.PI, 0); c.fill();
          c.fillStyle = '#ffd27a'; c.fillRect(X - 5, b - 40, 10, 16); c.fillRect(X - 20, b - 34, 6, 10); c.fillRect(X + 14, b - 34, 6, 10);
        });
        for (const x of spread(w, 16, r)) { const s = 40 + r() * 30; wrap(w, x, 20, X => pineTree(c, X, bandY(w, 304, wv, X) + 12, s, '#6a8ab0', '#f4f9ff')); }
        band(c, w, h, 326, [[3, 6, 2]], '#dfe9f8');
      },
      mid(c, w, h, r) {
        bulbs(c, w, 18, 44, 256, ['#ff4081', '#ffd23f', '#40c4ff', '#69f0ae', '#ff6e40'], 18, 3.6);
        const wv = [[3, 10, 0], [5, 5, 2]];
        band(c, w, h, 356, wv, '#f4f8ff');
        onBand(c, w, 356, wv, 6, r, 50, (x, y, k) => dec(c, 'mXmasTree', x, y + 8, 3 + k * 1.4, k * 20));
        onBand(c, w, 356, wv, 5, r, 30, (x, y, k) => dec(c, k < 0.6 ? 'mGiftPile' : 'mSnowBank', x, y + 6, 2));
        c.fillStyle = '#ffffff'; for (const x of spread(w, 40, r)) wrap(w, x, 4, X => circ(c, X, bandY(w, 356, wv, X) + 3, 2.2));
      },
    },
    // 9
    {
      name: 'Годинникова вежа', icon: '🕰️',
      sky: ['#3a2416', '#b07a40'],
      ground: { style: 'stone', body: '#6b4a2c', dark: '#553a20', top: '#c9a24a', topDark: '#8a6a2a', topLight: 'rgba(255,240,180,0.5)', texture: 'bricks' },
      block: { fill: '#8a6a52', light: '#b8987a', dark: '#5a4030' },
      oneway: { fill: '#a07a4a', dark: '#5d3a1e' },
      enemy: 'mClockMouse', enemyColor: '#9aa7b4', flyer: 'mCuckooBird',
      shooter: 'mCuckooClock', projectile: '#ffb030',
      decor: ['mHourglass', 'mBrassGear', 'mSmallPendulum', 'mOilCan'],
      particles: 'dust', gravity: 1, conveyor: true,
      music: { bpm: 96, root: 59, minor: true, lead: 'square', bass: 'triangle', drums: true, rest: 0.3, seed: 73, bell: true },
      skyDraw(c, w, h) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const x of [0.2, 0.55, 0.85]) {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, 'rgba(255,220,150,0.2)'); g.addColorStop(1, 'rgba(255,220,150,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(w * x - 20, 0); c.lineTo(w * x + 20, 0); c.lineTo(w * x + 120, h); c.lineTo(w * x + 40, h); c.fill();
        }
        c.restore();
      },
      far(c, w, h, r) {
        // величезний циферблат (зворотний бік)
        wrap(w, w * 0.5, 190, X => {
          const cy = 200, R = 170;
          c.fillStyle = 'rgba(255,236,190,0.35)'; circ(c, X, cy, R);
          c.strokeStyle = '#6a4a2a'; c.lineWidth = 10; c.beginPath(); c.arc(X, cy, R, 0, TAU); c.stroke();
          c.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(c, X + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26), X + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8)); }
          c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; line(c, X - Math.cos(a) * (R - 30), cy - Math.sin(a) * (R - 30), X + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30)); }
          c.lineWidth = 12; line(c, X, cy, X - 60, cy - 90); c.lineWidth = 8; line(c, X, cy, X + 110, cy + 30);
          c.fillStyle = '#6a4a2a'; circ(c, X, cy, 16);
        });
        for (const x of spread(w, 4, r)) { const y = 100 + r() * 200, R = 40 + r() * 40, a = r() * 2; wrap(w, x, R * 1.3, X => gearShape(c, X, y, R, 12, '#7a5434', '#b07a40', a)); }
        c.strokeStyle = '#5a3a1e'; c.lineWidth = 14;
        for (let x = 0; x < w; x += 256) { line(c, x, 0, x + 128, 330); line(c, x + 256, 0, x + 128, 330); }
        c.fillStyle = '#4a2e18'; c.fillRect(0, 326, w, h - 326);
      },
      mid(c, w, h, r) {
        c.fillStyle = '#4a2e18'; c.fillRect(0, 0, w, 20); c.fillStyle = '#6a4a2a'; c.fillRect(0, 18, w, 6);
        for (const x of spread(w, 4, r)) {
          const len = 140 + r() * 90, ang = (r() - 0.5) * 0.5;
          wrap(w, x, 60, X => {
            c.save(); c.translate(X, 24); c.rotate(ang);
            c.fillStyle = '#c9a24a'; c.fillRect(-3, 0, 6, len);
            c.fillStyle = '#e6c46a'; c.fillRect(-1, 0, 2, len);
            c.fillStyle = '#c9a24a'; circ(c, 0, len + 18, 22); c.fillStyle = '#ffdf80'; circ(c, -6, len + 12, 7);
            c.strokeStyle = '#8a6a2a'; c.lineWidth = 3; c.beginPath(); c.arc(0, len + 18, 22, 0, TAU); c.stroke();
            c.restore();
          });
        }
        for (const x of spread(w, 5, r)) { const y = 240 + r() * 80, R = 22 + r() * 22, a = r() * 2; wrap(w, x, R * 1.3, X => gearShape(c, X, y, R, 10, '#b8903e', '#5a3a1e', a)); }
        c.fillStyle = '#7a5434'; c.fillRect(0, 300, w, 8);
        c.fillStyle = '#9a7048'; c.fillRect(0, 300, w, 2);
        // дерев'яна підлога
        c.fillStyle = '#5d3a1e'; c.fillRect(0, 364, w, h - 364);
        c.strokeStyle = '#4a2e18'; c.lineWidth = 2; for (let y = 376; y < h; y += 14) line(c, 0, y, w, y);
        for (let x = 0; x < w; x += 64) { line(c, x, 364, x, 376); line(c, x + 32, 376, x + 32, 390); }
        c.fillStyle = '#8a5a32'; c.fillRect(0, 360, w, 5);
      },
    },
    // 10
    {
      name: 'Країна снів', icon: '🌙',
      sky: ['#3a2c7a', '#f6c6e6'],
      ground: { style: 'cloud', body: '#d3c3f3', dark: '#bfaaea', top: '#fff4ff', topDark: '#ebdcff', texture: 'puffs' },
      block: { fill: '#9fb8f0', light: '#d6e2ff', dark: '#6a84c8' },
      oneway: { fill: '#ffe6f6', dark: '#d8b0d8', style: 'cloud' },
      enemy: 'mSleepySheep', enemyColor: '#ffffff', flyer: 'mMagicOwl',
      shooter: 'mSnoreCloud', projectile: '#9fe0ff',
      bounce: { fill: '#f6eeff', dark: '#b8a4e0', light: '#ffffff' },
      decor: ['mPillowPile', 'mStarLamp', 'mMoonFlower', 'mZzzCloud'],
      particles: 'twinkle', gravity: 1, moverStyle: 'cloud',
      music: { bpm: 78, root: 64, minor: false, lead: 'sine', bass: 'sine', drums: false, rest: 0.4, seed: 74, bell: true },
      skyDraw(c, w, h) {
        stars(c, w, h, 120, mulberry32(74), h * 0.7);
        const mx = w * 0.2, my = 92;
        glow(c, mx, my, 90, 'rgba(255,240,200,0.35)');
        crescent(c, mx, my, 44, '#fff3c0', 0.84, 0.45, -0.2);
        sleepy(c, mx - 22, my + 4, 4, '#b8903e');
        blush(c, mx - 26, my + 14, 4);
        c.fillStyle = '#5c7cfa'; c.beginPath(); c.moveTo(mx - 30, my - 30); c.quadraticCurveTo(mx - 10, my - 70, mx + 30, my - 66); c.quadraticCurveTo(mx, my - 50, mx - 6, my - 26); c.fill();
        c.fillStyle = '#fff'; circ(c, mx + 32, my - 66, 6);
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = 'bold 20px sans-serif'; c.fillText('z', mx + 40, my - 20); c.font = 'bold 14px sans-serif'; c.fillText('z', mx + 56, my - 34);
      },
      far(c, w, h, r) {
        const wv = [[2, 20, 0.2], [3, 12, 1.8]];
        band(c, w, h, 290, wv, '#c0a8ec');
        onBand(c, w, 290, wv, 12, r, 50, (x, y, k) => { c.fillStyle = '#c0a8ec'; circ(c, x, y, 26 + k * 24); });
        const wv2 = [[3, 14, 1], [5, 6, 0]];
        band(c, w, h, 322, wv2, '#f0b8dc');
        onBand(c, w, 322, wv2, 14, r, 40, (x, y, k) => { c.fillStyle = '#f0b8dc'; circ(c, x, y, 20 + k * 20); });
      },
      mid(c, w, h, r) {
        // мобіль із зірок і місяців на ниточках
        for (const x of spread(w, 7, r)) {
          const len = 60 + r() * 120, k = r();
          wrap(w, x, 20, X => {
            c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1; line(c, X, 0, X, len);
            if (k < 0.6) { glow(c, X, len + 10, 24, 'rgba(255,240,160,0.4)'); c.fillStyle = '#fff59d'; star(c, X, len + 10, 12, 5, 0.5); sleepy(c, X - 3, len + 10, 1.6, '#b8903e'); sleepy(c, X + 3, len + 10, 1.6, '#b8903e'); }
            else { glow(c, X, len + 12, 22, 'rgba(255,240,160,0.35)'); crescent(c, X, len + 12, 12, '#fff3c0', 0.82, 0.5, -0.3); }
          });
        }
        const wv = [[3, 10, 0.6], [7, 4, 1]];
        band(c, w, h, 362, wv, '#f6f0ff');
        onBand(c, w, 362, wv, 16, r, 40, (x, y, k) => { c.fillStyle = '#f6f0ff'; circ(c, x, y + 4, 18 + k * 18); c.fillStyle = 'rgba(200,180,240,0.35)'; circ(c, x + 6, y + 10, 10 + k * 8); });
        onBand(c, w, 362, wv, 5, r, 40, (x, y, k) => dec(c, 'mPillowPile', x, y + 2, 2.2));
      },
    },
    // 11
    {
      name: 'Аркада', icon: '👾',
      sky: ['#07011c', '#3a0a6e'],
      ground: { style: 'stone', body: '#170c3a', dark: '#3d2aa0', top: '#ff3cac', topDark: '#7b2cff', topLight: 'rgba(255,255,255,0.6)', texture: 'bricks' },
      block: { fill: '#00b8d4', light: '#84ffff', dark: '#006a7a' },
      oneway: { fill: '#ff3cac', dark: '#8a1a6a' },
      enemy: 'mPixelInvader', enemyColor: '#39ff14', flyer: 'mPixelGhost',
      shooter: 'mPixelTurret', projectile: '#ff3cac',
      bounce: { fill: '#39ff14', dark: '#008a00', light: '#c8ffb8' },
      decor: ['mArcadeCab', 'mJoystick', 'mPixelHeart', 'mPixelTree'],
      particles: 'twinkle', gravity: 1,
      music: { bpm: 140, root: 60, minor: true, lead: 'square', bass: 'square', drums: true, rest: 0.2, seed: 75 },
      skyDraw(c, w, h) {
        const r = mulberry32(75);
        for (let i = 0; i < 90; i++) { c.fillStyle = pick(['#ffffff', '#84ffff', '#ff9ee0'], r()); const s = r() < 0.15 ? 4 : 2; c.fillRect(Math.floor(r() * w / 4) * 4, Math.floor(r() * h * 0.5 / 4) * 4, s, s); }
        const sx = w * 0.5, sy = 210, R = 110;
        c.save(); c.beginPath(); c.arc(sx, sy, R, 0, TAU); c.clip();
        const g = c.createLinearGradient(0, sy - R, 0, sy + R);
        g.addColorStop(0, '#ffe14d'); g.addColorStop(0.5, '#ff7a3d'); g.addColorStop(1, '#ff3cac');
        c.fillStyle = g; c.fillRect(sx - R, sy - R, R * 2, R * 2);
        c.fillStyle = '#2a0858'; for (let i = 0; i < 7; i++) c.fillRect(sx - R, sy + i * 14 - 4, R * 2, 3 + i * 1.3);
        c.restore();
        glow(c, sx, sy, R * 1.6, 'rgba(255,60,172,0.25)');
      },
      far(c, w, h, r) {
        // піксельні гори-сходинки
        const P = 8;
        let y = 260;
        c.fillStyle = '#3b1488';
        const hs = [];
        for (let x = 0; x < w; x += P) hs.push(x);
        const H = x => 250 + Math.round((Math.sin(x / w * TAU * 3) * 30 + Math.sin(x / w * TAU * 5 + 1) * 16) / P) * P;
        for (const x of hs) { c.fillStyle = '#3b1488'; c.fillRect(x, H(x), P, h); c.fillStyle = '#ff3cac'; c.fillRect(x, H(x), P, 2); }
        // неонове місто
        let x = 0;
        while (x < w) {
          const bw = Math.min(P * (4 + Math.floor(r() * 5)), w - x), bh = P * (8 + Math.floor(r() * 14));
          c.fillStyle = '#1a0a4a'; c.fillRect(x, 330 - bh, bw, bh);
          c.fillStyle = r() < 0.5 ? '#00e5ff' : '#ff3cac'; c.fillRect(x, 330 - bh, bw, 2); c.fillRect(x, 330 - bh, 2, bh);
          for (let wy = 330 - bh + P; wy < 322; wy += P * 2) for (let wx = x + P; wx < x + bw - P; wx += P * 2) if (r() < 0.4) { c.fillStyle = pick(['#ffe14d', '#84ffff', '#ff9ee0'], r()); c.fillRect(wx, wy, 4, 4); }
          x += bw + P;
        }
        c.fillStyle = '#1a0a4a'; c.fillRect(0, 328, w, h - 328);
        // перспективна сітка-підлога
        c.strokeStyle = 'rgba(255,60,172,0.6)'; c.lineWidth = 1.5;
        for (let i = 0, yy = 334; yy < h; i++, yy += 4 + i * 3) line(c, 0, yy, w, yy);
        for (let x2 = 0; x2 < w; x2 += 32) line(c, x2, 334, x2, h);
      },
      mid(c, w, h, r) {
        const P = 8;
        const H = x => 350 + Math.round((Math.sin(x / w * TAU * 2 + 0.5) * 14 + Math.sin(x / w * TAU * 7) * 6) / P) * P;
        for (let x = 0; x < w; x += P) { c.fillStyle = '#24105a'; c.fillRect(x, H(x), P, h); c.fillStyle = '#00e5ff'; c.fillRect(x, H(x), P, 3); }
        for (const x of spread(w, 5, r)) { const k = r(); wrap(w, x, 40, X => { const gx = Math.round(X / P) * P; dec(c, k < 0.5 ? 'mArcadeCab' : 'mPixelTree', gx, H(gx) + 2, 2.6, k * 7); }); }
        // піксельні монетки й серця в повітрі
        for (const x of spread(w, 8, r)) {
          const y = 120 + Math.floor(r() * 18) * P, k = r();
          wrap(w, x, 20, X => {
            if (k < 0.5) dec(c, 'mPixelHeart', X, y, 1.6);
            else pix(c, ['.cc.', 'cwcc', 'cccc', '.cc.'], X - 8, y - 16, 4, { c: '#00e5ff', w: '#ffffff' });
          });
        }
      },
    },
    // 12
    {
      name: 'Загублене місто', icon: '🗿',
      sky: ['#4f9a72', '#e6f2c4'],
      ground: { style: 'jungle', body: '#8a8576', dark: '#6f6a5c', top: '#3fa63e', topDark: '#2a7a2c', texture: 'bricks' },
      block: { fill: '#9a9886', light: '#c4c2ae', dark: '#66644f', bricks: true },
      oneway: { fill: '#7a6a4a', dark: '#4e4228' },
      enemy: 'mStoneIdol', enemyColor: '#d08c5a', flyer: 'mFireflyLantern',
      shooter: 'mSeedTotem', projectile: '#8bc34a',
      decor: ['mGoldIdol', 'mRuinPillar', 'mStoneHead', 'mVineUrn', 'fern'],
      particles: 'leaves', gravity: 1,
      music: { bpm: 110, root: 57, minor: true, lead: 'triangle', bass: 'triangle', drums: true, rest: 0.3, seed: 76 },
      skyDraw(c, w, h) {
        sun(c, w * 0.7, 70, 26, '#fffbe0', 'rgba(255,255,220,0.5)');
        c.fillStyle = 'rgba(255,255,230,0.12)';
        for (let i = 0; i < 4; i++) tri(c, w * (0.6 + i * 0.05), 0, w * (0.3 + i * 0.12), h, w * (0.45 + i * 0.12), h);
      },
      far(c, w, h, r) {
        const wv = [[2, 16, 0.5], [5, 8, 1]];
        band(c, w, h, 270, wv, '#7fb08e');
        onBand(c, w, 270, wv, 22, r, 40, (x, y, k) => { c.fillStyle = '#7fb08e'; circ(c, x, y, 20 + k * 20); });
        // ступінчасті піраміди
        for (const fx of [0.25, 0.7]) wrap(w, w * fx, 130, X => {
          const base = 320, steps = 6, sw = 120, sh2 = 22;
          for (let i = 0; i < steps; i++) { c.fillStyle = i % 2 ? '#8aa694' : '#93ae9c'; c.fillRect(X - sw + i * 16, base - (i + 1) * sh2, (sw - i * 16) * 2, sh2); }
          c.fillStyle = '#8aa694'; c.fillRect(X - 14, base - steps * sh2 - 22, 28, 22);
          c.fillStyle = '#5e7a68'; c.fillRect(X - 6, base - steps * sh2 - 16, 12, 16);
          c.fillStyle = '#7a9684'; c.fillRect(X - 10, base - steps * sh2, 20, steps * sh2);
          c.fillStyle = 'rgba(60,140,70,0.5)'; circ(c, X - 70, base - 30, 18); circ(c, X + 60, base - 50, 14);
        });
        band(c, w, h, 318, [[3, 8, 2]], '#6aa07a');
      },
      mid(c, w, h, r) {
        // ліани зверху
        for (const x of spread(w, 10, r)) {
          const len = 60 + r() * 140;
          wrap(w, x, 20, X => {
            c.strokeStyle = '#2f7d32'; c.lineWidth = 3;
            c.beginPath(); c.moveTo(X, 0); for (let y = 0; y < len; y += 10) c.lineTo(X + Math.sin(y * 0.06) * 7, y); c.stroke();
            c.fillStyle = '#4caf50'; for (let y = 16; y < len; y += 20) ell(c, X + Math.sin(y * 0.06) * 7 + 5, y, 7, 3.5, 0.5);
          });
        }
        // зруйнований мур
        const top = 300;
        for (const x of spread(w, 4, r, 0.5)) {
          const ww = 120 + r() * 60, hh = 50 + r() * 30;
          wrap(w, x, ww / 2 + 10, X => {
            c.fillStyle = '#8f8a7a'; c.fillRect(X - ww / 2, top + 60 - hh, ww, hh + 20);
            c.strokeStyle = '#6f6a5c'; c.lineWidth = 1.5;
            for (let y = top + 60 - hh, row = 0; y < top + 80; y += 14, row++) { line(c, X - ww / 2, y, X + ww / 2, y); for (let xx = X - ww / 2 + (row % 2) * 14; xx < X + ww / 2; xx += 28) line(c, xx, y, xx, y + 14); }
            c.fillStyle = '#8f8a7a'; for (let i = 0; i < ww; i += 28) if ((i / 28) % 2) c.fillRect(X - ww / 2 + i, top + 60 - hh - 12, 22, 12);
            c.fillStyle = '#4caf50'; circ(c, X - ww / 2 + 10, top + 60 - hh, 9); circ(c, X + ww / 3, top + 62 - hh, 7);
          });
        }
        for (const x of spread(w, 6, r)) { const k = r(); wrap(w, x, 40, X => {
          if (k < 0.35) dec(c, 'mStoneHead', X, 364, 3);
          else if (k < 0.7) { dec(c, 'mRuinPillar', X, 364, 3.4); dec(c, 'mGoldIdol', X - 4, 364 - 84, 1.8, k * 5); }
          else dec(c, 'mRuinPillar', X, 364, 2.6);
        }); }
        const wv = [[4, 8, 0], [9, 4, 1]];
        band(c, w, h, 364, wv, '#2e8b3a');
        onBand(c, w, 364, wv, 12, r, 30, (x, y, k) => { c.save(); c.translate(x, y + 4); c.scale(2, 2); Art.decors.bigLeaf(c, 0); c.restore(); });
      },
    },
    // 13
    {
      name: 'Пустельний оазис', icon: '🌴',
      sky: ['#3aa6ea', '#ffe8b8'],
      ground: { style: 'sand', body: '#e3a960', dark: '#c98e48', top: '#ffd98a', topDark: '#e0a650', topLight: 'rgba(255,255,230,0.5)', texture: 'dots' },
      block: { fill: '#c9805a', light: '#eaa882', dark: '#8e5232', bricks: true },
      oneway: { fill: '#2e9e9e', dark: '#1a6a6a' },
      enemy: 'mCamelCalf', enemyColor: '#d9a35a', flyer: 'dragonfly',
      shooter: 'mCactusSpitter', projectile: '#7cc04a',
      decor: ['mWaterJar', 'mSmallPalm', 'mDesertTent', 'mPapyrus', 'cactus'],
      particles: 'dust', gravity: 1, pit: '#2aa8d8',
      music: { bpm: 98, root: 62, minor: true, lead: 'triangle', bass: 'sine', drums: true, rest: 0.35, seed: 77 },
      skyDraw(c, w, h) {
        sun(c, w * 0.22, 78, 34, '#fffbe6', 'rgba(255,240,190,0.65)');
        c.fillStyle = 'rgba(255,255,255,0.6)'; rr(c, w * 0.55, 70, 160, 8, 4); c.fill(); rr(c, w * 0.6, 84, 90, 6, 3); c.fill();
      },
      far(c, w, h, r) {
        const wv = [[1, 24, 0.3], [2, 14, 1.2], [3, 6, 2]];
        band(c, w, h, 268, wv, '#f3c98a');
        c.fillStyle = 'rgba(255,240,200,0.6)';
        c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 268, wv, x)); for (let x = w; x >= 0; x -= 8) c.lineTo(x, bandY(w, 268, wv, x) + 5); c.fill();
        // караван верблюдів
        const cx0 = w * 0.38;
        for (let i = 0; i < 5; i++) wrap(w, cx0 + i * 34, 30, X => camel(c, X, bandY(w, 268, wv, X) + 2, 26, '#b8743e'));
        const wv2 = [[2, 16, 2.2], [4, 6, 0.5]];
        band(c, w, h, 300, wv2, '#ebb470');
        for (const x of spread(w, 4, r)) wrap(w, x, 20, X => { c.save(); c.translate(X, bandY(w, 300, wv2, X) + 4); c.scale(1.1, 1.1); tPalm(c, 0, 0, 50, 0.4, '#7aa05a', '#8ab468'); c.restore(); });
      },
      mid(c, w, h, r) {
        const wv = [[2, 8, 0.7], [5, 4, 2]];
        band(c, w, h, 352, wv, '#f6cf88');
        // озерця
        for (const x of spread(w, 2, r, 0.4)) wrap(w, x, 170, X => {
          const y = bandY(w, 352, wv, X) - 8;
          c.fillStyle = '#7cc04a'; ell(c, X, y, 160, 22);
          const g = c.createLinearGradient(0, y - 14, 0, y + 14);
          g.addColorStop(0, '#3fc0f0'); g.addColorStop(1, '#1e88c8');
          c.fillStyle = g; ell(c, X, y + 2, 140, 15);
          c.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = -3; i <= 3; i++) c.fillRect(X + i * 34 - 8, y + (i % 2) * 5, 16, 1.6);
          dec(c, 'mPapyrus', X - 130, y + 4, 2.2); dec(c, 'mPapyrus', X + 128, y + 6, 2);
          tPalm(c, X - 100, y - 6, 150, 0.6); tPalm(c, X + 96, y - 4, 120, -0.6); tPalm(c, X - 50, y - 12, 110, -0.3);
        });
        for (const x of spread(w, 3, r)) wrap(w, x, 40, X => dec(c, 'mDesertTent', X, bandY(w, 352, wv, X) + 6, 2.4));
      },
    },
    // 14
    {
      name: 'Льодовик', icon: '🏔️',
      sky: ['#5bb4ea', '#eef9ff'],
      ground: { style: 'frost', body: '#3f86c4', dark: '#2f6fae', top: '#f2fbff', topDark: '#b8e3f7', texture: 'gems', glow: '#d8f8ff' },
      block: { fill: '#8fd0f2', light: '#e0f6ff', dark: '#4a96c8' },
      oneway: { fill: '#e8f6ff', dark: '#7ab6dc' },
      enemy: 'mMammothCalf', enemyColor: '#8d5a3c', flyer: 'mPuffin',
      shooter: 'mWalrus', projectile: '#eaf6ff',
      decor: ['mIceShard', 'mIceBlock', 'mSnowDrift', 'mFrozenTwig'],
      particles: 'snow', gravity: 1, ice: true, pit: '#1e5a9a',
      music: { bpm: 92, root: 61, minor: false, lead: 'sine', bass: 'triangle', drums: false, rest: 0.35, seed: 78, bell: true },
      skyDraw(c, w, h) {
        sun(c, w * 0.75, 64, 22, '#ffffff', 'rgba(255,255,255,0.55)');
        c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.lineCap = 'round';
        for (const [x, y, l] of [[0.1, 80, 140], [0.35, 50, 200], [0.5, 110, 120]]) { c.beginPath(); c.moveTo(w * x, y); c.quadraticCurveTo(w * x + l / 2, y - 10, w * x + l, y); c.stroke(); }
      },
      far(c, w, h, r) {
        peaks(c, w, h, 250, 5, 110, 170, '#cfe6f6', '#ffffff', r);
        // стіна льодовика
        const wv = [[3, 14, 0], [7, 6, 1]];
        c.fillStyle = '#7cc0ea';
        c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 236, wv, x)); c.lineTo(w, h); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, bandY(w, 236, wv, x) - 4); for (let x = w; x >= 0; x -= 8) c.lineTo(x, bandY(w, 236, wv, x) + 8 + Math.sin(x * 0.2) * 3); c.fill();
        for (let x = 0; x < w; x += 16) { const top = bandY(w, 236, wv, x) + 10; c.fillStyle = (x / 16) % 3 === 0 ? '#5aa8de' : (x / 16) % 3 === 1 ? '#9fd6f5' : '#6cb6e6'; c.fillRect(x, top, 16, 280 - top + (x * 7 % 30)); }
        c.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = 250; y < 300; y += 12) c.fillRect(0, y, w, 3);
        c.fillStyle = '#f2f9ff'; c.fillRect(0, 290, w, h - 290);
        band(c, w, h, 296, [[2, 6, 0.5], [5, 3, 1]], '#e6f2fb');
        // мамонти вдалині
        for (const x of spread(w, 3, r)) { const s = 26 + r() * 10; wrap(w, x, 40, X => { mammoth(c, X, 300, s, '#7a8fa8'); mammoth(c, X + s * 1.4, 300, s * 0.6, '#7a8fa8'); }); }
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 9, r, 0.6)) { const ww = 40 + r() * 50, hh = 60 + r() * 90; wrap(w, x, ww, X => serac(c, X, 362, ww, hh, mulberry32((x * 13) | 0))); }
        const wv = [[3, 8, 0], [7, 3, 1]];
        band(c, w, h, 358, wv, '#f6fbff');
        c.fillStyle = 'rgba(160,210,240,0.6)'; for (const x of spread(w, 10, r)) wrap(w, x, 30, X => ell(c, X, bandY(w, 358, wv, X) + 18, 24, 3));
      },
    },
    // 15
    {
      name: 'Лавова печера', icon: '🔥',
      sky: ['#100306', '#3e0c08'],
      ground: { style: 'lava', body: '#211a2a', dark: '#2e2440', top: '#3d3250', topDark: '#ff5a1f', glow: '#ff7b1a', texture: 'cracks', topLight: 'rgba(255,150,80,0.45)' },
      block: { fill: '#4a3a5e', light: '#6e5c88', dark: '#2a2038' },
      oneway: { fill: '#5d4a6a', dark: '#2e2440' },
      enemy: 'mLavaTurtle', enemyColor: '#ff7a1a', flyer: 'mFireSprite',
      shooter: 'mLavaFlower', projectile: '#ff5a1f',
      decor: ['mObsidianShard', 'mMagmaBubble', 'mSteamVent', 'mEmberStone'],
      particles: 'embers', gravity: 1, pit: '#ff5a00',
      music: { bpm: 132, root: 55, minor: true, lead: 'sawtooth', bass: 'square', drums: true, rest: 0.2, seed: 79 },
      skyDraw(c, w, h) {
        const g = c.createLinearGradient(0, h * 0.4, 0, h);
        g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, 'rgba(255,90,20,0.35)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      },
      far(c, w, h, r) {
        for (const x of spread(w, 22, r)) { const l = 30 + r() * 80; wrap(w, x, 20, X => { c.fillStyle = '#2a0e10'; tri(c, X - 14, 0, X, l, X + 14, 0); }); }
        // лавові водоспади
        for (const x of spread(w, 4, r, 0.5)) {
          const top = 40 + r() * 60, wd = 14 + r() * 12;
          wrap(w, x, 40, X => {
            c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 24;
            const g = c.createLinearGradient(X - wd / 2, 0, X + wd / 2, 0);
            g.addColorStop(0, '#ff4a10'); g.addColorStop(0.5, '#ffc040'); g.addColorStop(1, '#ff5a10');
            c.fillStyle = g; c.fillRect(X - wd / 2, top, wd, 320 - top);
            c.restore();
            c.fillStyle = '#3a1410'; ell(c, X, top, wd, 8);
          });
        }
        band(c, w, h, 300, [[3, 16, 0], [7, 6, 1]], '#2a0e10');
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 20;
        const g = c.createLinearGradient(0, 318, 0, 340); g.addColorStop(0, '#ffb030'); g.addColorStop(1, '#ff4a10');
        c.fillStyle = g; c.fillRect(0, 318, w, 24);
        c.restore();
        c.fillStyle = '#1e0a0c'; c.fillRect(0, 340, w, h - 340);
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 10, r)) { const l = 50 + r() * 110; wrap(w, x, 28, X => {
          c.fillStyle = '#1c1622'; tri(c, X - 22, 0, X, l, X + 22, 0);
          c.fillStyle = '#3d3250'; tri(c, X - 12, 0, X - 2, l * 0.85, X + 2, 0);
          c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.fillStyle = '#ff7a1a'; circ(c, X, l - 2, 2.4); c.restore();
        }); }
        // обсидіанові шпилі з помаранчевим відблиском
        for (const x of spread(w, 7, r, 0.6)) {
          const hh = 70 + r() * 110, ww = 22 + r() * 18;
          wrap(w, x, ww * 1.4, X => {
            c.fillStyle = '#1c1622'; c.beginPath(); c.moveTo(X - ww, 368); c.lineTo(X - ww * 0.4, 368 - hh * 0.6); c.lineTo(X, 368 - hh); c.lineTo(X + ww * 0.5, 368 - hh * 0.5); c.lineTo(X + ww, 368); c.fill();
            c.fillStyle = '#4a3a62'; c.beginPath(); c.moveTo(X - ww * 0.7, 368); c.lineTo(X - ww * 0.35, 368 - hh * 0.58); c.lineTo(X - 1, 368 - hh * 0.96); c.lineTo(X - ww * 0.1, 368); c.fill();
            c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 10; c.strokeStyle = '#ff8a3a'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(X, 368 - hh); c.lineTo(X + ww * 0.5, 368 - hh * 0.5); c.lineTo(X + ww, 368); c.stroke(); c.restore();
          });
        }
        const wv = [[7, 8, 0], [13, 4, 1]];
        band(c, w, h, 362, wv, '#16101e');
        c.save(); c.shadowColor = '#ff6a00'; c.shadowBlur = 8; c.strokeStyle = '#ff7b1a'; c.lineWidth = 2;
        for (const x of spread(w, 12, r)) wrap(w, x, 20, X => { const y = bandY(w, 362, wv, X) + 12; c.beginPath(); c.moveTo(X, y); c.lineTo(X + 8, y + 10); c.lineTo(X + 2, y + 22); c.lineTo(X + 10, y + 32); c.stroke(); });
        c.restore();
      },
    },
    // 16
    {
      name: 'Райдужний водоспад', icon: '🌈',
      sky: ['#78ccff', '#fff0fa'],
      ground: { style: 'grass', body: '#9b7fd8', dark: '#8468c4', top: '#6fe0a0', topDark: '#3fb878', topLight: 'rgba(255,255,255,0.45)', texture: 'gems', glow: '#ffd1ec' },
      block: { fill: '#7ec8f0', light: '#c8ecff', dark: '#4a92c0' },
      oneway: { fill: '#ffffff', dark: '#c8b8ff', style: 'cloud' },
      enemy: 'mUnicorn', enemyColor: '#ffffff', flyer: 'mRainbowBird',
      shooter: 'mBubbleFrog', projectile: '#6fe0ff',
      bounce: { fill: '#ff9de2', dark: '#c860b0', light: '#ffe0f6' },
      decor: ['mSparkleFlower', 'mRainbowArc', 'mPrism', 'mCloudBush'],
      particles: 'sparkle', gravity: 1, pit: '#4fc3f7',
      music: { bpm: 124, root: 66, minor: false, lead: 'triangle', bass: 'sine', drums: true, rest: 0.25, seed: 80, bell: true },
      skyDraw(c, w, h) {
        sun(c, w * 0.12, 60, 26, '#fffde7', 'rgba(255,253,231,0.65)');
        rainbow(c, w * 0.6, 340, 300, 12, 0.35);
      },
      far(c, w, h, r) {
        clouds(c, w, 5, r, 30, 110, 'rgba(255,255,255,0.95)', 0.7, 1.3);
        // скелі з водоспадами
        const cols = ['#b7a6ec', '#a6d8e8', '#c8b0f0'];
        for (const x of spread(w, 4, r, 0.5)) {
          const top = 130 + r() * 50, ww = 90 + r() * 40, col = pick(cols, r());
          wrap(w, x, ww + 20, X => {
            c.fillStyle = col; c.beginPath(); c.moveTo(X - ww, 330); c.lineTo(X - ww * 0.8, top + 20); c.quadraticCurveTo(X, top - 14, X + ww * 0.8, top + 16); c.lineTo(X + ww, 330); c.fill();
            c.fillStyle = sh(col, 18); c.beginPath(); c.moveTo(X - ww * 0.8, top + 20); c.quadraticCurveTo(X - ww * 0.4, top, X - ww * 0.2, top + 4); c.lineTo(X - ww * 0.5, 330); c.lineTo(X - ww, 330); c.fill();
            c.fillStyle = '#6fe0a0'; c.beginPath(); c.moveTo(X - ww * 0.82, top + 22); c.quadraticCurveTo(X, top - 18, X + ww * 0.82, top + 18); c.quadraticCurveTo(X, top - 4, X - ww * 0.82, top + 22); c.fill();
            fall(c, X + ww * 0.1, top + 4, 320, 26, '#bfefff', '#ffffff', x | 0);
            rainbow(c, X + ww * 0.1, 316, 54, 4, 0.55);
          });
        }
        c.fillStyle = '#9fe4ff'; c.fillRect(0, 318, w, h - 318);
        c.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 26; i++) { const x = r() * w, y = 326 + r() * 50; wrap(w, x, 20, X => c.fillRect(X, y, 16, 1.6)); }
      },
      mid(c, w, h, r) {
        for (const x of spread(w, 2, r, 0.4)) wrap(w, x, 80, X => {
          c.fillStyle = '#a490e0'; rr(c, X - 70, 120, 140, 260, 30); c.fill();
          c.fillStyle = '#6fe0a0'; ell(c, X, 124, 74, 14);
          fall(c, X, 128, 350, 60, '#a8ecff', '#ffffff', 7);
          c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 7; i++) circ(c, X - 60 + i * 20, 352 + (i % 2) * 4, 14);
          rainbow(c, X, 340, 90, 6, 0.6);
        });
        const wv = [[3, 10, 0.3], [6, 4, 1]];
        band(c, w, h, 362, wv, '#5fd890');
        onBand(c, w, 362, wv, 16, r, 30, (x, y, k) => dec(c, k < 0.5 ? 'mSparkleFlower' : 'mCloudBush', x, y + 6, 1.8 + k * 0.6, k * 9));
      },
    },
  ];
})();
