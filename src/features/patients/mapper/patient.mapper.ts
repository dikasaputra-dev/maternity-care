import { ApiError } from '@/api/api-error';
import type {
  CreatePatientResult,
  Patient,
  PatientCreator,
  PatientEducation,
  PatientListItem,
  PatientListLinks,
  PatientListMeta,
  PatientListResult,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

const PATIENT_RELIGIONS: readonly PatientReligion[] = [
  'islam',
  'kristen-protestan',
  'katolik',
  'hindu',
  'buddha',
  'konghucu',
  'kepercayaan',
  'lainnya',
];

const PATIENT_EDUCATIONS: readonly PatientEducation[] = [
  'tidak-sekolah',
  'sd-sederajat',
  'smp-sederajat',
  'sma-sederajat',
  'diploma',
  'sarjana',
  'magister',
  'doktor',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPatientLocation(value: unknown): value is PatientLocation {
  return typeof value === 'string' && PATIENT_LOCATIONS.includes(value as PatientLocation);
}

function isPatientReligion(value: unknown): value is PatientReligion {
  return typeof value === 'string' && PATIENT_RELIGIONS.includes(value as PatientReligion);
}

function isPatientEducation(value: unknown): value is PatientEducation {
  return typeof value === 'string' && PATIENT_EDUCATIONS.includes(value as PatientEducation);
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string') {
    throw new ApiError(`Field ${field} dari data pasien tidak valid.`);
  }

  return value;
}

function readNumber(value: unknown, field: string) {
  if (typeof value !== 'number') {
    throw new ApiError(`Field ${field} dari data pasien tidak valid.`);
  }

  return value;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function readMessage(response: Record<string, unknown>, fallback: string) {
  return typeof response.message === 'string' && response.message.trim()
    ? response.message
    : fallback;
}

function mapPatientCreator(value: unknown): PatientCreator | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.name !== 'string' || !value.name.trim()) {
    return null;
  }

  return {
    id: typeof value.id === 'number' ? value.id : undefined,
    name: value.name,
  };
}

function readPatientLocation(value: unknown) {
  if (!isPatientLocation(value)) {
    throw new ApiError('Lokasi pasien dari server tidak valid.');
  }

  return value;
}

/**
 * Mapper khusus item dari GET /api/patients.
 * Endpoint list hanya boleh mengisi field table.
 */
export function mapPatientListItem(value: unknown): PatientListItem {
  if (!isRecord(value)) {
    throw new ApiError('Format item daftar pasien dari server tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    medical_record_number: readString(value.medical_record_number, 'medical_record_number'),
    name: readString(value.name, 'name'),
    date_of_birth: readString(value.date_of_birth, 'date_of_birth'),
    location: readPatientLocation(value.location),
    creator: mapPatientCreator(value.creator),
  };
}

/**
 * Mapper detail pasien.
 * Dipakai untuk GET /api/patients/{id}, create response, dan update response.
 */
export function mapPatient(value: unknown): Patient {
  if (!isRecord(value)) {
    throw new ApiError('Format data pasien dari server tidak valid.');
  }

  const location = value.location;
  const religion = value.religion;
  const education = value.education;

  if (!isPatientLocation(location)) {
    throw new ApiError('Lokasi pasien dari server tidak valid.');
  }

  if (!isPatientReligion(religion)) {
    throw new ApiError('Agama pasien dari server tidak valid.');
  }

  if (!isPatientEducation(education)) {
    throw new ApiError('Pendidikan pasien dari server tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    medical_record_number: readString(value.medical_record_number, 'medical_record_number'),
    name: readString(value.name, 'name'),
    date_of_birth: readString(value.date_of_birth, 'date_of_birth'),
    religion,
    education,
    occupation: readString(value.occupation, 'occupation'),
    ethnicity: readString(value.ethnicity, 'ethnicity'),
    phone_number: readNullableString(value.phone_number),
    address: readString(value.address, 'address'),
    location,
    created_by: readNumber(value.created_by, 'created_by'),
    creator: mapPatientCreator(value.creator),
    created_at: readString(value.created_at, 'created_at'),
    updated_at: readString(value.updated_at, 'updated_at'),
  };
}

function mapPatientListMeta(value: unknown): PatientListMeta {
  if (!isRecord(value)) {
    return {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
    };
  }

  return {
    current_page: typeof value.current_page === 'number' ? value.current_page : 1,
    per_page: typeof value.per_page === 'number' ? value.per_page : 10,
    total: typeof value.total === 'number' ? value.total : 0,
    last_page: typeof value.last_page === 'number' ? value.last_page : 1,
  };
}

function mapPatientListLinks(value: unknown): PatientListLinks {
  if (!isRecord(value)) {
    return {
      first: null,
      last: null,
      previous: null,
      next: null,
    };
  }

  return {
    first: readNullableString(value.first),
    last: readNullableString(value.last),
    previous: readNullableString(value.previous) ?? readNullableString(value.prev),
    next: readNullableString(value.next),
  };
}

export function mapPatientListResponse(response: unknown): PatientListResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response daftar pasien tidak valid.');
  }

  if (!Array.isArray(response.data)) {
    throw new ApiError('Format data daftar pasien tidak valid.');
  }

  return {
    message: readMessage(response, 'Data pasien berhasil dimuat.'),
    patients: response.data.map(mapPatientListItem),
    meta: mapPatientListMeta(response.meta),
    links: mapPatientListLinks(response.links),
  };
}

export function mapPatientDetailResponse(response: unknown): Patient {
  if (!isRecord(response)) {
    throw new ApiError('Format response detail pasien tidak valid.');
  }

  return mapPatient(response.data);
}

export function mapCreatePatientResponse(response: unknown): CreatePatientResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response tambah pasien tidak valid.');
  }

  return {
    message: readMessage(response, 'Data pasien berhasil disimpan.'),
    patient: mapPatient(response.data),
  };
}

export function mapUpdatePatientResponse(response: unknown): CreatePatientResult {
  if (!isRecord(response)) {
    throw new ApiError('Format response update pasien tidak valid.');
  }

  return {
    message: readMessage(response, 'Data pasien berhasil diperbarui.'),
    patient: mapPatient(response.data),
  };
}
