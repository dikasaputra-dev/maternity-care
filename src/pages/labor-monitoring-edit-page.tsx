import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import {
  getLaborMonitoringDetail,
  updateLaborMonitoring,
} from '@/features/labor-monitorings/api/labor-monitoring.api';
import {
  AMNIOTIC_FLUID_COLOR_OPTIONS,
  CONTRACTION_INTENSITY_OPTIONS,
  FETAL_HEAD_DESCENT_OPTIONS,
  FETAL_MOVEMENT_OPTIONS,
  MEMBRANE_STATUS_OPTIONS,
  URINE_ACETONE_OPTIONS,
  URINE_PROTEIN_OPTIONS,
} from '@/features/labor-monitorings/constants/labor-monitoring-options';
import {
  DEFAULT_LABOR_MONITORING_FORM_STATE,
  mapLaborMonitoringToFormState,
  type LaborMonitoringCreateFormState,
  validateLaborMonitoringCreateForm,
} from '@/features/labor-monitorings/lib/labor-monitoring-create-validation';
import {
  getLaborMonitoringErrorMessage,
  mapLaborMonitoringFieldErrors,
} from '@/features/labor-monitorings/lib/labor-monitoring-error';
import type {
  LaborMonitoring,
  LaborMonitoringFieldErrors,
} from '@/features/labor-monitorings/types/labor-monitoring.types';

function parseLaborMonitoringId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
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

