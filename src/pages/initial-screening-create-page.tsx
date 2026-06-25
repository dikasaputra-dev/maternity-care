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
import { createPatientInitialScreening } from '@/features/initial-screenings/api/initial-screening.api';
import {
  COMORBIDITY_KEYS,
  COMORBIDITY_LABELS,
  PREVIOUS_DELIVERY_HISTORY_KEYS,
  PREVIOUS_DELIVERY_HISTORY_LABELS,
  PREVIOUS_PREGNANCY_HISTORY_KEYS,
  PREVIOUS_PREGNANCY_HISTORY_LABELS,
} from '@/features/initial-screenings/constants/initial-screening-options';
import {
  INITIAL_SCREENING_CREATE_FORM_VALUES,
  hasInitialScreeningCreateErrors,
  mapInitialScreeningCreateFormToPayload,
  validateInitialScreeningCreateForm,
  type InitialScreeningCreateFieldErrors,
  type InitialScreeningCreateFormValues,
} from '@/features/initial-screenings/lib/initial-screening-create-validation';
import type {
  InitialScreeningComorbidities,
  PreviousDeliveryHistory,
  PreviousPregnancyHistory,
} from '@/features/initial-screenings/types/initial-screening.types';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memproses Skrining Awal.';
}

function parsePatientId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function mapLaravelFieldErrors(error: ApiError): InitialScreeningCreateFieldErrors {
  const errors: InitialScreeningCreateFieldErrors = {};
  const validationErrors = error.errors ?? error.validationErrors;

  if (validationErrors.height_cm?.[0]) {
    errors.heightCm = validationErrors.height_cm[0];
  }

  if (validationErrors.general_condition?.[0]) {
    errors.generalCondition = validationErrors.general_condition[0];
  }

  if (validationErrors.systolic_bp?.[0]) {
    errors.systolicBp = validationErrors.systolic_bp[0];
  }

  if (validationErrors.diastolic_bp?.[0]) {
    errors.diastolicBp = validationErrors.diastolic_bp[0];
  }

  if (validationErrors.pulse_rate?.[0]) {
    errors.pulseRate = validationErrors.pulse_rate[0];
  }

  if (validationErrors.respiratory_rate?.[0]) {
    errors.respiratoryRate = validationErrors.respiratory_rate[0];
  }

  if (validationErrors.temperature_c?.[0]) {
    errors.temperatureC = validationErrors.temperature_c[0];
  }

  if (validationErrors.oxygen_saturation?.[0]) {
    errors.oxygenSaturation = validationErrors.oxygen_saturation[0];
  }

  if (validationErrors.gravida?.[0]) {
    errors.gravida = validationErrors.gravida[0];
  }

  if (validationErrors.parity?.[0]) {
    errors.parity = validationErrors.parity[0];
  }

  if (validationErrors.abortus?.[0]) {
    errors.abortus = validationErrors.abortus[0];
  }

  if (validationErrors.living_children?.[0]) {
    errors.livingChildren = validationErrors.living_children[0];
  }

  if (validationErrors.gestational_age_weeks?.[0]) {
    errors.gestationalAgeWeeks = validationErrors.gestational_age_weeks[0];
  }

  if (validationErrors.previous_delivery_spacing_years?.[0]) {
    errors.previousDeliverySpacingYears = validationErrors.previous_delivery_spacing_years[0];
  }

  if (validationErrors['previous_pregnancy_history.other_text']?.[0]) {
    errors.previousPregnancyHistoryOtherText =
      validationErrors['previous_pregnancy_history.other_text'][0];
  }

  if (validationErrors['comorbidities.other_text']?.[0]) {
    errors.comorbiditiesOtherText = validationErrors['comorbidities.other_text'][0];
  }

  if (validationErrors.notes?.[0]) {
    errors.notes = validationErrors.notes[0];
  }

  return errors;
}

