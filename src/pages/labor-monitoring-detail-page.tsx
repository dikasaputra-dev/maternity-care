import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import {
  deleteLaborMonitoring,
  getLaborMonitoringDetail,
} from '@/features/labor-monitorings/api/labor-monitoring.api';
import {
  AMNIOTIC_FLUID_COLOR_LABELS,
  CONTRACTION_INTENSITY_LABELS,
  FETAL_HEAD_DESCENT_LABELS,
  FETAL_MOVEMENT_LABELS,
  LABOR_MONITORING_RISK_STATUS_LABELS,
  MEMBRANE_STATUS_LABELS,
  URINE_ACETONE_LABELS,
  URINE_PROTEIN_LABELS,
} from '@/features/labor-monitorings/constants/labor-monitoring-options';
import { getLaborMonitoringErrorMessage } from '@/features/labor-monitorings/lib/labor-monitoring-error';
import type {
  LaborMonitoring,
  LaborMonitoringRiskStatus,
} from '@/features/labor-monitorings/types/labor-monitoring.types';
import {
  getPatientEducationLabel,
  getPatientLocationLabel,
  getPatientReligionLabel,
} from '@/features/patients/constants/patient-options';
import { formatDate, formatDateTime } from '@/features/patients/lib/patient-format';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { getLaborMonitoringEditPath } from '@/features/labor-monitorings/lib/labor-monitoring-path';
import { DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';
import { PERMISSIONS } from '@/features/auth/constants/permissions';

function parseLaborMonitoringId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function formatReligionLabel(value?: string | null) {
  if (!value) {
    return '-';
  }

  return getPatientReligionLabel(value as Parameters<typeof getPatientReligionLabel>[0]);
}

function formatEducationLabel(value?: string | null) {
  if (!value) {
    return '-';
  }

  return getPatientEducationLabel(value as Parameters<typeof getPatientEducationLabel>[0]);
}

function formatLocationLabel(value?: string | null) {
  if (!value) {
    return '-';
  }

  return getPatientLocationLabel(value as Parameters<typeof getPatientLocationLabel>[0]);
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
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

function getMembraneLabel(monitoring: LaborMonitoring) {
  if (monitoring.membrane_status === 'intact') {
    return MEMBRANE_STATUS_LABELS.intact;
  }

  const fluidColorLabel = monitoring.amniotic_fluid_color
    ? AMNIOTIC_FLUID_COLOR_LABELS[monitoring.amniotic_fluid_color]
    : '-';

  return `${MEMBRANE_STATUS_LABELS.ruptured} · ${fluidColorLabel}`;
}

function PatientSummaryCard({ monitoring }: { monitoring: LaborMonitoring }) {
  const patient = monitoring.patient;

  if (!patient) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-950">Ringkasan Pasien</p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Data pasien tidak disertakan pada response detail Pemantauan Persalinan. ID pasien:{' '}
          {monitoring.patient_id}.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Ringkasan Pasien
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {patient.age ? `${patient.age} tahun` : 'Usia tidak tersedia'} ·{' '}
            {formatLocationLabel(patient.location)}
          </p>
        </div>

        <p className="text-sm font-semibold text-brand-600">{patient.medical_record_number}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Tanggal Lahir" value={formatDate(patient.date_of_birth)} />

        <InfoItem label="Agama" value={formatReligionLabel(patient.religion)} />

        <InfoItem label="Pendidikan" value={formatEducationLabel(patient.education)} />

        <InfoItem label="Ras/Suku" value={patient.ethnicity ?? '-'} />

        <InfoItem label="Pekerjaan" value={patient.occupation ?? '-'} />

        <InfoItem label="Nomor Telepon" value={patient.phone_number ?? '-'} />

        <InfoItem label="Lokasi Layanan" value={formatLocationLabel(patient.location)} />

        <InfoItem label="Alamat" value={patient.address ?? '-'} />
      </div>
    </Card>
  );
}

function MonitoringDetailCard({ monitoring }: { monitoring: LaborMonitoring }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Detail Pemantauan
          </p>

          <h3 className="mt-1 text-xl font-semibold text-slate-950">Pemantauan Persalinan</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Dipantau pada {formatDateTime(monitoring.monitored_at)}.
          </p>
        </div>

        <RiskBadge riskStatus={monitoring.risk_status} />
      </div>

      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Rekomendasi</p>

        <p className="mt-2 text-sm leading-6 text-slate-700">{monitoring.recommendation}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-900">Faktor Risiko</p>

        {monitoring.risk_factors.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-800">
            {monitoring.risk_factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Tidak ada faktor risiko bermakna dari data pemantauan.
          </p>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Tanda Vital</th>
              <th className="px-4 py-3">Janin</th>
              <th className="px-4 py-3">Kontraksi</th>
              <th className="px-4 py-3">Pembukaan</th>
              <th className="px-4 py-3">Ketuban</th>
              <th className="px-4 py-3">Urine</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            <tr className="align-top text-sm text-slate-700">
              <td className="min-w-56 px-4 py-4">
                <p>
                  TD {monitoring.systolic_bp}/{monitoring.diastolic_bp} mmHg
                </p>

                <p className="mt-1">Nadi {monitoring.pulse_rate} x/menit</p>

                <p className="mt-1">RR {monitoring.respiratory_rate} x/menit</p>

                <p className="mt-1">Suhu {monitoring.temperature_c} °C</p>

                <p className="mt-1">SpO₂ {monitoring.oxygen_saturation}%</p>
              </td>

              <td className="min-w-48 px-4 py-4">
                <p>DJJ {monitoring.fetal_heart_rate} x/menit</p>

                <p className="mt-1">Gerak {FETAL_MOVEMENT_LABELS[monitoring.fetal_movement]}</p>
              </td>

              <td className="min-w-52 px-4 py-4">
                <p>{monitoring.contraction_frequency_per_10_minutes}x / 10 menit</p>

                <p className="mt-1">Durasi {monitoring.contraction_duration_seconds} detik</p>

                <p className="mt-1">
                  {CONTRACTION_INTENSITY_LABELS[monitoring.contraction_intensity]}
                </p>
              </td>

              <td className="min-w-48 px-4 py-4">
                <p>{monitoring.cervical_dilation_cm} cm</p>

                <p className="mt-1">{FETAL_HEAD_DESCENT_LABELS[monitoring.fetal_head_descent]}</p>
              </td>

              <td className="min-w-52 px-4 py-4">
                <p>{getMembraneLabel(monitoring)}</p>

                {monitoring.membrane_rupture_at ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Pecah: {formatDateTime(monitoring.membrane_rupture_at)}
                  </p>
                ) : null}
              </td>

              <td className="min-w-48 px-4 py-4">
                <p>{monitoring.urine_volume_ml} ml</p>

                <p className="mt-1">Protein {URINE_PROTEIN_LABELS[monitoring.urine_protein]}</p>

                <p className="mt-1">Aseton {URINE_ACETONE_LABELS[monitoring.urine_acetone]}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {monitoring.notes ? (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Catatan</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">{monitoring.notes}</p>
        </div>
      ) : null}

      <p className="mt-5 text-xs font-medium text-slate-400">
        Data dibuat pada {formatDateTime(monitoring.created_at)} · Diperbarui pada{' '}
        {formatDateTime(monitoring.updated_at)}
      </p>
    </Card>
  );
}

export function LaborMonitoringDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const laborMonitoringId = parseLaborMonitoringId(params.laborMonitoringId);

  const canUpdateMonitoring = hasPermission(user, PERMISSIONS.MONITORING_UPDATE);
  const canDeleteMonitoring = hasPermission(user, PERMISSIONS.MONITORING_DELETE);

  const [monitoring, setMonitoring] = useState<LaborMonitoring | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(laborMonitoringId !== null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, [laborMonitoringId, reloadKey]);

  function handleBack() {
    if (monitoring?.patient_id) {
      void navigate(`/patients/${monitoring.patient_id}`);
      return;
    }

    void navigate(APP_PATHS.PATIENTS);
  }

  function handleRefresh() {
    setIsLoading(true);
    setErrorMessage(null);
    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleEdit() {
    if (!monitoring) {
      return;
    }

    void navigate(getLaborMonitoringEditPath(monitoring.id));
  }

  function handleDelete() {
    if (!monitoring) {
      return;
    }

    const confirmed = window.confirm(
      'Hapus data Pemantauan Persalinan ini? Data yang sudah dihapus tidak dapat dikembalikan.',
    );

    if (!confirmed) {
      return;
    }

    void deleteSelectedMonitoring();
  }

  async function deleteSelectedMonitoring() {
    if (!monitoring) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteLaborMonitoring(monitoring.id);

      void navigate(`/patients/${monitoring.patient_id}`);
    } catch (error: unknown) {
      setErrorMessage(getLaborMonitoringErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  if (!laborMonitoringId) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">Data tidak valid</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            ID Pemantauan Persalinan tidak ditemukan pada URL.
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Pemantauan Persalinan</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Detail Pemantauan Persalinan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Detail data pemantauan yang sudah tersimpan. Data risiko dan rekomendasi berasal dari
            backend.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="secondary"
            leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleBack}
          >
            Kembali
          </Button>

          {canUpdateMonitoring && monitoring ? (
            <Button
              type="button"
              variant="secondary"
              leadingIcon={<EditOutlined aria-hidden="true" fontSize="small" />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          ) : null}

          {canDeleteMonitoring && monitoring ? (
            <Button
              type="button"
              variant="secondary"
              isLoading={isDeleting}
              leadingIcon={<DeleteOutlineOutlined aria-hidden="true" fontSize="small" />}
              onClick={handleDelete}
            >
              Hapus
            </Button>
          ) : null}
        </div>
      </section>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-sm text-slate-500">Memuat detail Pemantauan Persalinan...</p>
        </Card>
      ) : monitoring ? (
        <>
          <PatientSummaryCard monitoring={monitoring} />
          <MonitoringDetailCard monitoring={monitoring} />
        </>
      ) : (
        <Card>
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold text-slate-950">Data tidak ditemukan</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Detail Pemantauan Persalinan tidak tersedia atau sudah dihapus.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
