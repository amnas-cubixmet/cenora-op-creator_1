import { toSvg } from "html-to-image";
import { POSTER_H, POSTER_W } from "@/components/Poster";

type SavedStyle = { el: HTMLElement; transform: string; opacity: string };

/**
 * The on-screen poster is shrunk with a CSS transform. Phone browsers paint
 * that scaled box into the export, which crops the artwork. Hide the jump,
 * clear the transform while the full-size clone is taken, then restore it.
 * Opacity stays on the wrapper so it is not copied onto the poster itself.
 */
function withoutAncestorScale<T>(node: HTMLElement, run: () => Promise<T>): Promise<T> {
  const saved: SavedStyle[] = [];
  let el = node.parentElement;
  while (el && el !== document.documentElement) {
    if (getComputedStyle(el).transform !== "none") {
      saved.push({ el, transform: el.style.transform, opacity: el.style.opacity });
      el.style.opacity = "0";
      el.style.transform = "none";
    }
    el = el.parentElement;
  }
  const restore = () => {
    for (const item of saved) {
      item.el.style.transform = item.transform;
      item.el.style.opacity = item.opacity;
    }
  };
  return run().then(
    (value) => {
      restore();
      return value;
    },
    (error) => {
      restore();
      throw error;
    },
  );
}

export const MIN_EXPORT_SCALE = 1;
export const MAX_EXPORT_SCALE = 5;

/** Integer export multiplier. 1 is the poster itself, 1080 × 1350. */
export function normalizeExportScale(scale: number) {
  if (!Number.isFinite(scale)) return MIN_EXPORT_SCALE;
  return Math.min(MAX_EXPORT_SCALE, Math.max(MIN_EXPORT_SCALE, Math.round(scale)));
}

export function exportPixelSize(scale: number) {
  const safe = normalizeExportScale(scale);
  return { width: POSTER_W * safe, height: POSTER_H * safe };
}

/** Bitmap photos are painted separately after SVG rasterization. */
export function shouldIncludePosterSvgNode(node: Node) {
  return node.nodeName.toLowerCase() !== "img";
}

function setSvgAttr(attrs: string, name: string, value: string | number) {
  const pattern = new RegExp(`\\s${name}="[^"]*"`);
  const next = ` ${name}="${value}"`;
  return pattern.test(attrs) ? attrs.replace(pattern, next) : `${attrs}${next}`;
}

/** Draw the poster SVG at the requested pixel size so a higher scale stays sharp. */
function sizeSvg(markup: string, scale: number) {
  const { width, height } = exportPixelSize(scale);
  const sized = markup
    .replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
      const next = setSvgAttr(setSvgAttr(setSvgAttr(attrs, "width", width), "height", height), "viewBox", `0 0 ${width} ${height}`);
      return `<svg${next}>`;
    })
    .replace(/<foreignObject\b([^>]*)>/, (_match, attrs: string) => `<foreignObject${setSvgAttr(setSvgAttr(attrs, "width", width), "height", height)}>`);
  if (scale === 1) return sized;
  return sized.replace(
    /(<foreignObject\b[^>]*>\s*<[a-zA-Z][^>]*\bstyle=")([^"]*)(")/,
    `$1$2;transform:scale(${scale});transform-origin:0 0$3`,
  );
}

function canvasHasArtwork(canvas: HTMLCanvasElement) {
  if (canvas.width < POSTER_W || canvas.height < POSTER_H) return false;
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const [r, g, b, a] = ctx.getImageData(24, 24, 1, 1).data;
    return a > 0 && (r < 250 || g < 250 || b < 250);
  } catch {
    return true;
  }
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob && blob.size > 0 ? blob : null), "image/png");
    } catch {
      resolve(null);
    }
  });
}

async function rasterize(markup: string, scale: number) {
  const { width, height } = exportPixelSize(scale);
  // A blob URL taints the canvas once the SVG is drawn. A data URL stays exportable.
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.width = width;
  img.height = height;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Export failed"));
    img.src = url;
  });
  if (img.decode) await img.decode().catch(() => undefined);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Export failed");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

