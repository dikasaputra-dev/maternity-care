import {
  DEFAULT_COMORBIDITIES,
  DEFAULT_PREVIOUS_DELIVERY_HISTORY,
  DEFAULT_PREVIOUS_PREGNANCY_HISTORY,
} from '@/features/initial-screenings/constants/initial-screening-options';
import type {
  CreateInitialScreeningPayload,
  InitialScreeningComorbidities,
  PreviousDeliveryHistory,
  PreviousPregnancyHistory,
} from '@/features/initial-screenings/types/initial-screening.types';

export interface InitialScreeningCreateFormValues {
  heightCm: string;
  generalCondition: string;
  systolicBp: string;
  diastolicBp: string;
  pulseRate: string;
  respiratoryRate: string;
  temperatureC: string;
  oxygenSaturation: string;
  gravida: string;
  parity: string;
  abortus: string;
  livingChildren: string;
  gestationalAgeWeeks: string;
  hasPreviousDelivery: boolean;
  previousDeliverySpacingYears: string;
  previousPregnancyHistory: PreviousPregnancyHistory;
  comorbidities: InitialScreeningComorbidities;
  previousDeliveryHistory: PreviousDeliveryHistory;
  notes: string;
}

export interface InitialScreeningCreateFieldErrors {
  heightCm?: string;
  generalCondition?: string;
  systolicBp?: string;
  diastolicBp?: string;
  pulseRate?: string;
  respiratoryRate?: string;
  temperatureC?: string;
  oxygenSaturation?: string;
  gravida?: string;
  parity?: string;
  abortus?: string;
  livingChildren?: string;
  gestationalAgeWeeks?: string;
  previousDeliverySpacingYears?: string;
  previousPregnancyHistoryOtherText?: string;
  comorbidities?: string;
  comorbiditiesOtherText?: string;
  previousDeliveryHistory?: string;
  notes?: string;
}

export const INITIAL_SCREENING_CREATE_FORM_VALUES: InitialScreeningCreateFormValues = {
  heightCm: '',
  generalCondition: '',
  systolicBp: '',
  diastolicBp: '',
  pulseRate: '',
  respiratoryRate: '',
  temperatureC: '',
  oxygenSaturation: '',
  gravida: '',
  parity: '',
  abortus: '',
  livingChildren: '',
  gestationalAgeWeeks: '',
  hasPreviousDelivery: false,
  previousDeliverySpacingYears: '',
  previousPregnancyHistory: DEFAULT_PREVIOUS_PREGNANCY_HISTORY,
  comorbidities: DEFAULT_COMORBIDITIES,
  previousDeliveryHistory: DEFAULT_PREVIOUS_DELIVERY_HISTORY,
  notes: '',
};

function validateRequiredNumber(
  value: string,
  label: string,
  min: number,
  max: number,
  allowDecimal = false,
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return `${label} wajib diisi.`;
  }

  const parsedValue = Number(trimmedValue);

  if (Number.isNaN(parsedValue)) {
    return `${label} harus berupa angka.`;
  }

  if (!allowDecimal && !Number.isInteger(parsedValue)) {
    return `${label} harus berupa angka bulat.`;
  }

  if (parsedValue < min || parsedValue > max) {
    return `${label} harus berada dalam rentang ${min}–${max}.`;
  }

  return undefined;
}

function toNumber(value: string) {
  return Number(value.trim());
}

function hasAnyPreviousDeliveryHistorySelected(history: PreviousDeliveryHistory) {
  return history.spontaneous_vaginal || history.assisted_vaginal || history.cesarean_section;
}

function hasComorbidityConflict(comorbidities: InitialScreeningComorbidities) {
  if (!comorbidities.none) {
    return false;
  }

  return (
    comorbidities.heart_disease ||
    comorbidities.asthma ||
    comorbidities.hypertension ||
    comorbidities.anemia ||
    comorbidities.bleeding ||
    comorbidities.other
  );
}

