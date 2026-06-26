import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';

import { Badge, Card } from '@/components/ui/surface';

type WorkflowItemStatus = 'completed' | 'available' | 'locked';

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  status: WorkflowItemStatus;
}

interface PatientWorkflowSectionProps {
  initialScreeningCompleted: boolean;
  monitoringEntryCount: number;
  actionRecorded: boolean;
  deliveryOutcomeRecorded: boolean;
  newbornOutcomeRecorded: boolean;
}

const statusLabels: Record<WorkflowItemStatus, string> = {
  completed: 'Selesai',
  available: 'Tersedia',
  locked: 'Menunggu',
};

const statusTones: Record<WorkflowItemStatus, 'success' | 'info' | 'neutral'> = {
  completed: 'success',
  available: 'info',
  locked: 'neutral',
};

export function PatientWorkflowSection({
  actionRecorded,
  deliveryOutcomeRecorded,
  initialScreeningCompleted,
  monitoringEntryCount,
  newbornOutcomeRecorded,
}: PatientWorkflowSectionProps) {
  const screeningTitle = initialScreeningCompleted ? 'Pemantauan Persalinan' : 'Skrining Awal';

  const workflowItems: WorkflowItem[] = [
    {
      id: 'identity',
      title: 'Identitas Pasien',
      description: 'Data identitas pasien sudah dibuat sebelum masuk alur klinis.',
      status: 'completed',
    },
    {
      id: 'screening-monitoring',
      title: screeningTitle,
      description: initialScreeningCompleted
        ? `${monitoringEntryCount} catatan pemantauan tersedia.`
        : 'Pasien perlu menjalani skrining awal terlebih dahulu.',
      status: initialScreeningCompleted ? 'completed' : 'available',
    },
    {
      id: 'action',
      title: 'Tindakan',
      description: actionRecorded
        ? 'Tindakan klinis sudah tercatat.'
        : 'Tindakan dapat dicatat setelah evaluasi klinis.',
      status: actionRecorded ? 'completed' : 'available',
    },
    {
      id: 'delivery-outcome',
      title: 'Luaran Persalinan',
      description: deliveryOutcomeRecorded
        ? 'Luaran persalinan sudah tercatat.'
        : 'Menunggu proses persalinan selesai.',
      status: deliveryOutcomeRecorded ? 'completed' : 'locked',
    },
    {
      id: 'newborn-outcome',
      title: 'Luaran Kelahiran Bayi',
      description: newbornOutcomeRecorded
        ? 'Luaran kelahiran bayi sudah tercatat.'
        : 'Menunggu data kelahiran bayi tersedia.',
      status: newbornOutcomeRecorded ? 'completed' : 'locked',
    },
  ];

  const icons = [
    AssignmentTurnedInOutlinedIcon,
    MonitorHeartOutlinedIcon,
    LocalHospitalOutlinedIcon,
    FactCheckOutlinedIcon,
    ChildCareOutlinedIcon,
  ];

  return (
    <Card>
      <div>
        <p className="text-sm font-semibold text-brand-600">Alur Pasien</p>

        <h3 className="mt-1 text-lg font-semibold text-slate-950">Patient Journey</h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Shell ini menjadi dasar navigasi klinis. Setiap bagian akan dikembangkan bertahap setelah
          detail pasien stabil.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {workflowItems.map((item, index) => {
          const Icon = icons[index];

          return (
            <div key={item.id} className="rounded-xl border border-brand-100 bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon aria-hidden="true" fontSize="small" />
              </span>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-950">{item.title}</h4>

                  <Badge tone={statusTones[item.status]}>{statusLabels[item.status]}</Badge>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
