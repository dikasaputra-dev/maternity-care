export type PatientRiskStatus = 'low' | 'medium' | 'high' | 'unknown';

export interface Patient {
  id: string;
  medicalRecordNumber: string;
  name: string;
  age: number;
  location: string;
  riskStatus: PatientRiskStatus;
  latestScreeningAt: string | null;
}

export interface PatientFilterState {
  search: string;
  riskStatus: PatientRiskStatus | 'all';
}
