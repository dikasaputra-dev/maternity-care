import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Badge, Card } from '@/components/ui/surface';
import { getPatientDetail } from '@/features/patients/api/patient.api';
import { formatDate, getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { Patient } from '@/features/patients/types/patient.types';
import { createScreening } from '@/features/screenings/api/screening.api';
import {
  DANGER_SIGN_KEYS,
  DANGER_SIGN_LABELS,
  MEDICAL_HISTORY_KEYS,
  MEDICAL_HISTORY_LABELS,
  SCREENING_RISK_STATUS_LABELS,
} from '@/features/screenings/constants/screening-options';
import {
  hasScreeningCreateErrors,
  INITIAL_SCREENING_CREATE_FORM_VALUES,
  mapScreeningCreateFormToPayload,
  validateScreeningCreateForm,
  type ScreeningCreateFieldErrors,
  type ScreeningCreateFormValues,
} from '@/features/screenings/lib/screening-create-validation';
import type {
  ScreeningDangerSigns,
  ScreeningMedicalHistory,
  ScreeningRiskStatus,
} from '@/features/screenings/types/screening.types';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memproses data skrining.';
}

function parsePatientId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function mapLaravelFieldErrors(error: ApiError): ScreeningCreateFieldErrors {
  const errors: ScreeningCreateFieldErrors = {};
  const validationErrors = error.errors ?? error.validationErrors;

  if (validationErrors.risk_status?.[0]) {
    errors.riskStatus = validationErrors.risk_status[0];
  }

  if (validationErrors.gestational_age_weeks?.[0]) {
    errors.gestationalAgeWeeks = validationErrors.gestational_age_weeks[0];
  }

  if (validationErrors.gravida?.[0]) {
    errors.gravida = validationErrors.gravida[0];
  }

  if (validationErrors.para?.[0]) {
    errors.para = validationErrors.para[0];
  }

  if (validationErrors.abortus?.[0]) {
    errors.abortus = validationErrors.abortus[0];
  }

  if (validationErrors.systolic_bp?.[0]) {
    errors.systolicBp = validationErrors.systolic_bp[0];
  }

  if (validationErrors.diastolic_bp?.[0]) {
    errors.diastolicBp = validationErrors.diastolic_bp[0];
  }

  if (validationErrors.estimated_fetal_weight_grams?.[0]) {
    errors.estimatedFetalWeightGrams = validationErrors.estimated_fetal_weight_grams[0];
  }

  if (validationErrors.notes?.[0]) {
    errors.notes = validationErrors.notes[0];
  }

  return errors;
}

