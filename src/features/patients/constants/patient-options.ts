import type { PatientLocation } from '@/features/patients/types/patient.types';

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

export function getPatientLocationLabel(location: PatientLocation) {
  return PATIENT_LOCATION_OPTIONS.find((option) => option.value === location)?.label ?? location;
}
