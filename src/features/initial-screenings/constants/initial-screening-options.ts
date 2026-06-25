import type {
  InitialScreeningComorbidities,
  InitialScreeningRiskStatus,
  PreviousDeliveryHistory,
  PreviousPregnancyHistory,
} from '@/features/initial-screenings/types/initial-screening.types';

export const INITIAL_SCREENING_RISK_STATUS_LABELS: Record<InitialScreeningRiskStatus, string> = {
  low: 'Risiko Rendah',
  medium: 'Risiko Sedang',
  high: 'Risiko Tinggi',
};

export const PREVIOUS_PREGNANCY_HISTORY_LABELS: Record<
  Exclude<keyof PreviousPregnancyHistory, 'other_text'>,
  string
> = {
  normal: 'Normal',
  hypertension: 'Hipertensi',
  eclampsia: 'Eklamsia',
  gestational_diabetes: 'Diabetes gestasional',
  preeclampsia: 'Preeklamsia',
  other: 'Lainnya',
};

export const COMORBIDITY_LABELS: Record<
  Exclude<keyof InitialScreeningComorbidities, 'other_text'>,
  string
> = {
  none: 'Tidak ada',
  heart_disease: 'Penyakit jantung',
  asthma: 'Asma',
  hypertension: 'Hipertensi',
  anemia: 'Anemia',
  bleeding: 'Perdarahan',
  other: 'Lainnya',
};

export const PREVIOUS_DELIVERY_HISTORY_LABELS: Record<keyof PreviousDeliveryHistory, string> = {
  spontaneous_vaginal: 'Persalinan spontan',
  assisted_vaginal: 'Persalinan berbantu',
  cesarean_section: 'Sectio caesarea',
};

export const DEFAULT_PREVIOUS_PREGNANCY_HISTORY: PreviousPregnancyHistory = {
  normal: false,
  hypertension: false,
  eclampsia: false,
  gestational_diabetes: false,
  preeclampsia: false,
  other: false,
  other_text: null,
};

export const DEFAULT_COMORBIDITIES: InitialScreeningComorbidities = {
  none: false,
  heart_disease: false,
  asthma: false,
  hypertension: false,
  anemia: false,
  bleeding: false,
  other: false,
  other_text: null,
};

export const DEFAULT_PREVIOUS_DELIVERY_HISTORY: PreviousDeliveryHistory = {
  spontaneous_vaginal: false,
  assisted_vaginal: false,
  cesarean_section: false,
};
