import type {
  CreatePatientPayload,
  PatientLocation,
} from '@/features/patients/types/patient.types';

export interface PatientCreateFormValues {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  location: PatientLocation | '';
}

export type PatientCreateFieldErrors = Partial<Record<keyof PatientCreateFormValues, string>>;

const PATIENT_LOCATIONS: readonly PatientLocation[] = [
  'poliklinik-puskesmas',
  'ruang-vk-poned-puskesmas',
  'poliklinik-rs',
  'ruang-vk-ponek-rs',
];

export const INITIAL_PATIENT_CREATE_FORM_VALUES: PatientCreateFormValues = {
  name: '',
  dateOfBirth: '',
  phoneNumber: '',
  address: '',
  location: '',
};

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

export function validatePatientCreateForm(form: PatientCreateFormValues): PatientCreateFieldErrors {
  const errors: PatientCreateFieldErrors = {};

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

export function hasPatientCreateErrors(errors: PatientCreateFieldErrors) {
  return Object.keys(errors).length > 0;
}

export function mapPatientCreateFormToPayload(form: PatientCreateFormValues): CreatePatientPayload {
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