export type ImageBox = { left: number; top: number; width: number; height: number };
export type PlacedImage = ImageBox & { sx: number; sy: number; sw: number; sh: number };

/** Where `object-position` puts the leftover space. Keywords follow the CSS single-value rules. */
export function objectPositionOffset(position: string, extraX: number, extraY: number): [number, number] {
  const parts = position.trim().split(/\s+/).filter(Boolean);
  const axis = (token: string, extra: number) => {
    if (token === "left" || token === "top") return 0;
    if (token === "right" || token === "bottom") return extra;
    if (token === "center") return extra / 2;
    if (token.endsWith("%")) return (Number.parseFloat(token) / 100) * extra;
    if (token.endsWith("px")) return Number.parseFloat(token);
    return extra / 2;
  };
  if (parts.length === 0) return [extraX / 2, extraY / 2];
  if (parts.length === 1) {
    const token = parts[0] ?? "center";
    if (token === "top" || token === "bottom") return [extraX / 2, axis(token, extraY)];
    return [axis(token, extraX), extraY / 2];
  }
  const a = parts[0] ?? "center";
  const b = parts[1] ?? "center";
  if (a === "top" || a === "bottom" || b === "left" || b === "right") return [axis(b, extraX), axis(a, extraY)];
  return [axis(a, extraX), axis(b, extraY)];
}

/**
 * Painted rectangle of an `<img>`, plus the source pixels that fill it.
 * `fill` stretches the file. `contain` letterboxes it. `cover` crops it.
 */
export function fittedImageRect(box: ImageBox, naturalWidth: number, naturalHeight: number, fit: string, position: string): PlacedImage {
  if (fit !== "contain" && fit !== "cover" && fit !== "none" && fit !== "scale-down") {
    return { ...box, sx: 0, sy: 0, sw: naturalWidth, sh: naturalHeight };
  }
  let scale =
    fit === "cover" ? Math.max(box.width / naturalWidth, box.height / naturalHeight) : Math.min(box.width / naturalWidth, box.height / naturalHeight);
  if (fit === "none") scale = 1;
  if (fit === "scale-down") scale = Math.min(1, scale);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const [ox, oy] = objectPositionOffset(position, box.width - width, box.height - height);
  if (fit === "cover") {
    return { left: box.left, top: box.top, width: box.width, height: box.height, sx: -ox / scale, sy: -oy / scale, sw: box.width / scale, sh: box.height / scale };
  }
  return { left: box.left + ox, top: box.top + oy, width, height, sx: 0, sy: 0, sw: naturalWidth, sh: naturalHeight };
}

export function intersectRects(a: ImageBox, b: ImageBox): ImageBox | null {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);
  if (right - left < 0.5 || bottom - top < 0.5) return null;
  return { left, top, width: right - left, height: bottom - top };
}

/** Source pixels that correspond to `visible` inside a placed image. */
export function cropSource(placed: PlacedImage, visible: ImageBox) {
  return {
    sx: placed.sx + ((visible.left - placed.left) / placed.width) * placed.sw,
    sy: placed.sy + ((visible.top - placed.top) / placed.height) * placed.sh,
    sw: (visible.width / placed.width) * placed.sw,
    sh: (visible.height / placed.height) * placed.sh,
  };
}

function overflowsHidden(style: CSSStyleDeclaration) {
  return style.overflow === "hidden" || style.overflowX === "hidden" || style.overflowY === "hidden";
}

function radiusPx(value: string, box: number) {
  if (value.endsWith("%")) return (Number.parseFloat(value) / 100) * box;
  return Number.parseFloat(value) || 0;
}

/** WebKit paints foreignObject text, then skips the HTML images inside it. */
function safariDropsForeignObjectImages() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return /Safari/.test(ua) && /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS|Android/.test(ua);
}

