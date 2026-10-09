export const VISITING_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type VisitingDay = (typeof VISITING_DAYS)[number];

export interface Doctor {
  id: string;
  name: string;
  qualifications: string[];
  department: {
    preset?: string;
    malayalam: string;
    english: string;
  };
  timings: {
    defaultStart: string;
    defaultEnd: string;
  };
  visitingDays: VisitingDay[];
  photoUrl: string;
}

const WEEKDAYS: VisitingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DOCTORS: Doctor[] = [
  {
    "id": "doc_001",
    "name": "Dr. Abdul Sameer. E",
    "qualifications": [
      "MBBS",
      "MD (Internal Medicine)",
      "CPCDM (Diabetology)"
    ],
    "department": {
      "malayalam": "ജനറൽ മെഡിസിൻ, പ്രമേഹരോഗ വിഭാഗം",
      "english": "General Medicine"
    },
    "timings": {
      "defaultStart": "10:00",
      "defaultEnd": "15:00"
    },
    "visitingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "photoUrl": "/assets/doctors/abdul_sameer.png"
  },
  {
    "id": "doc_002",
    "name": "Dr. Amjad Farook",
    "qualifications": [
      "MBBS",
      "MS - ENT (JIPMER)",
      "ENT, Head & Neck Surgery"
    ],
    "department": {
      "malayalam": "ഇ.എൻ.ടി ഹെഡ് & നെക്ക്",
      "english": "ENT, Head & Neck Surgery"
    },
    "timings": {
      "defaultStart": "16:30",
      "defaultEnd": "19:30"
    },
    "visitingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "photoUrl": "/assets/doctors/amjad_farook.png"
  },
  {
    "id": "doc_003",
    "name": "Dr. Mohammed Shafeeq K T",
    "qualifications": [
      "MBBS",
      "DNB (Paediatrics)",
      "MNAMS, PGPN"
    ],
    "department": {
      "malayalam": "ശിശുരോഗ വിഭാഗം",
      "english": "Pediatrics"
    },
    "timings": {
      "defaultStart": "14:00",
      "defaultEnd": "16:00"
    },
    "visitingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "photoUrl": "/assets/doctors/mohammed_shafeeq.png"
  },
  {
    "id": "doc_004",
    "name": "Dr. Fadhil S Isahac",
    "qualifications": [
      "MBBS",
      "MS (General Surgery)"
    ],
    "department": {
      "malayalam": "ജനറൽ സർജറി",
      "english": "General Surgery"
    },
    "timings": {
      "defaultStart": "19:00",
      "defaultEnd": "20:00"
    },
    "visitingDays": [
      "Tue",
      "Fri"
    ],
    "photoUrl": "/assets/doctors/fadhil_s_isahac.png"
  },
  {
    "id": "doc_005",
    "name": "Dr. Najla Tashreefa Pk",
    "qualifications": [
      "MBBS"
    ],
    "department": {
      "malayalam": "റെസിഡന്റ് മെഡിക്കൽ ഓഫീസർ",
      "english": "General Practitioner / RMO"
    },
    "timings": {
      "defaultStart": "08:00",
      "defaultEnd": "22:00"
    },
    "visitingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ],
    "photoUrl": "/assets/doctors/najla_tashreefa.png"
  },
  {
    "id": "doc_006",
    "name": "Dr. Rahul Das N T",
    "qualifications": [
      "MBBS",
      "MD Physical Medicine",
      "& Rehabilitation (PMR)"
    ],
    "department": {
      "malayalam": "പെയിൻ ക്ലിനിക്",
      "english": "Pain Clinic"
    },
    "timings": {
      "defaultStart": "17:00",
      "defaultEnd": "18:00"
    },
    "visitingDays": [
      "Mon",
      "Wed",
      "Fri"
    ],
    "photoUrl": "/assets/doctors/rahul_das.png"
  },
  {
    "id": "doc_007",
    "name": "Dr. Nishana. V",
    "qualifications": [
      "MBBS, DGO",
      "MS",
      "DNB - FMAS"
    ],
    "department": {
      "malayalam": "സ്ത്രീരോഗവിഭാഗം ഗൈനക്കോളജി",
      "english": "Obstetrics & Gynecology"
    },
    "timings": {
      "defaultStart": "09:00",
      "defaultEnd": "11:00"
    },
    "visitingDays": [
      "Thu",
      "Sun"
    ],
    "photoUrl": "/assets/doctors/nishana.png"
  },
  {
    "id": "doc_008",
    "name": "Dr. Ruhaila T",
    "qualifications": [
      "MBBS",
      "MD (Dermatology)"
    ],
    "department": {
      "malayalam": "ചർമ്മരോഗ വിഭാഗം",
      "english": "Dermatology"
    },
    "timings": {
      "defaultStart": "16:00",
      "defaultEnd": "17:00"
    },
    "visitingDays": [
      "Thu"
    ],
    "photoUrl": "/assets/doctors/ruhaila.png"
  },
  {
    "id": "doc_009",
    "name": "Dr. Pavithra Sharma",
    "qualifications": [
      "MBBS",
      "MD (Psychiatry)"
    ],
    "department": {
      "malayalam": "മാനസികാരോഗ്യ വിഭാഗം",
      "english": "Psychiatry"
    },
    "timings": {
      "defaultStart": "17:30",
      "defaultEnd": "18:30"
    },
    "visitingDays": [
      "Wed",
      "Thu"
    ],
    "photoUrl": "/assets/doctors/pavithra_sharma.png"
  },
  {
    "id": "doc_010",
    "name": "Dr. Saleem Lakkal",
    "qualifications": [
      "MBBS",
      "DTCD",
      "DNB"
    ],
    "department": {
      "malayalam": "ശ്വാസകോശ രോഗവിഭാഗം",
      "english": "Pulmonology"
    },
    "timings": {
      "defaultStart": "17:45",
      "defaultEnd": "18:45"
    },
    "visitingDays": [
      "Wed",
      "Sat"
    ],
    "photoUrl": "/assets/doctors/saleem_lakkal.png"
  },
  {
    "id": "doc_011",
    "name": "Dr. Ahammed Shaheem MC",
    "qualifications": [
      "MBBS, MD, DNB",
      "DM (Gastroenterology)"
    ],
    "department": {
      "malayalam": "ഉദര രോഗ വിഭാഗം ഗ്യാസ്ട്രോ എന്ററോളജി",
      "english": "Gastroenterology"
    },
    "timings": {
      "defaultStart": "16:30",
      "defaultEnd": "18:30"
    },
    "visitingDays": [
      "Wed"
    ],
    "photoUrl": "/assets/doctors/ahammed_shaheem.png"
  },
  {
    "id": "doc_012",
    "name": "Dr. Rahul Narayanan Unni",
    "qualifications": [
      "MBBS, MS (General Surgery)",
      "MRCS (England)",
      "M.Ch (Urology)"
    ],
    "department": {
      "malayalam": "യൂറോളജി",
      "english": "Urology"
    },
    "timings": {
      "defaultStart": "18:00",
      "defaultEnd": "19:00"
    },
    "visitingDays": [
      "Fri"
    ],
    "photoUrl": "/assets/doctors/rahul_narayanan_unni.png"
  },
  {
    "id": "doc_013",
    "name": "Dr. Rohan",
    "qualifications": [
      "MBBS",
      "MS (OG)"
    ],
    "department": {
      "malayalam": "സ്ത്രീരോഗവിഭാഗം ഗൈനക്കോളജി",
      "english": "Obstetrics & Gynecology"
    },
    "timings": {
      "defaultStart": "14:30",
      "defaultEnd": "15:30"
    },
    "visitingDays": [
      "Tue"
    ],
    "photoUrl": "/assets/doctors/rohan.png"
  },
  {
    "id": "doc_014",
    "name": "Dr. Ashna Aziz",
    "qualifications": [
      "MBBS, MS (OBG)",
      "DNB (OBG)",
      "FNB REPRODUCTIVE MEDICINE"
    ],
    "department": {
      "malayalam": "സ്ത്രീരോഗ വിഭാഗവും വന്ധ്യതാ ചികിത്സയും",
      "english": "Obstetrics & Gynaecology & Infertility Clinic"
    },
    "timings": {
      "defaultStart": "16:30",
      "defaultEnd": "17:30"
    },
    "visitingDays": [
      "Wed"
    ],
    "photoUrl": "/assets/doctors/ashna_aziz.png"
  },
  {
    "id": "doc_015",
    "name": "Dr. Shameer. AM",
    "qualifications": [
      "MBBS, MD, DNB (General Medicine)",
      "DM, DrNB (Nephrology)"
    ],
    "department": {
      "malayalam": "നെഫ്രോളജി",
      "english": "Nephrology"
    },
    "timings": {
      "defaultStart": "16:00",
      "defaultEnd": "17:00"
    },
    "visitingDays": [
      "Fri"
    ],
    "photoUrl": "/assets/doctors/shameer.png"
  },
  {
    "id": "doc_016",
    "name": "Dr. Rimpy Joseph",
    "qualifications": [
      "MD, DM, DNB (Neurology), MNAMS",
      "PDF Stroke (AIIMS, New Delhi), EDSI",
      "Fellowship in Interventional Neuroradiology (Switzerland)"
    ],
    "department": {
      "malayalam": "ന്യൂറോളജി",
      "english": "Neurology"
    },
    "timings": {
      "defaultStart": "08:00",
      "defaultEnd": "09:00"
    },
    "visitingDays": [
      "Sat"
    ],
    "photoUrl": "/assets/doctors/rimpy_joseph.png"
  },
  {
    "id": "doc_018",
    "name": "Dr. Muhammed Faisal",
    "qualifications": [
      "MDS"
    ],
    "department": {
      "malayalam": "ഹെയർ ട്രാൻസ്പ്ലാന്റേഷൻ",
      "english": "Hair Transplant Clinic"
    },
    "timings": {
      "defaultStart": "09:00",
      "defaultEnd": "12:00"
    },
    "visitingDays": [
      "Sun"
    ],
    "photoUrl": "/assets/doctors/faisal.png"
  },
  {
    "id": "doc_019",
    "name": "Dr. Wajidha P.K.",
    "qualifications": [
      "MBBS",
      "MD (Pathology)"
    ],
    "department": {
      "malayalam": "പാത്തോളജി",
      "english": "Pathology"
    },
    "timings": {
      "defaultStart": "09:00",
      "defaultEnd": "17:00"
    },
    "visitingDays": [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "photoUrl": "/assets/doctors/wajidha.png"
  },
  {
    "id": "doc_020",
    "name": "Allergy-Asthma Foundation Team",
    "qualifications": [],
    "department": {
      "malayalam": "അലർജി - ആസ്ത്മ ക്ലിനിക്",
      "english": "Allergy-Asthma Clinic"
    },
    "timings": {
      "defaultStart": "14:00",
      "defaultEnd": "16:00"
    },
    "visitingDays": [
      "Fri"
    ],
    "photoUrl": "/assets/doctors/allergy_team.png"
  },
  {
    "id": "doc_021",
    "name": "Hasna",
    "qualifications": [],
    "department": {
      "malayalam": "സൈക്കോളജി",
      "english": "Psychology"
    },
    "timings": {
      "defaultStart": "18:00",
      "defaultEnd": ""
    },
    "visitingDays": [
      "Sat"
    ],
    "photoUrl": "/assets/doctors/hasna.png"
  }
];
