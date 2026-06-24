export type PatientLocation =
  | 'poliklinik-puskesmas'
  | 'ruang-vk-poned-puskesmas'
  | 'poliklinik-rs'
  | 'ruang-vk-ponek-rs';

export interface PatientCreator {
  id: number;
  name: string;
}

export interface Patient {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  phone_number: string | null;
  address: string;
  location: PatientLocation;
  created_by: number;
  creator?: PatientCreator;
  created_at: string;
  updated_at: string;
}

export interface PatientListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PatientListLinks {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface PatientListResult {
  message: string;
  patients: Patient[];
  meta: PatientListMeta;
  links: PatientListLinks;
}

export interface PatientListQuery {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreatePatientPayload {
  name: string;
  date_of_birth: string;
  phone_number?: string | null;
  address: string;
  location: PatientLocation;
}

export interface UpdatePatientPayload {
  name?: string;
  date_of_birth?: string;
  phone_number?: string | null;
  address?: string;
  location?: PatientLocation;
}

export interface CreatePatientResult {
  message: string;
  patient: Patient;
}
