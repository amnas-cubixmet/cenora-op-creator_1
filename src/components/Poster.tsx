import { forwardRef } from "react";
import { Dna, HeartPulse, Pill, Plus, Stethoscope, Syringe } from "lucide-react";
import type { Lang } from "@/lib/formatTime";
import { LAYOUT_COMPONENTS } from "@/layouts";
import type { PosterFieldVisibility } from "@/lib/posterFields";
import type { PosterDoctor } from "./DoctorCard";
import { FitText } from "./FitText";
import { FooterStrip } from "./FooterStrip";

export const POSTER_W = 1080;
export const POSTER_H = 1350;
// Leave a clear separation between the final doctor row and the booking strip.
export const DOCTOR_GRID_TOP = 158;
export const DOCTOR_GRID_BOTTOM = 364;
export const FOOTER_LOGO_WIDTH = 280;
export const FOOTER_LOGO_HEIGHT = 176;

export const WEEKDAYS_ML = ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"];

/** Manjari vowel signs draw above a 1.0 line box, so Malayalam needs this leading. */
const ML_LINE_HEIGHT = 1.45;
export const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Props {
  doctors: PosterDoctor[];
  lang: Lang;
  weekday: number;
  enFont?: string;
  dateText?: string | undefined;
  fields: PosterFieldVisibility;
}

const gradText: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--brand-teal), var(--brand-green))",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

function Fb({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="var(--brand-teal)" /><path d="M13.2 19v-6h2l.3-2.4h-2.3V9.2c0-.7.2-1.2 1.2-1.2h1.2V5.9c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.7h-2V13h2v6z" fill="white" /></svg>
  );
}
function Ig({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="var(--brand-teal)" /><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="white" strokeWidth="1.8" /><circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.8" /><circle cx="16.1" cy="7.9" r="1" fill="white" /></svg>
  );
}

