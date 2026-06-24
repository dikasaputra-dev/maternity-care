import { axiosInstance } from '@/api/axios-instance';
import { SCREENING_ENDPOINTS } from '@/features/screenings/api/screening-endpoints';
import {
  mapCreateScreeningResponse,
  mapScreeningSingleResponse,
} from '@/features/screenings/mapper/screening.mapper';
import type {
  CreateScreeningPayload,
  CreateScreeningResult,
  Screening,
} from '@/features/screenings/types/screening.types';

export async function getLatestPatientScreening(patientId: number): Promise<Screening> {
  const response = await axiosInstance.get<unknown>(
    SCREENING_ENDPOINTS.LATEST_BY_PATIENT(patientId),
  );

  return mapScreeningSingleResponse(response.data);
}

export async function createScreening(
  payload: CreateScreeningPayload,
): Promise<CreateScreeningResult> {
  const response = await axiosInstance.post<unknown>(SCREENING_ENDPOINTS.CREATE, {
    patient_id: payload.patient_id,
    risk_status: payload.risk_status,
    gestational_age_weeks: payload.gestational_age_weeks ?? null,
    gravida: payload.gravida ?? null,
    para: payload.para ?? null,
    abortus: payload.abortus ?? null,
    systolic_bp: payload.systolic_bp ?? null,
    diastolic_bp: payload.diastolic_bp ?? null,
    estimated_fetal_weight_grams: payload.estimated_fetal_weight_grams ?? null,
    medical_history: payload.medical_history,
    danger_signs: payload.danger_signs,
    notes: payload.notes?.trim() ?? null,
  });

  return mapCreateScreeningResponse(response.data);
}
