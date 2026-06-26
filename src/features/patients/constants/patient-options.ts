import type {
  PatientEducation,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';

export const PATIENT_RELIGION_OPTIONS = [
  {
    value: 'islam',
    label: 'Islam',
  },
  {
    value: 'kristen-protestan',
    label: 'Kristen Protestan',
  },
  {
    value: 'katolik',
    label: 'Katolik',
  },
  {
    value: 'hindu',
    label: 'Hindu',
  },
  {
    value: 'buddha',
    label: 'Buddha',
  },
  {
    value: 'konghucu',
    label: 'Konghucu',
  },
  {
    value: 'kepercayaan',
    label: 'Kepercayaan',
  },
  {
    value: 'lainnya',
    label: 'Lainnya',
  },
] as const satisfies readonly {
  value: PatientReligion;
  label: string;
}[];

export const PATIENT_EDUCATION_OPTIONS = [
  {
    value: 'tidak-sekolah',
    label: 'Tidak Sekolah',
  },
  {
    value: 'sd-sederajat',
    label: 'SD/Sederajat',
  },
  {
    value: 'smp-sederajat',
    label: 'SMP/Sederajat',
  },
  {
    value: 'sma-sederajat',
    label: 'SMA/Sederajat',
  },
  {
    value: 'diploma',
    label: 'Diploma',
  },
  {
    value: 'sarjana',
    label: 'Sarjana',
  },
  {
    value: 'magister',
    label: 'Magister',
  },
  {
    value: 'doktor',
    label: 'Doktor',
  },
] as const satisfies readonly {
  value: PatientEducation;
  label: string;
}[];

export const PATIENT_LOCATION_OPTIONS = [
  {
    value: 'poliklinik-puskesmas',
    label: 'Poliklinik Puskesmas',
  },
  {
    value: 'ruang-vk-poned-puskesmas',
    label: 'Ruang VK/PONED Puskesmas',
  },
  {
    value: 'poliklinik-rs',
    label: 'Poliklinik RS',
  },
  {
    value: 'ruang-vk-ponek-rs',
    label: 'Ruang VK/PONEK RS',
  },
] as const satisfies readonly {
  value: PatientLocation;
  label: string;
}[];

export function getPatientReligionLabel(religion: PatientReligion) {
  return PATIENT_RELIGION_OPTIONS.find((option) => option.value === religion)?.label ?? religion;
}

export function getPatientEducationLabel(education: PatientEducation) {
  return PATIENT_EDUCATION_OPTIONS.find((option) => option.value === education)?.label ?? education;
}

export function getPatientLocationLabel(location: PatientLocation) {
  return PATIENT_LOCATION_OPTIONS.find((option) => option.value === location)?.label ?? location;
}
