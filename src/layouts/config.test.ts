import { describe, expect, it } from "vitest";
import { LAYOUTS } from "./config";

describe("poster card hierarchy", () => {
  it("keeps doctor names more prominent than the department and qualifications", () => {
    for (const count of [1, 2, 3, 4, 5, 6] as const) {
      const { text } = LAYOUTS[count];
      expect(text.name).toBeGreaterThan(text.dept);
      expect(text.dept).toBeGreaterThan(text.qual);
    }
  });

  it("fits the larger photos beside text inside each six-card poster row", () => {
    for (const count of [5, 6] as const) {
      const cfg = LAYOUTS[count];
      const photoWidth = Math.min(cfg.tile * 1.1, cfg.cardWidth - 260 - 12);
      const rowHeight = (1350 - 158 - 348 - (cfg.gap ?? 22) * 2) / 3;

      expect(photoWidth).toBeGreaterThan(198);
      expect(photoWidth + 12 + 260).toBeLessThanOrEqual(cfg.cardWidth);
      expect(photoWidth * 1.18).toBeLessThan(rowHeight);
    }
  });
});
