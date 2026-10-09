import { useEffect, useRef, useState, type ReactNode } from "react";
import { POSTER_H, POSTER_W } from "./Poster";

/** Scales a fixed 1080×1350 poster to fit its container width. */
export function ScaledPoster({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / POSTER_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-xl shadow-poster" style={{ height: Math.ceil(POSTER_H * scale) }}>
      <div style={{ width: POSTER_W, height: POSTER_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
