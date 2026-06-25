import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useEffect, useState } from 'react';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { formatDateTime } from '@/features/patients/lib/patient-format';
import { getPatientInitialScreening } from '@/features/initial-screenings/api/initial-screening.api';
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
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { AddOutlined } from '@mui/icons-material';

interface InitialScreeningStatusCardProps {
  patientId: number;
  onStatusChange?: (hasInitialScreening: boolean) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat data skrining awal.';
}

function RiskStatusBadge({ riskStatus }: { riskStatus: InitialScreeningRiskStatus }) {
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

function formatValue(value: number, suffix = '') {
  return `${value}${suffix}`;
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

function BadgeList({ emptyMessage, labels }: { labels: string[]; emptyMessage: string }) {
  if (labels.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <Badge key={label} tone="neutral">
          {label}
        </Badge>
      ))}
    </div>
  );
}

export function InitialScreeningStatusCard({
  onStatusChange,
  patientId,
}: InitialScreeningStatusCardProps) {
  const [initialScreening, setInitialScreening] = useState<InitialScreening | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreateInitialScreening = hasPermission(user, PERMISSIONS.SCREENINGS_CREATE);

  function handleCreateInitialScreening() {
    void navigate(`/patients/${patientId}/initial-screening/create`);
  }

  useEffect(() => {
    let isActive = true;

    async function loadInitialScreening() {
      setIsLoading(true);
      setIsEmpty(false);
      setErrorMessage(null);

      try {
        const result = await getPatientInitialScreening(patientId);

        if (!isActive) {
          return;
        }

        setInitialScreening(result);
        onStatusChange?.(true);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setInitialScreening(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsEmpty(true);
          onStatusChange?.(false);
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialScreening();

    return () => {
      isActive = false;
    };
  }, [onStatusChange, patientId, reloadKey]);

  function handleRefresh() {
    setReloadKey((current) => current + 1);
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat Skrining Awal...</p>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <FactCheckOutlinedIcon aria-hidden="true" fontSize="small" />
            </span>

            <div>
              <p className="text-sm font-semibold text-brand-600">Skrining Awal</p>

              <h3 className="mt-1 text-base font-semibold text-slate-950">
                Skrining Awal belum diisi
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Pasien belum memiliki data Skrining Awal. Pemantauan Persalinan, Tindakan, Luaran
                Persalinan, dan Luaran Kelahiran Bayi belum aktif sampai Skrining Awal dibuat.
              </p>
            </div>
          </div>

          {canCreateInitialScreening ? (
            <div className="flex shrink-0 justify-end sm:self-center">
              <Button
                type="button"
                leadingIcon={<AddOutlined aria-hidden="true" fontSize="small" />}
                onClick={handleCreateInitialScreening}
              >
                Isi Skrining Awal
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <WarningAmberOutlinedIcon aria-hidden="true" fontSize="small" />
            </span>

            <div>
              <h3 className="text-base font-semibold text-slate-950">Gagal memuat Skrining Awal</h3>

              <p className="mt-2 text-sm leading-6 text-red-600">{errorMessage}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleRefresh}
          >
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  if (!initialScreening) {
    return null;
  }

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

          <h3 className="mt-1 text-lg font-semibold text-slate-950">Detail Skrining Awal</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Dibuat pada {formatDateTime(initialScreening.created_at)}
          </p>
        </div>

        <RiskStatusBadge riskStatus={initialScreening.risk_status} />
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Rekomendasi Backend</p>

        <p className="mt-2 text-sm leading-6 text-slate-700">{initialScreening.recommendation}</p>
      </div>

      {initialScreening.risk_factors.length > 0 ? (
        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">Faktor Risiko</p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-800">
            {initialScreening.risk_factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tinggi Badan
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.height_cm, ' cm')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tekanan Darah
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {initialScreening.systolic_bp} / {initialScreening.diastolic_bp} mmHg
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nadi</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.pulse_rate, ' x/menit')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Napas</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.respiratory_rate, ' x/menit')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suhu</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.temperature_c, ' °C')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SpO₂</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.oxygen_saturation, '%')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GPA</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            G{initialScreening.gravida} / P{initialScreening.parity} / A{initialScreening.abortus}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Usia Kehamilan
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatValue(initialScreening.gestational_age_weeks, ' minggu')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Riwayat Kehamilan Sebelumnya</p>

          <div className="mt-3">
            <BadgeList
              labels={previousPregnancyLabels}
              emptyMessage="Tidak ada riwayat kehamilan sebelumnya."
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">Komorbiditas</p>

          <div className="mt-3">
            <BadgeList labels={comorbidityLabels} emptyMessage="Tidak ada komorbiditas." />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">Riwayat Persalinan Sebelumnya</p>

          <div className="mt-3">
            <BadgeList
              labels={previousDeliveryLabels}
              emptyMessage="Tidak ada riwayat persalinan sebelumnya."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Keadaan Umum</p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {initialScreening.general_condition}
        </p>
      </div>

      {initialScreening.notes ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Catatan</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">{initialScreening.notes}</p>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-semibold text-emerald-900">Tahap berikutnya</p>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Skrining Awal sudah tersedia. Setelah ini, fitur Pemantauan Persalinan boleh ditampilkan
          atau diaktifkan pada phase berikutnya.
        </p>
      </div>
    </Card>
  );
}
