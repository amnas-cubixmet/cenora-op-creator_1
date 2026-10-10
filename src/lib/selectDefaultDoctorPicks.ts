/** Prefer visiting doctors, then fill the initial selection to the requested count. */
export function selectDefaultDoctorPicks<
  T extends { id: string; start: string; end: string; weekdays: readonly number[] },
>(doctors: readonly T[], weekday: number, limit: number): { id: string; start: string; end: string }[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  const visiting = doctors.filter((doctor) => doctor.weekdays.includes(weekday));
  const remaining = doctors.filter((doctor) => !doctor.weekdays.includes(weekday));
  return [...visiting, ...remaining]
    .slice(0, Math.floor(limit))
    .map(({ id, start, end }) => ({ id, start, end }));
}
