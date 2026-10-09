import { describe, expect, it } from "vitest";
import { formatTimeClock, formatTimeMl } from "./formatTime";

describe("formatTimeMl", () => {
  it.each([
    ["11:00", "15:00", "രാവിലെ 11 മുതൽ വൈകുന്നേരം 3 വരെ"],
    ["16:30", "19:30", "വൈകുന്നേരം 4.30 - 7.30"],
    ["14:00", "16:00", "വൈകുന്നേരം 2 - 4"],
    ["19:00", "20:00", "വൈകുന്നേരം 7 - 8"],
    ["08:00", "22:00", "രാവിലെ 8 മുതൽ രാത്രി 10 വരെ"],
    ["17:00", "18:00", "വൈകുന്നേരം 5 - 6"],
  ])("%s–%s", (s, e, out) => {
    expect(formatTimeMl(s, e, "ml")).toBe(out);
  });

  it("only end time", () => expect(formatTimeMl(null, "22:00")).toBe("രാത്രി 10 വരെ"));
  it("only start time", () => expect(formatTimeMl("06:30", null)).toBe("രാവിലെ 6.30 മുതൽ"));
  it("24 hours", () => expect(formatTimeMl("00:00", "00:00")).toBe("24 മണിക്കൂറും"));
  it("noon period", () => expect(formatTimeMl("12:00", "13:00")).toBe("ഉച്ചയ്ക്ക് 12 - 1"));
  it("english", () => expect(formatTimeMl("11:00", "15:00", "en")).toBe("11 AM to 3 PM"));
});

describe("formatTimeClock", () => {
  it("writes both ends with minutes and meridiem", () => {
    expect(formatTimeClock("09:30", "12:30")).toBe("9:30 AM - 12:30 PM");
    expect(formatTimeClock("16:30", "19:30")).toBe("4:30 PM - 7:30 PM");
  });
  it("keeps a single bound", () => expect(formatTimeClock("06:30", null)).toBe("6:30 AM"));
  it("covers a full day", () => expect(formatTimeClock("00:00", "00:00")).toBe("12:00 AM - 11:59 PM"));
});
