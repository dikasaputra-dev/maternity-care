import type {
  Patient,
  PatientLocation,
  UpdatePatientPayload,
} from '@/features/patients/types/patient.types';

export interface PatientEditFormValues {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  location: PatientLocation | '';
}

export type PatientEditFieldErrors = Partial<Record<keyof PatientEditFormValues, string>>;

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

function isPatientLocation(value: string): value is PatientLocation {
  return PATIENT_LOCATIONS.includes(value as PatientLocation);
}

function isFutureDate(value: string) {
  const date = new Date(value);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return date.getTime() > today.getTime();
}

function isValidPhoneNumber(value: string) {
  return /^[0-9+()\-\s]{8,20}$/.test(value);
}

export function mapPatientToEditForm(patient: Patient): PatientEditFormValues {
  return {
    name: patient.name,
    dateOfBirth: patient.date_of_birth,
    phoneNumber: patient.phone_number ?? '',
    address: patient.address,
    location: patient.location,
  };
}

export function validatePatientEditForm(form: PatientEditFormValues): PatientEditFieldErrors {
  const errors: PatientEditFieldErrors = {};

  const name = form.name.trim();
  const phoneNumber = form.phoneNumber.trim();
  const address = form.address.trim();

  if (!name) {
    errors.name = 'Nama pasien wajib diisi.';
  } else if (name.length < 3) {
    errors.name = 'Nama pasien minimal 3 karakter.';
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Tanggal lahir wajib diisi.';
  } else if (Number.isNaN(new Date(form.dateOfBirth).getTime())) {
    errors.dateOfBirth = 'Tanggal lahir tidak valid.';
  } else if (isFutureDate(form.dateOfBirth)) {
    errors.dateOfBirth = 'Tanggal lahir tidak boleh melebihi hari ini.';
  }

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    errors.phoneNumber = 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung.';
  }

  if (!address) {
    errors.address = 'Alamat tempat tinggal pasien wajib diisi.';
  } else if (address.length < 5) {
    errors.address = 'Alamat tempat tinggal pasien terlalu pendek.';
  }

  if (!form.location) {
    errors.location = 'Lokasi pelayanan wajib dipilih.';
  } else if (!isPatientLocation(form.location)) {
    errors.location = 'Lokasi pelayanan tidak valid.';
  }

  return errors;
}

export function hasPatientEditErrors(errors: PatientEditFieldErrors) {
  return Object.keys(errors).length > 0;
}

export function mapPatientEditFormToPayload(form: PatientEditFormValues): UpdatePatientPayload {
  if (!isPatientLocation(form.location)) {
    throw new Error('Lokasi pelayanan tidak valid.');
  }

  const phoneNumber = form.phoneNumber.trim();

  return {
    name: form.name.trim(),
    date_of_birth: form.dateOfBirth,
    phone_number: phoneNumber || null,
    address: form.address.trim(),
    location: form.location,
  };
}
