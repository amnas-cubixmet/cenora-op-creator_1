import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import JSZip from "jszip";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Download, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Poster, POSTER_H, POSTER_W, WEEKDAYS_EN, WEEKDAYS_ML } from "@/components/Poster";
import { ScaledPoster } from "@/components/ScaledPoster";
import { DoctorTile } from "@/components/DoctorTile";
import { DoctorTimeFields } from "@/components/DoctorTimeFields";
import { ResponsiveDateField } from "@/components/ResponsiveDateField";
import type { PosterDoctor } from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatTimeClock, formatTimeMl, type Lang } from "@/lib/formatTime";
import { DEFAULT_FIELDS, loadFields, POSTER_FIELDS, saveFields, type PosterField, type PosterFieldVisibility } from "@/lib/posterFields";
import { downloadBlob, downloadPngFiles, MAX_DOCTORS_PER_POSTER, MAX_EXPORT_SCALE, MIN_EXPORT_SCALE, normalizeExportScale, posterToBlob, splitOptions } from "@/lib/exportPoster";
import { STATIC_DOCTORS } from "@/store/doctors";
import { selectDefaultDoctorPicks } from "@/lib/selectDefaultDoctorPicks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cenora Medical Center — OP Poster Creator" },
      { name: "description", content: "Pick today's doctors, check timings and download the Cenora OP chart poster." },
      { property: "og:title", content: "Cenora Medical Center — OP Poster Creator" },
      { property: "og:description", content: "Pick today's doctors, check timings and download the Cenora OP chart poster." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cenora Medical Center — OP Poster Creator" },
      { name: "twitter:description", content: "Create and download daily OP posters for Cenora Medical Center." },
    ],
  }),
  component: Index,
});

interface Pick {
  id: string;
  start: string;
  end: string;
}

const FONTS = ["Poppins", "Montserrat", "Inter"];
const DEFAULT_DATE = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 max-w-full rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-gradient text-xs text-primary-foreground">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Give the progress indicator a chance to paint before exporting. */
function letSpinnerPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => window.setTimeout(resolve, 0));
  });
}

