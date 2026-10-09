import type { Lang } from "@/lib/formatTime";

const grad: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--brand-teal), var(--brand-green))",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

function Pulse() {
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" style={{ flexShrink: 0 }}>
      <path d="M1 11h8l3-7 5 13 4-9 2 3h10" fill="none" stroke="var(--brand-teal)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Plus() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
      <rect x="8" y="1" width="6" height="20" rx="2" fill="var(--brand-green)" />
      <rect x="1" y="8" width="20" height="6" rx="2" fill="var(--brand-green)" />
    </svg>
  );
}

/** Static RMO & Casualty / Lab strip shown on every poster. */
export function FooterStrip({ lang }: { lang: Lang }) {
  const ml = lang === "ml";
  const font = ml ? "var(--poster-ml)" : "var(--poster-en)";
  const item = (icon: React.ReactNode, title: string, pre: string, key: string, post: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: ml ? 1.42 : 1.2 }}>
      <div style={{ display: "flex", minWidth: 0, alignItems: "center", justifyContent: "center", gap: 10, fontSize: 28, fontWeight: 700, color: "var(--brand-teal)" }}>
        {icon}
        {title}
      </div>
      <div style={{ fontSize: 22, color: "var(--brand-ink)", marginTop: 3, textAlign: "center" }}>
        {pre}
        <span style={{ ...grad, fontWeight: 700, fontSize: 25 }}>{key}</span>
        {post}
      </div>
    </div>
  );
  return (
    <div
      data-poster-footer-strip
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        fontFamily: font,
        padding: "8px 20px 6px",
        borderRadius: 22,
        background: "color-mix(in oklab, var(--brand-teal) 8%, white)",
        border: "1.5px solid color-mix(in oklab, var(--brand-teal) 22%, transparent)",
      }}
    >
      {ml
        ? item(<Pulse />, "ആർ.എം.ഒ & കാഷ്വാലിറ്റി", "രാത്രി ", "10 മണി", " വരെ ലഭ്യം")
        : item(<Pulse />, "RMO & Casualty", "Available till ", "10 PM", "")}
      <div style={{ width: 2, alignSelf: "stretch", margin: "4px 10px", background: "linear-gradient(var(--brand-teal), var(--brand-green))", opacity: 0.5 }} />
      {ml ? item(<Plus />, "ലാബ്", "രാവിലെ ", "6.30", " മുതൽ") : item(<Plus />, "Lab", "Open from ", "6:30 AM", "")}
    </div>
  );
}
