/* Service worker — app shell offline-first.
   Troque a versão do cache (hgt-vN) ao publicar mudanças para forçar atualização. */
const CACHE = "hgt-v54";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./foods.json",
  "./supabase.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && new URL(req.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});

/* Web Push — recebe a notificação (mesmo com o app fechado) */
self.addEventListener("push", function (e) {
  var payload = {};
  try { payload = e.data ? e.data.json() : {}; } catch (err) { payload = { title: "Home Gym", body: e.data ? e.data.text() : "" }; }
  var options = {
    body: payload.body || "",
    tag: payload.tag || "hg",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    vibrate: [40, 30, 40],
    data: { url: payload.url || "./" }
  };
  e.waitUntil(self.registration.showNotification(payload.title || "Home Gym", options));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ("focus" in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
