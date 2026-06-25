import { ApiError } from '@/api/api-error';
import type {
  PatientEducation,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';
import {
  DEFAULT_COMORBIDITIES,
  DEFAULT_PREVIOUS_DELIVERY_HISTORY,
  DEFAULT_PREVIOUS_PREGNANCY_HISTORY,
} from '@/features/initial-screenings/constants/initial-screening-options';
import type {
  InitialScreening,
  InitialScreeningComorbidities,
  InitialScreeningPatientSummary,
  InitialScreeningRiskStatus,
  PreviousDeliveryHistory,
  PreviousPregnancyHistory,
} from '@/features/initial-screenings/types/initial-screening.types';

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

const PATIENT_RELIGIONS: readonly PatientReligion[] = [
  'islam',
  'kristen-protestan',
  'katolik',
  'hindu',
  'buddha',
  'konghucu',
  'kepercayaan',
  'lainnya',
];

const PATIENT_EDUCATIONS: readonly PatientEducation[] = [
  'tidak-sekolah',
  'sd-sederajat',
  'smp-sederajat',
  'sma-sederajat',
  'diploma',
  'sarjana',
  'magister',
  'doktor',
];

const RISK_STATUSES: readonly InitialScreeningRiskStatus[] = ['low', 'medium', 'high'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPatientLocation(value: unknown): value is PatientLocation {
  return typeof value === 'string' && PATIENT_LOCATIONS.includes(value as PatientLocation);
}

function isPatientReligion(value: unknown): value is PatientReligion {
  return typeof value === 'string' && PATIENT_RELIGIONS.includes(value as PatientReligion);
}

function isPatientEducation(value: unknown): value is PatientEducation {
  return typeof value === 'string' && PATIENT_EDUCATIONS.includes(value as PatientEducation);
}

function isRiskStatus(value: unknown): value is InitialScreeningRiskStatus {
  return typeof value === 'string' && RISK_STATUSES.includes(value as InitialScreeningRiskStatus);
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw new ApiError(`Field ${field} dari data skrining awal tidak valid.`);
  }

  return value;
}

function readNumber(value: unknown, field: string) {
  if (typeof value !== 'number') {
    throw new ApiError(`Field ${field} dari data skrining awal tidak valid.`);
  }

  return value;
}

function readBoolean(value: unknown, field: string) {
  if (typeof value !== 'boolean') {
    throw new ApiError(`Field ${field} dari data skrining awal tidak valid.`);
  }

  return value;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function readNullableNumber(value: unknown) {
  return typeof value === 'number' ? value : null;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function readBooleanWithDefault(value: Record<string, unknown>, key: string, fallback: boolean) {
  return typeof value[key] === 'boolean' ? value[key] : fallback;
}

function mapPreviousPregnancyHistory(value: unknown): PreviousPregnancyHistory {
  if (!isRecord(value)) {
    return DEFAULT_PREVIOUS_PREGNANCY_HISTORY;
  }

  return {
    normal: readBooleanWithDefault(value, 'normal', DEFAULT_PREVIOUS_PREGNANCY_HISTORY.normal),
    hypertension: readBooleanWithDefault(
      value,
      'hypertension',
      DEFAULT_PREVIOUS_PREGNANCY_HISTORY.hypertension,
    ),
    eclampsia: readBooleanWithDefault(
      value,
      'eclampsia',
      DEFAULT_PREVIOUS_PREGNANCY_HISTORY.eclampsia,
    ),
    gestational_diabetes: readBooleanWithDefault(
      value,
      'gestational_diabetes',
      DEFAULT_PREVIOUS_PREGNANCY_HISTORY.gestational_diabetes,
    ),
    preeclampsia: readBooleanWithDefault(
      value,
      'preeclampsia',
      DEFAULT_PREVIOUS_PREGNANCY_HISTORY.preeclampsia,
    ),
    other: readBooleanWithDefault(value, 'other', DEFAULT_PREVIOUS_PREGNANCY_HISTORY.other),
    other_text: readNullableString(value.other_text),
  };
}

function mapComorbidities(value: unknown): InitialScreeningComorbidities {
  if (!isRecord(value)) {
    return DEFAULT_COMORBIDITIES;
  }

  return {
    none: readBooleanWithDefault(value, 'none', DEFAULT_COMORBIDITIES.none),
    heart_disease: readBooleanWithDefault(
      value,
      'heart_disease',
      DEFAULT_COMORBIDITIES.heart_disease,
    ),
    asthma: readBooleanWithDefault(value, 'asthma', DEFAULT_COMORBIDITIES.asthma),
    hypertension: readBooleanWithDefault(value, 'hypertension', DEFAULT_COMORBIDITIES.hypertension),
    anemia: readBooleanWithDefault(value, 'anemia', DEFAULT_COMORBIDITIES.anemia),
    bleeding: readBooleanWithDefault(value, 'bleeding', DEFAULT_COMORBIDITIES.bleeding),
    other: readBooleanWithDefault(value, 'other', DEFAULT_COMORBIDITIES.other),
    other_text: readNullableString(value.other_text),
  };
}

function mapPreviousDeliveryHistory(value: unknown): PreviousDeliveryHistory {
  if (!isRecord(value)) {
    return DEFAULT_PREVIOUS_DELIVERY_HISTORY;
  }

  return {
    spontaneous_vaginal: readBooleanWithDefault(
      value,
      'spontaneous_vaginal',
      DEFAULT_PREVIOUS_DELIVERY_HISTORY.spontaneous_vaginal,
    ),
    assisted_vaginal: readBooleanWithDefault(
      value,
      'assisted_vaginal',
      DEFAULT_PREVIOUS_DELIVERY_HISTORY.assisted_vaginal,
    ),
    cesarean_section: readBooleanWithDefault(
      value,
      'cesarean_section',
      DEFAULT_PREVIOUS_DELIVERY_HISTORY.cesarean_section,
    ),
  };
}

function mapPatientSummary(value: unknown): InitialScreeningPatientSummary | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const id = value.id;
  const medicalRecordNumber = value.medical_record_number;
  const name = value.name;
  const dateOfBirth = value.date_of_birth;
  const age = value.age;
  const religion = value.religion;
  const education = value.education;
  const occupation = value.occupation;
  const ethnicity = value.ethnicity;
  const phoneNumber = value.phone_number;
  const address = value.address;
  const location = value.location;

  if (typeof id !== 'number') {
    return undefined;
  }

  if (typeof medicalRecordNumber !== 'string') {
    return undefined;
  }

  if (typeof name !== 'string') {
    return undefined;
  }

  if (typeof dateOfBirth !== 'string') {
    return undefined;
  }

  if (typeof age !== 'number') {
    return undefined;
  }

  if (!isPatientReligion(religion)) {
    return undefined;
  }

  if (!isPatientEducation(education)) {
    return undefined;
  }

  if (typeof occupation !== 'string') {
    return undefined;
  }

  if (typeof ethnicity !== 'string') {
    return undefined;
  }

  if (typeof address !== 'string') {
    return undefined;
  }

  if (!isPatientLocation(location)) {
    return undefined;
  }

  return {
    id,
    medical_record_number: medicalRecordNumber,
    name,
    date_of_birth: dateOfBirth,
    age,
    religion,
    education,
    occupation,
    ethnicity,
    phone_number: readNullableString(phoneNumber),
    address,
    location,
  };
}

export function mapInitialScreening(value: unknown): InitialScreening {
  if (!isRecord(value)) {
    throw new ApiError('Format data skrining awal dari server tidak valid.');
  }

  const riskStatus = value.risk_status;

  if (!isRiskStatus(riskStatus)) {
    throw new ApiError('Status risiko skrining awal dari server tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    patient_id: readNumber(value.patient_id, 'patient_id'),
    patient: mapPatientSummary(value.patient),
    height_cm: readNumber(value.height_cm, 'height_cm'),
    general_condition: readString(value.general_condition, 'general_condition'),
    systolic_bp: readNumber(value.systolic_bp, 'systolic_bp'),
    diastolic_bp: readNumber(value.diastolic_bp, 'diastolic_bp'),
    pulse_rate: readNumber(value.pulse_rate, 'pulse_rate'),
    respiratory_rate: readNumber(value.respiratory_rate, 'respiratory_rate'),
    temperature_c: readNumber(value.temperature_c, 'temperature_c'),
    oxygen_saturation: readNumber(value.oxygen_saturation, 'oxygen_saturation'),
    gravida: readNumber(value.gravida, 'gravida'),
    parity: readNumber(value.parity, 'parity'),
    abortus: readNumber(value.abortus, 'abortus'),
    living_children: readNumber(value.living_children, 'living_children'),
    gestational_age_weeks: readNumber(value.gestational_age_weeks, 'gestational_age_weeks'),
    has_previous_delivery: readBoolean(value.has_previous_delivery, 'has_previous_delivery'),
    previous_delivery_spacing_years: readNullableNumber(value.previous_delivery_spacing_years),
    previous_pregnancy_history: mapPreviousPregnancyHistory(value.previous_pregnancy_history),
    comorbidities: mapComorbidities(value.comorbidities),
    previous_delivery_history: mapPreviousDeliveryHistory(value.previous_delivery_history),
    risk_status: riskStatus,
    risk_factors: readStringArray(value.risk_factors),
    recommendation: readString(value.recommendation, 'recommendation'),
    notes: readNullableString(value.notes),
    created_at: readString(value.created_at, 'created_at'),
    updated_at: readString(value.updated_at, 'updated_at'),
  };
}

export function mapInitialScreeningSingleResponse(response: unknown): InitialScreening {
  if (!isRecord(response)) {
    throw new ApiError('Format response skrining awal tidak valid.');
  }

  return mapInitialScreening(response.data);
}
