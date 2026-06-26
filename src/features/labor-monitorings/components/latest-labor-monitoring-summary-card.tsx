import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { getPatientLatestLaborMonitoring } from '@/features/labor-monitorings/api/labor-monitoring.api';
import {
  FETAL_MOVEMENT_LABELS,
  LABOR_MONITORING_RISK_STATUS_LABELS,
  MEMBRANE_STATUS_LABELS,
} from '@/features/labor-monitorings/constants/labor-monitoring-options';
import { getLaborMonitoringErrorMessage } from '@/features/labor-monitorings/lib/labor-monitoring-error';
import { getLaborMonitoringDetailPath } from '@/features/labor-monitorings/lib/labor-monitoring-path';
import type {
  LaborMonitoring,
  LaborMonitoringRiskStatus,
} from '@/features/labor-monitorings/types/labor-monitoring.types';
import { formatDateTime } from '@/features/patients/lib/patient-format';

interface LatestLaborMonitoringSummaryCardProps {
  patientId: number;
  hasInitialScreening: boolean;
}

function RiskBadge({ riskStatus }: { riskStatus: LaborMonitoringRiskStatus }) {
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

function getMembraneSummary(monitoring: LaborMonitoring) {
  if (monitoring.membrane_status === 'intact') {
    return MEMBRANE_STATUS_LABELS.intact;
  }

  return MEMBRANE_STATUS_LABELS.ruptured;
}

export function LatestLaborMonitoringSummaryCard({
  hasInitialScreening,
  patientId,
}: LatestLaborMonitoringSummaryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewMonitoring = hasPermission(user, PERMISSIONS.MONITORING_VIEW);

  const [latestMonitoring, setLatestMonitoring] = useState<LaborMonitoring | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(hasInitialScreening);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!canViewMonitoring || !hasInitialScreening) {
      return;
    }

    let isActive = true;

    getPatientLatestLaborMonitoring(patientId)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setLatestMonitoring(response);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setLatestMonitoring(null);
          setErrorMessage(null);
          return;
        }

        setLatestMonitoring(null);
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
  }, [canViewMonitoring, hasInitialScreening, patientId, reloadKey]);

  function handleRefresh() {
    setIsLoading(true);
    setErrorMessage(null);
    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleOpenDetail() {
    if (!latestMonitoring) {
      return;
    }

    void navigate(getLaborMonitoringDetailPath(latestMonitoring.id));
  }

  if (!canViewMonitoring) {
    return null;
  }

  if (!hasInitialScreening) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Pemantauan Terakhir</p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Aktif setelah Skrining Awal selesai.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-950">Pemantauan Terakhir</p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ringkasan data pemantauan terbaru pasien.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-500">Memuat pemantauan terakhir...</p>
      ) : latestMonitoring ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <RiskBadge riskStatus={latestMonitoring.risk_status} />

            <p className="text-xs font-semibold text-slate-400">
              {formatDateTime(latestMonitoring.monitored_at)}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Tanda Vital</p>

              <p className="mt-1">
                TD {latestMonitoring.systolic_bp}/{latestMonitoring.diastolic_bp} mmHg · Nadi{' '}
                {latestMonitoring.pulse_rate} x/menit
              </p>

              <p className="mt-1">
                Suhu {latestMonitoring.temperature_c} °C · SpO₂ {latestMonitoring.oxygen_saturation}
                %
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Kondisi Persalinan</p>

              <p className="mt-1">
                DJJ {latestMonitoring.fetal_heart_rate} x/menit · Gerak{' '}
                {FETAL_MOVEMENT_LABELS[latestMonitoring.fetal_movement]}
              </p>

              <p className="mt-1">
                Pembukaan {latestMonitoring.cervical_dilation_cm} cm · Ketuban{' '}
                {getMembraneSummary(latestMonitoring)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Rekomendasi</p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {latestMonitoring.recommendation}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            leadingIcon={<VisibilityOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleOpenDetail}
          >
            Lihat Detail Pemantauan
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-950">Belum ada Pemantauan Persalinan</p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ringkasan akan tampil setelah data Pemantauan Persalinan pertama dibuat.
          </p>
        </div>
      )}
    </Card>
  );
}
