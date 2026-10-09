import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function wordsIn(children: ReactNode) {
  if (typeof children !== "string") return null;
  const words = children.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 ? words : null;
}

/** Text that shrinks only after it exceeds the requested number of lines. */
export function FitText({
  children,
  size,
  style,
  lines = 1,
  keepWords = false,
}: {
  children: ReactNode;
  size: number;
  style?: CSSProperties;
  lines?: number;
  /** Keep each word intact. Two words wrap between them; a word that still does not fit shrinks. */
  keepWords?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(size);
  const [tick, setTick] = useState(0);
  const words = keepWords ? wordsIn(children) : null;
  const paired = words?.length === 2 ? words : null;
  const wrap = lines > 1 && !(keepWords && words?.length === 1);

  useLayoutEffect(() => setFs(size), [size, children, tick]);
  useEffect(() => {
    document.fonts?.ready.then(() => setTick((t) => t + 1));
  }, []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.clientWidth <= 0 || fs <= size * 0.45) return;

    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || fs * 1.2;
    const tooWide = el.scrollWidth > el.clientWidth + 1;
    const tooTall = el.scrollHeight > lineHeight * lines + 1;
    const overflows = keepWords ? tooWide || (wrap && tooTall) : lines === 1 ? tooWide : tooTall;

    if (overflows) setFs((f) => f * 0.94);
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        fontSize: fs,
        whiteSpace: wrap ? "normal" : "nowrap",
        overflow: "hidden",
        overflowWrap: keepWords ? "normal" : wrap ? "break-word" : undefined,
        wordBreak: keepWords ? "keep-all" : undefined,
        hyphens: keepWords ? "manual" : undefined,
      }}
    >
      {paired ? (
        <>
          {paired[0]}
          <br />
          {paired[1]}
        </>
      ) : (
        children
      )}
    </div>
  );
}
