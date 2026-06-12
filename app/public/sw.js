// Service worker do Home Gym (PWA): network-first com fallback de cache.
// - Online: usa a rede e atualiza o cache (sempre a versão mais nova).
// - Offline: serve do cache; navegações caem no index.html (SPA).
// - Ao ativar: apaga caches antigos (inclui os do V1) — substitui o kill-switch.
const CACHE = 'homegym-v0_6_0';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // não intercepta APIs externas (Supabase, OFF, etc.)

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
      return fresh;
    } catch {
      const cached = await cache.match(req);
      if (cached) return cached;
      // navegação offline → casca do app
      if (req.mode === 'navigate') {
        const shell = await cache.match('/index.html');
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
