import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FitText } from "./FitText";

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
