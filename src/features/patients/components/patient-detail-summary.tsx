import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';

import { Card } from '@/components/ui/surface';
import { PatientRiskBadge } from '@/features/patients/components/patient-risk-badge';
import type { Patient } from '@/features/patients/types/patient.types';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';

interface PatientDetailSummaryProps {
  patient: Patient;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatNullableNumber(value: number | null) {
  return value === null ? '-' : value.toString();
}

function formatGestationalAge(value: number | null) {
  return value === null ? '-' : `${value} minggu`;
}

function formatBloodPressure(value: string | null) {
  return value ?? '-';
}

function formatFetalWeight(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${value.toLocaleString('id-ID')} gram`;
}

export function PatientDetailSummary({ patient }: PatientDetailSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">{patient.medicalRecordNumber}</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {patient.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PatientRiskBadge riskStatus={patient.riskStatus} />
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm">
            <p className="font-semibold text-brand-800">{patient.age} tahun</p>

            <p className="mt-1 text-brand-700">Usia ibu</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <LocationOnOutlinedIcon
              aria-hidden="true"
              fontSize="small"
              className="mt-0.5 text-brand-600"
            />

            <div>
              <p className="text-sm font-medium text-slate-500">Lokasi</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {getPatientLocationLabel(patient.location)}
              </p>

              <p className="mt-1 text-sm text-slate-500">{patient.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PhoneOutlinedIcon
              aria-hidden="true"
              fontSize="small"
              className="mt-0.5 text-brand-600"
            />

            <div>
              <p className="text-sm font-medium text-slate-500">Nomor Telepon</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">{patient.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarMonthOutlinedIcon
              aria-hidden="true"
              fontSize="small"
              className="mt-0.5 text-brand-600"
            />

            <div>
              <p className="text-sm font-medium text-slate-500">Terdaftar</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDateTime(patient.registeredAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BadgeOutlinedIcon
              aria-hidden="true"
              fontSize="small"
              className="mt-0.5 text-brand-600"
            />

            <div>
              <p className="text-sm font-medium text-slate-500">Rekam Medis</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {patient.medicalRecordNumber}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <PregnantWomanOutlinedIcon aria-hidden="true" />
          </span>

          <div>
            <h3 className="text-base font-semibold text-slate-950">Ringkasan Obstetri</h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Data ini akan terisi setelah skrining awal dilakukan.
            </p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Gravida
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatNullableNumber(patient.obstetricSummary.gravida)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Partus</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatNullableNumber(patient.obstetricSummary.partus)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Abortus
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatNullableNumber(patient.obstetricSummary.abortus)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Usia Hamil
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatGestationalAge(patient.obstetricSummary.gestationalAgeWeeks)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">TD</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatBloodPressure(patient.obstetricSummary.bloodPressure)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">TBJ</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-950">
              {formatFetalWeight(patient.obstetricSummary.estimatedFetalWeightGram)}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