export function validateInitialScreeningCreateForm(
  form: InitialScreeningCreateFormValues,
): InitialScreeningCreateFieldErrors {
  const errors: InitialScreeningCreateFieldErrors = {};

  const heightError = validateRequiredNumber(form.heightCm, 'Tinggi badan', 80, 220);

  if (heightError) {
    errors.heightCm = heightError;
  }

  if (!form.generalCondition.trim()) {
    errors.generalCondition = 'Keadaan umum wajib diisi.';
  }

  const systolicError = validateRequiredNumber(form.systolicBp, 'Tekanan darah sistolik', 50, 250);

  if (systolicError) {
    errors.systolicBp = systolicError;
  }

  const diastolicError = validateRequiredNumber(
    form.diastolicBp,
    'Tekanan darah diastolik',
    30,
    160,
  );

  if (diastolicError) {
    errors.diastolicBp = diastolicError;
  }

  const pulseError = validateRequiredNumber(form.pulseRate, 'Frekuensi nadi', 30, 220);

  if (pulseError) {
    errors.pulseRate = pulseError;
  }

  const respiratoryError = validateRequiredNumber(form.respiratoryRate, 'Frekuensi napas', 5, 60);

  if (respiratoryError) {
    errors.respiratoryRate = respiratoryError;
  }

  const temperatureError = validateRequiredNumber(form.temperatureC, 'Suhu', 30, 45, true);

  if (temperatureError) {
    errors.temperatureC = temperatureError;
  }

  const oxygenError = validateRequiredNumber(form.oxygenSaturation, 'Saturasi oksigen', 0, 100);

  if (oxygenError) {
    errors.oxygenSaturation = oxygenError;
  }

  const gravidaError = validateRequiredNumber(form.gravida, 'Gravida', 0, 20);

  if (gravidaError) {
    errors.gravida = gravidaError;
  }

  const parityError = validateRequiredNumber(form.parity, 'Paritas', 0, 20);

  if (parityError) {
    errors.parity = parityError;
  }

  const abortusError = validateRequiredNumber(form.abortus, 'Abortus', 0, 20);

  if (abortusError) {
    errors.abortus = abortusError;
  }

  const livingChildrenError = validateRequiredNumber(form.livingChildren, 'Anak hidup', 0, 20);

  if (livingChildrenError) {
    errors.livingChildren = livingChildrenError;
  }

  const gestationalAgeError = validateRequiredNumber(
    form.gestationalAgeWeeks,
    'Usia kehamilan',
    1,
    45,
  );

  if (gestationalAgeError) {
    errors.gestationalAgeWeeks = gestationalAgeError;
  }

  if (form.hasPreviousDelivery) {
    const spacingError = validateRequiredNumber(
      form.previousDeliverySpacingYears,
      'Jarak persalinan sebelumnya',
      0,
      30,
      true,
    );

    if (spacingError) {
      errors.previousDeliverySpacingYears = spacingError;
    }

    if (!hasAnyPreviousDeliveryHistorySelected(form.previousDeliveryHistory)) {
      errors.previousDeliveryHistory = 'Pilih minimal satu riwayat persalinan sebelumnya.';
    }
  }

  if (form.previousPregnancyHistory.other && !form.previousPregnancyHistory.other_text?.trim()) {
    errors.previousPregnancyHistoryOtherText = 'Keterangan riwayat kehamilan lainnya wajib diisi.';
  }

  if (hasComorbidityConflict(form.comorbidities)) {
    errors.comorbidities =
      'Jika memilih tidak ada penyakit penyerta, penyakit lain tidak boleh dipilih.';
  }

  if (form.comorbidities.other && !form.comorbidities.other_text?.trim()) {
    errors.comorbiditiesOtherText = 'Keterangan penyakit penyerta lainnya wajib diisi.';
  }

  if (form.notes.trim().length > 2000) {
    errors.notes = 'Catatan maksimal 2000 karakter.';
  }

  return errors;
}

export function hasInitialScreeningCreateErrors(errors: InitialScreeningCreateFieldErrors) {
  return Object.keys(errors).length > 0;
}

export function mapInitialScreeningCreateFormToPayload(
  form: InitialScreeningCreateFormValues,
): CreateInitialScreeningPayload {
  return {
    height_cm: toNumber(form.heightCm),
    general_condition: form.generalCondition.trim(),
    systolic_bp: toNumber(form.systolicBp),
    diastolic_bp: toNumber(form.diastolicBp),
    pulse_rate: toNumber(form.pulseRate),
    respiratory_rate: toNumber(form.respiratoryRate),
    temperature_c: toNumber(form.temperatureC),
    oxygen_saturation: toNumber(form.oxygenSaturation),
    gravida: toNumber(form.gravida),
    parity: toNumber(form.parity),
    abortus: toNumber(form.abortus),
    living_children: toNumber(form.livingChildren),
    gestational_age_weeks: toNumber(form.gestationalAgeWeeks),
    has_previous_delivery: form.hasPreviousDelivery,
    previous_delivery_spacing_years: form.hasPreviousDelivery
      ? toNumber(form.previousDeliverySpacingYears)
      : null,
    previous_pregnancy_history: {
      ...form.previousPregnancyHistory,
      other_text: form.previousPregnancyHistory.other
        ? (form.previousPregnancyHistory.other_text?.trim() ?? null)
        : null,
    },
    comorbidities: {
      ...form.comorbidities,
      other_text: form.comorbidities.other ? (form.comorbidities.other_text?.trim() ?? null) : null,
    },
    previous_delivery_history: form.hasPreviousDelivery
      ? form.previousDeliveryHistory
      : DEFAULT_PREVIOUS_DELIVERY_HISTORY,
    notes: form.notes.trim() || null,
  };
}
