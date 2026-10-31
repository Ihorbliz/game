'use strict';
// Рівні 41–80: перемішуємо космічні, підводні та інші світи рівномірно,
// а «Бананова галактика» (останній космічний світ) завжди стає фінальним рівнем.
(() => {
  const P = window.THEME_PACKS || {};
  const space = (P.space || []).slice();
  const finale = space.length ? space.pop() : null;
  const packs = [space, P.water || [], P.misc || []]; // при нічиїй першим іде космос, потім вода
  const used = packs.map(() => 0);
  const total = packs.reduce((a, p) => a + p.length, 0);
  for (let i = 0; i < total; i++) {
    let best = -1, bestNeed = -Infinity;
    packs.forEach((p, k) => {
      if (used[k] >= p.length) return;
      const need = p.length * (i + 1) / total - used[k];
      if (need > bestNeed + 1e-9) { bestNeed = need; best = k; }
    });
    THEMES.push(packs[best][used[best]++]);
  }
  if (finale) THEMES.push(finale);
})();
