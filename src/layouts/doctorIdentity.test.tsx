import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { STATIC_DOCTORS } from "@/store/doctors";
import { GridLayout } from "./GridLayout";
import { LAYOUTS } from "./config";

describe("all doctor identities across poster positions", () => {
  it("keeps each portrait paired with its own name and bilingual department", () => {
    const fields = { photo: true, name: true, department: true, qualifications: true, time: true };
    for (const doctor of STATIC_DOCTORS) {
      for (const lang of ["ml", "en"] as const) {
        for (const count of [1, 2, 3, 4, 5, 6] as const) {
          for (let slot = 0; slot < count; slot++) {
            const doctors = Array.from({ length: count }, (_, i) => ({
              ...STATIC_DOCTORS[(STATIC_DOCTORS.indexOf(doctor) + i + 1) % STATIC_DOCTORS.length]!,
              timeText: "10 AM – 3 PM",
            }));
            doctors[slot] = { ...doctor, timeText: "10 AM – 3 PM" };
            const node = document.createElement("div");
            node.innerHTML = renderToStaticMarkup(<GridLayout doctors={doctors} lang={lang} fields={fields} cfg={LAYOUTS[count]} />);
            const card = [...node.querySelectorAll<HTMLElement>("[data-doctor-card]")][slot]!;
            expect(card.getAttribute("data-doctor-card")).toBe(doctor.id);
            expect(card.querySelector("[data-doctor-text]")?.textContent).toContain(doctor.name);
            expect(card.querySelector("[data-doctor-text]")?.textContent).toContain(lang === "ml" ? doctor.deptMl : doctor.deptEn);
            expect(card.querySelector("img")?.getAttribute("src")).toBe(doctor.photo);
          }
        }
      }
    }
  }, 15000);
});
