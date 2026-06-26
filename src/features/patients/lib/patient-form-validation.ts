import {
  PATIENT_EDUCATION_OPTIONS,
  PATIENT_LOCATION_OPTIONS,
  PATIENT_RELIGION_OPTIONS,
} from '@/features/patients/constants/patient-options';
import type {
  CreatePatientPayload,
  Patient,
  PatientEducation,
  PatientLocation,
  PatientReligion,
  UpdatePatientPayload,
} from '@/features/patients/types/patient.types';

export interface PatientFormValues {
  name: string;
  dateOfBirth: string;
  religion: PatientReligion | '';
  education: PatientEducation | '';
  occupation: string;
  ethnicity: string;
  phoneNumber: string;
  address: string;
  location: PatientLocation | '';
}

export type PatientFormFieldErrors = Partial<Record<keyof PatientFormValues, string>>;

export const INITIAL_PATIENT_FORM_VALUES: PatientFormValues = {
  name: '',
  dateOfBirth: '',
  religion: '',
  education: '',
  occupation: '',
  ethnicity: '',
  phoneNumber: '',
  address: '',
  location: '',
};

const PATIENT_RELIGIONS = PATIENT_RELIGION_OPTIONS.map((option) => option.value);
const PATIENT_EDUCATIONS = PATIENT_EDUCATION_OPTIONS.map((option) => option.value);
const PATIENT_LOCATIONS = PATIENT_LOCATION_OPTIONS.map((option) => option.value);

function isPatientReligion(value: string): value is PatientReligion {
  return PATIENT_RELIGIONS.includes(value as PatientReligion);
}

function isPatientEducation(value: string): value is PatientEducation {
  return PATIENT_EDUCATIONS.includes(value as PatientEducation);
}

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

export function mapPatientToFormValues(patient: Patient): PatientFormValues {
  return {
    name: patient.name,
    dateOfBirth: patient.date_of_birth,
    religion: patient.religion,
    education: patient.education,
    occupation: patient.occupation,
    ethnicity: patient.ethnicity,
    phoneNumber: patient.phone_number ?? '',
    address: patient.address,
    location: patient.location,
  };
}

export function validatePatientForm(form: PatientFormValues): PatientFormFieldErrors {
  const errors: PatientFormFieldErrors = {};

  const name = form.name.trim();
  const occupation = form.occupation.trim();
  const ethnicity = form.ethnicity.trim();
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

  if (!form.religion) {
    errors.religion = 'Agama wajib dipilih.';
  } else if (!isPatientReligion(form.religion)) {
    errors.religion = 'Agama tidak valid.';
  }

  if (!form.education) {
    errors.education = 'Pendidikan wajib dipilih.';
  } else if (!isPatientEducation(form.education)) {
    errors.education = 'Pendidikan tidak valid.';
  }

  if (!occupation) {
    errors.occupation = 'Pekerjaan wajib diisi.';
  }

  if (!ethnicity) {
    errors.ethnicity = 'Ras/Suku wajib diisi.';
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

export function hasPatientFormErrors(errors: PatientFormFieldErrors) {
  return Object.keys(errors).length > 0;
}

export function mapLaravelPatientFieldErrors(error: {
  errors?: Record<string, string[]>;
  validationErrors: Record<string, string[]>;
}): PatientFormFieldErrors {
  const errors: PatientFormFieldErrors = {};
  const validationErrors = error.errors ?? error.validationErrors;

  const fieldMap = {
    name: 'name',
    date_of_birth: 'dateOfBirth',
    phone_number: 'phoneNumber',
    address: 'address',
    location: 'location',
    religion: 'religion',
    education: 'education',
    occupation: 'occupation',
    ethnicity: 'ethnicity',
  } as const;

  for (const [backendField, formField] of Object.entries(fieldMap)) {
    const message = validationErrors[backendField]?.[0];

    if (message) {
      errors[formField] = message;
    }
  }

  return errors;
}

export function mapPatientFormToPayload(
  form: PatientFormValues,
): CreatePatientPayload & UpdatePatientPayload {
  if (!isPatientReligion(form.religion)) {
    throw new Error('Agama tidak valid.');
  }

  if (!isPatientEducation(form.education)) {
    throw new Error('Pendidikan tidak valid.');
  }

  if (!isPatientLocation(form.location)) {
    throw new Error('Lokasi pelayanan tidak valid.');
  }

  const phoneNumber = form.phoneNumber.trim();

  return {
    name: form.name.trim(),
    date_of_birth: form.dateOfBirth,
    religion: form.religion,
    education: form.education,
    occupation: form.occupation.trim(),
    ethnicity: form.ethnicity.trim(),
    phone_number: phoneNumber || null,
    address: form.address.trim(),
    location: form.location,
  };
}
