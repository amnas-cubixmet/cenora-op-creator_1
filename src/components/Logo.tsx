import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

const widths = { small: 168, medium: 280, large: 420 } as const;

/** One proportional lockup: the unchanged mark and selectable brand typography. */
export function Logo({ className, size = "medium" }: LogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(widths[size]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fit = () => setWidth(element.clientWidth || widths[size]);
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    return () => observer.disconnect();
  }, [size]);
  return (
    <div
      ref={ref}
      className={cn("cenora-logo grid max-w-full items-center", className)}
      style={{ width: widths[size], gridTemplateColumns: "24% 73%", columnGap: "3%" }}
      role="img"
      aria-label="CENORA Medical Center — Care Beyond Cure"
    >
      <div style={{ aspectRatio: "266 / 270" }}>
      <img
        data-poster-footer-logo
        src="/assets/logo-mark.png"
        alt=""
        width={266}
        height={270}
        className="block shrink-0 object-contain"
        style={{ width: "100%", height: "auto", aspectRatio: "266 / 270" }}
        decoding="async"
      />
      </div>
      <div className="min-w-0 text-center" style={{ whiteSpace: "nowrap" }}>
        <span className="block" style={{ fontFamily: '"Montserrat", sans-serif', fontSize: width * 0.132, fontWeight: 600, lineHeight: 1.05, letterSpacing: "0.025em", color: "#383838" }}>CENORA</span>
        <span className="block" style={{ fontFamily: '"Roboto Condensed", sans-serif', fontSize: width * 0.064, fontWeight: 700, lineHeight: 1.15, letterSpacing: "0.065em", color: "#383838" }}>MEDICAL CENTER</span>
        <span className="block" style={{ fontFamily: '"Open Sans", sans-serif', fontSize: width * 0.035, fontWeight: 400, fontStyle: "italic", lineHeight: 1.35, color: "#555555" }}>Care Beyond Cure</span>
      </div>
    </div>
  );
}
