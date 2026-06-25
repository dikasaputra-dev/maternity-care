import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { getPatientInitialScreening } from '@/features/initial-screenings/api/initial-screening.api';
import { createPatientLaborMonitoring } from '@/features/labor-monitorings/api/labor-monitoring.api';
import {
  AMNIOTIC_FLUID_COLOR_OPTIONS,
  CONTRACTION_INTENSITY_OPTIONS,
  FETAL_HEAD_DESCENT_OPTIONS,
  FETAL_MOVEMENT_OPTIONS,
  LABOR_MONITORING_RISK_STATUS_LABELS,
  MEMBRANE_STATUS_OPTIONS,
  URINE_ACETONE_OPTIONS,
  URINE_PROTEIN_OPTIONS,
} from '@/features/labor-monitorings/constants/labor-monitoring-options';
import {
  DEFAULT_LABOR_MONITORING_FORM_STATE,
  type LaborMonitoringCreateFormState,
  validateLaborMonitoringCreateForm,
} from '@/features/labor-monitorings/lib/labor-monitoring-create-validation';
import {
  getLaborMonitoringErrorMessage,
  mapLaborMonitoringFieldErrors,
} from '@/features/labor-monitorings/lib/labor-monitoring-error';
import type {
  CreateLaborMonitoringResult,
  LaborMonitoringFieldErrors,
} from '@/features/labor-monitorings/types/labor-monitoring.types';
import { formatDateTime } from '@/features/patients/lib/patient-format';

function parsePatientId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function FormField({
  error,
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div className="mt-2">{children}</div>

      {error ? <p className="mt-1 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function inputClassName(hasError?: boolean) {
  return [
    'min-h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
  ].join(' ');
}

function selectClassName(hasError?: boolean) {
  return [
    'min-h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-4',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
  ].join(' ');
}

function TextInput({
  error,
  id,
  inputMode,
  label,
  name,
  onChange,
  placeholder,
  step,
  type = 'text',
  value,
}: {
  id: keyof LaborMonitoringCreateFormState;
  name: keyof LaborMonitoringCreateFormState;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  type?: string;
  step?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <FormField id={id} label={label} error={error}>
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName(Boolean(error))}
      />
    </FormField>
  );
}

function TextAreaField({
  error,
  id,
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  id: keyof LaborMonitoringCreateFormState;
  name: keyof LaborMonitoringCreateFormState;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <FormField id={id} label={label} error={error}>
      <textarea
        id={id}
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[inputClassName(Boolean(error)), 'resize-none py-3 leading-6'].join(' ')}
      />
    </FormField>
  );
}

