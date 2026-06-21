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
import { PatientRiskBadge } from '@/features/patients/components/patient-risk-badge';
import type { Patient } from '@/features/patients/types/patient.types';

interface PatientTableProps {
  patients: readonly Patient[];
  onOpenDetail: (patientId: string) => void;
}

function formatLatestScreening(value: string | null) {
  if (!value) {
    return 'Belum ada';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function PatientTable({ onOpenDetail, patients }: PatientTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Usia</TableHead>
          <TableHead>Status Risiko</TableHead>
          <TableHead>Lokasi Pasien</TableHead>
          <TableHead>Skrining Terakhir</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <div>
                <p className="font-semibold text-slate-900">{patient.name}</p>

                <p className="mt-1 text-xs text-slate-500">{patient.medicalRecordNumber}</p>
              </div>
            </TableCell>

            <TableCell>{patient.age} tahun</TableCell>

            <TableCell>
              <PatientRiskBadge riskStatus={patient.riskStatus} />
            </TableCell>

            <TableCell>{patient.location}</TableCell>

            <TableCell>{formatLatestScreening(patient.latestScreeningAt)}</TableCell>

            <TableCell className="text-right">
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<VisibilityOutlinedIcon aria-hidden="true" fontSize="small" />}
                onClick={() => onOpenDetail(patient.id)}
              >
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
