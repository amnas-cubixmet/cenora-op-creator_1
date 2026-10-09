import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { buildManifest, buildServiceWorker, buildVersionDocument } from "./assets";
import { APP_VERSION } from "./version";

const PWA_PATHS = new Set(["/sw.js", "/version.json", "/manifest.webmanifest"]);

export function writePwaFiles(root: string) {
  const directory = resolve(root, "public");
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, "sw.js"), buildServiceWorker(APP_VERSION));
  writeFileSync(resolve(directory, "manifest.webmanifest"), buildManifest());
  writeFileSync(resolve(directory, "version.json"), buildVersionDocument(APP_VERSION));
}

/** Writes the versioned service worker, manifest, and version file into public/. */
export function cenoraPwaPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "cenora-pwa",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      if (process.env.VITEST) return;
      writePwaFiles(root);
    },
    configureServer(server) {
      if (process.env.VITEST) return;
      writePwaFiles(root);
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path && PWA_PATHS.has(path)) res.setHeader("Cache-Control", "no-cache");
        next();
      });
    },
  };
}
