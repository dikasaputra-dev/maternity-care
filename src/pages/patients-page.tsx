import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { getPatients } from '@/features/patients/api/patient.api';
import { PatientListTable } from '@/features/patients/components/patient-list-table';
import { getPatientDetailPath } from '@/features/patients/lib/patient-format';
import type { PatientListRouteState } from '@/features/patients/types/patient-route-state.types';
import type { PatientListResult } from '@/features/patients/types/patient.types';

const PATIENTS_PER_PAGE = 10;

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat data pasien.';
}

function parsePatientListRouteState(value: unknown): PatientListRouteState {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const state = value as Record<string, unknown>;

  return {
    shouldRefreshPatients: state.shouldRefreshPatients === true,
    flashMessage: typeof state.flashMessage === 'string' ? state.flashMessage : undefined,
  };
}

export function PatientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [patientResult, setPatientResult] = useState<PatientListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlashMessageDismissed, setIsFlashMessageDismissed] = useState(false);

  const canCreatePatient = hasPermission(user, PERMISSIONS.PATIENTS_CREATE);
  const canViewPatient = hasPermission(user, PERMISSIONS.PATIENTS_VIEW);

  const routeState = parsePatientListRouteState(location.state);

  const flashMessage = isFlashMessageDismissed ? null : (routeState.flashMessage ?? null);

  const patients = patientResult?.patients ?? [];
  const meta = patientResult?.meta;

  const currentPage = meta?.current_page ?? page;
  const lastPage = Math.max(meta?.last_page ?? 1, 1);
  const totalPatients = meta?.total ?? 0;

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < lastPage && !isLoading;

  useEffect(() => {
    let isActive = true;

    async function loadPatientsSafely() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getPatients({
          search: appliedSearch,
          page,
          perPage: PATIENTS_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setPatientResult(result);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setPatientResult(null);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPatientsSafely();

    return () => {
      isActive = false;
    };
  }, [appliedSearch, page, reloadKey]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function handleResetSearch() {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
    setReloadKey((current) => current + 1);
  }

  function handleRefresh() {
    setReloadKey((current) => current + 1);
  }

  function handleCreatePatient() {
    void navigate(APP_PATHS.PATIENT_CREATE);
  }

  function handleOpenDetail(patientId: number) {
    void navigate(getPatientDetailPath(patientId));
  }

  function handleDismissFlashMessage() {
    setIsFlashMessageDismissed(true);

    void navigate(location.pathname, {
      replace: true,
      state: null,
    });
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

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Daftar pasien
          </h2>
        </div>

        {canCreatePatient ? (
          <Button
            leadingIcon={<AddOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleCreatePatient}
          >
            Tambah Pasien
          </Button>
        ) : null}
      </section>

      <Card>
        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <Input
            label="Cari pasien"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari berdasarkan nama pasien"
          />

          <div className="flex items-end">
            <Button
              type="submit"
              variant="secondary"
              className="w-full md:w-auto"
              leadingIcon={<SearchOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Cari
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-auto"
              onClick={handleResetSearch}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Tabel pasien</h3>

            <p className="mt-1 text-sm text-slate-500">Total data: {totalPatients}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            isLoading={isLoading}
            leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleRefresh}
          >
            Muat Ulang
          </Button>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        <PatientListTable
          patients={patients}
          isLoading={isLoading}
          errorMessage={errorMessage}
          canViewPatient={canViewPatient}
          onOpenDetail={handleOpenDetail}
        />

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Halaman {currentPage} dari {lastPage}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canGoPrevious}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Sebelumnya
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={!canGoNext}
              onClick={() => setPage((current) => Math.min(current + 1, lastPage))}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