/**
 * iOS draws the SVG text, then drops every HTML image inside the foreignObject.
 * Paint the live photos and logo on top, clipped the same way the preview clips them.
 */
function paintDomImages(canvas: HTMLCanvasElement, poster: HTMLElement) {
  // Images are intentionally excluded from the SVG on every browser.
  // Always composite the loaded DOM photos and logo onto the PNG canvas.
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const posterRect = poster.getBoundingClientRect();
  if (posterRect.width < 1 || posterRect.height < 1) return;
  const scaleX = canvas.width / posterRect.width;
  const scaleY = canvas.height / posterRect.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (const img of poster.querySelectorAll("img")) {
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) continue;
    const style = getComputedStyle(img);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    const box = img.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    const placed = fittedImageRect(
      { left: box.left, top: box.top, width: box.width, height: box.height },
      img.naturalWidth,
      img.naturalHeight,
      style.objectFit,
      style.objectPosition,
    );
    const clips: HTMLElement[] = [];
    let el: HTMLElement | null = img.parentElement;
    while (el) {
      if (overflowsHidden(getComputedStyle(el)) || el === poster) clips.push(el);
      if (el === poster) break;
      el = el.parentElement;
    }
    let visible: ImageBox | null = placed;
    for (const clip of clips) {
      if (!visible) break;
      const bounds = clip.getBoundingClientRect();
      visible = intersectRects(visible, { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height });
    }
    if (!visible) continue;
    const source = cropSource(placed, visible);
    if (source.sw < 0.5 || source.sh < 0.5) continue;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();
    for (const clip of clips) {
      const bounds = clip.getBoundingClientRect();
      const edge = Math.min(bounds.width, bounds.height);
      const clipStyle = getComputedStyle(clip);
      const radii = [
        radiusPx(clipStyle.borderTopLeftRadius, edge) * scaleX,
        radiusPx(clipStyle.borderTopRightRadius, edge) * scaleX,
        radiusPx(clipStyle.borderBottomRightRadius, edge) * scaleY,
        radiusPx(clipStyle.borderBottomLeftRadius, edge) * scaleY,
      ] as [number, number, number, number];
      const x = (bounds.left - posterRect.left) * scaleX;
      const y = (bounds.top - posterRect.top) * scaleY;
      const w = bounds.width * scaleX;
      const h = bounds.height * scaleY;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, radii);
      else ctx.rect(x, y, w, h);
      ctx.clip();
    }
    ctx.globalAlpha = Math.min(1, Math.max(0, Number(style.opacity) || 1));
    ctx.drawImage(
      img,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      (visible.left - posterRect.left) * scaleX,
      (visible.top - posterRect.top) * scaleY,
      visible.width * scaleX,
      visible.height * scaleY,
    );
    ctx.restore();
  }
}

function usesUnpaintableText(style: CSSStyleDeclaration) {
  const clip = `${style.backgroundClip} ${style.getPropertyValue("-webkit-background-clip")}`;
  const primary = style.fontFamily.split(",")[0]?.replace(/["']/g, "").trim() ?? "";
  // Only the face that is actually requested. English text lists Manjari as a fallback.
  return /^manjari$/i.test(primary) || clip.includes("text");
}

function colorIsClear(color: string) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return color === "transparent";
  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return parts.length === 4 && parts[3] === 0;
}

function textFill(ctx: CanvasRenderingContext2D, style: CSSStyleDeclaration, x: number, width: number) {
  const clip = `${style.backgroundClip} ${style.getPropertyValue("-webkit-background-clip")}`;
  if (!clip.includes("text") && !colorIsClear(style.color)) return style.color;
  const gradient = ctx.createLinearGradient(x, 0, x + Math.max(width, 1), 0);
  const stops = style.backgroundImage.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g);
  gradient.addColorStop(0, stops?.[0] ?? "#14a3a0");
  gradient.addColorStop(1, stops?.[stops.length - 1] ?? "#3db36b");
  return gradient;
}

