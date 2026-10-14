/* Rwendo service worker.
   App shell is cached for offline use. Network-first so a redeploy is
   picked up as soon as the student is online, with the cache as fallback. */
const CACHE = "rwendo-v1-0-0";
const ASSETS = [
  "./", "./index.html", "./about.html", "./privacy.html",
  "./manifest.json", "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only ever cache our own files. Firebase and Google endpoints must not be
  // served from a stale cache, and opaque cross-origin responses only bloat it.
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit =>
        hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
      ))
  );
});
