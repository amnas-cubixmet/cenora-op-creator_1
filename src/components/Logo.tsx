import type { CSSProperties } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  style?: CSSProperties;
}

/** Compose the original icon and wordmark without altering either PNG. */
export function Logo({ className, width = 320, style }: LogoProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={width * 78 / 320}
      viewBox="0 0 320 78"
      role="img"
      aria-label="Cenora Medical Center — Care Beyond Cure"
      style={{ display: "block", maxWidth: "100%", height: "auto", ...style }}
    >
      <image x="0" y="0.43" width="76" height="77.14" href="/assets/logo-mark.png" />
      {/* The wordmark PNG has transparent padding; show its original ink bounds. */}
      <svg x="84" y="2.125" width="236" height="73.75" viewBox="0 81 400 125" overflow="hidden">
        <image width="400" height="250" href="/assets/logo-footer.png" />
      </svg>
    </svg>
  );
}
