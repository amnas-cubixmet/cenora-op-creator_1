import { describe, expect, it } from "vitest";
import { FOOTER_LOGO_HEIGHT, FOOTER_LOGO_WIDTH, POSTER_H, POSTER_W } from "./Poster";

describe("poster footer branding", () => {
  it("keeps the full Cenora logo large without leaving the poster canvas", () => {
    expect(FOOTER_LOGO_WIDTH).toBeGreaterThanOrEqual(220);
    expect(FOOTER_LOGO_HEIGHT).toBeGreaterThanOrEqual(140);
    expect(FOOTER_LOGO_WIDTH).toBeLessThan(POSTER_W / 3);
    expect(FOOTER_LOGO_HEIGHT).toBeLessThan(POSTER_H / 6);
  });
});
