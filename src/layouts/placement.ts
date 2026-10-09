import type { LayoutConfig } from "./config";

export type DoctorPosition = "left" | "right" | "center";

/** Position belongs to a poster slot, never to a doctor's identity. */
export function resolveDoctorPosition(
  count: number,
  index: number,
  cfg: LayoutConfig,
): DoctorPosition {
  if (count === 1) return "center";
  const last = index === count - 1;
  if (last && count % 2 === 1 && (cfg.centerLast || cfg.cols === 1)) return "center";
  return index % 2 === 1 ? "right" : "left";
}

export function doctorCardWidth(position: DoctorPosition, cfg: LayoutConfig): number {
  return position === "center" && cfg.cols === 2
    ? Math.min(860, cfg.cardWidth * 1.6)
    : cfg.cardWidth;
}
