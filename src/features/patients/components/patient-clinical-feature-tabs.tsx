import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
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
import { formatDateTime } from '@/features/patients/lib/patient-format';

type ClinicalFeatureTabId =
  | 'initial-screening'
  | 'labor-monitoring'
  | 'actions'
  | 'delivery-outcome'
  | 'newborn-outcome';

interface PatientClinicalFeatureTabsProps {
  patientId: number;
  hasInitialScreening: boolean;
  initialScreening: InitialScreening | null;
}

interface ClinicalFeatureTab {
  id: ClinicalFeatureTabId;
  label: string;
  disabled: boolean;
}

interface EmptyFeatureStateProps {
  title: string;
  description: string;
}

interface FeatureTableShellProps {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

const CLINICAL_FEATURE_TABS: ClinicalFeatureTab[] = [
  {
    id: 'initial-screening',
    label: 'Skrining Awal',
    disabled: false,
  },
  {
    id: 'labor-monitoring',
    label: 'Pemantauan Persalinan',
    disabled: false,
  },
  {
    id: 'actions',
    label: 'Tindakan',
    disabled: true,
  },
  {
    id: 'delivery-outcome',
    label: 'Luaran Persalinan',
    disabled: true,
  },
  {
    id: 'newborn-outcome',
    label: 'Luaran Kelahiran Bayi',
    disabled: true,
  },
];

function getTabIcon(tabId: ClinicalFeatureTabId) {
  if (tabId === 'initial-screening') {
    return <FactCheckOutlinedIcon aria-hidden="true" fontSize="small" />;
  }

  if (tabId === 'labor-monitoring') {
    return <MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />;
  }

  if (tabId === 'actions') {
    return <MedicalServicesOutlinedIcon aria-hidden="true" fontSize="small" />;
  }

  if (tabId === 'delivery-outcome') {
    return <TaskAltOutlinedIcon aria-hidden="true" fontSize="small" />;
  }

  return <LockOutlinedIcon aria-hidden="true" fontSize="small" />;
}

function EmptyFeatureState({ description, title }: EmptyFeatureStateProps) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
      <div>
        <h4 className="text-base font-semibold text-slate-950">{title}</h4>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FeatureTableShell({ action, children, description, title }: FeatureTableShellProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </Card>
  );
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

function ScreeningLabelList({ emptyMessage, labels }: { labels: string[]; emptyMessage: string }) {
  if (labels.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
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

function InitialScreeningDetailContent({
  initialScreening,
  patientId,
}: {
  patientId: number;
  initialScreening: InitialScreening | null;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreateInitialScreening = hasPermission(user, PERMISSIONS.SCREENINGS_CREATE);

  function handleCreateInitialScreening() {
    void navigate(`/patients/${patientId}/initial-screening/create`);
  }

  if (!initialScreening) {
    return (
      <FeatureTableShell
        title="Skrining Awal"
        description="Skrining Awal wajib diisi sebelum alur klinis berikutnya aktif."
        action={
          canCreateInitialScreening ? (
            <Button
              type="button"
              leadingIcon={<AddOutlinedIcon aria-hidden="true" fontSize="small" />}
              onClick={handleCreateInitialScreening}
            >
              Isi Skrining Awal
            </Button>
          ) : null
        }
      >
        <EmptyFeatureState
          title="Skrining Awal belum diisi"
          description="Isi Skrining Awal terlebih dahulu agar hasil risiko, faktor risiko, dan rekomendasi backend dapat tampil."
        />
      </FeatureTableShell>
    );
  }

  const previousPregnancyLabels = getActivePreviousPregnancyHistoryLabels(
    initialScreening.previous_pregnancy_history,
  );
  const comorbidityLabels = getActiveComorbidityLabels(initialScreening.comorbidities);
  const previousDeliveryLabels = getActivePreviousDeliveryHistoryLabels(
    initialScreening.previous_delivery_history,
  );

  return (
    <FeatureTableShell
      title="Skrining Awal"
      description="Detail lengkap hasil Skrining Awal pasien. Data risiko dan rekomendasi dihitung oleh backend."
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Rekomendasi Backend</p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {initialScreening.recommendation}
              </p>
            </div>

            <RiskBadge riskStatus={initialScreening.risk_status} />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
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

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
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

                <td className="whitespace-nowrap px-4 py-4">
                  {initialScreening.pulse_rate} x/menit
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {initialScreening.respiratory_rate} x/menit
                </td>

                <td className="whitespace-nowrap px-4 py-4">{initialScreening.temperature_c} °C</td>

                <td className="whitespace-nowrap px-4 py-4">
                  {initialScreening.oxygen_saturation}%
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  G{initialScreening.gravida} / P{initialScreening.parity} / A
                  {initialScreening.abortus}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {initialScreening.gestational_age_weeks} minggu
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
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
                emptyMessage="Tidak ada penyekit penyerta."
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

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Keadaan Umum</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {initialScreening.general_condition}
          </p>
        </div>

        {initialScreening.notes ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Catatan</p>

            <p className="mt-2 text-sm leading-6 text-slate-600">{initialScreening.notes}</p>
          </div>
        ) : null}

        <p className="text-xs font-medium text-slate-400">
          Skrining dibuat pada {formatDateTime(initialScreening.created_at)}
        </p>
      </div>
    </FeatureTableShell>
  );
}

function LaborMonitoringTable({ hasInitialScreening }: { hasInitialScreening: boolean }) {
  if (!hasInitialScreening) {
    return (
      <EmptyFeatureState
        title="Pemantauan Persalinan belum aktif"
        description="Pemantauan Persalinan baru aktif setelah Skrining Awal pasien selesai dibuat."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-left">
        <thead className="bg-slate-50">
          <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Waktu</th>
            <th className="px-4 py-3">Keadaan Ibu</th>
            <th className="px-4 py-3">DJJ</th>
            <th className="px-4 py-3">Kontraksi</th>
            <th className="px-4 py-3">Ketuban</th>
            <th className="px-4 py-3">Catatan</th>
          </tr>
        </thead>

        <tbody className="bg-white">
          <tr>
            <td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-500">
              <p className="font-semibold text-slate-800">Belum ada pemantauan</p>

              <p className="mt-2">
                Tambahkan catatan pemantauan pertama untuk pasien ini setelah API Pemantauan
                Persalinan tersedia.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LockedTable({ description, title }: { title: string; description: string }) {
  return <EmptyFeatureState title={title} description={description} />;
}

export function PatientClinicalFeatureTabs({
  hasInitialScreening,
  initialScreening,
  patientId,
}: PatientClinicalFeatureTabsProps) {
  const [activeTab, setActiveTab] = useState<ClinicalFeatureTabId>('initial-screening');

  const tabs = CLINICAL_FEATURE_TABS.map((tab) => {
    if (tab.id === 'labor-monitoring') {
      return {
        ...tab,
        disabled: !hasInitialScreening,
      };
    }

    return tab;
  });

  const selectedTab = tabs.find((tab) => tab.id === activeTab);
  const safeActiveTab = selectedTab && !selectedTab.disabled ? selectedTab.id : 'initial-screening';

  function handleSelectTab(tab: ClinicalFeatureTab) {
    if (tab.disabled) {
      return;
    }

    setActiveTab(tab.id);
  }

  function renderContent() {
    if (safeActiveTab === 'initial-screening') {
      return (
        <InitialScreeningDetailContent patientId={patientId} initialScreening={initialScreening} />
      );
    }

    if (safeActiveTab === 'labor-monitoring') {
      return (
        <FeatureTableShell
          title="Pemantauan Persalinan"
          description="Catatan berkala kondisi ibu, janin, kontraksi, ketuban, urine, dan perkembangan persalinan."
          action={
            <Button
              type="button"
              disabled
              leadingIcon={<AddOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Tambah Pemantauan
            </Button>
          }
        >
          <LaborMonitoringTable hasInitialScreening={hasInitialScreening} />
        </FeatureTableShell>
      );
    }

    if (safeActiveTab === 'actions') {
      return (
        <FeatureTableShell
          title="Tindakan"
          description="Daftar tindakan klinis pasien akan ditampilkan di sini."
        >
          <LockedTable
            title="Tindakan belum aktif"
            description="Fitur tindakan akan diaktifkan setelah alur pemantauan persalinan siap."
          />
        </FeatureTableShell>
      );
    }

    if (safeActiveTab === 'delivery-outcome') {
      return (
        <FeatureTableShell
          title="Luaran Persalinan"
          description="Data luaran persalinan pasien akan ditampilkan di sini."
        >
          <LockedTable
            title="Luaran Persalinan belum aktif"
            description="Fitur ini menunggu proses persalinan dan data pendukung tersedia."
          />
        </FeatureTableShell>
      );
    }

    return (
      <FeatureTableShell
        title="Luaran Kelahiran Bayi"
        description="Data luaran kelahiran bayi akan ditampilkan di sini."
      >
        <LockedTable
          title="Luaran Kelahiran Bayi belum aktif"
          description="Fitur ini akan aktif setelah luaran persalinan dan data bayi tersedia."
        />
      </FeatureTableShell>
    );
  }

  return (
    <div id="initial-screening-detail" className="space-y-5 scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid md:grid-cols-5">
          {tabs.map((tab) => {
            const isActive = safeActiveTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => handleSelectTab(tab)}
                className={[
                  'flex min-h-14 items-center justify-center gap-2 border-b px-4 text-sm font-semibold transition md:border-b-0 md:border-r md:last:border-r-0',
                  isActive
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  tab.disabled
                    ? 'cursor-not-allowed bg-slate-50 text-slate-400 hover:bg-slate-50 hover:text-slate-400'
                    : '',
                ].join(' ')}
              >
                <span className="hidden text-brand-600 lg:inline-flex">{getTabIcon(tab.id)}</span>

                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
