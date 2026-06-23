import { axiosInstance } from '@/api/axios-instance';
import { PATIENT_ENDPOINTS } from '@/features/patients/api/patient-endpoints';
import {
  mapCreatePatientResponse,
  mapPatientDetailResponse,
  mapPatientListResponse,
} from '@/features/patients/mapper/patient.mapper';
import type {
  CreatePatientPayload,
  CreatePatientResult,
  Patient,
  PatientListQuery,
  PatientListResult,
} from '@/features/patients/types/patient.types';

export async function getPatients(query: PatientListQuery = {}): Promise<PatientListResult> {
  const response = await axiosInstance.get<unknown>(PATIENT_ENDPOINTS.LIST, {
    params: {
      search: query.search ?? undefined,
      page: query.page ?? 1,
      per_page: query.perPage ?? 10,
    },
  });

  return mapPatientListResponse(response.data);
}

export async function getPatientDetail(patientId: number): Promise<Patient> {
  const response = await axiosInstance.get<unknown>(PATIENT_ENDPOINTS.DETAIL(patientId));

  return mapPatientDetailResponse(response.data);
}

export async function createPatient(payload: CreatePatientPayload): Promise<CreatePatientResult> {
  const response = await axiosInstance.post<unknown>(PATIENT_ENDPOINTS.CREATE, {
    name: payload.name.trim(),
    date_of_birth: payload.date_of_birth,
    location: payload.location,
  });

  return mapCreatePatientResponse(response.data);
}