export function InitialScreeningCreatePage() {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = parsePatientId(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<InitialScreeningCreateFormValues>(
    INITIAL_SCREENING_CREATE_FORM_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<InitialScreeningCreateFieldErrors>({});
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

  function updateField<Key extends keyof InitialScreeningCreateFormValues>(
    field: Key,
    value: InitialScreeningCreateFormValues[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFieldErrors({});
    setFormError(null);
  }

  function handleInputChange(
    field: keyof Pick<
      InitialScreeningCreateFormValues,
      | 'heightCm'
      | 'systolicBp'
      | 'diastolicBp'
      | 'pulseRate'
      | 'respiratoryRate'
      | 'temperatureC'
      | 'oxygenSaturation'
      | 'gravida'
      | 'parity'
      | 'abortus'
      | 'livingChildren'
      | 'gestationalAgeWeeks'
      | 'previousDeliverySpacingYears'
    >,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    };
  }

  function handleGeneralConditionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    updateField('generalCondition', event.target.value);
  }

  function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    updateField('notes', event.target.value);
  }

  function handleHasPreviousDeliveryChange(event: ChangeEvent<HTMLSelectElement>) {
    const hasPreviousDelivery = event.target.value === 'true';

    setForm((currentForm) => ({
      ...currentForm,
      hasPreviousDelivery,
      previousDeliverySpacingYears: hasPreviousDelivery
        ? currentForm.previousDeliverySpacingYears
        : '',
      previousDeliveryHistory: hasPreviousDelivery
        ? currentForm.previousDeliveryHistory
        : {
            spontaneous_vaginal: false,
            assisted_vaginal: false,
            cesarean_section: false,
          },
    }));

    setFieldErrors({});
    setFormError(null);
  }

  function updatePreviousPregnancyHistory(
    field: Exclude<keyof PreviousPregnancyHistory, 'other_text'>,
    checked: boolean,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      previousPregnancyHistory: {
        ...currentForm.previousPregnancyHistory,
        [field]: checked,
        other_text:
          field === 'other' && !checked ? null : currentForm.previousPregnancyHistory.other_text,
      },
    }));

    setFieldErrors({});
    setFormError(null);
  }

  function handlePreviousPregnancyOtherTextChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((currentForm) => ({
      ...currentForm,
      previousPregnancyHistory: {
        ...currentForm.previousPregnancyHistory,
        other_text: event.target.value,
      },
    }));

    setFieldErrors({});
    setFormError(null);
  }

  function updateComorbidity(
    field: Exclude<keyof InitialScreeningComorbidities, 'other_text'>,
    checked: boolean,
  ) {
    setForm((currentForm) => {
      const nextComorbidities = {
        ...currentForm.comorbidities,
        [field]: checked,
      };

      if (field === 'none' && checked) {
        return {
          ...currentForm,
          comorbidities: {
            none: true,
            heart_disease: false,
            asthma: false,
            hypertension: false,
            anemia: false,
            bleeding: false,
            other: false,
            other_text: null,
          },
        };
      }

      if (field !== 'none' && checked) {
        nextComorbidities.none = false;
      }

      if (field === 'other' && !checked) {
        nextComorbidities.other_text = null;
      }

      return {
        ...currentForm,
        comorbidities: nextComorbidities,
      };
    });

    setFieldErrors({});
    setFormError(null);
  }

  function handleComorbidityOtherTextChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((currentForm) => ({
      ...currentForm,
      comorbidities: {
        ...currentForm.comorbidities,
        other_text: event.target.value,
      },
    }));

    setFieldErrors({});
    setFormError(null);
  }

  function updatePreviousDeliveryHistory(field: keyof PreviousDeliveryHistory, checked: boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      previousDeliveryHistory: {
        ...currentForm.previousDeliveryHistory,
        [field]: checked,
      },
    }));

    setFieldErrors({});
    setFormError(null);
  }

  async function submitInitialScreening() {
    if (!patientId) {
      return;
    }

    const validationErrors = validateInitialScreeningCreateForm(form);

    if (hasInitialScreeningCreateErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      setFormError('Periksa kembali data Skrining Awal yang wajib diisi.');

      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createPatientInitialScreening(
        patientId,
        mapInitialScreeningCreateFormToPayload(form),
      );

      void navigate(getPatientDetailPath(result.initialScreening.patient_id), {
        replace: true,
        state: {
          flashMessage:
            result.message ||
            'Skrining Awal berhasil disimpan. Hasil risiko sudah dihitung backend.',
        },
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        void navigate(getPatientDetailPath(patientId), {
          replace: true,
          state: {
            flashMessage:
              'Skrining Awal pasien sudah pernah dibuat. Data ditampilkan dalam mode detail.',
          },
        });

        return;
      }

      if (error instanceof ApiError && error.status === 422) {
        setFieldErrors(mapLaravelFieldErrors(error));
        setFormError('Periksa kembali data Skrining Awal yang wajib diisi.');
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void submitInitialScreening();
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
          <p className="text-sm font-semibold text-brand-600">Skrining Awal</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Form Skrining Awal
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Isi data pengkajian awal. Status risiko, faktor risiko, dan rekomendasi akan dihitung
            oleh backend setelah data disimpan.
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-slate-950">Pemeriksaan Umum</h3>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                type="number"
                label="Tinggi badan (cm)"
                value={form.heightCm}
                onChange={handleInputChange('heightCm')}
                error={fieldErrors.heightCm}
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
                label="Frekuensi nadi"
                value={form.pulseRate}
                onChange={handleInputChange('pulseRate')}
                error={fieldErrors.pulseRate}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Frekuensi napas"
                value={form.respiratoryRate}
                onChange={handleInputChange('respiratoryRate')}
                error={fieldErrors.respiratoryRate}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Suhu (°C)"
                value={form.temperatureC}
                onChange={handleInputChange('temperatureC')}
                error={fieldErrors.temperatureC}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Saturasi oksigen (%)"
                value={form.oxygenSaturation}
                onChange={handleInputChange('oxygenSaturation')}
                error={fieldErrors.oxygenSaturation}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="general-condition" className="text-sm font-semibold text-slate-700">
                Keadaan umum
              </label>

              <textarea
                id="general-condition"
                value={form.generalCondition}
                onChange={handleGeneralConditionChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="Contoh: Compos mentis, tampak cukup baik"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />

              {fieldErrors.generalCondition ? (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.generalCondition}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-base font-semibold text-slate-950">Obstetri</h3>

            <div className="grid gap-5 md:grid-cols-2">
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
                label="Paritas"
                value={form.parity}
                onChange={handleInputChange('parity')}
                error={fieldErrors.parity}
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
                label="Anak hidup"
                value={form.livingChildren}
                onChange={handleInputChange('livingChildren')}
                error={fieldErrors.livingChildren}
                disabled={isSubmitting}
              />

              <Input
                type="number"
                label="Usia kehamilan (minggu)"
                value={form.gestationalAgeWeeks}
                onChange={handleInputChange('gestationalAgeWeeks')}
                error={fieldErrors.gestationalAgeWeeks}
                disabled={isSubmitting}
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-base font-semibold text-slate-950">
              Riwayat persalinan sebelumnya
            </h3>

            <div>
              <label
                htmlFor="has-previous-delivery"
                className="text-sm font-semibold text-slate-700"
              >
                Pernah melahirkan sebelumnya?
              </label>

              <select
                id="has-previous-delivery"
                value={String(form.hasPreviousDelivery)}
                onChange={handleHasPreviousDeliveryChange}
                disabled={isSubmitting}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="false">Belum pernah</option>
                <option value="true">Pernah</option>
              </select>
            </div>

            {form.hasPreviousDelivery ? (
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Jarak persalinan sebelumnya (tahun)"
                  value={form.previousDeliverySpacingYears}
                  onChange={handleInputChange('previousDeliverySpacingYears')}
                  error={fieldErrors.previousDeliverySpacingYears}
                  disabled={isSubmitting}
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Jenis riwayat persalinan sebelumnya
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {PREVIOUS_DELIVERY_HISTORY_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.previousDeliveryHistory[key]}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            updatePreviousDeliveryHistory(key, event.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />

                        {PREVIOUS_DELIVERY_HISTORY_LABELS[key]}
                      </label>
                    ))}
                  </div>

                  {fieldErrors.previousDeliveryHistory ? (
                    <p className="mt-2 text-sm text-red-600">
                      {fieldErrors.previousDeliveryHistory}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 border-t border-slate-100 pt-6 lg:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                Riwayat kehamilan sebelumnya
              </h3>

              <div className="mt-4 space-y-3">
                {PREVIOUS_PREGNANCY_HISTORY_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.previousPregnancyHistory[key]}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updatePreviousPregnancyHistory(key, event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    {PREVIOUS_PREGNANCY_HISTORY_LABELS[key]}
                  </label>
                ))}

                {form.previousPregnancyHistory.other ? (
                  <Input
                    label="Keterangan riwayat lainnya"
                    value={form.previousPregnancyHistory.other_text ?? ''}
                    onChange={handlePreviousPregnancyOtherTextChange}
                    error={fieldErrors.previousPregnancyHistoryOtherText}
                    disabled={isSubmitting}
                  />
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-950">Penyakit Penyerta</h3>

              <div className="mt-4 space-y-3">
                {COMORBIDITY_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.comorbidities[key]}
                      disabled={isSubmitting}
                      onChange={(event) => updateComorbidity(key, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    {COMORBIDITY_LABELS[key]}
                  </label>
                ))}

                {fieldErrors.comorbidities ? (
                  <p className="text-sm text-red-600">{fieldErrors.comorbidities}</p>
                ) : null}

                {form.comorbidities.other ? (
                  <Input
                    label="Keterangan penyakit penyerta lainnya"
                    value={form.comorbidities.other_text ?? ''}
                    onChange={handleComorbidityOtherTextChange}
                    error={fieldErrors.comorbiditiesOtherText}
                    disabled={isSubmitting}
                  />
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <label
              htmlFor="initial-screening-notes"
              className="text-sm font-semibold text-slate-700"
            >
              Catatan
            </label>

            <textarea
              id="initial-screening-notes"
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
              Simpan Skrining Awal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
