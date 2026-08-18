const CACHE_NAME = "rt-app-v1";
const OFFLINE_URL = "/offline.html";

// Assets to precache
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// Install event — precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and admin routes (always go to network)
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("/admin") ||
    event.request.url.includes("/login") ||
    event.request.url.includes("/_next/data/")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
