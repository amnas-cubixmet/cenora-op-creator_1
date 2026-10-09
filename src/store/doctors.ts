import { DOCTORS, VISITING_DAYS } from "@/data/doctors";

export interface Doctor {
  id: string;
  name: string;
  qualifications: string; // multi-line
  deptMl: string;
  deptEn: string;
  start: string; // "HH:mm" or ""
  end: string;
  weekdays: number[]; // 0 = Sunday
  photo: string; // data URL or ""
}

export const STATIC_DOCTORS: Doctor[] = DOCTORS.map((doctor) => ({
  id: doctor.id,
  name: doctor.name,
  qualifications: doctor.qualifications.join("\n"),
  deptMl: doctor.department.malayalam,
  deptEn: doctor.department.english,
  start: doctor.timings.defaultStart,
  end: doctor.timings.defaultEnd,
  weekdays: doctor.visitingDays.map((day) => VISITING_DAYS.indexOf(day)),
  photo: doctor.photoUrl,
}));
