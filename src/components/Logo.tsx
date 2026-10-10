import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

const widths = { small: 168, medium: 280, large: 420 } as const;

/** One proportional lockup: the unchanged mark and selectable brand typography. */
export function Logo({ className, size = "medium" }: LogoProps) {
  return (
    <div
      className={cn("cenora-logo inline-flex max-w-full items-center", className)}
      style={{ width: widths[size], containerType: "inline-size" } as CSSProperties}
      role="img"
      aria-label="CENORA Medical Center — Care Beyond Cure"
    >
      <img
        data-poster-footer-logo
        src="/assets/logo-mark.png"
        alt=""
        width={266}
        height={270}
        className="block shrink-0 object-contain"
        style={{ width: "24%", height: "auto", aspectRatio: "266 / 270" }}
        decoding="async"
      />
      <div className="min-w-0 flex-1 text-center" style={{ marginLeft: "3%", whiteSpace: "nowrap" }}>
        <span className="block" style={{ fontFamily: '"Montserrat", sans-serif', fontSize: "13.2cqw", fontWeight: 600, lineHeight: 1.05, letterSpacing: "0.025em", color: "#383838" }}>CENORA</span>
        <span className="block" style={{ fontFamily: '"Roboto Condensed", sans-serif', fontSize: "6.4cqw", fontWeight: 700, lineHeight: 1.15, letterSpacing: "0.065em", color: "#383838" }}>MEDICAL CENTER</span>
        <span className="block" style={{ fontFamily: '"Open Sans", sans-serif', fontSize: "3.5cqw", fontWeight: 400, fontStyle: "italic", lineHeight: 1.35, color: "#555555" }}>Care Beyond Cure</span>
      </div>
    </div>
  );
}
