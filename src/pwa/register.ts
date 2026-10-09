import { APP_VERSION } from "@/pwa/version";

const RELOAD_KEY = "cenora.pwaReloadedFor";
let reloading = false;

function reloadNow() {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

function reloadFor(version: string) {
  if (sessionStorage.getItem(RELOAD_KEY) === version) return;
  sessionStorage.setItem(RELOAD_KEY, version);
  const url = new URL(window.location.href);
  url.searchParams.set("app", version);
  window.location.replace(url.toString());
}

async function publishedVersion() {
  const response = await fetch("/version.json", { cache: "no-store" });
  if (!response.ok) return null;
  const body = (await response.json()) as { version?: unknown };
  return typeof body.version === "string" ? body.version : null;
}

/**
 * Registers the service worker and reloads once when a newer version takes over.
 * The first install does not reload.
 */
export function registerPwa() {
  if (!("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  if (url.searchParams.get("app") === APP_VERSION) {
    url.searchParams.delete("app");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    sessionStorage.removeItem(RELOAD_KEY);
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      reloadNow();
    });
  }

  const refresh = () => {
    void navigator.serviceWorker.getRegistration("/").then((registration) => registration?.update());
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });

  void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then(async (registration) => {
    await registration.update();
    const version = await publishedVersion().catch(() => null);
    if (!version || version === APP_VERSION) return;
    const worker = registration.waiting ?? registration.installing;
    if (worker) {
      worker.postMessage({ type: "SKIP_WAITING" });
      return;
    }
    reloadFor(version);
  });
}
