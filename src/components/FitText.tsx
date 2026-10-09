import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Padding belongs to the glyph-safe frame, not the line count. */
export function textExceedsLineLimit(scrollHeight: number, lineHeight: number, lines: number, paddingY = 0): boolean {
  return scrollHeight > lineHeight * lines + paddingY + 1;
}

/** Text that shrinks only after it exceeds the requested number of lines. */
export function FitText({
  children,
  size,
  style,
  lines = 1,
  keepWords = false,
  preserveGlyphs = false,
  minSize,
}: {
  children: ReactNode;
  size: number;
  style?: CSSProperties;
  lines?: number;
  /** Keep each word intact. Two words wrap between them; a word that still does not fit shrinks. */
  keepWords?: boolean;
  /** Avoid cropping tall Malayalam diacritics in Safari's line box. */
  preserveGlyphs?: boolean;
  /** Optional lower bound for readable names. */
  minSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(size);
  const [tick, setTick] = useState(0);
  // Let the browser wrap naturally. Never insert a forced break between
  // two-word department names; only shrink when the line limit is exceeded.
  const wrap = lines > 1;
  const floor = Math.min(size, Math.max(1, minSize ?? size * 0.45));

  useLayoutEffect(() => setFs(size), [size, children, tick]);
  useEffect(() => {
    document.fonts?.ready.then(() => setTick((t) => t + 1));
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.clientWidth <= 0 || fs <= floor) return;

    const computed = getComputedStyle(el);
    const lineHeight = Number.parseFloat(computed.lineHeight) || fs * 1.2;
    // scrollHeight includes vertical padding. Subtract it before measuring
    // the allowed text lines; otherwise padded Malayalam text shrinks endlessly.
    const paddingY = (Number.parseFloat(computed.paddingTop) || 0) + (Number.parseFloat(computed.paddingBottom) || 0);
    const tooWide = el.scrollWidth > el.clientWidth + 1;
    const tooTall = textExceedsLineLimit(el.scrollHeight, lineHeight, lines, paddingY);
    const overflows = keepWords ? tooWide || (wrap && tooTall) : lines === 1 ? tooWide : tooTall;

    if (overflows) setFs((f) => Math.max(floor, f * 0.94));
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        fontSize: fs,
        whiteSpace: wrap ? "normal" : "nowrap",
        overflow: preserveGlyphs ? "visible" : "hidden",
        overflowWrap: keepWords ? "normal" : wrap ? "break-word" : undefined,
        wordBreak: keepWords ? "keep-all" : undefined,
        hyphens: keepWords ? "manual" : undefined,
      }}
    >
      {children}
    </div>
  );
}
