import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { getPatientDetail, updatePatient } from '@/features/patients/api/patient.api';
import { PatientForm } from '@/features/patients/components/patient-form';
import {
  hasPatientFormErrors,
  mapLaravelPatientFieldErrors,
  mapPatientFormToPayload,
  mapPatientToFormValues,
  validatePatientForm,
  type PatientFormFieldErrors,
  type PatientFormValues,
} from '@/features/patients/lib/patient-form-validation';
import { formatDateTime, getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { Patient } from '@/features/patients/types/patient.types';

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

export function PatientEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = parsePatientId(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientFormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PatientFormFieldErrors>({});
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
        setForm(mapPatientToFormValues(result));
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

  function updateField<Key extends keyof PatientFormValues>(
    field: Key,
    value: PatientFormValues[Key],
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

  async function submitPatient() {
    if (!patientId || !form) {
      return;
    }

    const validationErrors = validatePatientForm(form);

    if (hasPatientFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data pasien yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await updatePatient(patientId, mapPatientFormToPayload(form));

      void navigate(getPatientDetailPath(result.patient.id), {
        replace: true,
        state: {
          flashMessage: result.message || 'Data pasien berhasil diperbarui.',
        },
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 422) {
        const backendErrors = mapLaravelPatientFieldErrors(error);

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

        <PatientForm
          values={form}
          errors={fieldErrors}
          formError={formError}
          isSubmitting={isSubmitting}
          submitLabel="Simpan Perubahan"
          submitIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
          onCancel={handleBack}
          onChange={updateField}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  );
}
