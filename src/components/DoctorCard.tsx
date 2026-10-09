import { useLayoutEffect, useRef, useState } from "react";
import type { Doctor } from "@/store/doctors";
import type { Lang } from "@/lib/formatTime";
import type { LayoutConfig } from "@/layouts/config";
import type { PosterFieldVisibility } from "@/lib/posterFields";
import { DoctorTile } from "./DoctorTile";
import { FitText } from "./FitText";
import { formatDoctorQualifications } from "@/lib/doctorQualifications";

export interface PosterDoctor extends Doctor {
  timeText: string;
}

export function DoctorCard({ d, cfg, flip, lang, width, fields }: { d: PosterDoctor; cfg: LayoutConfig; flip: boolean; lang: Lang; width: number; fields: PosterFieldVisibility }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(cfg.tile);
  const s = cfg.text;
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const fit = () => {
      const available = card.clientHeight;
      if (available <= 0) return;
      // Two-column posters need space for the photo AND legible doctor details.
      // Cap the photo instead of letting it expand and squeeze the text column.
      const compact = cfg.cols === 2;
      const gap = compact ? 12 : Math.max(16, cfg.tile * 0.12);
      const maxTile = compact
        ? Math.min(cfg.tile * 1.1, width - 260 - gap)
        : Math.max(cfg.tile, width - 340 - gap);
      setTileSize(Math.max(72, Math.min(maxTile, available / 1.18)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(card);
    fit();
    return () => observer.disconnect();
  }, [cfg, d.id, width]);
  const dept = lang === "ml" ? d.deptMl : d.deptEn;
  const qualifications = fields.qualifications ? formatDoctorQualifications(d.qualifications) : "";
  const showSide = fields.department || fields.name || Boolean(qualifications) || (fields.time && !fields.photo);
  const align = flip ? "right" : "left";
  // A single grid pairs each doctor's portrait with their own text on either side.
  // Keep the original photo tile, including its time badge, untouched.
  const pairPhotoAndText = cfg.cols === 2 && fields.photo && showSide;
  const gap = cfg.cols === 2 ? 12 : Math.max(16, tileSize * 0.12);
  const timeSize = Math.min(s.time, Math.max(12, tileSize * 0.1));
  return (
    <div
      ref={cardRef}
      data-doctor-card={d.id}
      style={{
        width,
        height: "100%",
        minHeight: 0,
        display: pairPhotoAndText ? "grid" : "flex",
        gridTemplateColumns: pairPhotoAndText
          ? flip ? `minmax(0, 1fr) ${tileSize}px` : `${tileSize}px minmax(0, 1fr)`
          : undefined,
        flexDirection: pairPhotoAndText ? undefined : flip ? "row-reverse" : "row",
        alignItems: "center",
        gap,
      }}
    >
      {fields.photo && (
        <div data-doctor-photo style={{ position: "relative", width: tileSize, height: tileSize * 1.18, flexShrink: 0, display: "flex", alignItems: "flex-end", gridColumn: pairPhotoAndText ? (flip ? 2 : 1) : undefined, gridRow: pairPhotoAndText ? 1 : undefined }}>
          <DoctorTile d={d} size={tileSize} />
          {fields.time && d.timeText && (
            <div
              data-poster-overlay
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: `${timeSize * 0.7}px ${timeSize * 0.25}px ${timeSize * 0.2}px`,
                borderBottomLeftRadius: tileSize * 0.14,
                borderBottomRightRadius: tileSize * 0.14,
                background: "linear-gradient(to top, #06343a 0%, rgba(6, 52, 58, 0.72) 58%, rgba(6, 52, 58, 0) 100%)",
                textAlign: "center",
              }}
            >
              <FitText size={timeSize} style={{ color: "white", fontWeight: 700, lineHeight: 1.1, fontFamily: "var(--poster-en)" }}>
                {d.timeText}
              </FitText>
            </div>
          )}
        </div>
      )}
      {showSide && (
        <div data-doctor-text style={{ flex: 1, minWidth: 0, textAlign: align, display: "flex", flexDirection: "column", gridColumn: pairPhotoAndText ? (flip ? 1 : 2) : undefined, gridRow: pairPhotoAndText ? 1 : undefined }}>
          {fields.department && (
            <FitText
              keepWords
              lines={2}
              size={s.dept}
              style={{
                color: "var(--brand-teal)",
                fontWeight: 700,
                lineHeight: lang === "ml" ? 1.3 : 1.15,
                fontFamily: lang === "ml" ? "var(--poster-ml)" : "var(--poster-en)",
                width: "100%",
                boxSizing: "border-box",
                letterSpacing: 0,
              }}
            >
              {dept}
            </FitText>
          )}
          {fields.name && (
            <FitText lines={3} size={s.name} style={{ color: "#18363A", fontWeight: 800, lineHeight: 1.14, letterSpacing: "-0.01em", marginTop: fields.department ? s.name * 0.12 : 0, fontFamily: "var(--poster-en)" }}>
              {d.name}
            </FitText>
          )}
          {qualifications && (
            <div
              data-doctor-qualifications
              style={{ minWidth: 0, marginTop: fields.department || fields.name ? Math.max(3, s.qual * 0.25) : 0 }}
            >
              <FitText
                lines={3}
                size={s.qual}
                style={{
                  color: "color-mix(in oklab, var(--brand-ink) 88%, transparent)",
                  fontWeight: 500,
                  lineHeight: 1.23,
                  fontFamily: "var(--poster-en)",
                }}
              >
                {qualifications}
              </FitText>
            </div>
          )}
          {fields.time && !fields.photo && d.timeText && (
            <FitText size={s.time} style={{ color: "var(--brand-ink)", fontWeight: 700, lineHeight: 1.1, marginTop: s.time * 0.4, fontFamily: "var(--poster-en)" }}>
              {d.timeText}
            </FitText>
          )}
        </div>
      )}
    </div>
  );
}
