import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { getPatientInitialScreening } from '@/features/initial-screenings/api/initial-screening.api';
import type { InitialScreening } from '@/features/initial-screenings/types/initial-screening.types';
import { PatientDetailDashboard } from '@/features/patients/components/patient-detail-dashboard';
import { deletePatient, getPatientDetail } from '@/features/patients/api/patient.api';
import type {
  PatientDetailRouteState,
  PatientListRouteState,
} from '@/features/patients/types/patient-route-state.types';
import type { Patient } from '@/features/patients/types/patient.types';

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
  const [initialScreening, setInitialScreening] = useState<InitialScreening | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialScreeningErrorMessage, setInitialScreeningErrorMessage] = useState<string | null>(
    null,
  );

  const [flashMessage, setFlashMessage] = useState<string | null>(routeState.flashMessage ?? null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const hasInitialScreening = initialScreening !== null;

  useEffect(() => {
    let isActive = true;

    async function loadPatientDetail() {
      if (!patientId) {
        setIsLoading(false);
        setIsNotFound(true);
        setPatient(null);
        setInitialScreening(null);
        setInitialScreeningErrorMessage(null);

        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setInitialScreeningErrorMessage(null);
      setIsNotFound(false);
      setPatient(null);
      setInitialScreening(null);

      try {
        const patientResult = await getPatientDetail(patientId);

        if (!isActive) {
          return;
        }

        setPatient(patientResult);

        try {
          const initialScreeningResult = await getPatientInitialScreening(patientResult.id);

          if (!isActive) {
            return;
          }

          setInitialScreening(initialScreeningResult);
          setInitialScreeningErrorMessage(null);
        } catch (error: unknown) {
          if (!isActive) {
            return;
          }

          setInitialScreening(null);

          if (error instanceof ApiError && error.status === 404) {
            setInitialScreeningErrorMessage(null);
            return;
          }

          setInitialScreeningErrorMessage(getErrorMessage(error));
        }
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setPatient(null);
        setInitialScreening(null);
        setInitialScreeningErrorMessage(null);

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
  }, [patientId, refreshKey]);

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
    setRefreshKey((currentKey) => currentKey + 1);
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

      {initialScreeningErrorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Detail pasien berhasil dimuat, tetapi data Skrining Awal belum bisa dimuat.{' '}
          {initialScreeningErrorMessage}
        </div>
      ) : null}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Detail Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ringkasan identitas, status Skrining Awal, dan alur klinis pasien.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canUpdatePatient ? (
            <Button
              type="button"
              variant="secondary"
              leadingIcon={<EditOutlinedIcon aria-hidden="true" fontSize="small" />}
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
              leadingIcon={<DeleteOutlineOutlinedIcon aria-hidden="true" fontSize="small" />}
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

      <PatientDetailDashboard
        patient={patient}
        hasInitialScreening={hasInitialScreening}
        initialScreening={initialScreening}
      />
    </div>
  );
}