export function PatientScreeningCreatePage() {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = parsePatientId(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<ScreeningCreateFormValues>(INITIAL_SCREENING_CREATE_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ScreeningCreateFieldErrors>({});
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPatient() {
      if (!patientId) {
        setIsLoadingPatient(false);
        setIsNotFound(true);

        return;
      }

      setIsLoadingPatient(true);
      setIsNotFound(false);
      setPageError(null);

      try {
        const result = await getPatientDetail(patientId);

        if (!isActive) {
          return;
        }

        setPatient(result);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setPatient(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true);
        } else {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingPatient(false);
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

  function updateField<Key extends keyof ScreeningCreateFormValues>(
    field: Key,
    value: ScreeningCreateFormValues[Key],
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

  function handleRiskStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    updateField('riskStatus', event.target.value as ScreeningRiskStatus | '');
  }

  function handleInputChange(
    field: keyof Pick<
      ScreeningCreateFormValues,
      | 'gestationalAgeWeeks'
      | 'gravida'
      | 'para'
      | 'abortus'
      | 'systolicBp'
      | 'diastolicBp'
      | 'estimatedFetalWeightGrams'
    >,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    };
  }

  function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    updateField('notes', event.target.value);
  }

  function updateMedicalHistory(field: keyof ScreeningMedicalHistory, checked: boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      medicalHistory: {
        ...currentForm.medicalHistory,
        [field]: checked,
      },
    }));

    setFormError(null);
  }

  function updateDangerSign(field: keyof ScreeningDangerSigns, checked: boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      dangerSigns: {
        ...currentForm.dangerSigns,
        [field]: checked,
      },
    }));

    setFormError(null);
  }

  async function submitScreening() {
    if (!patientId) {
      return;
    }

    const validationErrors = validateScreeningCreateForm(form);

    if (hasScreeningCreateErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data skrining yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createScreening(mapScreeningCreateFormToPayload(patientId, form));

      void navigate(getPatientDetailPath(result.screening.patient_id), {
        replace: true,
        state: {
          flashMessage: result.message || 'Data skrining berhasil ditambahkan.',
        },
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 422) {
        setFieldErrors(mapLaravelFieldErrors(error));
        setFormError('Periksa kembali data skrining yang wajib diisi.');
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void submitScreening();
  }

  if (isLoadingPatient) {
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

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Tambah Skrining</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Skrining awal pasien
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Isi data skrining awal pasien. Status risiko disimpan sebagai data skrining, bukan
            sebagai field utama pasien.
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pasien</p>

            <h3 className="mt-1 text-lg font-semibold text-slate-950">{patient.name}</h3>

            <p className="mt-1 text-sm text-slate-500">
              {patient.medical_record_number} · Lahir {formatDate(patient.date_of_birth)}
            </p>
          </div>

          <Badge tone="neutral">Identitas dari backend</Badge>
        </div>
      </Card>

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

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Status risiko</h3>

              <p className="mt-1 text-sm text-slate-500">
                Pilih kesimpulan risiko dari hasil pengkajian.
              </p>
            </div>

            <div>
              <label htmlFor="risk-status" className="text-sm font-semibold text-slate-700">
                Status risiko
              </label>

              <select
                id="risk-status"
                value={form.riskStatus}
                onChange={handleRiskStatusChange}
                disabled={isSubmitting}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Pilih status risiko</option>

                {Object.entries(SCREENING_RISK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {fieldErrors.riskStatus ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.riskStatus}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                Data obstetri dan pemeriksaan
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Field ini boleh dikosongkan jika belum tersedia.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                type="number"
                label="Usia kehamilan (minggu)"
                value={form.gestationalAgeWeeks}
                onChange={handleInputChange('gestationalAgeWeeks')}
                error={fieldErrors.gestationalAgeWeeks}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Gravida"
                value={form.gravida}
                onChange={handleInputChange('gravida')}
                error={fieldErrors.gravida}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Para"
                value={form.para}
                onChange={handleInputChange('para')}
                error={fieldErrors.para}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Abortus"
                value={form.abortus}
                onChange={handleInputChange('abortus')}
                error={fieldErrors.abortus}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Tekanan darah sistolik"
                value={form.systolicBp}
                onChange={handleInputChange('systolicBp')}
                error={fieldErrors.systolicBp}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Tekanan darah diastolik"
                value={form.diastolicBp}
                onChange={handleInputChange('diastolicBp')}
                error={fieldErrors.diastolicBp}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Taksiran berat janin (gram)"
                value={form.estimatedFetalWeightGrams}
                onChange={handleInputChange('estimatedFetalWeightGrams')}
                error={fieldErrors.estimatedFetalWeightGrams}
                disabled={isSubmitting}
              />
            </div>
          </section>

          <section className="grid gap-6 border-t border-slate-100 pt-6 lg:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Riwayat penyakit</h3>

              <div className="mt-4 space-y-3">
                {MEDICAL_HISTORY_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.medicalHistory[key]}
                      disabled={isSubmitting}
                      onChange={(event) => updateMedicalHistory(key, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    {MEDICAL_HISTORY_LABELS[key]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-950">Tanda bahaya</h3>

              <div className="mt-4 space-y-3">
                {DANGER_SIGN_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.dangerSigns[key]}
                      disabled={isSubmitting}
                      onChange={(event) => updateDangerSign(key, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    {DANGER_SIGN_LABELS[key]}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <label htmlFor="screening-notes" className="text-sm font-semibold text-slate-700">
              Catatan
            </label>

            <textarea
              id="screening-notes"
              value={form.notes}
              onChange={handleNotesChange}
              disabled={isSubmitting}
              rows={4}
              placeholder="Opsional, contoh: Skrining awal pasien."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />

            {fieldErrors.notes ? <p className="text-sm text-red-600">{fieldErrors.notes}</p> : null}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleBack}>
              Batal
            </Button>

            <Button
              type="submit"
              isLoading={isSubmitting}
              leadingIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Simpan Skrining
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
