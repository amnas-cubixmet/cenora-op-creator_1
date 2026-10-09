import { APP_VERSION } from "./version";

export const MEDIA_CACHE_PREFIX = "cenora-media-";
export const SHELL_CACHE_PREFIX = "cenora-shell-";

export function mediaCacheName(version: string) {
  return `${MEDIA_CACHE_PREFIX}${version}`;
}

export function shellCacheName(version: string) {
  return `${SHELL_CACHE_PREFIX}${version}`;
}

/** True when a Cache Storage entry belongs to the running app version. */
export function isCurrentCache(name: string, version: string) {
  return name === mediaCacheName(version) || name === shellCacheName(version);
}

export function buildVersionDocument(version: string) {
  return `${JSON.stringify({ version })}\n`;
}

export function buildManifest() {
  return `${JSON.stringify(
    {
      id: "/",
      name: "Cenora OP Poster Creator",
      short_name: "Cenora OP",
      description: "Create the daily OP chart poster for Cenora Medical Center.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f7fbfb",
      theme_color: "#14a3a0",
      lang: "ml",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
      ],
    },
    null,
    2,
  )}\n`;
}

export function buildServiceWorker(version: string = APP_VERSION) {
  const media = mediaCacheName(version);
  const shell = shellCacheName(version);
  return `const VERSION = ${JSON.stringify(version)};
const MEDIA_CACHE = ${JSON.stringify(media)};
const SHELL_CACHE = ${JSON.stringify(shell)};
const MEDIA = /\\.(?:png|jpe?g|webp|gif|svg|ico|ttf|otf|woff2?)(?:$|\\?)/i;

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
`;
}