export const Poster = forwardRef<HTMLDivElement, Props>(function Poster({ doctors, lang, weekday, enFont = "Poppins", dateText, fields }, ref) {
  const ml = lang === "ml";
  const Layout = LAYOUT_COMPONENTS[Math.min(Math.max(doctors.length, 1), 8) - 1];
  if (!Layout) return null;
  const deco = { position: "absolute" as const, color: "var(--brand-teal)", opacity: 0.07 };

  return (
    <div
      ref={ref}
      style={{
        width: POSTER_W,
        height: POSTER_H,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(170deg, var(--brand-aqua) 0%, var(--brand-mist) 42%, white 78%)",
        fontFamily: "var(--poster-en)",
        color: "var(--brand-ink)",
        textSizeAdjust: "100%",
        WebkitTextSizeAdjust: "100%",
        ["--poster-en" as string]: `"${enFont}", "Manjari", sans-serif`,
      }}
    >
      {/* faint medical icons */}
      <Stethoscope size={300} strokeWidth={1.2} style={{ ...deco, top: -30, right: -40, opacity: 0.09 }} />
      <Plus size={120} style={{ ...deco, top: 360, left: 20 }} />
      <Pill size={110} style={{ ...deco, top: 640, right: 30, transform: "rotate(30deg)" }} />
      <Dna size={150} style={{ ...deco, top: 880, left: 440 }} />
      <HeartPulse size={130} style={{ ...deco, top: 210, left: 470 }} />
      <Syringe size={90} style={{ ...deco, top: 540, left: 480, transform: "rotate(-20deg)" }} />
      <Plus size={70} style={{ ...deco, top: 980, right: 120 }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 18, left: 48, right: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, minWidth: 0, maxWidth: dateText ? 580 : 920 }}>
          <div
            style={{
              flexShrink: 0,
              background: "linear-gradient(150deg, var(--brand-teal), var(--brand-deep))",
              color: "white",
              borderRadius: 22,
              padding: ml ? "16px 26px 4px" : "18px 26px 14px",
              fontFamily: ml ? "var(--poster-ml)" : "var(--poster-en)",
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1,
              boxShadow: "0 14px 30px -16px var(--brand-deep)",
            }}
          >
            <span style={{ display: "block", marginBottom: ml ? -18 : 0 }}>{ml ? "ഓ.പി" : "OP"}</span>
          </div>
          <div style={{ minWidth: 0, marginTop: ml ? 4 : 0, marginBottom: ml ? -28 : 0 }}>
            <FitText
              size={ml ? 104 : 92}
              style={{ ...gradText, fontFamily: ml ? "var(--poster-ml)" : "var(--poster-en)", fontWeight: 700, lineHeight: ml ? ML_LINE_HEIGHT : 1.05 }}
            >
              {(ml ? WEEKDAYS_ML : WEEKDAYS_EN)[weekday]}
            </FitText>
          </div>
        </div>
        {dateText && (
          <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--brand-deep)", fontSize: 28, fontWeight: 700, whiteSpace: "nowrap" }}>
            {dateText}
          </div>
        )}
      </div>

      {/* Doctors stop above the RMO strip. The extra room covers Malayalam leading and iOS text metrics. */}
      <div data-poster-doctors-area style={{ position: "absolute", top: DOCTOR_GRID_TOP, bottom: DOCTOR_GRID_BOTTOM, left: 40, right: 40 }}>
        <Layout doctors={doctors} lang={lang} fields={fields} />
      </div>

      {/* Footer */}
      <div data-poster-footer style={{ position: "absolute", left: 50, right: 50, bottom: 16, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <FooterStrip lang={lang} />
        <div data-poster-booking-heading style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 34, margin: "12px 0 0" }}>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, transparent, var(--brand-teal))" }} />
          <span style={{ fontFamily: ml ? "var(--poster-ml)" : "var(--poster-en)", fontWeight: 700, fontSize: 28, color: "var(--brand-deep)", lineHeight: ml ? 1.4 : 1.1, whiteSpace: "nowrap", paddingTop: ml ? 2 : 0, paddingBottom: ml ? 2 : 0 }}>
            {ml ? "ബുക്കിങ്ങിന്" : "For Booking"}
          </span>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, var(--brand-teal), transparent)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginTop: -60 }}>
          <div data-poster-footer-brand style={{ flex: `0 0 ${FOOTER_LOGO_WIDTH}px`, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              data-poster-footer-logo
              src="/assets/logo-footer.png"
              alt="Cenora Medical Center"
              style={{ display: "block", position: "relative", top: 28, width: FOOTER_LOGO_WIDTH, height: FOOTER_LOGO_HEIGHT, objectFit: "contain", objectPosition: "center" }}
            />
          </div>
          <div style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "flex-end", justifyContent: "flex-end", gap: 16 }}>
            <div style={{ textAlign: "right", lineHeight: 1.25 }}>
              <div style={{ fontFamily: ml ? "var(--poster-ml)" : "var(--poster-en)", fontSize: 34, fontWeight: 700, color: "var(--brand-deep)", lineHeight: ml ? ML_LINE_HEIGHT : 1.2 }}>{ml ? "പാണ്ടിക്കാട്" : "Pandikkad"}</div>
              <div style={{ fontSize: 22, color: "var(--brand-ink)", marginTop: 2 }}>Pattath Avenue, Oravampuram</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 8, whiteSpace: "nowrap" }}>
                <Fb />
                <Ig />
                <span style={{ fontSize: 20, fontWeight: 600, color: "var(--brand-deep)", marginLeft: 2 }}>cenora_medical_center</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 24px -14px var(--brand-deep)" }}>
              <div
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  background: "linear-gradient(180deg, var(--brand-green), var(--brand-teal))",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: 3,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                BOOKING
              </div>
              <div style={{ background: "white", padding: "10px 18px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "var(--brand-ink)", letterSpacing: 0.5 }}>9279 900 300</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "var(--brand-ink)", letterSpacing: 0.5 }}>9279 900 400</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
