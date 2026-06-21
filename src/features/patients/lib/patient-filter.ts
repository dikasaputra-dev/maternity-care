import type { Patient, PatientFilterState } from '@/features/patients/types/patient.types';

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function filterPatients(patients: readonly Patient[], filters: PatientFilterState) {
  const normalizedSearch = normalizeSearch(filters.search);

  return patients.filter((patient) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      patient.name.toLowerCase().includes(normalizedSearch) ||
      patient.medicalRecordNumber.toLowerCase().includes(normalizedSearch);

    const matchesRisk = filters.riskStatus === 'all' || patient.riskStatus === filters.riskStatus;

    return matchesSearch && matchesRisk;
  });
}
