export type Lang = "ml" | "en";

const toMin = (t?: string | null): number | null => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (h === undefined || Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
};

/** Malayalam period word for a time (minutes from midnight). */
export function periodMl(min: number): string {
  const h = Math.floor(min / 60) % 24;
  if (h >= 4 && h < 12) return "രാവിലെ";
  if (h >= 12 && h < 14) return "ഉച്ചയ്ക്ക്";
  // Evening runs through 20:59 so "7 - 8" in the evening reads naturally.
  if (h >= 14 && h < 21) return "വൈകുന്നേരം";
  return "രാത്രി";
}

function clockMl(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h = h24 % 12 || 12;
  return m ? `${h}.${String(m).padStart(2, "0")}` : `${h}`;
}

function clockEn(min: number): { t: string; ap: "AM" | "PM" } {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h = h24 % 12 || 12;
  return { t: m ? `${h}:${String(m).padStart(2, "0")}` : `${h}`, ap: h24 < 12 ? "AM" : "PM" };
}

/** Poster photo label, always "9:30 AM - 12:30 PM". */
export function formatTimeClock(start?: string | null, end?: string | null): string {
  const s = toMin(start);
  const e = toMin(end);
  if (s === null && e === null) return "";
  const stamp = (min: number) => {
    const h24 = Math.floor(min / 60) % 24;
    const h = h24 % 12 || 12;
    return `${h}:${String(min % 60).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
  };
  if (s !== null && e !== null && (s === e || (s === 0 && e >= 23 * 60 + 59))) return "12:00 AM - 11:59 PM";
  if (s !== null && e === null) return stamp(s);
  if (s === null && e !== null) return stamp(e);
  return `${stamp(s!)} - ${stamp(e!)}`;
}

export function formatTimeMl(start?: string | null, end?: string | null, lang: Lang = "ml"): string {
  const s = toMin(start);
  const e = toMin(end);
  if (s === null && e === null) return "";
  const allDay = s !== null && e !== null && (s === e || (s === 0 && e >= 23 * 60 + 59));

  if (lang === "en") {
    if (allDay) return "24 Hours";
    if (s !== null && e === null) {
      const a = clockEn(s);
      return `From ${a.t} ${a.ap}`;
    }
    if (s === null && e !== null) {
      const b = clockEn(e);
      return `Till ${b.t} ${b.ap}`;
    }
    const a = clockEn(s!);
    const b = clockEn(e!);
    if (a.ap === b.ap) return `${a.t} to ${b.t} ${b.ap}`;
    return `${a.t} ${a.ap} to ${b.t} ${b.ap}`;
  }

  if (allDay) return "24 മണിക്കൂറും";
  if (s !== null && e === null) return `${periodMl(s)} ${clockMl(s)} മുതൽ`;
  if (s === null && e !== null) return `${periodMl(e)} ${clockMl(e)} വരെ`;
  const ps = periodMl(s!);
  const pe = periodMl(e!);
  if (ps === pe) return `${ps} ${clockMl(s!)} - ${clockMl(e!)}`;
  return `${ps} ${clockMl(s!)} മുതൽ ${pe} ${clockMl(e!)} വരെ`;
}