function ResultBadge({
  riskStatus,
}: {
  riskStatus: CreateLaborMonitoringResult['laborMonitoring']['risk_status'];
}) {
  if (riskStatus === 'high') {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        {LABOR_MONITORING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  if (riskStatus === 'medium') {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {LABOR_MONITORING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {LABOR_MONITORING_RISK_STATUS_LABELS[riskStatus]}
    </span>
  );
}

export function LaborMonitoringCreatePage() {
  const navigate = useNavigate();
  const params = useParams();
  const patientId = parsePatientId(params.patientId);

  const [formState, setFormState] = useState<LaborMonitoringCreateFormState>(
    DEFAULT_LABOR_MONITORING_FORM_STATE,
  );
  const [fieldErrors, setFieldErrors] = useState<LaborMonitoringFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingPrerequisite, setIsCheckingPrerequisite] = useState(patientId !== null);
  const [isInitialScreeningMissing, setIsInitialScreeningMissing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState<CreateLaborMonitoringResult | null>(null);

  const isMembraneRuptured = formState.membrane_status === 'ruptured';

  useEffect(() => {
    if (!patientId) {
      return;
    }

    let isActive = true;

    getPatientInitialScreening(patientId)
      .then(() => {
        if (!isActive) {
          return;
        }

        setIsInitialScreeningMissing(false);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setIsInitialScreeningMissing(true);
          setErrorMessage(null);
          return;
        }

        setErrorMessage(getLaborMonitoringErrorMessage(error));
      })
      .finally(() => {
        if (isActive) {
          setIsCheckingPrerequisite(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [patientId]);

  function handleBack() {
    if (patientId) {
      void navigate(`/patients/${patientId}`);
      return;
    }

    void navigate(APP_PATHS.PATIENTS);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;

    setFormState((currentState) => {
      if (name === 'membrane_status' && value === 'intact') {
        return {
          ...currentState,
          membrane_status: value,
          membrane_rupture_at: '',
          amniotic_fluid_color: '',
        };
      }

      return {
        ...currentState,
        [name]: value,
      };
    });

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void submitLaborMonitoring();
  }

  async function submitLaborMonitoring() {
    if (!patientId) {
      setErrorMessage('ID pasien tidak valid.');
      return;
    }

    const validationResult = validateLaborMonitoringCreateForm(formState);

    setFieldErrors(validationResult.fieldErrors);
    setErrorMessage(null);
    setCreateResult(null);

    if (!validationResult.payload) {
      setErrorMessage('Periksa kembali data Pemantauan Persalinan yang wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPatientLaborMonitoring(patientId, validationResult.payload);

      setCreateResult(result);
      setFieldErrors({});
      setErrorMessage(null);
    } catch (error: unknown) {
      setFieldErrors(mapLaborMonitoringFieldErrors(error));
      setErrorMessage(getLaborMonitoringErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!patientId) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">Pasien tidak valid</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            ID pasien tidak ditemukan pada URL.
          </p>

          <Button
            className="mt-5"
            variant="secondary"
            leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleBack}
          >
            Kembali
          </Button>
        </div>
      </Card>
    );
  }

  if (isCheckingPrerequisite) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memeriksa status Skrining Awal pasien...</p>
      </Card>
    );
  }

  if (isInitialScreeningMissing) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">Skrining Awal belum selesai</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pemantauan Persalinan baru dapat dibuat setelah Skrining Awal pasien selesai.
          </p>

          <Button
            className="mt-5"
            variant="secondary"
            leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleBack}
          >
            Kembali ke Detail Pasien
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Pemantauan Persalinan</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Tambah Pemantauan Persalinan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Input data pemantauan berkala kondisi ibu, janin, kontraksi, pembukaan, ketuban, urine,
            dan catatan klinis.
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

      {createResult ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Pemantauan berhasil disimpan</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-950">Hasil analisis backend</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dipantau pada {formatDateTime(createResult.laborMonitoring.monitored_at)}
              </p>
            </div>

            <ResultBadge riskStatus={createResult.laborMonitoring.risk_status} />
          </div>

          <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Rekomendasi</p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {createResult.laborMonitoring.recommendation}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Faktor Risiko</p>

            {createResult.laborMonitoring.risk_factors.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-800">
                {createResult.laborMonitoring.risk_factors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Tidak ada faktor risiko bermakna dari data pemantauan.
              </p>
            )}
          </div>
        </Card>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Tanda-tanda Vital</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextInput
              id="systolic_bp"
              name="systolic_bp"
              label="Sistolik"
              value={formState.systolic_bp}
              error={fieldErrors.systolic_bp}
              inputMode="numeric"
              placeholder="120"
              onChange={handleInputChange}
            />

            <TextInput
              id="diastolic_bp"
              name="diastolic_bp"
              label="Diastolik"
              value={formState.diastolic_bp}
              error={fieldErrors.diastolic_bp}
              inputMode="numeric"
              placeholder="80"
              onChange={handleInputChange}
            />

            <TextInput
              id="pulse_rate"
              name="pulse_rate"
              label="Nadi"
              value={formState.pulse_rate}
              error={fieldErrors.pulse_rate}
              inputMode="numeric"
              placeholder="88"
              onChange={handleInputChange}
            />

            <TextInput
              id="respiratory_rate"
              name="respiratory_rate"
              label="Frekuensi Napas"
              value={formState.respiratory_rate}
              error={fieldErrors.respiratory_rate}
              inputMode="numeric"
              placeholder="20"
              onChange={handleInputChange}
            />

            <TextInput
              id="temperature_c"
              name="temperature_c"
              label="Suhu"
              value={formState.temperature_c}
              error={fieldErrors.temperature_c}
              inputMode="decimal"
              placeholder="36.7"
              step="0.1"
              onChange={handleInputChange}
            />

            <TextInput
              id="oxygen_saturation"
              name="oxygen_saturation"
              label="SpO₂"
              value={formState.oxygen_saturation}
              error={fieldErrors.oxygen_saturation}
              inputMode="numeric"
              placeholder="98"
              onChange={handleInputChange}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Kondisi Janin</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput
              id="fetal_heart_rate"
              name="fetal_heart_rate"
              label="Denyut Jantung Janin"
              value={formState.fetal_heart_rate}
              error={fieldErrors.fetal_heart_rate}
              inputMode="numeric"
              placeholder="145"
              onChange={handleInputChange}
            />

            <FormField id="fetal_movement" label="Gerak Janin" error={fieldErrors.fetal_movement}>
              <select
                id="fetal_movement"
                name="fetal_movement"
                value={formState.fetal_movement}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.fetal_movement))}
              >
                {FETAL_MOVEMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Kontraksi</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <TextInput
              id="contraction_frequency_per_10_minutes"
              name="contraction_frequency_per_10_minutes"
              label="Frekuensi per 10 Menit"
              value={formState.contraction_frequency_per_10_minutes}
              error={fieldErrors.contraction_frequency_per_10_minutes}
              inputMode="numeric"
              placeholder="3"
              onChange={handleInputChange}
            />

            <TextInput
              id="contraction_duration_seconds"
              name="contraction_duration_seconds"
              label="Durasi Kontraksi"
              value={formState.contraction_duration_seconds}
              error={fieldErrors.contraction_duration_seconds}
              inputMode="numeric"
              placeholder="45"
              onChange={handleInputChange}
            />

            <FormField
              id="contraction_intensity"
              label="Intensitas Kontraksi"
              error={fieldErrors.contraction_intensity}
            >
              <select
                id="contraction_intensity"
                name="contraction_intensity"
                value={formState.contraction_intensity}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.contraction_intensity))}
              >
                {CONTRACTION_INTENSITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Pembukaan dan Penurunan Kepala</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput
              id="cervical_dilation_cm"
              name="cervical_dilation_cm"
              label="Pembukaan Serviks"
              value={formState.cervical_dilation_cm}
              error={fieldErrors.cervical_dilation_cm}
              inputMode="decimal"
              placeholder="4"
              step="0.5"
              onChange={handleInputChange}
            />

            <FormField
              id="fetal_head_descent"
              label="Penurunan Kepala"
              error={fieldErrors.fetal_head_descent}
            >
              <select
                id="fetal_head_descent"
                name="fetal_head_descent"
                value={formState.fetal_head_descent}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.fetal_head_descent))}
              >
                {FETAL_HEAD_DESCENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Ketuban</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FormField
              id="membrane_status"
              label="Status Ketuban"
              error={fieldErrors.membrane_status}
            >
              <select
                id="membrane_status"
                name="membrane_status"
                value={formState.membrane_status}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.membrane_status))}
              >
                {MEMBRANE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            {isMembraneRuptured ? (
              <>
                <TextInput
                  id="membrane_rupture_at"
                  name="membrane_rupture_at"
                  label="Waktu Pecah Ketuban"
                  type="datetime-local"
                  value={formState.membrane_rupture_at}
                  error={fieldErrors.membrane_rupture_at}
                  onChange={handleInputChange}
                />

                <FormField
                  id="amniotic_fluid_color"
                  label="Warna Ketuban"
                  error={fieldErrors.amniotic_fluid_color}
                >
                  <select
                    id="amniotic_fluid_color"
                    name="amniotic_fluid_color"
                    value={formState.amniotic_fluid_color}
                    onChange={handleSelectChange}
                    className={selectClassName(Boolean(fieldErrors.amniotic_fluid_color))}
                  >
                    <option value="">Pilih warna ketuban</option>

                    {AMNIOTIC_FLUID_COLOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </>
            ) : null}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Urine</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <TextInput
              id="urine_volume_ml"
              name="urine_volume_ml"
              label="Volume Urine"
              value={formState.urine_volume_ml}
              error={fieldErrors.urine_volume_ml}
              inputMode="numeric"
              placeholder="200"
              onChange={handleInputChange}
            />

            <FormField id="urine_protein" label="Protein Urine" error={fieldErrors.urine_protein}>
              <select
                id="urine_protein"
                name="urine_protein"
                value={formState.urine_protein}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.urine_protein))}
              >
                {URINE_PROTEIN_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="urine_acetone" label="Aseton Urine" error={fieldErrors.urine_acetone}>
              <select
                id="urine_acetone"
                name="urine_acetone"
                value={formState.urine_acetone}
                onChange={handleSelectChange}
                className={selectClassName(Boolean(fieldErrors.urine_acetone))}
              >
                {URINE_ACETONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Catatan</h3>

          <div className="mt-5">
            <TextAreaField
              id="notes"
              name="notes"
              label="Catatan Pemantauan"
              value={formState.notes}
              error={fieldErrors.notes}
              placeholder="Pemantauan persalinan berjalan stabil."
              onChange={handleTextAreaChange}
            />
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleBack}>
            Batal
          </Button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            leadingIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
          >
            Simpan Pemantauan
          </Button>
        </div>
      </form>
    </div>
  );
}
