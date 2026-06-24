import {
  DEFAULT_DANGER_SIGNS,
  DEFAULT_MEDICAL_HISTORY,
} from '@/features/screenings/constants/screening-options';
import type {
  CreateScreeningPayload,
  ScreeningDangerSigns,
  ScreeningMedicalHistory,
  ScreeningRiskStatus,
} from '@/features/screenings/types/screening.types';

export interface ScreeningCreateFormValues {
  riskStatus: ScreeningRiskStatus | '';
  gestationalAgeWeeks: string;
  gravida: string;
  para: string;
  abortus: string;
  systolicBp: string;
  diastolicBp: string;
  estimatedFetalWeightGrams: string;
  medicalHistory: ScreeningMedicalHistory;
  dangerSigns: ScreeningDangerSigns;
  notes: string;
}

export type ScreeningCreateFieldErrors = Partial<Record<keyof ScreeningCreateFormValues, string>>;

const SCREENING_RISK_STATUSES: readonly ScreeningRiskStatus[] = ['low', 'medium', 'high'];

export const INITIAL_SCREENING_CREATE_FORM_VALUES: ScreeningCreateFormValues = {
  riskStatus: '',
  gestationalAgeWeeks: '',
  gravida: '',
  para: '',
  abortus: '',
  systolicBp: '',
  diastolicBp: '',
  estimatedFetalWeightGrams: '',
  medicalHistory: DEFAULT_MEDICAL_HISTORY,
  dangerSigns: DEFAULT_DANGER_SIGNS,
  notes: '',
};

function isScreeningRiskStatus(value: string): value is ScreeningRiskStatus {
  return SCREENING_RISK_STATUSES.includes(value as ScreeningRiskStatus);
}

function validateOptionalInteger(value: string, fieldLabel: string, min: number, max: number) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);

  if (!Number.isInteger(parsedValue)) {
    return `${fieldLabel} harus berupa angka bulat.`;
  }

  if (parsedValue < min || parsedValue > max) {
    return `${fieldLabel} harus berada dalam rentang ${min}–${max}.`;
  }

  return undefined;
}

function toOptionalNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return Number(trimmedValue);
}

export function validateScreeningCreateForm(
  form: ScreeningCreateFormValues,
): ScreeningCreateFieldErrors {
  const errors: ScreeningCreateFieldErrors = {};

  if (!form.riskStatus) {
    errors.riskStatus = 'Status risiko wajib dipilih.';
  } else if (!isScreeningRiskStatus(form.riskStatus)) {
    errors.riskStatus = 'Status risiko tidak valid.';
  }

  const gestationalAgeError = validateOptionalInteger(
    form.gestationalAgeWeeks,
    'Usia kehamilan',
    1,
    45,
  );

  if (gestationalAgeError) {
    errors.gestationalAgeWeeks = gestationalAgeError;
  }

  const gravidaError = validateOptionalInteger(form.gravida, 'Gravida', 0, 20);

  if (gravidaError) {
    errors.gravida = gravidaError;
  }

  const paraError = validateOptionalInteger(form.para, 'Para', 0, 20);

  if (paraError) {
    errors.para = paraError;
  }

  const abortusError = validateOptionalInteger(form.abortus, 'Abortus', 0, 20);

  if (abortusError) {
    errors.abortus = abortusError;
  }

  const systolicError = validateOptionalInteger(form.systolicBp, 'Tekanan darah sistolik', 50, 250);

  if (systolicError) {
    errors.systolicBp = systolicError;
  }

  const diastolicError = validateOptionalInteger(
    form.diastolicBp,
    'Tekanan darah diastolik',
    30,
    160,
  );

  if (diastolicError) {
    errors.diastolicBp = diastolicError;
  }

  const fetalWeightError = validateOptionalInteger(
    form.estimatedFetalWeightGrams,
    'Taksiran berat janin',
    300,
    7000,
  );

  if (fetalWeightError) {
    errors.estimatedFetalWeightGrams = fetalWeightError;
  }

  if (form.notes.trim().length > 2000) {
    errors.notes = 'Catatan maksimal 2000 karakter.';
  }

  return errors;
}

export function hasScreeningCreateErrors(errors: ScreeningCreateFieldErrors) {
  return Object.keys(errors).length > 0;
}

export function mapScreeningCreateFormToPayload(
  patientId: number,
  form: ScreeningCreateFormValues,
): CreateScreeningPayload {
  if (!isScreeningRiskStatus(form.riskStatus)) {
    throw new Error('Status risiko tidak valid.');
  }

  return {
    patient_id: patientId,
    risk_status: form.riskStatus,
    gestational_age_weeks: toOptionalNumber(form.gestationalAgeWeeks),
    gravida: toOptionalNumber(form.gravida),
    para: toOptionalNumber(form.para),
    abortus: toOptionalNumber(form.abortus),
    systolic_bp: toOptionalNumber(form.systolicBp),
    diastolic_bp: toOptionalNumber(form.diastolicBp),
    estimated_fetal_weight_grams: toOptionalNumber(form.estimatedFetalWeightGrams),
    medical_history: form.medicalHistory,
    danger_signs: form.dangerSigns,
    notes: form.notes.trim() || null,
  };
}
