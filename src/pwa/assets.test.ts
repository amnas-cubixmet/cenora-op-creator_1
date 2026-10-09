import { describe, expect, it } from "vitest";
import { buildManifest, buildServiceWorker, buildVersionDocument, isCurrentCache, mediaCacheName, shellCacheName } from "@/pwa/assets";
import { APP_VERSION } from "@/pwa/version";

describe("PWA versioned cache", () => {
  it("keeps only the caches for the current version", () => {
    expect(isCurrentCache(mediaCacheName("2"), "2")).toBe(true);
    expect(isCurrentCache(shellCacheName("2"), "2")).toBe(true);
    expect(isCurrentCache(mediaCacheName("1"), "2")).toBe(false);
    expect(isCurrentCache("cenora-media-1", "2")).toBe(false);
  });

  it("embeds the version so a bump replaces the service worker and published version", () => {
    const worker = buildServiceWorker("4");
    expect(worker).toContain('"cenora-media-4"');
    expect(worker).toContain('"cenora-shell-4"');
    expect(worker).toContain("caches.delete");
    expect(worker).toContain("skipWaiting");
    expect(buildVersionDocument("4")).toContain('"version":"4"');
    expect(buildServiceWorker()).toContain(JSON.stringify(APP_VERSION));
  });

  it("publishes an installable manifest", () => {
    const manifest = JSON.parse(buildManifest()) as {
      display: string;
      start_url: string;
      icons: { sizes: string; src: string }[];
    };
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });
});
