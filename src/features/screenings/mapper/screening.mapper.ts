import { ApiError } from '@/api/api-error';
import type { PatientLocation } from '@/features/patients/types/patient.types';
import {
  DEFAULT_DANGER_SIGNS,
  DEFAULT_MEDICAL_HISTORY,
} from '@/features/screenings/constants/screening-options';
import type {
  Screening,
  ScreeningCreator,
  ScreeningDangerSigns,
  ScreeningMedicalHistory,
  ScreeningPatientSummary,
  ScreeningRiskStatus,
} from '@/features/screenings/types/screening.types';

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

const SCREENING_RISK_STATUSES: readonly ScreeningRiskStatus[] = ['low', 'medium', 'high'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPatientLocation(value: unknown): value is PatientLocation {
  return typeof value === 'string' && PATIENT_LOCATIONS.includes(value as PatientLocation);
}

function isScreeningRiskStatus(value: unknown): value is ScreeningRiskStatus {
  return (
    typeof value === 'string' && SCREENING_RISK_STATUSES.includes(value as ScreeningRiskStatus)
  );
}

function readNumber(value: unknown, field: string) {
  if (typeof value !== 'number') {
    throw new ApiError(`Field ${field} dari data skrining tidak valid.`);
  }

  return value;
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw new ApiError(`Field ${field} dari data skrining tidak valid.`);
  }

  return value;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function readNullableNumber(value: unknown) {
  return typeof value === 'number' ? value : null;
}

function mapBooleanRecord<T extends { [Key in keyof T]: boolean }>(value: unknown, defaults: T): T {
  const result = { ...defaults };

  if (!isRecord(value)) {
    return result;
  }

  const keys = Object.keys(defaults) as (keyof T)[];

  for (const key of keys) {
    const currentValue = value[String(key)];

    result[key] = (
      typeof currentValue === 'boolean' ? currentValue : defaults[key]
    ) as T[typeof key];
  }

  return result;
}

function mapScreeningCreator(value: unknown): ScreeningCreator | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.id !== 'number' || typeof value.name !== 'string') {
    return undefined;
  }

  return {
    id: value.id,
    name: value.name,
  };
}

function mapScreeningPatientSummary(value: unknown): ScreeningPatientSummary | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (!isPatientLocation(value.location)) {
    return undefined;
  }

  if (
    typeof value.id !== 'number' ||
    typeof value.medical_record_number !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.date_of_birth !== 'string' ||
    typeof value.address !== 'string'
  ) {
    return undefined;
  }

  return {
    id: value.id,
    medical_record_number: value.medical_record_number,
    name: value.name,
    date_of_birth: value.date_of_birth,
    phone_number: readNullableString(value.phone_number),
    address: value.address,
    location: value.location,
  };
}

export function mapScreening(value: unknown): Screening {
  if (!isRecord(value)) {
    throw new ApiError('Format data skrining dari server tidak valid.');
  }

  if (!isScreeningRiskStatus(value.risk_status)) {
    throw new ApiError('Status risiko skrining dari server tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    patient_id: readNumber(value.patient_id, 'patient_id'),
    patient: mapScreeningPatientSummary(value.patient),
    created_by: readNumber(value.created_by, 'created_by'),
    creator: mapScreeningCreator(value.creator),
    risk_status: value.risk_status,
    gestational_age_weeks: readNullableNumber(value.gestational_age_weeks),
    gravida: readNullableNumber(value.gravida),
    para: readNullableNumber(value.para),
    abortus: readNullableNumber(value.abortus),
    systolic_bp: readNullableNumber(value.systolic_bp),
    diastolic_bp: readNullableNumber(value.diastolic_bp),
    estimated_fetal_weight_grams: readNullableNumber(value.estimated_fetal_weight_grams),
    medical_history: mapBooleanRecord<ScreeningMedicalHistory>(
      value.medical_history,
      DEFAULT_MEDICAL_HISTORY,
    ),
    danger_signs: mapBooleanRecord<ScreeningDangerSigns>(value.danger_signs, DEFAULT_DANGER_SIGNS),
    notes: readNullableString(value.notes),
    created_at: readString(value.created_at, 'created_at'),
    updated_at: readString(value.updated_at, 'updated_at'),
  };
}

export function mapScreeningSingleResponse(response: unknown): Screening {
  if (!isRecord(response)) {
    throw new ApiError('Format response skrining tidak valid.');
  }

  return mapScreening(response.data);
}
