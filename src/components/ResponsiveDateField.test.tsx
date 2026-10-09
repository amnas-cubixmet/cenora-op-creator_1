import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResponsiveDateField } from "./ResponsiveDateField";

describe("mobile date selector", () => {
  it("shows a readable date while keeping the native iPhone date picker accessible", () => {
    const { container } = render(<ResponsiveDateField value="2026-10-10" onChange={() => {}} />);
    const field = container.querySelector("[data-poster-date-field]");
    const input = screen.getByLabelText("Choose poster date") as HTMLInputElement;
    expect(field?.className).toContain("overflow-hidden");
    expect(field?.className).toContain("min-w-0");
    expect(screen.getByText("10 Oct 2026")).toBeTruthy();
    expect(input.type).toBe("date");
    expect(input.value).toBe("2026-10-10");
    expect(input.className).toContain("absolute inset-0");
  });

  it("updates the poster date from the native date picker", () => {
    const onChange = vi.fn();
    render(<ResponsiveDateField value="2026-10-10" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Choose poster date"), { target: { value: "2026-10-11" } });
    expect(onChange).toHaveBeenCalledWith("2026-10-11");
  });
});
