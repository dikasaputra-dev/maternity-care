import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { createPatient } from '@/features/patients/api/patient.api';
import { PatientForm } from '@/features/patients/components/patient-form';
import {
  hasPatientFormErrors,
  INITIAL_PATIENT_FORM_VALUES,
  mapLaravelPatientFieldErrors,
  mapPatientFormToPayload,
  validatePatientForm,
  type PatientFormFieldErrors,
  type PatientFormValues,
} from '@/features/patients/lib/patient-form-validation';
import { getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { PatientDetailRouteState } from '@/features/patients/types/patient-route-state.types';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal menyimpan data pasien.';
}

export function PatientCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientFormValues>(INITIAL_PATIENT_FORM_VALUES);

  const [fieldErrors, setFieldErrors] = useState<PatientFormFieldErrors>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBack() {
    void navigate(APP_PATHS.PATIENTS);
  }

  function updateField<Key extends keyof PatientFormValues>(
    field: Key,
    value: PatientFormValues[Key],
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

  async function submitPatient() {
    const validationErrors = validatePatientForm(form);

    if (hasPatientFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data pasien yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createPatient(mapPatientFormToPayload(form));

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
        <PatientForm
          values={form}
          errors={fieldErrors}
          formError={formError}
          isSubmitting={isSubmitting}
          submitLabel="Simpan Pasien"
          submitIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
          onCancel={handleBack}
          onChange={updateField}
          onSubmit={handleSubmit}
        />
      </Card>
    </div>
  );
}