/** Split a string into the same visual lines the browser already wrapped. */
export function splitTextToWidths(measure: (value: string) => number, text: string, widths: number[]) {
  let rest = text;
  const parts: string[] = [];
  for (let i = 0; i < widths.length; i++) {
    if (i === widths.length - 1) {
      parts.push(rest);
      break;
    }
    const target = widths[i] ?? 0;
    let fit = 0;
    for (let end = 1; end <= rest.length; end++) {
      if (measure(rest.slice(0, end)) <= target + 1) fit = end;
      else break;
    }
    const space = rest.lastIndexOf(" ", fit);
    const cut = space > 0 ? space : Math.max(fit, 1);
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, "");
  }
  return parts;
}

function paintTextTree(
  ctx: CanvasRenderingContext2D,
  root: HTMLElement,
  posterRect: DOMRect,
  scaleX: number,
  scaleY: number,
  include: (style: CSSStyleDeclaration) => boolean,
) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const textNode = current;
    const text = textNode.textContent ?? "";
    const parent = textNode.parentElement;
    current = walker.nextNode();
    if (!parent || !text.trim()) continue;
    const style = getComputedStyle(parent);
    if (!include(style) || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0.5 && rect.height > 0.5);
    if (rects.length === 0) continue;
    ctx.save();
    ctx.font = style.font.replace(/(\d+(?:\.\d+)?)px/, (_match, size: string) => `${Number(size) * scaleY}px`);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.globalAlpha = Math.min(1, Math.max(0, Number(style.opacity) || 1));
    const parts = splitTextToWidths((value) => ctx.measureText(value).width / scaleX, text, rects.map((rect) => rect.width));
    parts.forEach((part, index) => {
      const rect = rects[index];
      if (!rect || !part) return;
      const x = (rect.left - posterRect.left) * scaleX;
      const y = (rect.top - posterRect.top) * scaleY + (rect.height * scaleY) / 2;
      const fill = textFill(ctx, style, x, rect.width * scaleX);
      const stroke = Number.parseFloat(style.webkitTextStrokeWidth);
      if (stroke > 0) {
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke * scaleY;
        ctx.strokeStyle = style.webkitTextStrokeColor || (typeof fill === "string" ? fill : "#06343a");
        ctx.strokeText(part, x, y);
      }
      ctx.fillStyle = fill;
      ctx.fillText(part, x, y);
    });
    ctx.restore();
  }
}

/** Dark time chip drawn again after Safari paints the photo on top of it. */
function paintPosterOverlays(canvas: HTMLCanvasElement, poster: HTMLElement, posterRect: DOMRect, scaleX: number, scaleY: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  for (const el of poster.querySelectorAll<HTMLElement>("[data-poster-overlay]")) {
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    const style = getComputedStyle(el);
    const x = (box.left - posterRect.left) * scaleX;
    const y = (box.top - posterRect.top) * scaleY;
    const w = box.width * scaleX;
    const h = box.height * scaleY;
    const edge = Math.min(box.width, box.height);
    const radii = [
      radiusPx(style.borderTopLeftRadius, edge) * scaleX,
      radiusPx(style.borderTopRightRadius, edge) * scaleX,
      radiusPx(style.borderBottomRightRadius, edge) * scaleY,
      radiusPx(style.borderBottomLeftRadius, edge) * scaleY,
    ] as [number, number, number, number];
    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, radii);
    else ctx.rect(x, y, w, h);
    const shade = ctx.createLinearGradient(x, y + h, x, y);
    shade.addColorStop(0, "#06343a");
    shade.addColorStop(0.58, "rgba(6, 52, 58, 0.72)");
    shade.addColorStop(1, "rgba(6, 52, 58, 0)");
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.restore();
    paintTextTree(ctx, el, posterRect, scaleX, scaleY, () => true);
  }
}

/**
 * iOS leaves Malayalam and gradient titles blank when the poster SVG is drawn.
 * The same faces are already loaded for the preview, so paint those runs directly.
 * Photos are already on the canvas, so the time chip is painted again on top of them.
 */
