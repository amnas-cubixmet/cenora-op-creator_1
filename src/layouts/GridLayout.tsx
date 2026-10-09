import { DoctorCard, type PosterDoctor } from "@/components/DoctorCard";
import type { Lang } from "@/lib/formatTime";
import type { PosterFieldVisibility } from "@/lib/posterFields";
import type { LayoutConfig } from "./config";
import { doctorCardWidth, resolveDoctorPosition } from "./placement";

export interface LayoutProps {
  doctors: PosterDoctor[];
  lang: Lang;
  fields: PosterFieldVisibility;
  fontKey?: string;
}

export function GridLayout({ doctors, lang, fields, cfg, fontKey }: LayoutProps & { cfg: LayoutConfig }) {
  const rows: PosterDoctor[][] = [];
  for (let i = 0; i < doctors.length; i += cfg.cols) rows.push(doctors.slice(i, i + cfg.cols));
  return (
    <div data-doctor-grid style={{ height: "100%", display: "grid", gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))`, gap: cfg.gap ?? 22 }}>
      {rows.map((row, r) => (
        <div key={r} data-doctor-row style={{ minHeight: 0, overflow: "hidden", display: "flex", justifyContent: row.length === 1 ? "center" : "space-between" }}>
          {row.map((d, c) => {
            const position = resolveDoctorPosition(doctors.length, r * cfg.cols + c, cfg);
            return <DoctorCard key={`${d.id}:${fontKey ?? "default"}`} d={d} cfg={cfg} position={position} lang={lang} width={doctorCardWidth(position, cfg)} fields={fields} />;
          })}
        </div>
      ))}
    </div>
  );
}
