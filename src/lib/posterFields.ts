export const POSTER_FIELDS = [
  { id: "photo", label: "Photo" },
  { id: "department", label: "Department" },
  { id: "name", label: "Name" },
  { id: "qualifications", label: "Qualifications" },
  { id: "time", label: "Timing" },
] as const;

export type PosterField = (typeof POSTER_FIELDS)[number]["id"];
export type PosterFieldVisibility = Record<PosterField, boolean>;

export const DEFAULT_FIELDS: PosterFieldVisibility = {
  photo: true,
  department: true,
  name: true,
  qualifications: true,
  time: true,
};

const STORAGE_KEY = "cenora.fields";

export function loadFields(): PosterFieldVisibility {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FIELDS };
    const parsed = JSON.parse(raw) as Partial<PosterFieldVisibility>;
    return Object.fromEntries(POSTER_FIELDS.map(({ id }) => [id, parsed[id] !== false])) as PosterFieldVisibility;
  } catch {
    return { ...DEFAULT_FIELDS };
  }
}

export function saveFields(fields: PosterFieldVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}
