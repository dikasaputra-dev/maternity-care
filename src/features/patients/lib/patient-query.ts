import { MOCK_PATIENTS } from '@/features/patients/mocks/patient.mock';

export function getPatientById(patientId: string) {
  return MOCK_PATIENTS.find((patient) => patient.id === patientId) ?? null;
}
