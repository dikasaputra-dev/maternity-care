import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useEffect, useState } from 'react';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { formatDateTime } from '@/features/patients/lib/patient-format';
import { getLatestPatientScreening } from '@/features/screenings/api/screening.api';
import {
  DANGER_SIGN_KEYS,
  DANGER_SIGN_LABELS,
  MEDICAL_HISTORY_KEYS,
  MEDICAL_HISTORY_LABELS,
  SCREENING_RISK_STATUS_LABELS,
} from '@/features/screenings/constants/screening-options';
import type { Screening, ScreeningRiskStatus } from '@/features/screenings/types/screening.types';

interface LatestPatientScreeningCardProps {
  patientId: number;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat skrining terbaru.';
}

function RiskStatusBadge({ riskStatus }: { riskStatus: ScreeningRiskStatus }) {
  if (riskStatus === 'high') {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        {SCREENING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  if (riskStatus === 'medium') {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        {SCREENING_RISK_STATUS_LABELS[riskStatus]}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {SCREENING_RISK_STATUS_LABELS[riskStatus]}
    </span>
  );
}

function formatNullableNumber(value: number | null, suffix = '') {
  if (value === null) {
    return '-';
  }

  return `${value}${suffix}`;
}

function getActiveMedicalHistoryLabels(screening: Screening) {
  return MEDICAL_HISTORY_KEYS.filter((key) => screening.medical_history[key]).map(
    (key) => MEDICAL_HISTORY_LABELS[key],
  );
}

function getActiveDangerSignLabels(screening: Screening) {
  return DANGER_SIGN_KEYS.filter((key) => screening.danger_signs[key]).map(
    (key) => DANGER_SIGN_LABELS[key],
  );
}

export function LatestPatientScreeningCard({ patientId }: LatestPatientScreeningCardProps) {
  const { user } = useAuth();

  const canViewScreening = hasPermission(user, PERMISSIONS.SCREENINGS_VIEW);

  const [screening, setScreening] = useState<Screening | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!canViewScreening) {
      return;
    }

    let isActive = true;

    async function loadLatestScreening() {
      setIsLoading(true);
      setIsEmpty(false);
      setErrorMessage(null);

      try {
        const result = await getLatestPatientScreening(patientId);

        if (!isActive) {
          return;
        }

        setScreening(result);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setScreening(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsEmpty(true);
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadLatestScreening();

    return () => {
      isActive = false;
    };
  }, [canViewScreening, patientId, reloadKey]);

  function handleRefresh() {
    setReloadKey((current) => current + 1);
  }

  if (!canViewScreening) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat skrining terbaru...</p>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <FactCheckOutlinedIcon aria-hidden="true" fontSize="small" />
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-950">Skrining terbaru</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">Belum ada data skrining.</p>
          </div>
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
              <h3 className="text-base font-semibold text-slate-950">
                Gagal memuat skrining terbaru
              </h3>

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

  if (!screening) {
    return null;
  }

  const activeMedicalHistoryLabels = getActiveMedicalHistoryLabels(screening);

  const activeDangerSignLabels = getActiveDangerSignLabels(screening);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Skrining Terbaru</p>

          <h3 className="mt-1 text-lg font-semibold text-slate-950">Ringkasan hasil skrining</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Dibuat pada {formatDateTime(screening.created_at)}
            {screening.creator ? ` oleh ${screening.creator.name}` : ''}
          </p>
        </div>

        <RiskStatusBadge riskStatus={screening.risk_status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Usia Kehamilan
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatNullableNumber(screening.gestational_age_weeks, ' minggu')}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GPA</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            G{formatNullableNumber(screening.gravida)} / P{formatNullableNumber(screening.para)} / A
            {formatNullableNumber(screening.abortus)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tekanan Darah
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatNullableNumber(screening.systolic_bp)} /{' '}
            {formatNullableNumber(screening.diastolic_bp)} mmHg
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TBJ</p>

          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatNullableNumber(screening.estimated_fetal_weight_grams, ' gram')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">Riwayat penyakit aktif</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {activeMedicalHistoryLabels.length > 0 ? (
              activeMedicalHistoryLabels.map((label) => (
                <Badge key={label} tone="neutral">
                  {label}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">Tidak ada riwayat penyakit aktif.</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">Tanda bahaya aktif</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {activeDangerSignLabels.length > 0 ? (
              activeDangerSignLabels.map((label) => (
                <Badge key={label} tone="neutral">
                  {label}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">Tidak ada tanda bahaya aktif.</p>
            )}
          </div>
        </div>
      </div>

      {screening.notes ? (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Catatan</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">{screening.notes}</p>
        </div>
      ) : null}
    </Card>
  );
}
