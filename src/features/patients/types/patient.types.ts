import type { PatientLocation } from '@/features/patients/constants/patient-options';

export type PatientRiskStatus = 'low' | 'medium' | 'high' | 'unknown';

export interface PatientObstetricSummary {
  gravida: number | null;
  partus: number | null;
  abortus: number | null;
  gestationalAgeWeeks: number | null;
  bloodPressure: string | null;
  estimatedFetalWeightGram: number | null;
}

export interface PatientWorkflowStatus {
  initialScreeningCompleted: boolean;
  monitoringEntryCount: number;
  actionRecorded: boolean;
  deliveryOutcomeRecorded: boolean;
  newbornOutcomeRecorded: boolean;
}

export interface Patient {
  id: string;
  medicalRecordNumber: string;
  name: string;
  age: number;
  location: PatientLocation;
  address: string;
  phoneNumber: string;
  registeredAt: string;
  riskStatus: PatientRiskStatus;
  latestScreeningAt: string | null;
  obstetricSummary: PatientObstetricSummary;
  workflowStatus: PatientWorkflowStatus;
}

export interface CreatePatientInput {
  name: string;
  age: number;
  location: PatientLocation;
  address: string;
  phoneNumber: string;
}

export interface PatientFilterState {
  search: string;
  riskStatus: PatientRiskStatus | 'all';
}
