import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useParams, useNavigate } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { PatientDetailSummary } from '@/features/patients/components/patient-detail-summary';
import { PatientWorkflowSection } from '@/features/patients/components/patient-workflow-section';
import { getPatientById } from '@/features/patients/lib/patient-query';

export function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const patient = patientId ? getPatientById(patientId) : null;

  function handleBack() {
    void navigate(APP_PATHS.PATIENTS);
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="text-center">
            <p className="text-sm font-semibold text-brand-600">Pasien tidak ditemukan</p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Data pasien tidak tersedia
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pasien mungkin belum tersedia di mock data atau ID pasien tidak sesuai.
            </p>

            <Button
              className="mt-6"
              variant="secondary"
              leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
              onClick={handleBack}
            >
              Kembali ke Daftar Pasien
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <Button
          variant="ghost"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali ke Daftar Pasien
        </Button>

        <div className="mt-5">
          <p className="text-sm font-semibold text-brand-600">Detail Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {patient.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Halaman ini menjadi pusat navigasi data pasien. Data klinis akan dibuat bertahap setelah
            struktur detail pasien stabil.
          </p>
        </div>
      </section>

      <PatientDetailSummary patient={patient} />

      <PatientWorkflowSection
        initialScreeningCompleted={patient.workflowStatus.initialScreeningCompleted}
        monitoringEntryCount={patient.workflowStatus.monitoringEntryCount}
        actionRecorded={patient.workflowStatus.actionRecorded}
        deliveryOutcomeRecorded={patient.workflowStatus.deliveryOutcomeRecorded}
        newbornOutcomeRecorded={patient.workflowStatus.newbornOutcomeRecorded}
      />
    </div>
  );
}
