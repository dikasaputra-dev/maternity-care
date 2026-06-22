export type PatientRiskStatus = 'low' | 'medium' | 'high' | 'unknown';

export interface PatientObstetricSummary {
  gravida: number;
  partus: number;
  abortus: number;
  gestationalAgeWeeks: number;
  bloodPressure: string;
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
  location: string;
  address: string;
  phoneNumber: string;
  registeredAt: string;
  riskStatus: PatientRiskStatus;
  latestScreeningAt: string | null;
  obstetricSummary: PatientObstetricSummary;
  workflowStatus: PatientWorkflowStatus;
}

export interface PatientFilterState {
  search: string;
  riskStatus: PatientRiskStatus | 'all';
}
