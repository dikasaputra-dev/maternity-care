import { axiosInstance } from '@/api/axios-instance';
import { INITIAL_SCREENING_ENDPOINTS } from '@/features/initial-screenings/api/initial-screening-endpoints';
import { mapInitialScreeningSingleResponse } from '@/features/initial-screenings/mapper/initial-screening.mapper';
import type { InitialScreening } from '@/features/initial-screenings/types/initial-screening.types';

export async function getPatientInitialScreening(patientId: number): Promise<InitialScreening> {
  const response = await axiosInstance.get<unknown>(
    INITIAL_SCREENING_ENDPOINTS.BY_PATIENT(patientId),
  );

  return mapInitialScreeningSingleResponse(response.data);
}
