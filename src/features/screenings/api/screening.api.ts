import { axiosInstance } from '@/api/axios-instance';
import { SCREENING_ENDPOINTS } from '@/features/screenings/api/screening-endpoints';
import { mapScreeningSingleResponse } from '@/features/screenings/mapper/screening.mapper';
import type { Screening } from '@/features/screenings/types/screening.types';

export async function getLatestPatientScreening(patientId: number): Promise<Screening> {
  const response = await axiosInstance.get<unknown>(
    SCREENING_ENDPOINTS.LATEST_BY_PATIENT(patientId),
  );

  return mapScreeningSingleResponse(response.data);
}
