'use strict';
// Сервіс-воркер: зберігає гру в кеші, щоб вона працювала без інтернету.
const CACHE = 'minion-game-v5';
const FILES = [
  './',
  './index.html',
  './js/audio.js',
  './js/art.js',
  './js/themes.js',
  './js/themes2.js',
  './js/themes3.js',
  './js/themes4.js',
  './js/themes5.js',
  './js/themes6.js',
  './js/themesOrder.js',
  './js/levels.js',
  './js/game.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Встановлення: кладемо всі файли гри в кеш.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' — беремо свіжі файли з мережі, а не зі старого кешу браузера
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// Активація: прибираємо старі версії кешу.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Запити: спершу кеш, потім мережа (і докладаємо нове в кеш).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Немає мережі: для сторінок віддаємо збережену гру.
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
