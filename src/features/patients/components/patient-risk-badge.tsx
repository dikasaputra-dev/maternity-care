import { Badge } from '@/components/ui/surface';
import type { PatientRiskStatus } from '@/features/patients/types/patient.types';

interface PatientRiskBadgeProps {
  riskStatus: PatientRiskStatus;
}

const riskLabels: Record<PatientRiskStatus, string> = {
  low: 'Risiko Rendah',
  medium: 'Risiko Sedang',
  high: 'Risiko Tinggi',
  unknown: 'Belum Skrining',
};

const riskTones: Record<PatientRiskStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  unknown: 'neutral',
};

export function PatientRiskBadge({ riskStatus }: PatientRiskBadgeProps) {
  return <Badge tone={riskTones[riskStatus]}>{riskLabels[riskStatus]}</Badge>;
}
