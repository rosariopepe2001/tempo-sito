// Service worker di Tempo: fa funzionare l'app anche senza connessione.
var CACHE = "tempo-v1";
var FILE_BASE = ["./", "./index.html", "./manifest.webmanifest", "./icona-192.png", "./icona-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILE_BASE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (chiavi) {
        return Promise.all(chiavi.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Prima la rete (per avere sempre l'ultima versione), poi la cache se offline.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(function (risposta) {
        var copia = risposta.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        return risposta;
      })
      .catch(function () {
        return caches.match(e.request).then(function (m) { return m || caches.match("./index.html"); });
      })
  );
});
