import type {
  ScreeningDangerSigns,
  ScreeningMedicalHistory,
  ScreeningRiskStatus,
} from '@/features/screenings/types/screening.types';

export const SCREENING_RISK_STATUS_LABELS: Record<ScreeningRiskStatus, string> = {
  low: 'Risiko Rendah',
  medium: 'Risiko Sedang',
  high: 'Risiko Tinggi',
};

export const MEDICAL_HISTORY_KEYS = [
  'diabetes',
  'hypertension',
  'asthma',
  'heart_disease',
  'preeclampsia',
  'anemia',
] as const satisfies readonly (keyof ScreeningMedicalHistory)[];

export const DANGER_SIGN_KEYS = [
  'bleeding',
  'severe_headache',
  'visual_disturbance',
  'edema',
  'reduced_fetal_movement',
  'fever',
  'abdominal_pain',
] as const satisfies readonly (keyof ScreeningDangerSigns)[];

export const DEFAULT_MEDICAL_HISTORY: ScreeningMedicalHistory = {
  diabetes: false,
  hypertension: false,
  asthma: false,
  heart_disease: false,
  preeclampsia: false,
  anemia: false,
};

export const DEFAULT_DANGER_SIGNS: ScreeningDangerSigns = {
  bleeding: false,
  severe_headache: false,
  visual_disturbance: false,
  edema: false,
  reduced_fetal_movement: false,
  fever: false,
  abdominal_pain: false,
};

export const MEDICAL_HISTORY_LABELS: Record<keyof ScreeningMedicalHistory, string> = {
  diabetes: 'Diabetes',
  hypertension: 'Hipertensi',
  asthma: 'Asma',
  heart_disease: 'Penyakit jantung',
  preeclampsia: 'Preeklamsia',
  anemia: 'Anemia',
};

export const DANGER_SIGN_LABELS: Record<keyof ScreeningDangerSigns, string> = {
  bleeding: 'Perdarahan',
  severe_headache: 'Sakit kepala berat',
  visual_disturbance: 'Gangguan penglihatan',
  edema: 'Edema',
  reduced_fetal_movement: 'Gerak janin berkurang',
  fever: 'Demam',
  abdominal_pain: 'Nyeri perut',
};
