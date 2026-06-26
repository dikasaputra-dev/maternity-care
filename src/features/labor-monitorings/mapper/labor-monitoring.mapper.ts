import { ApiError } from '@/api/api-error';
import type {
  AmnioticFluidColor,
  ContractionIntensity,
  CreateLaborMonitoringResult,
  DeleteLaborMonitoringResult,
  FetalHeadDescent,
  FetalMovement,
  LaborMonitoring,
  LaborMonitoringCollectionLinks,
  LaborMonitoringCollectionMeta,
  LaborMonitoringCollectionResult,
  LaborMonitoringPatientSummary,
  LaborMonitoringRiskStatus,
  LaborMonitoringSingleResult,
  MembraneStatus,
  UpdateLaborMonitoringResult,
  UrineAcetone,
  UrineProtein,
} from '@/features/labor-monitorings/types/labor-monitoring.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, fieldName: string) {
  if (typeof value !== 'number') {
    throw new ApiError(`Field ${fieldName} tidak valid.`);
  }

  return value;
}

function readString(value: unknown, fieldName: string) {
  if (typeof value !== 'string') {
    throw new ApiError(`Field ${fieldName} tidak valid.`);
  }

  return value;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function readMessage(response: Record<string, unknown>, fallback: string) {
  return typeof response.message === 'string' && response.message.trim()
    ? response.message
    : fallback;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function mapPatientSummary(value: unknown): LaborMonitoringPatientSummary | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    id: readNumber(value.id, 'patient.id'),
    medical_record_number: readString(value.medical_record_number, 'patient.medical_record_number'),
    name: readString(value.name, 'patient.name'),
    date_of_birth: readString(value.date_of_birth, 'patient.date_of_birth'),
    age: typeof value.age === 'number' ? value.age : undefined,
    religion: typeof value.religion === 'string' ? value.religion : undefined,
    education: typeof value.education === 'string' ? value.education : undefined,
    occupation: typeof value.occupation === 'string' ? value.occupation : undefined,
    ethnicity: typeof value.ethnicity === 'string' ? value.ethnicity : undefined,
    phone_number: typeof value.phone_number === 'string' ? value.phone_number : null,
    address: typeof value.address === 'string' ? value.address : undefined,
    location: typeof value.location === 'string' ? value.location : undefined,
  };
}

function mapCollectionMeta(value: unknown): LaborMonitoringCollectionMeta {
  if (!isRecord(value)) {
    return {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    };
  }

  return {
    current_page: typeof value.current_page === 'number' ? value.current_page : 1,
    per_page: typeof value.per_page === 'number' ? value.per_page : 10,
    total: typeof value.total === 'number' ? value.total : 0,
    last_page: typeof value.last_page === 'number' ? value.last_page : 1,
  };
}

function mapCollectionLinks(value: unknown): LaborMonitoringCollectionLinks {
  if (!isRecord(value)) {
    return {
      first: null,
      last: null,
      previous: null,
      next: null,
    };
  }

  return {
    first: readNullableString(value.first),
    last: readNullableString(value.last),
    previous: readNullableString(value.previous) ?? readNullableString(value.prev),
    next: readNullableString(value.next),
  };
}

