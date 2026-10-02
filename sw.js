const CACHE_NAME = "hazi-dada-travels-v2";

self.addEventListener("install", event => {
  // Activate immediately.
  event.waitUntil(self.skipWaiting());
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

  // Only handle normal GET requests.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Leave Supabase, CDN and all external services alone.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Always try the live website first.
  // If offline, use the cached response if available.
  event.respondWith(
    fetch(request)
      .then(response => {
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
      })
      .catch(() => caches.match(request))
  );
});
