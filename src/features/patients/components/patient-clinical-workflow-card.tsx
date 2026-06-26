import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';

import { Badge, Card } from '@/components/ui/surface';
import type React from 'react';

interface PatientClinicalWorkflowCardProps {
  hasInitialScreening: boolean;
}

interface WorkflowItem {
  title: string;
  description: string;
  status: 'done' | 'active' | 'locked';
  icon: React.ReactNode;
}

function getStatusLabel(status: WorkflowItem['status']) {
  if (status === 'done') {
    return 'Selesai';
  }

  if (status === 'active') {
    return 'Siap';
  }

  return 'Terkunci';
}

function getStatusTone(status: WorkflowItem['status']) {
  if (status === 'done') {
    return 'success';
  }

  if (status === 'active') {
    return 'info';
  }

  return 'neutral';
}

export function PatientClinicalWorkflowCard({
  hasInitialScreening,
}: PatientClinicalWorkflowCardProps) {
  const workflowItems: WorkflowItem[] = [
    {
      title: 'Skrining Awal',
      description: hasInitialScreening
        ? 'Skrining Awal sudah tersedia dan ditampilkan dalam mode detail.'
        : 'Skrining Awal wajib diisi terlebih dahulu sebelum fitur klinis lain aktif.',
      status: hasInitialScreening ? 'done' : 'active',
      icon: <FactCheckOutlinedIcon aria-hidden="true" fontSize="small" />,
    },
    {
      title: 'Pemantauan Persalinan',
      description: hasInitialScreening
        ? 'Fitur ini sudah boleh diaktifkan pada phase berikutnya.'
        : 'Belum aktif sampai Skrining Awal selesai.',
      status: hasInitialScreening ? 'active' : 'locked',
      icon: <MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />,
    },
    {
      title: 'Tindakan',
      description: 'Akan diaktifkan setelah alur pemantauan persalinan siap.',
      status: 'locked',
      icon: <VolunteerActivismOutlinedIcon aria-hidden="true" fontSize="small" />,
    },
    {
      title: 'Luaran Persalinan',
      description: 'Akan diaktifkan setelah data tindakan dan persalinan siap.',
      status: 'locked',
      icon: <TaskAltOutlinedIcon aria-hidden="true" fontSize="small" />,
    },
    {
      title: 'Luaran Kelahiran Bayi',
      description: 'Akan diaktifkan setelah luaran persalinan siap.',
      status: 'locked',
      icon: <LockOutlinedIcon aria-hidden="true" fontSize="small" />,
    },
  ];

  return (
    <Card>
      <div>
        <p className="text-sm font-semibold text-brand-600">Alur Klinis Pasien</p>

        <h3 className="mt-1 text-lg font-semibold text-slate-950">Status fitur klinis</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Fitur klinis dibuka bertahap agar data tidak loncat alur. Skrining Awal harus selesai
          sebelum Pemantauan Persalinan digunakan.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {workflowItems.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600">
                {item.icon}
              </span>

              <Badge tone={getStatusTone(item.status)}>{getStatusLabel(item.status)}</Badge>
            </div>

            <h4 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h4>

            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
