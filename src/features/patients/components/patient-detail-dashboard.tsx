import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BabyChangingStationOutlinedIcon from '@mui/icons-material/BabyChangingStationOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SensorOccupiedOutlinedIcon from '@mui/icons-material/SensorOccupiedOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/surface';
import { INITIAL_SCREENING_RISK_STATUS_LABELS } from '@/features/initial-screenings/constants/initial-screening-options';
import type {
  InitialScreening,
  InitialScreeningRiskStatus,
} from '@/features/initial-screenings/types/initial-screening.types';
import {
  getPatientEducationLabel,
  getPatientLocationLabel,
  getPatientReligionLabel,
} from '@/features/patients/constants/patient-options';
import { formatDate, formatDateTime } from '@/features/patients/lib/patient-format';
import type { Patient } from '@/features/patients/types/patient.types';
import { PatientClinicalFeatureTabs } from '@/features/patients/components/patient-clinical-feature-tabs';
import { LatestLaborMonitoringSummaryCard } from '@/features/labor-monitorings/components/latest-labor-monitoring-summary-card';

interface PatientDetailDashboardProps {
  patient: Patient;
  initialScreening: InitialScreening | null;
  hasInitialScreening: boolean;
}

interface PatientInfoItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

interface ScreeningSummaryItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function getAgeNumber(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function formatDateOfBirthWithAge(dateOfBirth: string) {
  const formattedDate = formatDate(dateOfBirth);
  const age = getAgeNumber(dateOfBirth);

  if (age === null) {
    return formattedDate;
  }

  return `${formattedDate} (${age} Tahun)`;
}

function getPhoneLabel(phoneNumber: string | null) {
  return phoneNumber?.trim() ? phoneNumber : '-';
}

function getCreatorName(name: string | undefined) {
  return name?.trim() ? name : '-';
}

function RiskBadge({ riskStatus }: { riskStatus: InitialScreeningRiskStatus | null }) {
  if (!riskStatus) {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
        Belum Skrining
      </span>
    );
  }

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

function PatientInfoItem({ icon, label, value }: PatientInfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="mt-1 wrap-break-word text-sm font-semibold leading-6 text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function ScreeningSummaryItem({ icon, label, value }: ScreeningSummaryItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
        {icon}
      </span>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>

        <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function InitialScreeningInsightCard({
  initialScreening,
}: {
  initialScreening: InitialScreening | null;
}) {
  if (!initialScreening) {
    return (
      <Card>
        <div className="flex h-full flex-col">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <MedicalInformationOutlinedIcon aria-hidden="true" fontSize="small" />
            </span>

            <div>
              <h3 className="text-lg font-semibold text-slate-950">Hasil Skrining Awal</h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ringkasan klinis akan tampil setelah Skrining Awal pasien dibuat.
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-800">Belum ada Skrining Awal</p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nurse belum dapat melihat status risiko, faktor risiko, dan rekomendasi sampai
              Skrining Awal disimpan.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <MedicalInformationOutlinedIcon aria-hidden="true" fontSize="small" />
            </span>

            <div>
              <h3 className="text-lg font-semibold text-slate-950">Hasil Skrining Awal</h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ringkasan cepat hasil pengkajian awal pasien.
              </p>
            </div>
          </div>

          <RiskBadge riskStatus={initialScreening.risk_status} />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <ScreeningSummaryItem
            icon={<PregnantWomanOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Gravida"
            value={initialScreening.gravida}
          />

          <ScreeningSummaryItem
            icon={<ChildCareOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Paritas"
            value={initialScreening.parity}
          />

          <ScreeningSummaryItem
            icon={<HealingOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Abortus"
            value={initialScreening.abortus}
          />

          <ScreeningSummaryItem
            icon={<BabyChangingStationOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Usia Hamil"
            value={`${initialScreening.gestational_age_weeks} minggu`}
          />

          <ScreeningSummaryItem
            icon={<MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Tekanan Darah"
            value={`${initialScreening.systolic_bp}/${initialScreening.diastolic_bp} mmHg`}
          />

          <ScreeningSummaryItem
            icon={<FavoriteBorderOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Nadi"
            value={`${initialScreening.pulse_rate} x/menit`}
          />

          <ScreeningSummaryItem
            icon={<SpeedOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="SpO₂"
            value={`${initialScreening.oxygen_saturation}%`}
          />

          <ScreeningSummaryItem
            icon={<ThermostatOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Suhu"
            value={`${initialScreening.temperature_c} °C`}
          />
        </div>

        <p className="mt-auto pt-5 text-xs font-medium text-slate-400">
          Skrining dibuat pada {formatDateTime(initialScreening.created_at)}
        </p>
      </div>
    </Card>
  );
}

export function PatientDetailDashboard({
  hasInitialScreening,
  initialScreening,
  patient,
}: PatientDetailDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.95fr)]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Nomor Rekam Medis</p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {patient.medical_record_number}
              </h2>
            </div>

            <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              {getPatientLocationLabel(patient.location)}
            </span>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            <PatientInfoItem
              icon={<PersonOutlineOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Nama Pasien"
              value={patient.name}
            />

            <PatientInfoItem
              icon={<CakeOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Tanggal Lahir"
              value={formatDateOfBirthWithAge(patient.date_of_birth)}
            />

            <PatientInfoItem
              icon={<SensorOccupiedOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Agama"
              value={getPatientReligionLabel(patient.religion)}
            />

            <PatientInfoItem
              icon={<SchoolOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Pendidikan"
              value={getPatientEducationLabel(patient.education)}
            />

            <PatientInfoItem
              icon={<WorkOutlineOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Pekerjaan"
              value={patient.occupation}
            />

            <PatientInfoItem
              icon={<SensorOccupiedOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Ras/Suku"
              value={patient.ethnicity}
            />

            <PatientInfoItem
              icon={<PhoneOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Nomor Telepon"
              value={getPhoneLabel(patient.phone_number)}
            />

            <PatientInfoItem
              icon={<HomeOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Alamat Tempat Tinggal"
              value={patient.address}
            />

            <PatientInfoItem
              icon={<LocationOnOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Lokasi Pelayanan"
              value={getPatientLocationLabel(patient.location)}
            />

            <PatientInfoItem
              icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Dibuat Oleh"
              value={getCreatorName(patient.creator?.name)}
            />

            <PatientInfoItem
              icon={<CalendarMonthOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Tanggal Dibuat"
              value={formatDateTime(patient.created_at)}
            />

            <PatientInfoItem
              icon={<UpdateOutlinedIcon aria-hidden="true" fontSize="small" />}
              label="Terakhir Diperbarui"
              value={formatDateTime(patient.updated_at)}
            />
          </div>
        </Card>
        <InitialScreeningInsightCard initialScreening={initialScreening} />
      </div>

      <PatientClinicalFeatureTabs
        patientId={patient.id}
        hasInitialScreening={hasInitialScreening}
        initialScreening={initialScreening}
      />
      <LatestLaborMonitoringSummaryCard
        patientId={patient.id}
        hasInitialScreening={hasInitialScreening}
      />
    </div>
  );
}
