import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPatientLocationLabel } from '@/features/patients/constants/patient-options';
import {
  getPatientAgeLabel,
  getPatientListCreatorLabel,
} from '@/features/patients/lib/patient-format';
import type { PatientListItem } from '@/features/patients/types/patient.types';

interface PatientListTableProps {
  patients: PatientListItem[];
  isLoading: boolean;
  errorMessage: string | null;
  canViewPatient: boolean;
  onOpenDetail: (patientId: number) => void;
}

const PATIENT_TABLE_COLUMN_COUNT = 6;

export function PatientListTable({
  canViewPatient,
  errorMessage,
  isLoading,
  onOpenDetail,
  patients,
}: PatientListTableProps) {
  return (
    <Table containerClassName="mt-5">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Nomor RM</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Usia</TableHead>
          <TableHead>Lokasi</TableHead>
          <TableHead>Dibuat Oleh</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={PATIENT_TABLE_COLUMN_COUNT} className="py-10 text-center">
              Memuat data pasien...
            </TableCell>
          </TableRow>
        ) : null}

        {!isLoading && !errorMessage && patients.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={PATIENT_TABLE_COLUMN_COUNT} className="py-10 text-center">
              Belum ada data pasien.
            </TableCell>
          </TableRow>
        ) : null}

        {!isLoading && !errorMessage
          ? patients.map((patient) => (
              <TableRow key={patient.id} className="align-top">
                <TableCell className="font-semibold text-slate-900">
                  {patient.medical_record_number}
                </TableCell>

                <TableCell className="font-semibold text-slate-900">{patient.name}</TableCell>

                <TableCell>{getPatientAgeLabel(patient.date_of_birth)}</TableCell>

                <TableCell>{getPatientLocationLabel(patient.location)}</TableCell>

                <TableCell>{getPatientListCreatorLabel(patient)}</TableCell>

                <TableCell className="text-right">
                  {canViewPatient ? (
                    <Button
                      type="button"
                      variant="secondary"
                      leadingIcon={<VisibilityOutlinedIcon aria-hidden="true" fontSize="small" />}
                      onClick={() => onOpenDetail(patient.id)}
                    >
                      Detail
                    </Button>
                  ) : (
                    <span className="text-sm text-slate-400">Tidak tersedia</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  );
}
