import { describe, expect, it } from "vitest";
import { cropSource, exportPixelSize, fittedImageRect, intersectRects, MAX_EXPORT_SCALE, MIN_EXPORT_SCALE, normalizeExportScale, splitTextToWidths } from "./exportPoster";

describe("export scale", () => {
  it("defaults to the poster size and stops at 5×", () => {
    expect(MIN_EXPORT_SCALE).toBe(1);
    expect(MAX_EXPORT_SCALE).toBe(5);
    expect(exportPixelSize(1)).toEqual({ width: 1080, height: 1350 });
    expect(exportPixelSize(5)).toEqual({ width: 5400, height: 6750 });
    expect(normalizeExportScale(0)).toBe(1);
    expect(normalizeExportScale(9)).toBe(5);
    expect(normalizeExportScale(2.4)).toBe(2);
  });
});

describe("exported image placement", () => {
  it("crops the padded logo down to the artwork window", () => {
    const frame = { left: 0, top: 0, width: 176, height: 111 };
    const placed = fittedImageRect(
      {
        left: frame.left - (3163 / 4474) * frame.width,
        top: frame.top - (2141 / 2822) * frame.height,
        width: (10800 / 4474) * frame.width,
        height: (7200 / 2822) * frame.height,
      },
      10800,
      7200,
      "fill",
      "50% 50%",
    );
    const visible = intersectRects(placed, frame);
    expect(visible).not.toBeNull();
    const source = cropSource(placed, visible!);
    expect(source.sx).toBeCloseTo(3163, 0);
    expect(source.sy).toBeCloseTo(2141, 0);
    expect(source.sw).toBeCloseTo(4474, 0);
    expect(source.sh).toBeCloseTo(2822, 0);
  });

  it("sits a contained photo on the bottom center of its tile", () => {
    const placed = fittedImageRect({ left: 10, top: 20, width: 100, height: 118 }, 80, 200, "contain", "center bottom");
    expect(placed.width).toBeCloseTo(47.2, 5);
    expect(placed.height).toBeCloseTo(118, 5);
    expect(placed.left).toBeCloseTo(10 + (100 - 47.2) / 2, 5);
    expect(placed.top).toBeCloseTo(20, 5);
    expect(placed).toMatchObject({ sx: 0, sy: 0, sw: 80, sh: 200 });
  });
});

describe("text lines for iPhone export", () => {
  it("keeps a single line together and wraps the rest onto the next width", () => {
    const widthOf = (value: string) => value.length * 10;
    expect(splitTextToWidths(widthOf, "രാവിലെ 10 - 4", [120])).toEqual(["രാവിലെ 10 - 4"]);
    expect(splitTextToWidths(widthOf, "General Medicine Clinic", [70, 90])).toEqual(["General", "Medicine Clinic"]);
  });
});
