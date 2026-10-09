import { useLayoutEffect, useRef, useState } from "react";
import type { Doctor } from "@/store/doctors";
import type { Lang } from "@/lib/formatTime";
import type { LayoutConfig } from "@/layouts/config";
import type { DoctorPosition } from "@/layouts/placement";
import type { PosterFieldVisibility } from "@/lib/posterFields";
import { DoctorTile } from "./DoctorTile";
import { FitText } from "./FitText";
import { formatDoctorQualifications } from "@/lib/doctorQualifications";

export interface PosterDoctor extends Doctor {
  timeText: string;
}

export function DoctorCard({
  d,
  cfg,
  position,
  lang,
  width,
  fields,
}: {
  d: PosterDoctor;
  cfg: LayoutConfig;
  position: DoctorPosition;
  lang: Lang;
  width: number;
  fields: PosterFieldVisibility;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(cfg.tile);
  const s = cfg.text;
  const dept = lang === "ml" ? d.deptMl : d.deptEn;
  const qualifications = fields.qualifications ? formatDoctorQualifications(d.qualifications) : "";
  const showSide =
    fields.department || fields.name || Boolean(qualifications) || (fields.time && !fields.photo);
  const flip = position === "right";
  const stacked = position === "center" && cfg.centerComposition === "stacked" && fields.photo && showSide;
  const align =
    stacked || (!fields.photo && position === "center") ? "center" : flip ? "right" : "left";
  const pairPhotoAndText = !stacked && fields.photo && showSide;
  const gap = cfg.cols === 2 ? 12 : 20;
  const timeSize = Math.min(s.time, Math.max(18, tileSize * 0.1));

  useLayoutEffect(() => {
    const card = cardRef.current;
    const text = textRef.current;
    if (!card) return;
    let active = true;
    const fit = () => {
      if (!active || card.clientHeight <= 0) return;
      const available = card.clientHeight - 12;
      const minTile = Math.min(cfg.tile, cfg.cols === 2 ? 120 : 160);
      let candidate = Math.min(cfg.tile, available / 1.18);
      // Measure at preferred font sizes BEFORE sacrificing readable typography.
      // A temporary, hidden clone does not change the poster or doctor data.
      if (text && fields.photo) {
        const probe = text.cloneNode(true) as HTMLDivElement;
        probe.style.position = "fixed";
        probe.style.visibility = "hidden";
        probe.style.pointerEvents = "none";
        probe.style.left = "-10000px";
        probe.style.top = "0";
        probe.style.height = "auto";
        probe.style.gridArea = "auto";
        probe.querySelectorAll<HTMLElement>("[data-fit-size]").forEach((el) => {
          el.style.fontSize = `${el.dataset["fitSize"]}px`;
        });
        card.appendChild(probe);
        try {
          for (; candidate > minTile; candidate -= 8) {
            probe.style.width = `${stacked ? width : width - candidate - gap}px`;
            const textFits = [...probe.querySelectorAll<HTMLElement>("[data-fit-lines]")].every(
              (el) => {
                const cs = getComputedStyle(el);
                const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
                return (
                  el.scrollWidth <= el.clientWidth + 1 &&
                  el.scrollHeight <=
                    parseFloat(cs.lineHeight) * Number(el.dataset["fitLines"]) + padding + 1
                );
              },
            );
            const needed = stacked
              ? candidate * 1.18 + gap + probe.offsetHeight
              : Math.max(candidate * 1.18, probe.offsetHeight);
            if (textFits && needed <= available) break;
          }
        } finally {
          probe.remove();
        }
      }
      setTileSize(Math.max(Math.min(minTile, available / 1.18), candidate));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(card);
    fit();
    document.fonts?.ready.then(fit);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [cfg, dept, d.name, qualifications, d.timeText, width, fields, stacked, gap]);
  return (
    <div
      ref={cardRef}
      data-doctor-card={d.id}
      data-doctor-position={position}
      data-doctor-composition={stacked ? "stacked" : "horizontal"}
      style={{
        width,
        maxWidth: "100%",
        boxSizing: "border-box",
        paddingBlock: 6,
        height: "100%",
        minHeight: 0,
        display: pairPhotoAndText ? "grid" : "flex",
        gridTemplateColumns: pairPhotoAndText
          ? flip
            ? `minmax(0, 1fr) ${tileSize}px`
            : `${tileSize}px minmax(0, 1fr)`
          : undefined,
        flexDirection: stacked
          ? "column"
          : pairPhotoAndText
            ? undefined
            : flip
              ? "row-reverse"
              : "row",
        justifyContent: "center",
        alignItems: "center",
        gap,
      }}
    >
      {fields.photo && (
        <div
          data-doctor-photo
          style={{
            position: "relative",
            width: tileSize,
            height: tileSize * 1.18,
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
            gridColumn: pairPhotoAndText ? (flip ? 2 : 1) : undefined,
            gridRow: pairPhotoAndText ? 1 : undefined,
          }}
        >
          <DoctorTile d={d} size={tileSize} priority />
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
                background:
                  "linear-gradient(to top, #06343a 0%, rgba(6, 52, 58, 0.72) 58%, rgba(6, 52, 58, 0) 100%)",
                textAlign: "center",
              }}
            >
              <FitText
                size={timeSize}
                minSize={16}
                lines={2}
                keepWords
                style={{
                  color: "white",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  fontFamily: "var(--poster-en)",
                }}
              >
                {d.timeText}
              </FitText>
            </div>
          )}
        </div>
      )}
      {showSide && (
        <div
          ref={textRef}
          data-doctor-text
          style={{
            flex: stacked ? "0 0 auto" : 1,
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            textAlign: align,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gridColumn: pairPhotoAndText ? (flip ? 1 : 2) : undefined,
            gridRow: pairPhotoAndText ? 1 : undefined,
          }}
        >
          {fields.department && (
            <FitText
              keepWords
              preserveGlyphs={lang === "ml"}
              lines={2}
              size={cfg.cols === 2 && s.dept === 27 ? 30 : s.dept}
              minSize={cfg.cols === 2 ? 27 : s.dept * 0.9}
              style={{
                color: "#245B4B",
                fontWeight: lang === "ml" ? 700 : 800,
                // Manjari's vowel marks extend beyond a compact line box.
                // Reserve top/bottom ink space so no Malayalam strokes are clipped.
                lineHeight: lang === "ml" ? 1.3 : 1.12,
                paddingTop: lang === "ml" ? 5 : 0,
                paddingBottom: lang === "ml" ? 5 : 0,
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
            <FitText
              // Two columns have a narrow text track beside the portrait.
              // Do not let longer names occupy three or more lines.
              keepWords
              lines={2}
              size={s.name}
              minSize={cfg.cols === 2 ? Math.min(s.name, 32) : s.name * 0.9}
              style={{
                width: "100%",
                color: "var(--poster-doctor-name)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
                marginTop: fields.department ? 4 : 0,
                fontFamily: "var(--poster-en)",
              }}
            >
              {d.name}
            </FitText>
          )}
          {qualifications && (
            <div
              data-doctor-qualifications
              style={{
                minWidth: 0,
                width: "100%",
                marginTop: fields.department || fields.name ? 7 : 0,
              }}
            >
              <FitText
                lines={3}
                size={s.qual}
                minSize={Math.min(s.qual, 14)}
                style={{
                  width: "100%",
                  color: "#607477",
                  fontWeight: 600,
                  lineHeight: 1.23,
                  fontFamily: "var(--poster-en)",
                }}
              >
                {qualifications}
              </FitText>
            </div>
          )}
          {fields.time && !fields.photo && d.timeText && (
            <FitText
              size={s.time}
              minSize={Math.min(s.time, 18)}
              style={{
                color: "var(--brand-ink)",
                fontWeight: 700,
                lineHeight: 1.1,
                marginTop: s.time * 0.4,
                fontFamily: "var(--poster-en)",
              }}
            >
              {d.timeText}
            </FitText>
          )}
        </div>
      )}
    </div>
  );
}
