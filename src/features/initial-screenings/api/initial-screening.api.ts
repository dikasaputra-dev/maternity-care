import { axiosInstance } from '@/api/axios-instance';
import { INITIAL_SCREENING_ENDPOINTS } from '@/features/initial-screenings/api/initial-screening-endpoints';
import {
  mapCreateInitialScreeningResponse,
  mapInitialScreeningListResponse,
  mapInitialScreeningSingleResponse,
} from '@/features/initial-screenings/mapper/initial-screening.mapper';
import type {
  CreateInitialScreeningPayload,
  CreateInitialScreeningResult,
  InitialScreening,
  InitialScreeningListQuery,
  InitialScreeningListResult,
} from '@/features/initial-screenings/types/initial-screening.types';

export async function getInitialScreenings(
  query: InitialScreeningListQuery = {},
): Promise<InitialScreeningListResult> {
  const response = await axiosInstance.get<unknown>(INITIAL_SCREENING_ENDPOINTS.LIST, {
    params: {
      search: query.search ?? undefined,
      page: query.page ?? 1,
      per_page: query.perPage ?? 10,
    },
  });

  return mapInitialScreeningListResponse(response.data);
}

export async function getPatientInitialScreening(patientId: number): Promise<InitialScreening> {
  const response = await axiosInstance.get<unknown>(
    INITIAL_SCREENING_ENDPOINTS.BY_PATIENT(patientId),
  );

  return mapInitialScreeningSingleResponse(response.data);
}

export async function createPatientInitialScreening(
  patientId: number,
  payload: CreateInitialScreeningPayload,
): Promise<CreateInitialScreeningResult> {
  const response = await axiosInstance.post<unknown>(
    INITIAL_SCREENING_ENDPOINTS.CREATE_BY_PATIENT(patientId),
    {
      height_cm: payload.height_cm,
      general_condition: payload.general_condition,
      systolic_bp: payload.systolic_bp,
      diastolic_bp: payload.diastolic_bp,
      pulse_rate: payload.pulse_rate,
      respiratory_rate: payload.respiratory_rate,
      temperature_c: payload.temperature_c,
      oxygen_saturation: payload.oxygen_saturation,
      gravida: payload.gravida,
      parity: payload.parity,
      abortus: payload.abortus,
      living_children: payload.living_children,
      gestational_age_weeks: payload.gestational_age_weeks,
      has_previous_delivery: payload.has_previous_delivery,
      previous_delivery_spacing_years: payload.previous_delivery_spacing_years,
      previous_pregnancy_history: payload.previous_pregnancy_history,
      comorbidities: payload.comorbidities,
      previous_delivery_history: payload.previous_delivery_history,
      notes: payload.notes,
    },
  );

  return mapCreateInitialScreeningResponse(response.data);
}

export async function getInitialScreeningDetail(
  initialScreeningId: number,
): Promise<InitialScreening> {
  const response = await axiosInstance.get<unknown>(
    INITIAL_SCREENING_ENDPOINTS.DETAIL(initialScreeningId),
  );

  return mapInitialScreeningSingleResponse(response.data);
}