function Field({
  children,
  error,
  id,
  label,
}: {
  id: keyof LaborMonitoringCreateFormState;
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

export function LaborMonitoringEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const laborMonitoringId = parseLaborMonitoringId(params.laborMonitoringId);

  const [monitoring, setMonitoring] = useState<LaborMonitoring | null>(null);
  const [formState, setFormState] = useState<LaborMonitoringCreateFormState>(
    DEFAULT_LABOR_MONITORING_FORM_STATE,
  );
  const [fieldErrors, setFieldErrors] = useState<LaborMonitoringFieldErrors>({});
  const [isLoading, setIsLoading] = useState(laborMonitoringId !== null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isMembraneRuptured = formState.membrane_status === 'ruptured';

  useEffect(() => {
    if (!laborMonitoringId) {
      return;
    }

    let isActive = true;

    getLaborMonitoringDetail(laborMonitoringId)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setMonitoring(response);
        setFormState(mapLaborMonitoringToFormState(response));
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setMonitoring(null);
        setErrorMessage(getLaborMonitoringErrorMessage(error));
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [laborMonitoringId]);

  function handleBack() {
    if (monitoring?.id) {
      void navigate(`/labor-monitorings/${monitoring.id}`);
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

    void submitUpdate();
  }

  async function submitUpdate() {
    if (!laborMonitoringId) {
      setErrorMessage('ID Pemantauan Persalinan tidak valid.');
      return;
    }

    const validationResult = validateLaborMonitoringCreateForm(formState);

    setFieldErrors(validationResult.fieldErrors);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validationResult.payload) {
      setErrorMessage('Periksa kembali data Pemantauan Persalinan yang wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateLaborMonitoring(laborMonitoringId, validationResult.payload);

      setMonitoring(result.laborMonitoring);
      setFormState(mapLaborMonitoringToFormState(result.laborMonitoring));
      setFieldErrors({});
      setSuccessMessage('Pemantauan Persalinan berhasil diperbarui.');
    } catch (error: unknown) {
      setFieldErrors(mapLaborMonitoringFieldErrors(error));
      setErrorMessage(getLaborMonitoringErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!laborMonitoringId) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Data tidak valid</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          ID Pemantauan Persalinan tidak ditemukan pada URL.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat data Pemantauan Persalinan...</p>
      </Card>
    );
  }

  if (!monitoring) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Data tidak ditemukan</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Data Pemantauan Persalinan tidak tersedia atau sudah dihapus.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Pemantauan Persalinan</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Edit Pemantauan Persalinan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Perubahan hanya dapat dilakukan oleh admin.
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

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
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
            <Field id="systolic_bp" label="Sistolik" error={fieldErrors.systolic_bp}>
              <input
                id="systolic_bp"
                name="systolic_bp"
                value={formState.systolic_bp}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.systolic_bp))}
              />
            </Field>

            <Field id="diastolic_bp" label="Diastolik" error={fieldErrors.diastolic_bp}>
              <input
                id="diastolic_bp"
                name="diastolic_bp"
                value={formState.diastolic_bp}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.diastolic_bp))}
              />
            </Field>

            <Field id="pulse_rate" label="Nadi" error={fieldErrors.pulse_rate}>
              <input
                id="pulse_rate"
                name="pulse_rate"
                value={formState.pulse_rate}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.pulse_rate))}
              />
            </Field>

            <Field
              id="respiratory_rate"
              label="Frekuensi Napas"
              error={fieldErrors.respiratory_rate}
            >
              <input
                id="respiratory_rate"
                name="respiratory_rate"
                value={formState.respiratory_rate}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.respiratory_rate))}
              />
            </Field>

            <Field id="temperature_c" label="Suhu" error={fieldErrors.temperature_c}>
              <input
                id="temperature_c"
                name="temperature_c"
                value={formState.temperature_c}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.temperature_c))}
              />
            </Field>

            <Field id="oxygen_saturation" label="SpO₂" error={fieldErrors.oxygen_saturation}>
              <input
                id="oxygen_saturation"
                name="oxygen_saturation"
                value={formState.oxygen_saturation}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.oxygen_saturation))}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Kondisi Janin</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              id="fetal_heart_rate"
              label="Denyut Jantung Janin"
              error={fieldErrors.fetal_heart_rate}
            >
              <input
                id="fetal_heart_rate"
                name="fetal_heart_rate"
                value={formState.fetal_heart_rate}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.fetal_heart_rate))}
              />
            </Field>

            <Field id="fetal_movement" label="Gerak Janin" error={fieldErrors.fetal_movement}>
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
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Kontraksi</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field
              id="contraction_frequency_per_10_minutes"
              label="Frekuensi per 10 Menit"
              error={fieldErrors.contraction_frequency_per_10_minutes}
            >
              <input
                id="contraction_frequency_per_10_minutes"
                name="contraction_frequency_per_10_minutes"
                value={formState.contraction_frequency_per_10_minutes}
                onChange={handleInputChange}
                className={inputClassName(
                  Boolean(fieldErrors.contraction_frequency_per_10_minutes),
                )}
              />
            </Field>

            <Field
              id="contraction_duration_seconds"
              label="Durasi Kontraksi"
              error={fieldErrors.contraction_duration_seconds}
            >
              <input
                id="contraction_duration_seconds"
                name="contraction_duration_seconds"
                value={formState.contraction_duration_seconds}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.contraction_duration_seconds))}
              />
            </Field>

            <Field
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
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Pembukaan dan Penurunan Kepala</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              id="cervical_dilation_cm"
              label="Pembukaan Serviks"
              error={fieldErrors.cervical_dilation_cm}
            >
              <input
                id="cervical_dilation_cm"
                name="cervical_dilation_cm"
                value={formState.cervical_dilation_cm}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.cervical_dilation_cm))}
              />
            </Field>

            <Field
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
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Ketuban</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field id="membrane_status" label="Status Ketuban" error={fieldErrors.membrane_status}>
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
            </Field>

            {isMembraneRuptured ? (
              <>
                <Field
                  id="membrane_rupture_at"
                  label="Waktu Pecah Ketuban"
                  error={fieldErrors.membrane_rupture_at}
                >
                  <input
                    id="membrane_rupture_at"
                    name="membrane_rupture_at"
                    type="datetime-local"
                    value={formState.membrane_rupture_at}
                    onChange={handleInputChange}
                    className={inputClassName(Boolean(fieldErrors.membrane_rupture_at))}
                  />
                </Field>

                <Field
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
                </Field>
              </>
            ) : null}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Urine</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field id="urine_volume_ml" label="Volume Urine" error={fieldErrors.urine_volume_ml}>
              <input
                id="urine_volume_ml"
                name="urine_volume_ml"
                value={formState.urine_volume_ml}
                onChange={handleInputChange}
                className={inputClassName(Boolean(fieldErrors.urine_volume_ml))}
              />
            </Field>

            <Field id="urine_protein" label="Protein Urine" error={fieldErrors.urine_protein}>
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
            </Field>

            <Field id="urine_acetone" label="Aseton Urine" error={fieldErrors.urine_acetone}>
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
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Catatan</h3>

          <div className="mt-5">
            <Field id="notes" label="Catatan Pemantauan" error={fieldErrors.notes}>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formState.notes}
                onChange={handleTextAreaChange}
                className={[
                  inputClassName(Boolean(fieldErrors.notes)),
                  'resize-none py-3 leading-6',
                ].join(' ')}
              />
            </Field>
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
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
