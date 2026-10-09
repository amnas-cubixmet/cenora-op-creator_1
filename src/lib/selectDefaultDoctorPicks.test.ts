import { describe, expect, it } from "vitest";
import { selectDefaultDoctorPicks } from "./selectDefaultDoctorPicks";

const doctors = Array.from({ length: 10 }, (_, index) => ({
  id: `doctor-${index + 1}`,
  start: "09:00",
  end: "17:00",
  weekdays: index % 2 === 0 ? [1, 2] : [1],
}));

describe("default doctor selection", () => {
  it("selects only the first six visiting doctors in their saved order", () => {
    expect(selectDefaultDoctorPicks(doctors, 1, 6).map((doctor) => doctor.id))
      .toEqual(["doctor-1", "doctor-2", "doctor-3", "doctor-4", "doctor-5", "doctor-6"]);
  });

  it("selects fewer when fewer than six doctors visit that day", () => {
    expect(selectDefaultDoctorPicks(doctors, 2, 6).map((doctor) => doctor.id))
      .toEqual(["doctor-1", "doctor-3", "doctor-5", "doctor-7", "doctor-9"]);
    expect(selectDefaultDoctorPicks(doctors, 0, 6)).toEqual([]);
  });

  it("keeps start/end times and does not mutate master data", () => {
    const picked = selectDefaultDoctorPicks(doctors, 1, 6);
    expect(picked[0]).toEqual({ id: "doctor-1", start: "09:00", end: "17:00" });
    expect(picked[0]).not.toBe(doctors[0]);
    expect(doctors).toHaveLength(10);
  });
});
