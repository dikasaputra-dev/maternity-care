import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { deletePatient, getPatientDetail } from '@/features/patients/api/patient.api';
import {
  getPatientEducationLabel,
  getPatientLocationLabel,
  getPatientReligionLabel,
} from '@/features/patients/constants/patient-options';
import {
  formatDate,
  formatDateTime,
  getPatientCreatorLabel,
} from '@/features/patients/lib/patient-format';
import type {
  PatientDetailRouteState,
  PatientListRouteState,
} from '@/features/patients/types/patient-route-state.types';
import type { Patient } from '@/features/patients/types/patient.types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';
import { hasPermission } from '@/features/auth/lib/authorization';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { InitialScreeningStatusCard } from '@/features/initial-screenings/components/initial-screening-status-card';

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

        <div className="mt-1 wrap-break-word text-sm font-semibold leading-6 text-slate-900">
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

function parsePatientDetailRouteState(value: unknown): PatientDetailRouteState {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const state = value as Record<string, unknown>;

  return {
    fromCreate: state.fromCreate === true,
    flashMessage: typeof state.flashMessage === 'string' ? state.flashMessage : undefined,
  };
}

export function PatientDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();

  const routeState = parsePatientDetailRouteState(location.state);
  const patientId = parsePatientId(params.patientId);
  const canUpdatePatient = hasPermission(user, PERMISSIONS.PATIENTS_UPDATE);
  const canDeletePatient = hasPermission(user, PERMISSIONS.PATIENTS_DELETE);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(routeState.flashMessage ?? null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

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
    const state: PatientListRouteState = {
      shouldRefreshPatients: routeState.fromCreate,
      flashMessage: routeState.fromCreate ? 'Daftar pasien telah diperbarui.' : undefined,
    };

    void navigate(APP_PATHS.PATIENTS, {
      state,
    });
  }

  function handleDismissFlashMessage() {
    setFlashMessage(null);
  }

  function handleEditPatient() {
    if (!patientId) {
      return;
    }

    void navigate(`/patients/${patientId}/edit`);
  }

  async function performDeletePatient() {
    if (!patientId || !patient) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus data pasien ${patient.name}? Tindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await deletePatient(patientId);

      void navigate(APP_PATHS.PATIENTS, {
        replace: true,
        state: {
          shouldRefreshPatients: true,
          flashMessage: 'Data pasien berhasil dihapus.',
        },
      });
    } catch (error: unknown) {
      setDeleteErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDeletePatient() {
    void performDeletePatient();
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
      {flashMessage ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{flashMessage}</p>

            <button
              type="button"
              onClick={handleDismissFlashMessage}
              className="text-left text-sm font-semibold text-emerald-800 hover:text-emerald-900"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}

      {deleteErrorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {deleteErrorMessage}
        </div>
      ) : null}

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

        <div className="flex flex-wrap gap-2">
          {canUpdatePatient ? (
            <Button
              type="button"
              variant="secondary"
              leadingIcon={<EditOutlined aria-hidden="true" fontSize="small" />}
              onClick={handleEditPatient}
            >
              Edit Pasien
            </Button>
          ) : null}

          {canDeletePatient ? (
            <Button
              type="button"
              variant="secondary"
              isLoading={isDeleting}
              leadingIcon={<DeleteOutlineOutlined aria-hidden="true" fontSize="small" />}
              onClick={handleDeletePatient}
            >
              Hapus Pasien
            </Button>
          ) : null}

          <Button
            variant="secondary"
            leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleBack}
          >
            Kembali
          </Button>
        </div>
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
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Agama"
            value={getPatientReligionLabel(patient.religion)}
          />

          <PatientInfoItem
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Pendidikan"
            value={getPatientEducationLabel(patient.education)}
          />

          <PatientInfoItem
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Pekerjaan"
            value={patient.occupation}
          />

          <PatientInfoItem
            icon={<BadgeOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Ras/Suku"
            value={patient.ethnicity}
          />

          <PatientInfoItem
            icon={<PhoneOutlinedIcon aria-hidden="true" fontSize="small" />}
            label="Nomor Telepon"
            value={patient.phone_number ?? '-'}
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

      <InitialScreeningStatusCard patientId={patient.id} />

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
