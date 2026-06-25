export type PatientLocation =
  | 'poliklinik-puskesmas'
  | 'ruang-vk-poned-puskesmas'
  | 'poliklinik-rs'
  | 'ruang-vk-ponek-rs';

export type PatientReligion =
  | 'islam'
  | 'kristen-protestan'
  | 'katolik'
  | 'hindu'
  | 'buddha'
  | 'konghucu'
  | 'kepercayaan'
  | 'lainnya';

export type PatientEducation =
  | 'tidak-sekolah'
  | 'sd-sederajat'
  | 'smp-sederajat'
  | 'sma-sederajat'
  | 'diploma'
  | 'sarjana'
  | 'magister'
  | 'doktor';

export interface PatientCreator {
  id: number;
  name: string;
}

export interface Patient {
  id: number;
  medical_record_number: string;
  name: string;
  date_of_birth: string;
  religion: PatientReligion;
  education: PatientEducation;
  occupation: string;
  ethnicity: string;
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
  religion: PatientReligion;
  education: PatientEducation;
  occupation: string;
  ethnicity: string;
  phone_number?: string | null;
  address: string;
  location: PatientLocation;
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

export interface CreatePatientResult {
  message: string;
  patient: Patient;
}