function Index() {
  const doctors = STATIC_DOCTORS;
  const [date, setDate] = useState(DEFAULT_DATE);
  const [showDate, setShowDate] = useState(false);
  const [fields, setFields] = useState<PosterFieldVisibility>(DEFAULT_FIELDS);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [lang, setLang] = useState<Lang>("ml");
  const [enFont, setEnFont] = useState("Poppins");
  const [q, setQ] = useState("");
  const [splitIdx, setSplitIdx] = useState(0);
  const [busy, setBusy] = useState<number | "all" | null>(null);
  const [exportScale, setExportScale] = useState(MIN_EXPORT_SCALE);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setShowDate(localStorage.getItem("cenora.showDate") === "true");
    setFields(loadFields());
    const storedScale = Number(localStorage.getItem("cenora.exportScale"));
    if (Number.isFinite(storedScale)) setExportScale(normalizeExportScale(storedScale));
  }, []);
  const changeField = (id: PosterField, checked: boolean) => {
    setFields((current) => {
      const next = { ...current, [id]: checked };
      saveFields(next);
      return next;
    });
  };
  const changeShowDate = (checked: boolean) => {
    setShowDate(checked);
    localStorage.setItem("cenora.showDate", String(checked));
  };
  const shiftDate = (days: number) => {
    if (!date) return;
    const d = parseISO(date);
    d.setDate(d.getDate() + days);
    setDate(format(d, "yyyy-MM-dd"));
  };
  const weekday = date ? parseISO(date).getDay() : new Date().getDay();

  // Initially select at most one poster's worth of doctors for the date.
  // People can still add more manually and download multiple split posters.
  useEffect(() => {
    if (!date) return;
    setPicks(selectDefaultDoctorPicks(doctors, weekday, MAX_DOCTORS_PER_POSTER));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekday, date]);

  const byId = useMemo(() => new Map(doctors.map((d) => [d.id, d])), [doctors]);
  const chosen: PosterDoctor[] = picks
    .filter((p) => byId.has(p.id))
    .flatMap((p) => {
      const doctor = byId.get(p.id);
      return doctor ? [{ ...doctor, start: p.start, end: p.end, timeText: formatTimeClock(p.start, p.end) }] : [];
    });

  const options = splitOptions(chosen.length);
  if (chosen.length > 1 && chosen.length <= MAX_DOCTORS_PER_POSTER) {
    options.push([Math.ceil(chosen.length / 2), Math.floor(chosen.length / 2)]);
  }
  const split = options[Math.min(splitIdx, options.length - 1)] ?? [0];
  useEffect(() => setSplitIdx(0), [chosen.length]);
  const pages: PosterDoctor[][] = [];
  let at = 0;
  for (const n of split) {
    pages.push(chosen.slice(at, at + n));
    at += n;
  }

  const toggle = (id: string) => {
    const d = byId.get(id);
    if (!d) return;
    setPicks((ps) => (ps.some((p) => p.id === id) ? ps.filter((p) => p.id !== id) : [...ps, { id, start: d.start, end: d.end }]));
  };
  const move = (i: number, dir: -1 | 1) =>
    setPicks((ps) => {
      const next = [...ps];
      const j = i + dir;
      if (j < 0 || j >= next.length) return ps;
      const current = next[i];
      const target = next[j];
      if (!current || !target) return ps;
      next[i] = target;
      next[j] = current;
      return next;
    });
  const update = (id: string, patch: Partial<Pick>) => setPicks((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const fileName = (i: number) => `cenora-op-${date}${pages.length > 1 ? `-${i + 1}of${pages.length}` : ""}.png`;
  const downloadOne = async (i: number) => {
    const node = refs.current[i];
    if (!node) return;
    setBusy(i);
    try {
      await letSpinnerPaint();
      await downloadBlob(await posterToBlob(node, exportScale), fileName(i));
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not create the image. Please try again.");
    } finally {
      setBusy(null);
    }
  };
  const downloadAll = async () => {
    if (pages.length === 1) return downloadOne(0);
    setBusy("all");
    try {
      await letSpinnerPaint();
      const pngs: { blob: Blob; name: string }[] = [];
      for (let i = 0; i < pages.length; i++) {
        const node = refs.current[i];
        if (!node) continue;
        pngs.push({ blob: await posterToBlob(node, exportScale), name: fileName(i) });
      }
      const zipOnDesktop = await downloadPngFiles(pngs);
      if (zipOnDesktop) {
        const zip = new JSZip();
        for (const png of pngs) zip.file(png.name, png.blob);
        await downloadBlob(await zip.generateAsync({ type: "blob" }), `cenora-op-${date}.zip`);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not create the images. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const filtered = doctors.filter((d) => `${d.name} ${d.deptEn} ${d.deptMl}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen min-w-0 max-w-full">
      <AppHeader />
      <main className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-[minmax(0,1fr)] gap-5 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] lg:gap-6">
        <div className="min-w-0 space-y-4">
          <Section n={1} title="Date">
            <div data-date-controls className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 sm:grid-cols-[44px_minmax(0,1fr)_44px] sm:gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 min-w-0 shrink-0 rounded-xl p-0 sm:h-11 sm:w-11"
                onClick={() => shiftDate(-1)}
                aria-label="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <ResponsiveDateField value={date} onChange={setDate} />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 min-w-0 shrink-0 rounded-xl p-0 sm:h-11 sm:w-11"
                onClick={() => shiftDate(1)}
                aria-label="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="min-w-0 leading-tight">
                <div className="font-ml text-xl font-bold text-brand-gradient sm:text-2xl">{WEEKDAYS_ML[weekday]}</div>
                <div className="text-xs text-muted-foreground">{WEEKDAYS_EN[weekday]}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Label htmlFor="show-date" className="whitespace-nowrap text-xs font-medium sm:text-sm">Show date</Label>
                <Switch id="show-date" checked={showDate} onCheckedChange={changeShowDate} aria-label="Show date on poster" />
              </div>
            </div>
          </Section>

          <Section n={2} title={`Doctors (${picks.length} selected)`}>
            <div className="relative mb-3 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search doctors" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 min-w-0 w-full pl-9" />
            </div>
            <div data-doctor-picker-list className="flex max-h-72 min-w-0 w-full flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-1">
              {filtered.map((d) => {
                const on = picks.some((p) => p.id === d.id);
                return (
                  <Button
                    key={d.id}
                    type="button"
                    variant="outline"
                    onClick={() => toggle(d.id)}
                    className={`h-auto min-h-12 min-w-0 w-full max-w-full shrink-0 justify-start gap-2 rounded-xl p-2 text-left sm:gap-3 ${on ? "border-primary bg-secondary" : "bg-card"}`}
                  >
                    <div className="shrink-0 origin-bottom-left scale-100">
                      <DoctorTile d={d} size={40} />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="line-clamp-2 break-words text-sm font-semibold leading-tight">{d.name || "Unnamed"}</div>
                      <div className="truncate font-ml text-xs text-primary">{d.deptMl}</div>
                    </div>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </Button>
                );
              })}
            </div>
          </Section>

          {picks.length > 0 && (
            <Section n={3} title="Order & today's timings">
              <div className="min-w-0 space-y-2">
                {picks.map((p, i) => {
                  const d = byId.get(p.id);
                  if (!d) return null;
                  const changed = p.start !== d.start || p.end !== d.end;
                  return (
                    <div key={p.id} className="min-w-0 max-w-full rounded-xl border bg-muted/40 p-3">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-1 sm:gap-2">
                        <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                        <div className="min-w-0 flex-1 truncate text-sm font-semibold">{d.name}</div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, 1)} disabled={i === picks.length - 1} aria-label="Move down">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggle(p.id)} aria-label="Remove">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <DoctorTimeFields
                        start={p.start}
                        end={p.end}
                        modified={changed}
                        onStartChange={(start) => update(p.id, { start })}
                        onEndChange={(end) => update(p.id, { end })}
                        onReset={() => update(p.id, { start: d.start, end: d.end })}
                      />
                      <div className={`mt-1.5 text-sm ${lang === "ml" ? "font-ml" : ""} font-semibold text-brand-deep`}>{formatTimeMl(p.start, p.end, lang) || "—"}</div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section n={4} title="Fields">
            <div className="grid grid-cols-2 gap-2">
              {POSTER_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <Label htmlFor={`field-${field.id}`} className="text-sm">{field.label}</Label>
                  <Switch
                    id={`field-${field.id}`}
                    checked={fields[field.id]}
                    onCheckedChange={(checked) => changeField(field.id, checked)}
                    aria-label={`Show ${field.label}`}
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section n={5} title="Language">
            <div className="flex gap-2">
              {(["ml", "en"] as const).map((l) => (
                <Button key={l} variant={lang === l ? "default" : "outline"} className="flex-1" onClick={() => setLang(l)}>
                  {l === "ml" ? <span className="font-ml">മലയാളം</span> : "English"}
                </Button>
              ))}
            </div>
            {lang === "en" && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FONTS.map((f) => (
                  <Button key={f} size="sm" variant={enFont === f ? "secondary" : "ghost"} onClick={() => setEnFont(f)} style={{ fontFamily: f }}>
                    {f}
                  </Button>
                ))}
              </div>
            )}
          </Section>

          {options.length > 1 && (
            <Section n={6} title={`Split into ${split.length} posters`}>
              <p className="mb-2 text-xs text-muted-foreground">Maximum {MAX_DOCTORS_PER_POSTER} doctors per poster. Choose how to distribute the cards.</p>
              <div className="flex flex-wrap gap-2">
                {options.map((o, i) => (
                  <Button key={o.join("+")} size="sm" variant={i === splitIdx ? "default" : "outline"} onClick={() => setSplitIdx(i)}>
                    {o.join(" + ")}
                  </Button>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-96px)] lg:self-start lg:overflow-y-auto">
          {chosen.length === 0 ? (
            <div className="grid aspect-[4/5] place-items-center rounded-xl border border-dashed bg-card text-sm text-muted-foreground">
              Select at least one doctor to see the poster.
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${pages.length > 1 ? "xl:grid-cols-2" : ""}`}>
                {pages.map((pg, i) => (
                  <div key={i} className="mx-auto w-full min-w-0 max-w-[560px] space-y-2 lg:max-w-[min(560px,calc((100dvh-200px)*0.8))]">
                    <ScaledPoster>
                      <Poster
                        ref={(el) => {
                          refs.current[i] = el;
                        }}
                        doctors={pg}
                        lang={lang}
                        weekday={weekday}
                        enFont={enFont}
                        dateText={showDate && date ? format(parseISO(date), "dd MMM yyyy") : undefined}
                        fields={fields}
                      />
                    </ScaledPoster>
                    {pages.length > 1 && (
                      <div className="space-y-2">
                      <p className="text-center text-sm font-semibold text-muted-foreground">Poster {i + 1} of {pages.length}</p>
                      <Button variant="outline" className="w-full" onClick={() => downloadOne(i)} disabled={busy !== null}>
                        {busy === i ? <Loader2 className="animate-spin" /> : <Download />}
                        Download poster {i + 1}
                      </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button size="lg" className="h-14 w-full bg-brand-gradient text-base font-semibold shadow-poster" onClick={downloadAll} disabled={busy !== null}>
                {busy !== null ? <Loader2 className="animate-spin" /> : <Download />}
                {pages.length > 1 ? `Download all (${pages.length} PNGs, zip)` : "Download PNG"}
              </Button>
              <div className="space-y-2 rounded-xl border bg-card px-3 py-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <Label htmlFor="export-scale">Export scale</Label>
                  <span className="font-semibold tabular-nums">{exportScale}×</span>
                </div>
                <Slider
                  id="export-scale"
                  min={MIN_EXPORT_SCALE}
                  max={MAX_EXPORT_SCALE}
                  step={1}
                  value={[exportScale]}
                  disabled={busy !== null}
                  aria-label="Export scale"
                  onValueChange={(value) => {
                    const next = value[0];
                    if (next == null) return;
                    const scale = normalizeExportScale(next);
                    setExportScale(scale);
                    localStorage.setItem("cenora.exportScale", String(scale));
                  }}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>1×</span>
                  <span>5×</span>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Exports at {POSTER_W * exportScale} × {POSTER_H * exportScale} px
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
