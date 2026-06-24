import { ApiError } from '@/api/api-error';
import type {
  CreatePatientResult,
  Patient,
  PatientCreator,
  PatientListLinks,
  PatientListMeta,
  PatientListResult,
  PatientLocation,
} from '@/features/patients/types/patient.types';

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPatientLocation(value: unknown): value is PatientLocation {
  return typeof value === 'string' && PATIENT_LOCATIONS.includes(value as PatientLocation);
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

function mapPatientCreator(value: unknown): PatientCreator | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.id !== 'number' || typeof value.name !== 'string') {
    return undefined;
  }

  return {
    id: value.id,
    name: value.name,
  };
}

export function mapPatient(value: unknown): Patient {
  if (!isRecord(value)) {
    throw new ApiError('Format data pasien dari server tidak valid.');
  }

  if (!isPatientLocation(value.location)) {
    throw new ApiError('Lokasi pasien dari server tidak valid.');
  }

  return {
    id: readNumber(value.id, 'id'),
    medical_record_number: readString(value.medical_record_number, 'medical_record_number'),
    name: readString(value.name, 'name'),
    date_of_birth: readString(value.date_of_birth, 'date_of_birth'),
    phone_number: readNullableString(value.phone_number),
    address: readString(value.address, 'address'),
    location: value.location,
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
    patients: response.data.map(mapPatient),
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
