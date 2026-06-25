import type {
  PatientEducation,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';

export type InitialScreeningRiskStatus = 'low' | 'medium' | 'high';

export interface InitialScreeningPatientSummary {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  age: number;
  religion: PatientReligion;
  education: PatientEducation;
  occupation: string;
  ethnicity: string;
  phone_number: string | null;
  address: string;
  location: PatientLocation;
}

export interface PreviousPregnancyHistory {
  normal: boolean;
  hypertension: boolean;
  eclampsia: boolean;
  gestational_diabetes: boolean;
  preeclampsia: boolean;
  other: boolean;
  other_text: string | null;
}

export interface InitialScreeningComorbidities {
  none: boolean;
  heart_disease: boolean;
  asthma: boolean;
  hypertension: boolean;
  anemia: boolean;
  bleeding: boolean;
  other: boolean;
  other_text: string | null;
}

export interface PreviousDeliveryHistory {
  spontaneous_vaginal: boolean;
  assisted_vaginal: boolean;
  cesarean_section: boolean;
}

export interface InitialScreening {
  id: number;
  patient_id: number;
  patient?: InitialScreeningPatientSummary;
  height_cm: number;
  general_condition: string;
  systolic_bp: number;
  diastolic_bp: number;
  pulse_rate: number;
  respiratory_rate: number;
  temperature_c: number;
  oxygen_saturation: number;
  gravida: number;
  parity: number;
  abortus: number;
  living_children: number;
  gestational_age_weeks: number;
  has_previous_delivery: boolean;
  previous_delivery_spacing_years: number | null;
  previous_pregnancy_history: PreviousPregnancyHistory;
  comorbidities: InitialScreeningComorbidities;
  previous_delivery_history: PreviousDeliveryHistory;
  risk_status: InitialScreeningRiskStatus;
  risk_factors: string[];
  recommendation: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInitialScreeningPayload {
  height_cm: number;
  general_condition: string;
  systolic_bp: number;
  diastolic_bp: number;
  pulse_rate: number;
  respiratory_rate: number;
  temperature_c: number;
  oxygen_saturation: number;
  gravida: number;
  parity: number;
  abortus: number;
  living_children: number;
  gestational_age_weeks: number;
  has_previous_delivery: boolean;
  previous_delivery_spacing_years: number | null;
  previous_pregnancy_history: PreviousPregnancyHistory;
  comorbidities: InitialScreeningComorbidities;
  previous_delivery_history: PreviousDeliveryHistory;
  notes: string | null;
}

export interface CreateInitialScreeningResult {
  message: string;
  initialScreening: InitialScreening;
}

export interface InitialScreeningListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface InitialScreeningListLinks {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface InitialScreeningListResult {
  message: string;
  initialScreenings: InitialScreening[];
  meta: InitialScreeningListMeta;
  links: InitialScreeningListLinks;
}

export interface InitialScreeningListQuery {
  search?: string;
  page?: number;
  perPage?: number;
}
