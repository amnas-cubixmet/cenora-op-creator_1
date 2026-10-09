import { describe, expect, it } from "vitest";
import { DOCTORS } from "./doctors";

describe("static doctor data", () => {
  it("stores every default time in 24-hour HH:mm format", () => {
    const hhmm = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    for (const doctor of DOCTORS) {
      expect(doctor.timings.defaultStart).toMatch(hhmm);
      if (doctor.timings.defaultEnd) expect(doctor.timings.defaultEnd).toMatch(hhmm);
    }
  });

  it("does not include image positioning controls", () => {
    for (const doctor of DOCTORS) {
      expect(doctor).not.toHaveProperty("offsetX");
      expect(doctor).not.toHaveProperty("offsetY");
      expect(doctor).not.toHaveProperty("zoom");
    }
  });
});