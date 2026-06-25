import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/api-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { getInitialScreenings } from '@/features/initial-screenings/api/initial-screening.api';
import { INITIAL_SCREENING_RISK_STATUS_LABELS } from '@/features/initial-screenings/constants/initial-screening-options';
import type {
  InitialScreening,
  InitialScreeningRiskStatus,
  InitialScreeningListResult,
} from '@/features/initial-screenings/types/initial-screening.types';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';
import { formatDateTime, getPatientDetailPath } from '@/features/patients/lib/patient-format';

const DEFAULT_PER_PAGE = 10;

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat data Skrining.';
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

function getPatientName(screening: InitialScreening) {
  return screening.patient?.name ?? `Pasien #${screening.patient_id}`;
}

function getPatientAge(screening: InitialScreening) {
  if (typeof screening.patient?.age === 'number') {
    return `${screening.patient.age} tahun`;
  }

  return '-';
}

function getPatientLocation(screening: InitialScreening) {
  if (!screening.patient?.location) {
    return '-';
  }

  return getPatientLocationLabel(screening.patient.location);
}

function getClinicalStageLabel() {
  return 'Skrining Awal';
}

export function InitialScreeningsPage() {
  const navigate = useNavigate();

  const [result, setResult] = useState<InitialScreeningListResult | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadInitialScreenings() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getInitialScreenings({
          search: appliedSearch,
          page,
          perPage: DEFAULT_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setResult(response);
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setResult(null);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialScreenings();

    return () => {
      isActive = false;
    };
  }, [appliedSearch, page, reloadKey]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }

  function handleResetSearch() {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  }

  function handleRefresh() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleOpenDetail(screening: InitialScreening) {
    void navigate(getPatientDetailPath(screening.patient_id));
  }

  const initialScreenings = result?.initialScreenings ?? [];
  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Data Skrining</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Pasien yang Sudah Skrining
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Daftar pasien yang sudah memiliki Skrining Awal. Detail pasien akan menampilkan alur
            klinis mulai dari Skrining Awal, Pemantauan Persalinan, Tindakan, Luaran Persalinan,
            hingga Luaran Kelahiran Bayi.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          leadingIcon={<RefreshOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </section>

      <Card>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="relative w-full md:max-w-md">
            <SearchOutlinedIcon
              aria-hidden="true"
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama pasien atau nomor rekam medis..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Cari</Button>

            <Button type="button" variant="secondary" onClick={handleResetSearch}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <p className="text-sm text-slate-500">Memuat data Skrining...</p>
        ) : initialScreenings.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Belum ada data Skrining</h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Data akan tampil setelah pasien memiliki Skrining Awal.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Nama Pasien</th>
                  <th className="px-4 py-3">Usia</th>
                  <th className="px-4 py-3">Skrining Terakhir</th>
                  <th className="px-4 py-3">Lokasi Layanan</th>
                  <th className="px-4 py-3">Status Risiko</th>
                  <th className="px-4 py-3">Tahapan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {initialScreenings.map((screening) => (
                  <tr key={screening.id} className="text-sm">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{getPatientName(screening)}</p>

                      <p className="mt-1 text-xs text-slate-500">
                        {screening.patient?.medical_record_number ??
                          `Patient ID ${screening.patient_id}`}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {getPatientAge(screening)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDateTime(screening.updated_at)}
                    </td>

                    <td className="min-w-56 px-4 py-4 text-slate-600">
                      {getPatientLocation(screening)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <RiskBadge riskStatus={screening.risk_status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        {getClinicalStageLabel()}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        leadingIcon={<VisibilityOutlinedIcon aria-hidden="true" fontSize="small" />}
                        onClick={() => handleOpenDetail(screening)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Menampilkan {initialScreenings.length} dari {meta.total} data.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Sebelumnya
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={!meta.last_page || page >= meta.last_page || isLoading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
