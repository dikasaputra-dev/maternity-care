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
] as const;

export type PatientLocation = (typeof PATIENT_LOCATION_OPTIONS)[number]['value'];

export function isPatientLocation(value: string): value is PatientLocation {
  return PATIENT_LOCATION_OPTIONS.some((location) => location.value === value);
}

export function getPatientLocationLabel(value: PatientLocation) {
  return PATIENT_LOCATION_OPTIONS.find((location) => location.value === value)?.label ?? value;
}