function paintDomText(canvas: HTMLCanvasElement, poster: HTMLElement) {
  if (!safariDropsForeignObjectImages()) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const posterRect = poster.getBoundingClientRect();
  if (posterRect.width < 1 || posterRect.height < 1) return;
  const scaleX = canvas.width / posterRect.width;
  const scaleY = canvas.height / posterRect.height;
  paintTextTree(ctx, poster, posterRect, scaleX, scaleY, usesUnpaintableText);
}

async function paintPoster(node: HTMLElement, scale: number) {
  const dataUrl = await toSvg(node, {
    width: POSTER_W,
    height: POSTER_H,
    cacheBust: false,
    filter: shouldIncludePosterSvgNode,
    style: {
      transform: "none",
      width: `${POSTER_W}px`,
      height: `${POSTER_H}px`,
    },
  });
  const markup = sizeSvg(await (await fetch(dataUrl)).text(), scale);
  const canvas = await rasterize(markup, scale);
  paintDomImages(canvas, node);
  // Repaint the timing chips after their portraits on every browser.
  const rect = node.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    paintPosterOverlays(canvas, node, rect, canvas.width / rect.width, canvas.height / rect.height);
  }
  paintDomText(canvas, node);
  return canvas;
}

export async function posterToBlob(node: HTMLElement, scale = MIN_EXPORT_SCALE): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const images = [...node.querySelectorAll("img")];
  for (const img of images) img.loading = "eager";
  await Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => undefined) : undefined)));
  const requested = normalizeExportScale(scale);

  return withoutAncestorScale(node, async () => {
    let canvas = await paintPoster(node, requested);
    let blob = canvasHasArtwork(canvas) ? await canvasToPng(canvas) : null;
    if (!blob && requested !== MIN_EXPORT_SCALE) {
      canvas = await paintPoster(node, MIN_EXPORT_SCALE);
      blob = canvasHasArtwork(canvas) ? await canvasToPng(canvas) : null;
    }
    if (!blob) throw new Error("Export failed");
    return blob;
  });
}

function isMobileSave() {
  return window.matchMedia("(pointer: coarse)").matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function shareFiles(files: File[]) {
  if (!isMobileSave() || !navigator.canShare?.({ files })) return false;
  try {
    await navigator.share({ files });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}

export async function downloadBlob(blob: Blob, name: string) {
  const type = blob.type || (name.endsWith(".zip") ? "application/zip" : "image/png");
  const file = new File([blob], name, { type });
  if (await shareFiles([file])) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export const MAX_DOCTORS_PER_POSTER = 6;

/** Split doctors across posters with at most 6 cards each (2 pages: all valid choices; more: even split). */
export function splitOptions(n: number): number[][] {
  if (n <= MAX_DOCTORS_PER_POSTER) return [[n]];
  const pages = Math.ceil(n / MAX_DOCTORS_PER_POSTER);
  if (pages === 2) {
    const out: number[][] = [];
    for (let a = MAX_DOCTORS_PER_POSTER; a >= n - MAX_DOCTORS_PER_POSTER; a--) out.push([a, n - a]);
    return out.sort((x, y) => Math.abs(x[0]! - x[1]!) - Math.abs(y[0]! - y[1]!));
  }
  const base = Math.floor(n / pages);
  const rem = n % pages;
  return [Array.from({ length: pages }, (_, i) => base + (i < rem ? 1 : 0))];
}

/** Phones save a set of posters through the share sheet. Desktop keeps the zip. */
export async function downloadPngFiles(items: { blob: Blob; name: string }[]) {
  const files = items.map((item) => new File([item.blob], item.name, { type: "image/png" }));
  if (items.length > 1 && (await shareFiles(files))) return false;
  if (items.length === 1) {
    await downloadBlob(items[0].blob, items[0].name);
    return false;
  }
  return true;
}
