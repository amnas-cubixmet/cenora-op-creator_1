/** Display stored multi-line credentials as one compact, naturally wrapping sentence. */
export function formatDoctorQualifications(raw: string): string {
  const parts = raw
    .split(/\r?\n/)
    .map((part) => part.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  return parts.reduce((text, part) => {
    if (!text) return part;
    // Some records split a title across lines at "& Rehabilitation".
    const separator = part.startsWith("&") || text.endsWith(",") ? " " : ", ";
    return text + separator + part;
  }, "");
}
