import type { PatientLocation } from '@/features/patients/types/patient.types';

export type ScreeningRiskStatus = 'low' | 'medium' | 'high';

export interface ScreeningMedicalHistory {
  diabetes: boolean;
  hypertension: boolean;
  asthma: boolean;
  heart_disease: boolean;
  preeclampsia: boolean;
  anemia: boolean;
}

export interface ScreeningDangerSigns {
  bleeding: boolean;
  severe_headache: boolean;
  visual_disturbance: boolean;
  edema: boolean;
  reduced_fetal_movement: boolean;
  fever: boolean;
  abdominal_pain: boolean;
}

export interface ScreeningCreator {
  id: number;
  name: string;
}

export interface ScreeningPatientSummary {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  phone_number: string | null;
  address: string;
  location: PatientLocation;
}

export interface Screening {
  id: number;
  patient_id: number;
  patient?: ScreeningPatientSummary;
  created_by: number;
  creator?: ScreeningCreator;
  risk_status: ScreeningRiskStatus;
  gestational_age_weeks: number | null;
  gravida: number | null;
  para: number | null;
  abortus: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  estimated_fetal_weight_grams: number | null;
  medical_history: ScreeningMedicalHistory;
  danger_signs: ScreeningDangerSigns;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScreeningPayload {
  patient_id: number;
  risk_status: ScreeningRiskStatus;
  gestational_age_weeks?: number | null;
  gravida?: number | null;
  para?: number | null;
  abortus?: number | null;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  estimated_fetal_weight_grams?: number | null;
  medical_history?: Partial<ScreeningMedicalHistory>;
  danger_signs?: Partial<ScreeningDangerSigns>;
  notes?: string | null;
}

export interface CreateScreeningResult {
  message: string;
  screening: Screening;
}