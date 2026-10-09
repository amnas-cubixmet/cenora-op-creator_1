import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DoctorTimeFields } from "./DoctorTimeFields";

describe("responsive doctor time editor", () => {
  it("keeps native time inputs in a mobile single-column layout", () => {
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
    expect(root?.className).toContain("grid-cols-1");
    expect(root?.className).toContain("sm:grid-cols-");
    expect((screen.getByLabelText("Start time") as HTMLInputElement).type).toBe("time");
    expect((screen.getByLabelText("End time") as HTMLInputElement).value).toBe("15:00");
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
});
