import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/surface';
import { createPatient } from '@/features/patients/api/patient.api';
import {
  PATIENT_EDUCATION_OPTIONS,
  PATIENT_LOCATION_OPTIONS,
  PATIENT_RELIGION_OPTIONS,
} from '@/features/patients/constants/patient-options';
import {
  hasPatientCreateErrors,
  INITIAL_PATIENT_CREATE_FORM_VALUES,
  mapPatientCreateFormToPayload,
  validatePatientCreateForm,
  type PatientCreateFieldErrors,
  type PatientCreateFormValues,
} from '@/features/patients/lib/patient-create-validation';
import { getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { PatientDetailRouteState } from '@/features/patients/types/patient-route-state.types';
import type {
  PatientEducation,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal menyimpan data pasien.';
}

function mapLaravelFieldErrors(error: ApiError): PatientCreateFieldErrors {
  const errors: PatientCreateFieldErrors = {};

  const validationErrors = error.errors ?? error.validationErrors;

  if (validationErrors.name?.[0]) {
    errors.name = validationErrors.name[0];
  }

  if (validationErrors.date_of_birth?.[0]) {
    errors.dateOfBirth = validationErrors.date_of_birth[0];
  }

  if (validationErrors.phone_number?.[0]) {
    errors.phoneNumber = validationErrors.phone_number[0];
  }

  if (validationErrors.address?.[0]) {
    errors.address = validationErrors.address[0];
  }

  if (validationErrors.location?.[0]) {
    errors.location = validationErrors.location[0];
  }

  if (validationErrors.religion?.[0]) {
    errors.religion = validationErrors.religion[0];
  }

  if (validationErrors.education?.[0]) {
    errors.education = validationErrors.education[0];
  }

  if (validationErrors.occupation?.[0]) {
    errors.occupation = validationErrors.occupation[0];
  }

  if (validationErrors.ethnicity?.[0]) {
    errors.ethnicity = validationErrors.ethnicity[0];
  }

  return errors;
}

export function PatientCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientCreateFormValues>(INITIAL_PATIENT_CREATE_FORM_VALUES);

  const [fieldErrors, setFieldErrors] = useState<PatientCreateFieldErrors>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBack() {
    void navigate(APP_PATHS.PATIENTS);
  }

  function updateField<Key extends keyof PatientCreateFormValues>(
    field: Key,
    value: PatientCreateFormValues[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setFormError(null);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('name', event.target.value);
  }

  function handleDateOfBirthChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('dateOfBirth', event.target.value);
  }

  function handleLocationChange(event: ChangeEvent<HTMLSelectElement>) {
    updateField('location', event.target.value as PatientLocation | '');
  }

  function handlePhoneNumberChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('phoneNumber', event.target.value);
  }

  function handleAddressChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('address', event.target.value);
  }

  function handleReligionChange(event: ChangeEvent<HTMLSelectElement>) {
    updateField('religion', event.target.value as PatientReligion | '');
  }

  function handleEducationChange(event: ChangeEvent<HTMLSelectElement>) {
    updateField('education', event.target.value as PatientEducation | '');
  }

  function handleOccupationChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('occupation', event.target.value);
  }

  function handleEthnicityChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('ethnicity', event.target.value);
  }

  async function submitPatient() {
    const validationErrors = validatePatientCreateForm(form);

    if (hasPatientCreateErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data pasien yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createPatient(mapPatientCreateFormToPayload(form));

      const state: PatientDetailRouteState = {
        fromCreate: true,
        flashMessage: result.message || 'Data pasien berhasil disimpan.',
      };

      void navigate(getPatientDetailPath(result.patient.id), {
        replace: true,
        state,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 422) {
        const backendErrors = mapLaravelFieldErrors(error);

        setFieldErrors(backendErrors);
        setFormError('Periksa kembali data pasien yang wajib diisi.');
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void submitPatient();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Tambah Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Form tambah pasien
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Masukkan identitas dasar pasien. Nomor rekam medis dan pembuat data akan ditentukan
            otomatis oleh backend.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </section>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nama pasien"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Contoh: Rina Nuraini"
              error={fieldErrors.name}
              disabled={isSubmitting}
            />

            <Input
              type="date"
              label="Tanggal lahir"
              value={form.dateOfBirth}
              onChange={handleDateOfBirthChange}
              error={fieldErrors.dateOfBirth}
              disabled={isSubmitting}
            />

            <div>
              <label htmlFor="patient-religion" className="text-sm font-semibold text-slate-700">
                Agama
              </label>

              <select
                id="patient-religion"
                value={form.religion}
                onChange={handleReligionChange}
                disabled={isSubmitting}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Pilih agama</option>

                {PATIENT_RELIGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {fieldErrors.religion ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.religion}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="patient-education" className="text-sm font-semibold text-slate-700">
                Pendidikan
              </label>

              <select
                id="patient-education"
                value={form.education}
                onChange={handleEducationChange}
                disabled={isSubmitting}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Pilih pendidikan</option>

                {PATIENT_EDUCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {fieldErrors.education ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.education}</p>
              ) : null}
            </div>

            <Input
              label="Pekerjaan"
              value={form.occupation}
              onChange={handleOccupationChange}
              placeholder="Contoh: Ibu Rumah Tangga"
              error={fieldErrors.occupation}
              disabled={isSubmitting}
            />

            <Input
              label="Ras/Suku"
              value={form.ethnicity}
              onChange={handleEthnicityChange}
              placeholder="Contoh: Sunda"
              error={fieldErrors.ethnicity}
              disabled={isSubmitting}
            />

            <Input
              label="Nomor telepon"
              value={form.phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Opsional, contoh: 081234567890"
              error={fieldErrors.phoneNumber}
              disabled={isSubmitting}
            />

            <Input
              label="Alamat tempat tinggal"
              value={form.address}
              onChange={handleAddressChange}
              placeholder="Contoh: Jl. Melati No. 12, Bandung"
              error={fieldErrors.address}
              disabled={isSubmitting}
            />

            <div className="md:col-span-2">
              <label htmlFor="patient-location" className="text-sm font-semibold text-slate-700">
                Lokasi pelayanan
              </label>

              <select
                id="patient-location"
                value={form.location}
                onChange={handleLocationChange}
                disabled={isSubmitting}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Pilih lokasi pelayanan</option>

                {PATIENT_LOCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {fieldErrors.location ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.location}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleBack}>
              Batal
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
              leadingIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Simpan Pasien
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
