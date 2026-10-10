import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders selectable wording and a decorative unchanged mark", () => {
    const { container } = render(<Logo />);
    expect(screen.getByRole("img", { name: "CENORA Medical Center — Care Beyond Cure" })).toBeInTheDocument();
    for (const text of ["CENORA", "MEDICAL CENTER", "Care Beyond Cure"]) expect(screen.getByText(text)).toBeInTheDocument();
    const mark = container.querySelector("img");
    expect(mark?.getAttribute("src")).toBe("/assets/logo-mark.png");
    expect(mark?.getAttribute("alt")).toBe("");
    expect(mark?.getAttribute("width")).toBe("266");
    expect(mark?.getAttribute("height")).toBe("270");
  });
  it("supports size and caller classes", () => {
    const { container } = render(<Logo size="small" className="custom-logo" />);
    expect(container.firstChild).toHaveClass("custom-logo");
    expect(container.firstChild).toHaveStyle({ width: "168px" });
  });
});
