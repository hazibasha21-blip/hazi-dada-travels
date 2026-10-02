const CACHE_NAME = "hazi-dada-travels-v1";

const APP_SHELL = [
  "/hazi-dada-travels/",
  "/hazi-dada-travels/index.html",
  "/hazi-dada-travels/style.css",
  "/hazi-dada-travels/app.js",
  "/hazi-dada-travels/data.js",
  "/hazi-dada-travels/supabase.js",
  "/hazi-dada-travels/logo.png",
  "/hazi-dada-travels/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never interfere with Supabase/API/external requests.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation: use the latest website when online,
  // fall back to cached index when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put("/hazi-dada-travels/index.html", copy);
          });

          return response;
        })
        .catch(() =>
          caches.match("/hazi-dada-travels/index.html")
        )
    );

    return;
  }

  // Static files: cache first, then network.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
