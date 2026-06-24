import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Badge, Card } from '@/components/ui/surface';
import { getPatientDetail, updatePatient } from '@/features/patients/api/patient.api';
import { PATIENT_LOCATION_OPTIONS } from '@/features/patients/constants/patient-options';
import {
  hasPatientEditErrors,
  mapPatientEditFormToPayload,
  mapPatientToEditForm,
  validatePatientEditForm,
  type PatientEditFieldErrors,
  type PatientEditFormValues,
} from '@/features/patients/lib/patient-edit-validation';
import { formatDateTime, getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { PatientLocation, Patient } from '@/features/patients/types/patient.types';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memproses data pasien.';
}

function parsePatientId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function mapLaravelFieldErrors(error: ApiError): PatientEditFieldErrors {
  const errors: PatientEditFieldErrors = {};

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

  return errors;
}

export function PatientEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = parsePatientId(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientEditFormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PatientEditFieldErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPatient() {
      if (!patientId) {
        setIsLoading(false);
        setIsNotFound(true);

        return;
      }

      setIsLoading(true);
      setIsNotFound(false);
      setPageError(null);

      try {
        const result = await getPatientDetail(patientId);

        if (!isActive) {
          return;
        }

        setPatient(result);
        setForm(mapPatientToEditForm(result));
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true);
        } else {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPatient();

    return () => {
      isActive = false;
    };
  }, [patientId]);

  function handleBack() {
    if (patientId) {
      void navigate(getPatientDetailPath(patientId));
      return;
    }

    void navigate(APP_PATHS.PATIENTS);
  }

  function updateField<Key extends keyof PatientEditFormValues>(
    field: Key,
    value: PatientEditFormValues[Key],
  ) {
    setForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        [field]: value,
      };
    });

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

  function handlePhoneNumberChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('phoneNumber', event.target.value);
  }

  function handleAddressChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('address', event.target.value);
  }

  function handleLocationChange(event: ChangeEvent<HTMLSelectElement>) {
    updateField('location', event.target.value as PatientLocation | '');
  }

  async function submitPatient() {
    if (!patientId || !form) {
      return;
    }

    const validationErrors = validatePatientEditForm(form);

    if (hasPatientEditErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data pasien yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await updatePatient(patientId, mapPatientEditFormToPayload(form));

      void navigate(getPatientDetailPath(result.patient.id), {
        replace: true,
        state: {
          flashMessage: result.message || 'Data pasien berhasil diperbarui.',
        },
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

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat data pasien...</p>
      </Card>
    );
  }

  if (isNotFound) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Pasien tidak ditemukan</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Data pasien tidak ditemukan atau sudah tidak tersedia.
        </p>

        <Button
          className="mt-5"
          variant="secondary"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </Card>
    );
  }

  if (pageError) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Gagal memuat data pasien</h2>

        <p className="mt-2 text-sm leading-6 text-red-600">{pageError}</p>

        <Button
          className="mt-5"
          variant="secondary"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </Card>
    );
  }

  if (!patient || !form) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Edit Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Perbarui data identitas pasien. Nomor rekam medis tetap readonly dan dikelola oleh
            backend.
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
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Nomor Rekam Medis</p>

            <p className="mt-1 text-base font-semibold text-slate-950">
              {patient.medical_record_number}
            </p>
          </div>

          <Badge tone="neutral">Terakhir diperbarui: {formatDateTime(patient.updated_at)}</Badge>
        </div>

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
              placeholder="Contoh: Jl. Sukamaju No. 12, Bandung"
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
