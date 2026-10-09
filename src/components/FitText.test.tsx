import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FitText, textExceedsLineLimit } from "./FitText";

describe("poster typography wrapping", () => {
  it("keeps two-word departments available for natural wrapping", () => {
    const markup = renderToStaticMarkup(createElement(FitText, {
      size: 28,
      lines: 2,
      keepWords: true,
    }, "ശിശുരോഗ വിഭാഗം"));
    expect(markup).toContain("ശിശുരോഗ വിഭാഗം");
    expect(markup).not.toContain("<br");
    expect(markup).toContain("white-space:normal");
  });

  it("keeps single-line timing badges unwrapped", () => {
    const markup = renderToStaticMarkup(createElement(FitText, {
      size: 20,
    }, "4:30 PM – 7:30 PM"));
    expect(markup).toContain("white-space:nowrap");
  });
});

describe("Malayalam diacritic-safe text fitting", () => {
  it("does not count glyph breathing room as a third line", () => {
    expect(textExceedsLineLimit(95, 42, 2, 11)).toBe(false);
    expect(textExceedsLineLimit(110, 42, 2, 11)).toBe(true);
    expect(textExceedsLineLimit(42, 30, 1, 11)).toBe(false);
  });

  it("retains upper and lower padding for Malayalam vowel marks", () => {
    const markup = renderToStaticMarkup(createElement(FitText, {
      size: 28,
      lines: 2,
      keepWords: true,
      style: { paddingTop: 5, paddingBottom: 6, lineHeight: 1.45 },
    }, "ഇ.എൻ.ടി ഹെഡ് & നെക്ക്"));

    expect(markup).toContain("padding-top:5px");
    expect(markup).toContain("padding-bottom:6px");
    expect(markup).toContain("line-height:1.45");
    expect(markup).toContain("ഇ.എൻ.ടി ഹെഡ് & നെക്ക്");
  });
});
