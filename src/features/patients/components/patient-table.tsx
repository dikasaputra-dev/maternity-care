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
import { PatientRiskBadge } from '@/features/patients/components/patient-risk-badge';
import { formatLatestScreening, formatPatientAge } from '@/features/patients/lib/patient-format';
import type { Patient } from '@/features/patients/types/patient.types';

interface PatientTableProps {
  patients: readonly Patient[];
  onOpenDetail: (patientId: string) => void;
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

            <TableCell>{formatPatientAge(patient.age)}</TableCell>

            <TableCell>
              <PatientRiskBadge riskStatus={patient.riskStatus} />
            </TableCell>

            <TableCell>{getPatientLocationLabel(patient.location)}</TableCell>

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
