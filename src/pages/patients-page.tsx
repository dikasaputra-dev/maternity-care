import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/surface';
import { PermissionGate } from '@/features/auth/components/permission-gate';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { PatientTable } from '@/features/patients/components/patient-table';
import { filterPatients } from '@/features/patients/lib/patient-filter';
import { listPatients } from '@/features/patients/lib/patient-query';
import { getPatientDetailPath } from '@/features/patients/lib/patient-routes';
import type {
  PatientFilterState,
  PatientRiskStatus,
} from '@/features/patients/types/patient.types';

const initialFilters: PatientFilterState = {
  search: '',
  riskStatus: 'all',
};

export function PatientsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PatientFilterState>(initialFilters);
  const [patients] = useState(() => listPatients());

  const filteredPatients = useMemo(() => filterPatients(patients, filters), [filters, patients]);

  function handleSearchChange(value: string) {
    setFilters((current) => ({
      ...current,
      search: value,
    }));
  }

  function handleRiskFilterChange(value: PatientRiskStatus | 'all') {
    setFilters((current) => ({
      ...current,
      riskStatus: value,
    }));
  }

  function handleOpenDetail(patientId: string) {
    void navigate(getPatientDetailPath(patientId));
  }

  function handleCreatePatient() {
    void navigate(APP_PATHS.PATIENT_CREATE);
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
            Kelola akses awal ke data pasien. Perawat dapat melihat dan menambahkan data, tetapi
            tidak dapat mengedit atau menghapus data yang sudah tersimpan.
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.PATIENTS_CREATE}>
          <Button
            leadingIcon={<AddOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleCreatePatient}
          >
            Tambah Pasien
          </Button>
        </PermissionGate>
      </section>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <Input
            label="Cari pasien"
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Cari nama atau nomor rekam medis"
          />

          <Select
            label="Status risiko"
            value={filters.riskStatus}
            onChange={(event) =>
              handleRiskFilterChange(event.target.value as PatientRiskStatus | 'all')
            }
          >
            <option value="all">Semua risiko</option>
            <option value="unknown">Belum skrining</option>
            <option value="low">Risiko rendah</option>
            <option value="medium">Risiko sedang</option>
            <option value="high">Risiko tinggi</option>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Pasien terdaftar</h3>

            <p className="text-sm text-slate-500">
              {filteredPatients.length} dari {patients.length} pasien ditampilkan.
            </p>
          </div>
        </div>

        {filteredPatients.length > 0 ? (
          <PatientTable patients={filteredPatients} onOpenDetail={handleOpenDetail} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">Data pasien tidak ditemukan</p>

            <p className="mt-1 text-sm text-slate-500">
              Coba ubah kata kunci pencarian atau filter risiko.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
