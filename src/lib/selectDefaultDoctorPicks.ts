/** Select only the first available visiting doctors for the initial poster. */
export function selectDefaultDoctorPicks<
  T extends { id: string; start: string; end: string; weekdays: readonly number[] },
>(doctors: readonly T[], weekday: number, limit: number): { id: string; start: string; end: string }[] {
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return doctors
    .filter((doctor) => doctor.weekdays.includes(weekday))
    .slice(0, Math.floor(limit))
    .map(({ id, start, end }) => ({ id, start, end }));
}
