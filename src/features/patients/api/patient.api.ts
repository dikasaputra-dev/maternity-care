import { axiosInstance } from '@/api/axios-instance';
import { PATIENT_ENDPOINTS } from '@/features/patients/api/patient-endpoints';
import {
  mapCreatePatientResponse,
  mapPatientDetailResponse,
  mapPatientListResponse,
  mapUpdatePatientResponse,
} from '@/features/patients/mapper/patient.mapper';
import type {
  CreatePatientPayload,
  CreatePatientResult,
  Patient,
  PatientListQuery,
  PatientListResult,
  UpdatePatientPayload,
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
  const phoneNumber = payload.phone_number?.trim() ?? null;

  const response = await axiosInstance.post<unknown>(PATIENT_ENDPOINTS.CREATE, {
    name: payload.name.trim(),
    date_of_birth: payload.date_of_birth,
    phone_number: phoneNumber,
    address: payload.address.trim(),
    location: payload.location,
  });

  return mapCreatePatientResponse(response.data);
}

export async function updatePatient(
  patientId: number,
  payload: UpdatePatientPayload,
): Promise<CreatePatientResult> {
  const phoneNumber =
    payload.phone_number === undefined ? undefined : (payload.phone_number?.trim() ?? null);

  const response = await axiosInstance.patch<unknown>(PATIENT_ENDPOINTS.UPDATE(patientId), {
    name: payload.name?.trim(),
    date_of_birth: payload.date_of_birth,
    phone_number: phoneNumber,
    address: payload.address?.trim(),
    location: payload.location,
  });

  return mapUpdatePatientResponse(response.data);
}

export async function deletePatient(patientId: number): Promise<string> {
  const response = await axiosInstance.delete<unknown>(PATIENT_ENDPOINTS.DELETE(patientId));

  if (
    typeof response.data === 'object' &&
    response.data !== null &&
    'message' in response.data &&
    typeof response.data.message === 'string'
  ) {
    return response.data.message;
  }

  return 'Data pasien berhasil dihapus.';
}
