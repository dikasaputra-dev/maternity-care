import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { getInitialScreeningDetail } from '@/features/initial-screenings/api/initial-screening.api';
import {
  COMORBIDITY_LABELS,
  INITIAL_SCREENING_RISK_STATUS_LABELS,
  PREVIOUS_DELIVERY_HISTORY_LABELS,
  PREVIOUS_PREGNANCY_HISTORY_LABELS,
} from '@/features/initial-screenings/constants/initial-screening-options';
import type {
  InitialScreening,
  InitialScreeningComorbidities,
  InitialScreeningRiskStatus,
  PreviousDeliveryHistory,
  PreviousPregnancyHistory,
} from '@/features/initial-screenings/types/initial-screening.types';
import {
  getPatientEducationLabel,
  getPatientLocationLabel,
  getPatientReligionLabel,
} from '@/features/patients/constants/patient-options';
import { formatDate, formatDateTime } from '@/features/patients/lib/patient-format';

function parseInitialScreeningId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat detail Skrining Awal.';
}

function RiskBadge({ riskStatus }: { riskStatus: InitialScreeningRiskStatus }) {
  if (riskStatus === 'high') {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        {INITIAL_SCREENING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  if (riskStatus === 'medium') {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {INITIAL_SCREENING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {INITIAL_SCREENING_RISK_STATUS_LABELS[riskStatus]}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{value}</p>
    </div>
  );
}

function ScreeningLabelList({ emptyMessage, labels }: { labels: string[]; emptyMessage: string }) {
  if (labels.length === 0) {
    return <p className="text-sm leading-6 text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function getActivePreviousPregnancyHistoryLabels(history: PreviousPregnancyHistory) {
  const labels: string[] = [];

  if (history.normal) {
    labels.push(PREVIOUS_PREGNANCY_HISTORY_LABELS.normal);
  }

  if (history.hypertension) {
    labels.push(PREVIOUS_PREGNANCY_HISTORY_LABELS.hypertension);
  }

  if (history.eclampsia) {
    labels.push(PREVIOUS_PREGNANCY_HISTORY_LABELS.eclampsia);
  }

  if (history.gestational_diabetes) {
    labels.push(PREVIOUS_PREGNANCY_HISTORY_LABELS.gestational_diabetes);
  }

  if (history.preeclampsia) {
    labels.push(PREVIOUS_PREGNANCY_HISTORY_LABELS.preeclampsia);
  }

  if (history.other) {
    labels.push(history.other_text ?? PREVIOUS_PREGNANCY_HISTORY_LABELS.other);
  }

  return labels;
}

function getActiveComorbidityLabels(comorbidities: InitialScreeningComorbidities) {
  const labels: string[] = [];

  if (comorbidities.none) {
    labels.push(COMORBIDITY_LABELS.none);
  }

  if (comorbidities.heart_disease) {
    labels.push(COMORBIDITY_LABELS.heart_disease);
  }

  if (comorbidities.asthma) {
    labels.push(COMORBIDITY_LABELS.asthma);
  }

  if (comorbidities.hypertension) {
    labels.push(COMORBIDITY_LABELS.hypertension);
  }

  if (comorbidities.anemia) {
    labels.push(COMORBIDITY_LABELS.anemia);
  }

  if (comorbidities.bleeding) {
    labels.push(COMORBIDITY_LABELS.bleeding);
  }

  if (comorbidities.other) {
    labels.push(comorbidities.other_text ?? COMORBIDITY_LABELS.other);
  }

  return labels;
}

function getActivePreviousDeliveryHistoryLabels(history: PreviousDeliveryHistory) {
  const labels: string[] = [];

  if (history.spontaneous_vaginal) {
    labels.push(PREVIOUS_DELIVERY_HISTORY_LABELS.spontaneous_vaginal);
  }

  if (history.assisted_vaginal) {
    labels.push(PREVIOUS_DELIVERY_HISTORY_LABELS.assisted_vaginal);
  }

  if (history.cesarean_section) {
    labels.push(PREVIOUS_DELIVERY_HISTORY_LABELS.cesarean_section);
  }

  return labels;
}

function PatientSummaryCard({ initialScreening }: { initialScreening: InitialScreening }) {
  const patient = initialScreening.patient;

  if (!patient) {
    return (
      <Card>
        <p className="text-sm leading-6 text-slate-500">
          Data ringkas pasien tidak tersedia pada response Skrining Awal.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">{patient.medical_record_number}</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {patient.age} tahun · {getPatientLocationLabel(patient.location)}
          </p>
        </div>

        <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
          {getPatientLocationLabel(patient.location)}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Tanggal Lahir" value={formatDate(patient.date_of_birth)} />
        <InfoItem label="Agama" value={getPatientReligionLabel(patient.religion)} />
        <InfoItem label="Pendidikan" value={getPatientEducationLabel(patient.education)} />
        <InfoItem label="Ras/Suku" value={patient.ethnicity} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoItem label="Pekerjaan" value={patient.occupation} />
        <InfoItem label="Nomor Telepon" value={patient.phone_number ?? '-'} />
      </div>

      <div className="mt-5">
        <InfoItem label="Alamat Tempat Tinggal" value={patient.address} />
      </div>
    </Card>
  );
}

function InitialScreeningDetailCard({ initialScreening }: { initialScreening: InitialScreening }) {
  const previousPregnancyLabels = getActivePreviousPregnancyHistoryLabels(
    initialScreening.previous_pregnancy_history,
  );
  const comorbidityLabels = getActiveComorbidityLabels(initialScreening.comorbidities);
  const previousDeliveryLabels = getActivePreviousDeliveryHistoryLabels(
    initialScreening.previous_delivery_history,
  );

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Skrining Awal</p>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Detail Skrining yang Dilakukan
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Data ini adalah hasil input Skrining Awal dan analisis risiko dari backend pada waktu
            skrining dilakukan.
          </p>
        </div>

        <RiskBadge riskStatus={initialScreening.risk_status} />
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Rekomendasi Backend</p>

        <p className="mt-2 text-sm leading-6 text-slate-700">{initialScreening.recommendation}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-900">Faktor Risiko</p>

        {initialScreening.risk_factors.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-800">
            {initialScreening.risk_factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Tidak ada faktor risiko bermakna dari data Skrining Awal.
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Tinggi</th>
              <th className="px-4 py-3">TD</th>
              <th className="px-4 py-3">Nadi</th>
              <th className="px-4 py-3">Napas</th>
              <th className="px-4 py-3">Suhu</th>
              <th className="px-4 py-3">SpO₂</th>
              <th className="px-4 py-3">GPA</th>
              <th className="px-4 py-3">Anak Hidup</th>
              <th className="px-4 py-3">Usia Hamil</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            <tr className="text-sm text-slate-700">
              <td className="whitespace-nowrap px-4 py-4 font-semibold">
                {initialScreening.height_cm} cm
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {initialScreening.systolic_bp}/{initialScreening.diastolic_bp} mmHg
              </td>

              <td className="whitespace-nowrap px-4 py-4">{initialScreening.pulse_rate} x/menit</td>

              <td className="whitespace-nowrap px-4 py-4">
                {initialScreening.respiratory_rate} x/menit
              </td>

              <td className="whitespace-nowrap px-4 py-4">{initialScreening.temperature_c} °C</td>

              <td className="whitespace-nowrap px-4 py-4">{initialScreening.oxygen_saturation}%</td>

              <td className="whitespace-nowrap px-4 py-4">
                G{initialScreening.gravida} / P{initialScreening.parity} / A
                {initialScreening.abortus}
              </td>

              <td className="whitespace-nowrap px-4 py-4">{initialScreening.living_children}</td>

              <td className="whitespace-nowrap px-4 py-4">
                {initialScreening.gestational_age_weeks} minggu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Riwayat Kehamilan Sebelumnya</p>

          <div className="mt-3">
            <ScreeningLabelList
              labels={previousPregnancyLabels}
              emptyMessage="Tidak ada riwayat kehamilan sebelumnya."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Penyakit Penyerta</p>

          <div className="mt-3">
            <ScreeningLabelList
              labels={comorbidityLabels}
              emptyMessage="Tidak ada penyakit penyerta."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Riwayat Persalinan Sebelumnya</p>

          <div className="mt-3">
            <ScreeningLabelList
              labels={previousDeliveryLabels}
              emptyMessage="Tidak ada riwayat persalinan sebelumnya."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Keadaan Umum</p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {initialScreening.general_condition}
        </p>
      </div>

      {initialScreening.notes ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Catatan</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">{initialScreening.notes}</p>
        </div>
      ) : null}

      <p className="mt-6 text-xs font-medium text-slate-400">
        Skrining dibuat pada {formatDateTime(initialScreening.created_at)}
      </p>
    </Card>
  );
}

export function InitialScreeningDetailPage() {
  const navigate = useNavigate();
  const params = useParams();

  const initialScreeningId = parseInitialScreeningId(params.initialScreeningId);

  const [initialScreening, setInitialScreening] = useState<InitialScreening | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadInitialScreeningDetail() {
      if (!initialScreeningId) {
        setIsLoading(false);
        setIsNotFound(true);
        setInitialScreening(null);

        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);
      setInitialScreening(null);

      try {
        const result = await getInitialScreeningDetail(initialScreeningId);

        if (!isActive) {
          return;
        }

        setInitialScreening(result);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setInitialScreening(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true);
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialScreeningDetail();

    return () => {
      isActive = false;
    };
  }, [initialScreeningId, reloadKey]);

  function handleBack() {
    void navigate(APP_PATHS.SCREENINGS);
  }

  function handleRefresh() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat detail Skrining Awal...</p>
      </Card>
    );
  }

  if (isNotFound) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">Skrining Awal tidak ditemukan</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Data Skrining Awal tidak ditemukan atau sudah tidak tersedia.
          </p>

          <Button
            className="mt-5"
            variant="secondary"
            leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleBack}
          >
            Kembali ke Menu Skrining
          </Button>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">
            Gagal memuat detail Skrining Awal
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">{errorMessage}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
              onClick={handleBack}
            >
              Kembali
            </Button>

            <Button
              leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
              onClick={handleRefresh}
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!initialScreening) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Detail Skrining</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Detail Skrining Awal
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informasi ini menampilkan data Skrining Awal yang dilakukan pada satu waktu pemeriksaan.
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

      <PatientSummaryCard initialScreening={initialScreening} />

      <InitialScreeningDetailCard initialScreening={initialScreening} />
    </div>
  );
}
