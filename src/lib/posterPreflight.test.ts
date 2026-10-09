import { describe, expect, it } from "vitest";
import { assertPosterFits } from "./posterPreflight";

describe("readable poster export", () => {
  it("rejects unresolved text rather than exporting clipped doctor details", () => {
    const poster = document.createElement("div");
    poster.innerHTML =
      '<div data-doctor-card="test"><div data-fit-status="overflow">Long doctor name</div></div>';
    expect(() => assertPosterFits(poster)).toThrow("readable sizes");
  });

  it("accepts fitted text", () => {
    const poster = document.createElement("div");
    poster.innerHTML =
      '<div data-doctor-card="test"><div data-fit-status="ready">Doctor</div></div>';
    expect(() => assertPosterFits(poster)).not.toThrow();
  });
});
