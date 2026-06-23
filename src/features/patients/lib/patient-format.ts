import type { Patient } from '@/features/patients/types/patient.types';

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function getPatientCreatorLabel(patient: Patient) {
  return patient.creator?.name ?? `User #${patient.created_by}`;
}

export function getPatientDetailPath(patientId: number) {
  return `/patients/${patientId}`;
}
