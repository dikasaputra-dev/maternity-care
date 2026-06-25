import type {
  AmnioticFluidColor,
  ContractionIntensity,
  FetalHeadDescent,
  FetalMovement,
  LaborMonitoringRiskStatus,
  MembraneStatus,
  UrineAcetone,
  UrineProtein,
} from '@/features/labor-monitorings/types/labor-monitoring.types';

export const LABOR_MONITORING_RISK_STATUS_LABELS: Record<LaborMonitoringRiskStatus, string> = {
  low: 'Risiko Rendah',
  medium: 'Risiko Sedang',
  high: 'Risiko Tinggi',
};

export const FETAL_MOVEMENT_LABELS: Record<FetalMovement, string> = {
  active: 'Aktif',
  decreased: 'Berkurang',
  not_felt: 'Tidak terasa',
};

export const CONTRACTION_INTENSITY_LABELS: Record<ContractionIntensity, string> = {
  weak: 'Lemah',
  moderate: 'Sedang',
  strong: 'Kuat',
};

export const FETAL_HEAD_DESCENT_LABELS: Record<FetalHeadDescent, string> = {
  not_assessed: 'Belum dinilai',
  hodge_i: 'Hodge I',
  hodge_ii: 'Hodge II',
  hodge_iii: 'Hodge III',
  hodge_iv: 'Hodge IV',
};

export const MEMBRANE_STATUS_LABELS: Record<MembraneStatus, string> = {
  intact: 'Utuh',
  ruptured: 'Pecah',
};

export const AMNIOTIC_FLUID_COLOR_LABELS: Record<AmnioticFluidColor, string> = {
  clear: 'Jernih',
  green: 'Hijau',
  blood_stained: 'Bercampur darah',
  dry: 'Kering',
};

export const URINE_PROTEIN_LABELS: Record<UrineProtein, string> = {
  negative: 'Negatif (-)',
  positive: 'Positif (+)',
};

export const URINE_ACETONE_LABELS: Record<UrineAcetone, string> = {
  negative: 'Negatif (-)',
  positive: 'Positif (+)',
};

export const FETAL_MOVEMENT_OPTIONS = [
  { value: 'active', label: FETAL_MOVEMENT_LABELS.active },
  { value: 'decreased', label: FETAL_MOVEMENT_LABELS.decreased },
  { value: 'not_felt', label: FETAL_MOVEMENT_LABELS.not_felt },
] as const;

export const CONTRACTION_INTENSITY_OPTIONS = [
  { value: 'weak', label: CONTRACTION_INTENSITY_LABELS.weak },
  { value: 'moderate', label: CONTRACTION_INTENSITY_LABELS.moderate },
  { value: 'strong', label: CONTRACTION_INTENSITY_LABELS.strong },
] as const;

export const FETAL_HEAD_DESCENT_OPTIONS = [
  { value: 'not_assessed', label: FETAL_HEAD_DESCENT_LABELS.not_assessed },
  { value: 'hodge_i', label: FETAL_HEAD_DESCENT_LABELS.hodge_i },
  { value: 'hodge_ii', label: FETAL_HEAD_DESCENT_LABELS.hodge_ii },
  { value: 'hodge_iii', label: FETAL_HEAD_DESCENT_LABELS.hodge_iii },
  { value: 'hodge_iv', label: FETAL_HEAD_DESCENT_LABELS.hodge_iv },
] as const;

export const MEMBRANE_STATUS_OPTIONS = [
  { value: 'intact', label: MEMBRANE_STATUS_LABELS.intact },
  { value: 'ruptured', label: MEMBRANE_STATUS_LABELS.ruptured },
] as const;

export const AMNIOTIC_FLUID_COLOR_OPTIONS = [
  { value: 'clear', label: AMNIOTIC_FLUID_COLOR_LABELS.clear },
  { value: 'green', label: AMNIOTIC_FLUID_COLOR_LABELS.green },
  {
    value: 'blood_stained',
    label: AMNIOTIC_FLUID_COLOR_LABELS.blood_stained,
  },
  { value: 'dry', label: AMNIOTIC_FLUID_COLOR_LABELS.dry },
] as const;

export const URINE_PROTEIN_OPTIONS = [
  { value: 'negative', label: URINE_PROTEIN_LABELS.negative },
  { value: 'positive', label: URINE_PROTEIN_LABELS.positive },
] as const;

export const URINE_ACETONE_OPTIONS = [
  { value: 'negative', label: URINE_ACETONE_LABELS.negative },
  { value: 'positive', label: URINE_ACETONE_LABELS.positive },
] as const;
