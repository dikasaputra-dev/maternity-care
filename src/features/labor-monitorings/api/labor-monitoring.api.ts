import { axiosInstance } from '@/api/axios-instance';
import { LABOR_MONITORING_ENDPOINTS } from '@/features/labor-monitorings/api/labor-monitoring-endpoints';
import {
  mapCreateLaborMonitoringResponse,
  mapDeleteLaborMonitoringResponse,
  mapLaborMonitoringCollectionResponse,
  mapLaborMonitoringSingleResponse,
  mapUpdateLaborMonitoringResponse,
} from '@/features/labor-monitorings/mapper/labor-monitoring.mapper';
import type {
  CreateLaborMonitoringPayload,
  CreateLaborMonitoringResult,
  LaborMonitoring,
  LaborMonitoringCollectionResult,
  LaborMonitoringListQuery,
  UpdateLaborMonitoringPayload,
  UpdateLaborMonitoringResult,
  DeleteLaborMonitoringResult,
} from '@/features/labor-monitorings/types/labor-monitoring.types';

function buildCreatePayload(payload: CreateLaborMonitoringPayload) {
  return {
    systolic_bp: payload.systolic_bp,
    diastolic_bp: payload.diastolic_bp,
    pulse_rate: payload.pulse_rate,
    respiratory_rate: payload.respiratory_rate,
    temperature_c: payload.temperature_c,
    oxygen_saturation: payload.oxygen_saturation,

    fetal_heart_rate: payload.fetal_heart_rate,
    fetal_movement: payload.fetal_movement,

    contraction_frequency_per_10_minutes: payload.contraction_frequency_per_10_minutes,
    contraction_duration_seconds: payload.contraction_duration_seconds,
    contraction_intensity: payload.contraction_intensity,

    cervical_dilation_cm: payload.cervical_dilation_cm,
    fetal_head_descent: payload.fetal_head_descent,

    membrane_status: payload.membrane_status,
    membrane_rupture_at:
      payload.membrane_status === 'ruptured' ? payload.membrane_rupture_at : null,
    amniotic_fluid_color:
      payload.membrane_status === 'ruptured' ? payload.amniotic_fluid_color : null,

    urine_volume_ml: payload.urine_volume_ml,
    urine_protein: payload.urine_protein,
    urine_acetone: payload.urine_acetone,

    notes: payload.notes ?? null,
  };
}

function removeUndefinedValues(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function buildUpdatePayload(payload: UpdateLaborMonitoringPayload) {
  const mappedPayload = removeUndefinedValues({
    systolic_bp: payload.systolic_bp,
    diastolic_bp: payload.diastolic_bp,
    pulse_rate: payload.pulse_rate,
    respiratory_rate: payload.respiratory_rate,
    temperature_c: payload.temperature_c,
    oxygen_saturation: payload.oxygen_saturation,

    fetal_heart_rate: payload.fetal_heart_rate,
    fetal_movement: payload.fetal_movement,

    contraction_frequency_per_10_minutes: payload.contraction_frequency_per_10_minutes,
    contraction_duration_seconds: payload.contraction_duration_seconds,
    contraction_intensity: payload.contraction_intensity,

    cervical_dilation_cm: payload.cervical_dilation_cm,
    fetal_head_descent: payload.fetal_head_descent,

    membrane_status: payload.membrane_status,
    membrane_rupture_at: payload.membrane_rupture_at,
    amniotic_fluid_color: payload.amniotic_fluid_color,

    urine_volume_ml: payload.urine_volume_ml,
    urine_protein: payload.urine_protein,
    urine_acetone: payload.urine_acetone,

    notes: payload.notes,
  });

  if (payload.membrane_status === 'intact') {
    return {
      ...mappedPayload,
      membrane_rupture_at: null,
      amniotic_fluid_color: null,
    };
  }

  return mappedPayload;
}

export async function getLaborMonitorings(
  query: LaborMonitoringListQuery = {},
): Promise<LaborMonitoringCollectionResult> {
  const response = await axiosInstance.get<unknown>(LABOR_MONITORING_ENDPOINTS.LIST, {
    params: {
      search: query.search ?? undefined,
      page: query.page ?? 1,
      per_page: query.perPage ?? 10,
    },
  });

  return mapLaborMonitoringCollectionResponse(response.data);
}

export async function getLaborMonitoringDetail(
  laborMonitoringId: number,
): Promise<LaborMonitoring> {
  const response = await axiosInstance.get<unknown>(
    LABOR_MONITORING_ENDPOINTS.DETAIL(laborMonitoringId),
  );

  return mapLaborMonitoringSingleResponse(response.data).laborMonitoring;
}

export async function getPatientLaborMonitorings(
  patientId: number,
  query: LaborMonitoringListQuery = {},
): Promise<LaborMonitoringCollectionResult> {
  const response = await axiosInstance.get<unknown>(
    LABOR_MONITORING_ENDPOINTS.BY_PATIENT(patientId),
    {
      params: {
        search: query.search ?? undefined,
        page: query.page ?? 1,
        per_page: query.perPage ?? 10,
      },
    },
  );

  return mapLaborMonitoringCollectionResponse(response.data);
}

export async function getPatientLatestLaborMonitoring(patientId: number): Promise<LaborMonitoring> {
  const response = await axiosInstance.get<unknown>(
    LABOR_MONITORING_ENDPOINTS.LATEST_BY_PATIENT(patientId),
  );

  return mapLaborMonitoringSingleResponse(response.data).laborMonitoring;
}

export async function createPatientLaborMonitoring(
  patientId: number,
  payload: CreateLaborMonitoringPayload,
): Promise<CreateLaborMonitoringResult> {
  const response = await axiosInstance.post<unknown>(
    LABOR_MONITORING_ENDPOINTS.CREATE_BY_PATIENT(patientId),
    buildCreatePayload(payload),
  );

  return mapCreateLaborMonitoringResponse(response.data);
}

export async function updateLaborMonitoring(
  laborMonitoringId: number,
  payload: UpdateLaborMonitoringPayload,
): Promise<UpdateLaborMonitoringResult> {
  const response = await axiosInstance.patch<unknown>(
    LABOR_MONITORING_ENDPOINTS.DETAIL(laborMonitoringId),
    buildUpdatePayload(payload),
  );

  return mapUpdateLaborMonitoringResponse(response.data);
}

export async function deleteLaborMonitoring(
  laborMonitoringId: number,
): Promise<DeleteLaborMonitoringResult> {
  const response = await axiosInstance.delete<unknown>(
    LABOR_MONITORING_ENDPOINTS.DETAIL(laborMonitoringId),
  );

  return mapDeleteLaborMonitoringResponse(response.data);
}
