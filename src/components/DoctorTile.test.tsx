import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DoctorTile } from "./DoctorTile";

const sample = { photo: "/assets/doctors/abdul_sameer.png" };

describe("doctor image loading", () => {
  it("defers images in the scrollable doctor list", () => {
    const html = renderToStaticMarkup(createElement(DoctorTile, { d: sample, size: 40 }));
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("prioritizes the full poster photos", () => {
    const html = renderToStaticMarkup(createElement(DoctorTile, { d: sample, size: 190, priority: true }));
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
  });
});
