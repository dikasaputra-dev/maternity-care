import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { getPatientDetail } from '@/features/patients/api/patient.api';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';
import {
  formatDate,
  formatDateTime,
  getPatientCreatorLabel,
} from '@/features/patients/lib/patient-format';
import type { Patient } from '@/features/patients/types/patient.types';

interface PatientInfoItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function PatientInfoItem({ icon, label, value }: PatientInfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat detail pasien.';
}

function parsePatientId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

export function PatientDetailPage() {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = parsePatientId(params.patientId);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPatientDetail() {
      if (!patientId) {
        setIsLoading(false);
        setIsNotFound(true);
        setPatient(null);

        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

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
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPatientDetail();

    return () => {
      isActive = false;
    };
  }, [patientId]);

  function handleBack() {
    void navigate(APP_PATHS.PATIENTS);
  }

  function handleRefresh() {
    if (!patientId) {
      return;
    }

    setPatient(null);
    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    void getPatientDetail(patientId)
      .then((result) => {
        setPatient(result);
      })
      .catch((error: unknown) => {
        setPatient(null);

        if (error instanceof ApiError && error.status === 404) {
          setIsNotFound(true);
        } else {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Memuat detail pasien...</p>
      </Card>
    );
  }

  if (isNotFound) {
    return (
      <Card>
        <div className="max-w-xl">
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
            Kembali ke Daftar Pasien
          </Button>
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card>
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-950">Gagal memuat detail pasien</h2>

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

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Detail Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informasi pasien ini berasal langsung dari backend.
          </p>
        </div>

        <Button
          variant="secondary"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </section>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Nomor Rekam Medis</p>

            <p className="mt-1 text-xl font-semibold text-slate-950">
              {patient.medical_record_number}
            </p>
          </div>

          <Badge tone="info">{getPatientLocationLabel(patient.location)}</Badge>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <PatientInfoItem
            icon={<PersonOutlineIcon aria-hidden="true" fontSize="small" />}
            label="Nama Pasien"
            value={patient.name}
          />

          <PatientInfoItem
            icon={<CalendarMonthOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Tanggal Lahir"
            value={formatDate(patient.date_of_birth)}
          />

          <PatientInfoItem
            icon={<LocationOnOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Lokasi"
            value={getPatientLocationLabel(patient.location)}
          />

          <PatientInfoItem
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Dibuat Oleh"
            value={getPatientCreatorLabel(patient)}
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

      <Card>
        <h3 className="text-base font-semibold text-slate-950">Status integrasi klinis</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Data skrining, status risiko, pemantauan persalinan, dan laporan belum dipanggil pada
          phase ini. Integrasi tersebut akan dilakukan setelah list dan detail pasien stabil.
        </p>
      </Card>
    </div>
  );
}
