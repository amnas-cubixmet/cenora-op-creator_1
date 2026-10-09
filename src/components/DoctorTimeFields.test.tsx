import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DoctorTimeFields } from "./DoctorTimeFields";

describe("responsive doctor time editor", () => {
  it("keeps a bounded mobile field and the accessible native iOS time picker", () => {
    const { container } = render(
      <DoctorTimeFields
        start="10:00"
        end="15:00"
        modified={false}
        onStartChange={() => {}}
        onEndChange={() => {}}
        onReset={() => {}}
      />,
    );
    const root = container.querySelector("[data-doctor-time-fields]");
    const start = screen.getByLabelText("Start time") as HTMLInputElement;
    const end = screen.getByLabelText("End time") as HTMLInputElement;
    expect(root?.className).toContain("grid-cols-1");
    expect(root?.className).toContain("sm:grid-cols-");
    expect(start.type).toBe("time");
    expect(start.value).toBe("10:00");
    expect(end.value).toBe("15:00");
    expect(start.className).toContain("absolute inset-0");
    expect(start.parentElement?.className).toContain("overflow-hidden");
    expect(start.parentElement?.className).toContain("max-w-full");
    expect(screen.getByText("10:00 AM")).toBeTruthy();
    expect(screen.getByText("3:00 PM")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Reset time" })).toBeNull();
  });

  it("preserves time changes and reset action", () => {
    const onStartChange = vi.fn();
    const onEndChange = vi.fn();
    const onReset = vi.fn();
    render(
      <DoctorTimeFields
        start="10:00"
        end="15:00"
        modified
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        onReset={onReset}
      />,
    );
    fireEvent.change(screen.getByLabelText("Start time"), { target: { value: "11:30" } });
    fireEvent.change(screen.getByLabelText("End time"), { target: { value: "16:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset time" }));
    expect(onStartChange).toHaveBeenCalledWith("11:30");
    expect(onEndChange).toHaveBeenCalledWith("16:00");
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("keeps long native iOS control text from growing the visible card", () => {
    const { container } = render(
      <DoctorTimeFields
        start="16:30"
        end="19:30"
        modified={false}
        onStartChange={() => {}}
        onEndChange={() => {}}
        onReset={() => {}}
      />,
    );
    const fields = container.querySelectorAll<HTMLInputElement>('input[type="time"]');
    expect(fields).toHaveLength(2);
    for (const field of fields) {
      expect(field.parentElement?.className).toContain("min-w-0");
      expect(field.parentElement?.className).toContain("overflow-hidden");
      expect(field.className).toContain("max-w-full");
    }
    expect(screen.getByText("4:30 PM")).toBeTruthy();
    expect(screen.getByText("7:30 PM")).toBeTruthy();
  });
});
