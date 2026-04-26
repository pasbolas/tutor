const CACHE_NAME = "tutor-notes-v4";

const CORE_ASSETS = [
  "./assets/icons/app-icon-192.png",
  "./assets/icons/app-icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png",
  "./assets/icons/left-arrow.png",
  "./assets/loading/editorial-seal.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("tutor-notes-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "TUTOR_SW_ACTIVATED", cacheName: CACHE_NAME });
          if ("navigate" in client) {
            client.navigate(client.url);
          }
        });
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const acceptsHtml = (event.request.headers.get("accept") || "").includes("text/html");
  const isDocumentRequest = event.request.mode === "navigate" || acceptsHtml;
  const isFreshAssetRequest = (
    isSameOrigin
    && ["script", "style", "worker"].includes(event.request.destination)
  );

  event.respondWith(
    (async () => {
      if (isSameOrigin && (isDocumentRequest || isFreshAssetRequest)) {
        try {
          const networkResponse = await fetch(event.request);

          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        } catch {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          return caches.match("./index.html");
        }
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);

        if (networkResponse && networkResponse.ok && isSameOrigin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      } catch {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return undefined;
      }
    })()
  );
});
