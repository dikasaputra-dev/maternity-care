import type { Patient } from '@/features/patients/types/patient.types';

export const MOCK_PATIENTS: readonly Patient[] = [
  {
    id: 'patient-001',
    medicalRecordNumber: 'RM-2026-001',
    name: 'Siti Aminah',
    age: 27,
    location: 'Ruang Bersalin 1',
    riskStatus: 'low',
    latestScreeningAt: '2026-06-20T08:30:00.000Z',
  },
  {
    id: 'patient-002',
    medicalRecordNumber: 'RM-2026-002',
    name: 'Dewi Lestari',
    age: 34,
    location: 'Ruang Observasi',
    riskStatus: 'medium',
    latestScreeningAt: '2026-06-20T09:15:00.000Z',
  },
  {
    id: 'patient-003',
    medicalRecordNumber: 'RM-2026-003',
    name: 'Rina Marlina',
    age: 39,
    location: 'Ruang Bersalin 2',
    riskStatus: 'high',
    latestScreeningAt: '2026-06-20T10:05:00.000Z',
  },
  {
    id: 'patient-004',
    medicalRecordNumber: 'RM-2026-004',
    name: 'Nur Aisyah',
    age: 24,
    location: 'Ruang Tunggu',
    riskStatus: 'unknown',
    latestScreeningAt: null,
  },
  {
    id: 'patient-005',
    medicalRecordNumber: 'RM-2026-005',
    name: 'Fitri Handayani',
    age: 31,
    location: 'Ruang Observasi',
    riskStatus: 'low',
    latestScreeningAt: '2026-06-20T11:20:00.000Z',
  },
];
