import { describe, expect, it } from "vitest";
import { cropSource, exportPixelSize, fittedImageRect, intersectRects, MAX_DOCTORS_PER_POSTER, MAX_EXPORT_SCALE, MIN_EXPORT_SCALE, normalizeExportScale, shouldIncludePosterSvgNode, splitOptions, splitTextToWidths } from "./exportPoster";

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

describe("doctor cards per poster", () => {
  it("allows up to six doctors on one poster", () => {
    expect(MAX_DOCTORS_PER_POSTER).toBe(6);
    expect(splitOptions(1)).toEqual([[1]]);
    expect(splitOptions(6)).toEqual([[6]]);
  });

  it("splits seven or more doctors into multiple posters without losing cards", () => {
    expect(splitOptions(7)[0]).toEqual([4, 3]);
    expect(splitOptions(8)[0]).toEqual([4, 4]);
    expect(splitOptions(12)[0]).toEqual([6, 6]);
    expect(splitOptions(13)[0]).toEqual([5, 4, 4]);

    for (const count of [7, 8, 9, 12, 13, 18, 19, 24]) {
      for (const option of splitOptions(count)) {
        expect(option.length).toBeGreaterThan(1);
        expect(option.reduce((sum, n) => sum + n, 0)).toBe(count);
        expect(option.every((n) => n >= 1 && n <= MAX_DOCTORS_PER_POSTER)).toBe(true);
      }
    }
  });
});

describe("poster SVG bitmap exclusion", () => {
  it("retains vector shapes but paints loaded photos outside the SVG", () => {
    expect(shouldIncludePosterSvgNode(document.createElement("img"))).toBe(false);
    expect(shouldIncludePosterSvgNode(document.createElement("div"))).toBe(true);
    expect(shouldIncludePosterSvgNode(document.createElement("svg"))).toBe(true);
  });
});
