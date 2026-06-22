import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PregnantWomanOutlinedIcon from '@mui/icons-material/PregnantWomanOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

import {
  formatBloodPressure,
  formatFetalWeight,
  formatGestationalAge,
  formatNullableNumber,
  formatPatientDateTime,
} from '@/features/patients/lib/patient-format';
import { Card } from '@/components/ui/surface';
import { PatientRiskBadge } from '@/features/patients/components/patient-risk-badge';
import type { Patient } from '@/features/patients/types/patient.types';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PatientDetailSummaryProps {
  patient: Patient;
}

interface PatientInfoItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}

interface ObstetricInfoItemProps {
  label: string;
  value: string;
}

function PatientInfoItem({ className, icon, label, value }: PatientInfoItemProps) {
  return (
    <div
      className={cn(
        'flex min-h-24 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4',
        className,
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-brand-100">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>

        <p className="mt-1 wrap-break-word text-sm font-semibold leading-6 text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function ObstetricInfoItem({ label, value }: ObstetricInfoItemProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{value}</p>
    </div>
  );
}

export function PatientDetailSummary({ patient }: PatientDetailSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <Card>
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {patient.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PatientRiskBadge riskStatus={patient.riskStatus} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <PatientInfoItem
            label="Nomor Rekam Medis"
            value={patient.medicalRecordNumber}
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
          />

          <PatientInfoItem
            label="Lokasi"
            value={getPatientLocationLabel(patient.location)}
            icon={<LocationOnOutlinedIcon aria-hidden="true" fontSize="small" />}
          />

          <PatientInfoItem
            label="Terdaftar"
            value={formatPatientDateTime(patient.registeredAt)}
            icon={<CalendarMonthOutlinedIcon aria-hidden="true" fontSize="small" />}
          />

          <PatientInfoItem
            label="Usia"
            value={`${patient.age} tahun`}
            icon={<PersonOutlineIcon aria-hidden="true" fontSize="small" />}
          />

          <PatientInfoItem
            label="Nomor Telepon"
            value={patient.phoneNumber}
            icon={<PhoneOutlinedIcon aria-hidden="true" fontSize="small" />}
          />

          <PatientInfoItem
            label="Alamat"
            value={patient.address}
            className="md:col-span-2 lg:col-span-1"
            icon={<HomeOutlinedIcon aria-hidden="true" fontSize="small" />}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <PregnantWomanOutlinedIcon aria-hidden="true" />
              </span>

              <div>
                <h3 className="text-base font-semibold text-slate-950">Ringkasan Obstetri</h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Data ini akan terisi setelah skrining awal dilakukan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ObstetricInfoItem
            label="Gravida"
            value={formatNullableNumber(patient.obstetricSummary.gravida)}
          />

          <ObstetricInfoItem
            label="Partus"
            value={formatNullableNumber(patient.obstetricSummary.partus)}
          />

          <ObstetricInfoItem
            label="Abortus"
            value={formatNullableNumber(patient.obstetricSummary.abortus)}
          />

          <ObstetricInfoItem
            label="Usia Hamil"
            value={formatGestationalAge(patient.obstetricSummary.gestationalAgeWeeks)}
          />

          <ObstetricInfoItem
            label="Tekanan Darah"
            value={formatBloodPressure(patient.obstetricSummary.bloodPressure)}
          />

          <ObstetricInfoItem
            label="TBJ"
            value={formatFetalWeight(patient.obstetricSummary.estimatedFetalWeightGram)}
          />
        </div>
      </Card>
    </div>
  );
}
