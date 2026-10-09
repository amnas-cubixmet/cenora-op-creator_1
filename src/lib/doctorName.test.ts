import { describe, expect, it } from "vitest";
import { splitDoctorName } from "./doctorName";
import { STATIC_DOCTORS } from "@/store/doctors";

describe("two-line doctor names", () => {
  it("keeps Dr with the first name", () => {
    expect(splitDoctorName("Dr. Abdul Sameer. E")).toEqual(["Dr. Abdul", "Sameer. E"]);
  });
  it("preserves every doctor name without splitting words", () => {
    for (const doctor of STATIC_DOCTORS) {
      const lines = splitDoctorName(doctor.name);
      expect(lines.filter(Boolean).join(" ")).toBe(doctor.name);
      if (doctor.name.includes(" ")) expect(lines.every(Boolean)).toBe(true);
    }
  });
  it("does not cut a single-word name into fragments", () => {
    expect(splitDoctorName("Hasna")).toEqual(["Hasna", ""]);
  });
});
