import { describe, expect, it } from "vitest";
import { DOCTOR_GRID_BOTTOM, DOCTOR_GRID_TOP, FOOTER_LOGO_HEIGHT, FOOTER_LOGO_WIDTH, POSTER_H, POSTER_W } from "./Poster";

describe("poster footer branding", () => {
  it("sets aside a visible gap above the footer without shrinking the logo", () => {
    expect(DOCTOR_GRID_TOP).toBe(140);
    expect(DOCTOR_GRID_BOTTOM).toBe(300);
    expect(POSTER_H - DOCTOR_GRID_TOP - DOCTOR_GRID_BOTTOM).toBeGreaterThan(800);
  });

  it("keeps the full Cenora logo large without leaving the poster canvas", () => {
    expect(FOOTER_LOGO_WIDTH).toBeGreaterThanOrEqual(220);
    expect(FOOTER_LOGO_HEIGHT).toBeGreaterThanOrEqual(140);
    expect(FOOTER_LOGO_WIDTH).toBeLessThan(POSTER_W / 3);
    expect(FOOTER_LOGO_HEIGHT).toBeLessThan(POSTER_H / 6);
  });
});
