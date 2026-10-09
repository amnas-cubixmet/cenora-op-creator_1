const VERSION = "7";
const MEDIA_CACHE = "cenora-media-7";
const SHELL_CACHE = "cenora-shell-7";
const MEDIA = /\.(?:png|jpe?g|webp|gif|svg|ico|ttf|otf|woff2?)(?:$|\?)/i;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== MEDIA_CACHE && key !== SHELL_CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || shouldBypass(url.pathname)) return;
  if (MEDIA.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, event));
    return;
  }
  event.respondWith(networkFirst(request, SHELL_CACHE, event));
});

function shouldBypass(pathname) {
  if (pathname === "/sw.js" || pathname === "/version.json" || pathname === "/manifest.webmanifest") return true;
  return (
    pathname.startsWith("/src/") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/node_modules/") ||
    pathname.startsWith("/__") ||
    pathname.startsWith("/_")
  );
}

async function cacheFirst(request, cacheName, event) {
  let cache;
  try {
    cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
  } catch (_) {
    // A full or unavailable cache must not block photos.
  }
  const response = await fetch(request);
  if (cache && response.ok && response.type === "basic") {
    event.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
  }
  return response;
}

async function networkFirst(request, cacheName, event) {
  let cache;
  try { cache = await caches.open(cacheName); } catch (_) {}
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (cache && response.ok && response.type === "basic") {
      event.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
    }
    return response;
  } catch (error) {
    const cached = cache ? await cache.match(request).catch(() => undefined) : undefined;
    if (cached) return cached;
    if (request.mode === "navigate") {
      return new Response("You are offline. Reopen Cenora OP when you are back online.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    throw error;
  }
}
