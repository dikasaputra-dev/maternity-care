import type { Patient, PatientListItem } from '@/features/patients/types/patient.types';

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

export function getPatientListCreatorLabel(patient: PatientListItem) {
  return patient.creator?.name.trim() ?? '-';
}

export function getPatientAgeLabel(dateOfBirth: string) {
  const [year, month, day] = dateOfBirth.split('-').map(Number);

  if (!year || !month || !day) {
    return '-';
  }

  const today = new Date();
  let age = today.getFullYear() - year;

  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  if (age < 0) {
    return '-';
  }

  return `${age} Tahun`;
}

export function getPatientDetailPath(patientId: number) {
  return `/patients/${patientId}`;
}

export function getPatientListPath() {
  return '/patients';
}
