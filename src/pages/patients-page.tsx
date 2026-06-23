import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form-controls';
import { Badge, Card } from '@/components/ui/surface';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { getPatients } from '@/features/patients/api/patient.api';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';
import {
  formatDate,
  getPatientCreatorLabel,
  getPatientDetailPath,
} from '@/features/patients/lib/patient-format';
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

export function PatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [patientResult, setPatientResult] = useState<PatientListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canCreatePatient = hasPermission(user, PERMISSIONS.PATIENTS_CREATE);
  const canViewPatient = hasPermission(user, PERMISSIONS.PATIENTS_VIEW);

  const patients = patientResult?.patients ?? [];
  const meta = patientResult?.meta;

  const currentPage = meta?.current_page ?? page;
  const lastPage = Math.max(meta?.last_page ?? 1, 1);
  const totalPatients = meta?.total ?? 0;

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < lastPage && !isLoading;

  useEffect(() => {
    let isActive = true;

    async function loadPatients() {
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

    void loadPatients();

    return () => {
      isActive = false;
    };
  }, [appliedSearch, page]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function handleResetSearch() {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  }

  function handleRefresh() {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function handleCreatePatient() {
    void navigate(APP_PATHS.PATIENT_CREATE);
  }

  function handleOpenDetail(patientId: number) {
    void navigate(getPatientDetailPath(patientId));
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Data Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Daftar pasien
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Data pasien diambil langsung dari backend. Tidak ada lagi dummy data atau sessionStorage
            untuk daftar pasien.
          </p>
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

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="whitespace-nowrap px-4 py-3">Nomor RM</th>
                <th className="whitespace-nowrap px-4 py-3">Nama</th>
                <th className="whitespace-nowrap px-4 py-3">Tanggal Lahir</th>
                <th className="whitespace-nowrap px-4 py-3">Lokasi</th>
                <th className="whitespace-nowrap px-4 py-3">Dibuat Oleh</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Memuat data pasien...
                  </td>
                </tr>
              ) : null}

              {!isLoading && !errorMessage && patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    Belum ada data pasien.
                  </td>
                </tr>
              ) : null}

              {!isLoading && !errorMessage
                ? patients.map((patient) => (
                    <tr key={patient.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                        {patient.medical_record_number}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                        {patient.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(patient.date_of_birth)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        <Badge tone="neutral">{getPatientLocationLabel(patient.location)}</Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {getPatientCreatorLabel(patient)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        {canViewPatient ? (
                          <Button
                            type="button"
                            variant="secondary"
                            leadingIcon={
                              <VisibilityOutlinedIcon aria-hidden="true" fontSize="small" />
                            }
                            onClick={() => handleOpenDetail(patient.id)}
                          >
                            Detail
                          </Button>
                        ) : (
                          <span className="text-sm text-slate-400">Tidak tersedia</span>
                        )}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

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
