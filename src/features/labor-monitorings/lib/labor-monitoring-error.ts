import { ApiError } from '@/api/api-error';
import type { LaborMonitoringFieldErrors } from '@/features/labor-monitorings/types/labor-monitoring.types';

const LABOR_MONITORING_FIELD_ERROR_KEYS: (keyof LaborMonitoringFieldErrors)[] = [
  'systolic_bp',
  'diastolic_bp',
  'pulse_rate',
  'respiratory_rate',
  'temperature_c',
  'oxygen_saturation',

  'fetal_heart_rate',
  'fetal_movement',

  'contraction_frequency_per_10_minutes',
  'contraction_duration_seconds',
  'contraction_intensity',

  'cervical_dilation_cm',
  'fetal_head_descent',

  'membrane_status',
  'membrane_rupture_at',
  'amniotic_fluid_color',

  'urine_volume_ml',
  'urine_protein',
  'urine_acetone',

  'notes',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getFirstErrorMessage(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const firstMessage = value.find((item): item is string => typeof item === 'string');

    return firstMessage;
  }

  return undefined;
}

function getValidationErrorsFromApiError(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  if (isRecord(error.errors)) {
    return error.errors;
  }

  if (isRecord(error.data) && isRecord(error.data.errors)) {
    return error.data.errors;
  }

  if (
    isRecord(error.response) &&
    isRecord(error.response.data) &&
    isRecord(error.response.data.errors)
  ) {
    return error.response.data.errors;
  }

  return null;
}

export function getLaborMonitoringErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Skrining awal harus diselesaikan terlebih dahulu sebelum pemantauan persalinan.';
    }

    if (error.status === 403) {
      return 'Anda tidak memiliki izin untuk mengubah atau menghapus data ini.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan saat memproses data Pemantauan Persalinan.';
}

export function mapLaborMonitoringFieldErrors(error: unknown): LaborMonitoringFieldErrors {
  const validationErrors = getValidationErrorsFromApiError(error);

  if (!validationErrors) {
    return {};
  }

  return LABOR_MONITORING_FIELD_ERROR_KEYS.reduce<LaborMonitoringFieldErrors>(
    (mappedErrors, fieldKey) => {
      const message = getFirstErrorMessage(validationErrors[fieldKey]);

      if (message) {
        mappedErrors[fieldKey] = message;
      }

      return mappedErrors;
    },
    {},
  );
}