export function mapLaborMonitoring(value: unknown): LaborMonitoring {
  if (!isRecord(value)) {
    throw new ApiError('Format data Pemantauan Persalinan tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    patient_id: readNumber(value.patient_id, 'patient_id'),
    patient: mapPatientSummary(value.patient),
    monitored_at: readString(value.monitored_at, 'monitored_at'),

    systolic_bp: readNumber(value.systolic_bp, 'systolic_bp'),
    diastolic_bp: readNumber(value.diastolic_bp, 'diastolic_bp'),
    pulse_rate: readNumber(value.pulse_rate, 'pulse_rate'),
    respiratory_rate: readNumber(value.respiratory_rate, 'respiratory_rate'),
    temperature_c: readNumber(value.temperature_c, 'temperature_c'),
    oxygen_saturation: readNumber(value.oxygen_saturation, 'oxygen_saturation'),

    fetal_heart_rate: readNumber(value.fetal_heart_rate, 'fetal_heart_rate'),
    fetal_movement: readString(value.fetal_movement, 'fetal_movement') as FetalMovement,

    contraction_frequency_per_10_minutes: readNumber(
      value.contraction_frequency_per_10_minutes,
      'contraction_frequency_per_10_minutes',
    ),
    contraction_duration_seconds: readNumber(
      value.contraction_duration_seconds,
      'contraction_duration_seconds',
    ),
    contraction_intensity: readString(
      value.contraction_intensity,
      'contraction_intensity',
    ) as ContractionIntensity,

    cervical_dilation_cm: readNumber(value.cervical_dilation_cm, 'cervical_dilation_cm'),
    fetal_head_descent: readString(
      value.fetal_head_descent,
      'fetal_head_descent',
    ) as FetalHeadDescent,

    membrane_status: readString(value.membrane_status, 'membrane_status') as MembraneStatus,
    membrane_rupture_at: readNullableString(value.membrane_rupture_at),
    amniotic_fluid_color: readNullableString(
      value.amniotic_fluid_color,
    ) as AmnioticFluidColor | null,

    urine_volume_ml: readNumber(value.urine_volume_ml, 'urine_volume_ml'),
    urine_protein: readString(value.urine_protein, 'urine_protein') as UrineProtein,
    urine_acetone: readString(value.urine_acetone, 'urine_acetone') as UrineAcetone,

    risk_status: readString(value.risk_status, 'risk_status') as LaborMonitoringRiskStatus,
    risk_factors: readStringArray(value.risk_factors),
    recommendation: readString(value.recommendation, 'recommendation'),

    notes: readNullableString(value.notes),

    created_at: readString(value.created_at, 'created_at'),
    updated_at: readString(value.updated_at, 'updated_at'),
  };
}

export function mapLaborMonitoringSingleResponse(response: unknown): LaborMonitoringSingleResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response Pemantauan Persalinan tidak valid.');
  }

  return {
    message: readMessage(response, 'Data Pemantauan Persalinan berhasil dimuat.'),
    laborMonitoring: mapLaborMonitoring(response.data),
  };
}

export function mapCreateLaborMonitoringResponse(response: unknown): CreateLaborMonitoringResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response tambah Pemantauan Persalinan tidak valid.');
  }

  return {
    message: readMessage(response, 'Pemantauan Persalinan berhasil dibuat.'),
    laborMonitoring: mapLaborMonitoring(response.data),
  };
}

export function mapUpdateLaborMonitoringResponse(response: unknown): UpdateLaborMonitoringResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response update Pemantauan Persalinan tidak valid.');
  }

  return {
    message: readMessage(response, 'Pemantauan Persalinan berhasil diperbarui.'),
    laborMonitoring: mapLaborMonitoring(response.data),
  };
}

export function mapLaborMonitoringCollectionResponse(
  response: unknown,
): LaborMonitoringCollectionResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response daftar Pemantauan Persalinan tidak valid.');
  }

  if (!Array.isArray(response.data)) {
    throw new ApiError('Format data daftar Pemantauan Persalinan tidak valid.');
  }

  return {
    message: readMessage(response, 'Data Pemantauan Persalinan berhasil dimuat.'),
    laborMonitorings: response.data.map(mapLaborMonitoring),
    meta: mapCollectionMeta(response.meta),
    links: mapCollectionLinks(response.links),
  };
}

export function mapDeleteLaborMonitoringResponse(response: unknown): DeleteLaborMonitoringResult {
  if (!isRecord(response)) {
    return {
      message: 'Pemantauan Persalinan berhasil dihapus.',
    };
  }

  return {
    message: readMessage(response, 'Pemantauan Persalinan berhasil dihapus.'),
  };
}
