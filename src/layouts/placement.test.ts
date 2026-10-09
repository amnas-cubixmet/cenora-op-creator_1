import { describe, expect, it } from "vitest";
import { LAYOUTS } from "./config";
import { doctorCardWidth, resolveDoctorPosition } from "./placement";

describe("position-aware doctor slots", () => {
  it.each([
    [1, ["center"]],
    [2, ["left", "right"]],
    [3, ["left", "right", "center"]],
    [4, ["left", "right", "left", "right"]],
    [5, ["left", "right", "left", "right", "center"]],
    [6, ["left", "right", "left", "right", "left", "right"]],
    [7, ["left", "right", "left", "right", "left", "right", "center"]],
    [8, ["left", "right", "left", "right", "left", "right", "left", "right"]],
  ] as const)("assigns every slot for %i doctors", (count, expected) => {
    expect(
      Array.from({ length: count }, (_, i) => resolveDoctorPosition(count, i, LAYOUTS[count])),
    ).toEqual(expected);
  });

  it("gives the odd final card room without changing paired card widths", () => {
    expect(doctorCardWidth("center", LAYOUTS[5])).toBeGreaterThan(LAYOUTS[5].cardWidth);
    expect(doctorCardWidth("right", LAYOUTS[5])).toBe(LAYOUTS[5].cardWidth);
  });
});
