import {
  isPatientLocation,
  type PatientLocation,
} from '@/features/patients/constants/patient-options';

export interface PatientCreateFormState {
  name: string;
  age: string;
  location: PatientLocation | '';
  address: string;
  phoneNumber: string;
}

export type PatientCreateField = keyof PatientCreateFormState;

export type PatientCreateTextField = Exclude<PatientCreateField, 'location'>;

export type PatientCreateErrors = Partial<Record<PatientCreateField, string>>;

export const initialPatientCreateFormState: PatientCreateFormState = {
  name: '',
  age: '',
  location: '',
  address: '',
  phoneNumber: '',
};

const PHONE_PATTERN = /^[0-9+()\-\s]{8,20}$/;

export function parsePatientAge(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsedAge = Number(value);

  if (!Number.isInteger(parsedAge)) {
    return null;
  }

  return parsedAge;
}

export function validateCreatePatientForm(form: PatientCreateFormState): PatientCreateErrors {
  const errors: PatientCreateErrors = {};

  const name = form.name.trim();
  const age = parsePatientAge(form.age);
  const address = form.address.trim();
  const phoneNumber = form.phoneNumber.trim();

  if (!name) {
    errors.name = 'Nama pasien wajib diisi.';
  } else if (name.length < 3) {
    errors.name = 'Nama pasien minimal 3 karakter.';
  }

  if (!form.age.trim()) {
    errors.age = 'Usia ibu wajib diisi.';
  } else if (age === null) {
    errors.age = 'Usia harus berupa angka.';
  } else if (age < 10 || age > 60) {
    errors.age = 'Usia ibu harus berada antara 10 sampai 60 tahun.';
  }

  if (!form.location) {
    errors.location = 'Lokasi pasien wajib dipilih.';
  } else if (!isPatientLocation(form.location)) {
    errors.location = 'Lokasi pasien tidak valid.';
  }

  if (!address) {
    errors.address = 'Alamat pasien wajib diisi.';
  } else if (address.length < 5) {
    errors.address = 'Alamat pasien terlalu pendek.';
  }

  if (!phoneNumber) {
    errors.phoneNumber = 'Nomor telepon wajib diisi.';
  } else if (!PHONE_PATTERN.test(phoneNumber)) {
    errors.phoneNumber = 'Format nomor telepon tidak valid.';
  }

  return errors;
}
