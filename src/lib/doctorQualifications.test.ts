import { describe, expect, it } from "vitest";
import { formatDoctorQualifications } from "./doctorQualifications";

describe("doctor qualification formatting", () => {
  it("joins credential lines with commas for a compact text block", () => {
    expect(formatDoctorQualifications("MBBS\nMD (Internal Medicine)\nCPCDM (Diabetology)"))
      .toBe("MBBS, MD (Internal Medicine), CPCDM (Diabetology)");
  });

  it("does not insert a comma before a continued ampersand title", () => {
    expect(formatDoctorQualifications("MBBS\nMD Physical Medicine\n& Rehabilitation (PMR)"))
      .toBe("MBBS, MD Physical Medicine & Rehabilitation (PMR)");
  });

  it("preserves existing commas and ignores blank lines", () => {
    expect(formatDoctorQualifications(" MBBS, DGO \n\n MS \n DNB - FMAS "))
      .toBe("MBBS, DGO, MS, DNB - FMAS");
    expect(formatDoctorQualifications("\n \n")).toBe("");
  });
});
