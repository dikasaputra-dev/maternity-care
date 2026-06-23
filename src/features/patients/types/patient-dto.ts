import type { PatientLocation } from '@/features/patients/types/patient.types';

export interface PatientCreatorDto {
  id: number;
  name: string;
}

export interface PatientDto {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  location: PatientLocation;
  created_by: number;
  creator?: PatientCreatorDto;
  created_at: string;
  updated_at: string;
}

export interface PatientListMetaDto {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PatientListLinksDto {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface PatientListResponseDto {
  message: string;
  data: PatientDto[];
  meta: PatientListMetaDto;
  links: PatientListLinksDto;
}

export interface PatientDetailResponseDto {
  message: string;
  data: PatientDto;
}

export interface CreatePatientRequestDto {
  name: string;
  date_of_birth: string;
  location: PatientLocation;
}

export interface CreatePatientResponseDto {
  message: string;
  data: PatientDto;
}
