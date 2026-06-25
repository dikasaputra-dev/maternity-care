export type LaborMonitoringRiskStatus = 'low' | 'medium' | 'high';

export type FetalMovement = 'active' | 'decreased' | 'not_felt';

export type ContractionIntensity = 'weak' | 'moderate' | 'strong';

export type FetalHeadDescent = 'not_assessed' | 'hodge_i' | 'hodge_ii' | 'hodge_iii' | 'hodge_iv';

export type MembraneStatus = 'intact' | 'ruptured';

export type AmnioticFluidColor = 'clear' | 'green' | 'blood_stained' | 'dry';

export type UrineProtein = 'negative' | 'positive';

export type UrineAcetone = 'negative' | 'positive';

export interface LaborMonitoringPatientSummary {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  age?: number;
  religion?: string;
  education?: string;
  occupation?: string;
  ethnicity?: string;
  phone_number?: string | null;
  address?: string;
  location?: string;
}

export interface LaborMonitoring {
  id: number;
  patient_id: number;
  patient?: LaborMonitoringPatientSummary;
  monitored_at: string;

  systolic_bp: number;
  diastolic_bp: number;
  pulse_rate: number;
  respiratory_rate: number;
  temperature_c: number;
  oxygen_saturation: number;

  fetal_heart_rate: number;
  fetal_movement: FetalMovement;

  contraction_frequency_per_10_minutes: number;
  contraction_duration_seconds: number;
  contraction_intensity: ContractionIntensity;

  cervical_dilation_cm: number;
  fetal_head_descent: FetalHeadDescent;

  membrane_status: MembraneStatus;
  membrane_rupture_at: string | null;
  amniotic_fluid_color: AmnioticFluidColor | null;

  urine_volume_ml: number;
  urine_protein: UrineProtein;
  urine_acetone: UrineAcetone;

  risk_status: LaborMonitoringRiskStatus;
  risk_factors: string[];
  recommendation: string;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateLaborMonitoringPayload {
  systolic_bp: number;
  diastolic_bp: number;
  pulse_rate: number;
  respiratory_rate: number;
  temperature_c: number;
  oxygen_saturation: number;

  fetal_heart_rate: number;
  fetal_movement: FetalMovement;

  contraction_frequency_per_10_minutes: number;
  contraction_duration_seconds: number;
  contraction_intensity: ContractionIntensity;

  cervical_dilation_cm: number;
  fetal_head_descent: FetalHeadDescent;

  membrane_status: MembraneStatus;
  membrane_rupture_at?: string | null;
  amniotic_fluid_color?: AmnioticFluidColor | null;

  urine_volume_ml: number;
  urine_protein: UrineProtein;
  urine_acetone: UrineAcetone;

  notes?: string | null;
}

export type UpdateLaborMonitoringPayload = Partial<CreateLaborMonitoringPayload>;

export interface LaborMonitoringSingleResult {
  message: string;
  laborMonitoring: LaborMonitoring;
}

export interface CreateLaborMonitoringResult {
  message: string;
  laborMonitoring: LaborMonitoring;
}

export interface UpdateLaborMonitoringResult {
  message: string;
  laborMonitoring: LaborMonitoring;
}

export interface DeleteLaborMonitoringResult {
  message: string;
}

export interface LaborMonitoringCollectionMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface LaborMonitoringCollectionLinks {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface LaborMonitoringCollectionResult {
  message: string;
  laborMonitorings: LaborMonitoring[];
  meta: LaborMonitoringCollectionMeta;
  links: LaborMonitoringCollectionLinks;
}

export interface LaborMonitoringListQuery {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface LaborMonitoringFieldErrors {
  systolic_bp?: string;
  diastolic_bp?: string;
  pulse_rate?: string;
  respiratory_rate?: string;
  temperature_c?: string;
  oxygen_saturation?: string;

  fetal_heart_rate?: string;
  fetal_movement?: string;

  contraction_frequency_per_10_minutes?: string;
  contraction_duration_seconds?: string;
  contraction_intensity?: string;

  cervical_dilation_cm?: string;
  fetal_head_descent?: string;

  membrane_status?: string;
  membrane_rupture_at?: string;
  amniotic_fluid_color?: string;

  urine_volume_ml?: string;
  urine_protein?: string;
  urine_acetone?: string;

  notes?: string;
}
