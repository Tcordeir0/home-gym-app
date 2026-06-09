// Kill-switch do service worker do V1 (vanilla).
// O app novo (React/Ionic) NÃO usa service worker. Como o V1 registrou um SW
// no mesmo domínio, este arquivo substitui o antigo (mesma URL /sw.js): ele se
// auto-desregistra, apaga os caches e recarrega — evitando servir o V1 em cache
// depois da virada pra gym.trazzidely.com.br.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch { /* ok */ }
    try { await self.registration.unregister(); } catch { /* ok */ }
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => { try { c.navigate(c.url); } catch { /* ok */ } });
  })());
});
