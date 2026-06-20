import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState, LoadingState } from '@/components/ui/feedback-state';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/form-controls';
import { Modal } from '@/components/ui/modal';
import { Badge, Card } from '@/components/ui/surface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DesignSystemPageProps {
  systemMessage?: string | null;
}

const screeningRows = [
  {
    id: 'screening-001',
    patientName: 'Siti Aminah',
    time: '08.15',
    location: 'Ruang Bersalin 1',
    risk: 'Risiko Rendah',
  },
  {
    id: 'screening-002',
    patientName: 'Dewi Lestari',
    time: '09.30',
    location: 'Ruang Observasi',
    risk: 'Risiko Sedang',
  },
  {
    id: 'screening-003',
    patientName: 'Nadia Putri',
    time: '10.10',
    location: 'Ruang Bersalin 2',
    risk: 'Risiko Tinggi',
  },
] as const;

const riskTone = {
  'Risiko Rendah': 'success',
  'Risiko Sedang': 'warning',
  'Risiko Tinggi': 'danger',
} as const;

export function DesignSystemPage({ systemMessage }: DesignSystemPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-8">
        {systemMessage ? (
          <div
            role="status"
            className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
          >
            {systemMessage}
          </div>
        ) : null}

        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Phase 1 Preview</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Design System dan Layout
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Halaman ini memastikan komponen dasar memiliki tampilan konsisten sebelum autentikasi
              dan data klinis dibuat.
            </p>
          </div>

          <Button
            leadingIcon={<AddIcon aria-hidden="true" fontSize="small" />}
            onClick={() => setModalOpen(true)}
          >
            Buka Modal
          </Button>
        </section>

        <section aria-labelledby="statistic-heading">
          <h3 id="statistic-heading" className="mb-4 text-lg font-semibold text-slate-900">
            Statistik
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <p className="text-sm font-medium text-slate-500">Total Pasien</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">128</p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-slate-500">Skrining Hari Ini</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">12</p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-slate-500">Ditangani Hari Ini</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">8</p>
            </Card>
          </div>
        </section>

        <section aria-labelledby="table-heading">
          <div className="mb-4">
            <h3 id="table-heading" className="text-lg font-semibold text-slate-900">
              Preview Tabel
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Tabel menggunakan horizontal scroll ketika ruang layar terbatas.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pasien</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status Risiko</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {screeningRows.map((screening) => (
                <TableRow key={screening.id}>
                  <TableCell className="font-medium text-slate-900">
                    {screening.patientName}
                  </TableCell>

                  <TableCell>{screening.time}</TableCell>
                  <TableCell>{screening.location}</TableCell>

                  <TableCell>
                    <Badge tone={riskTone[screening.risk]}>{screening.risk}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section aria-labelledby="form-heading" className="grid gap-6 xl:grid-cols-2">
          <Card>
            <div className="mb-5">
              <h3 id="form-heading" className="text-lg font-semibold text-slate-900">
                Form Controls
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Form ini hanya preview visual dan belum dikirim ke backend.
              </p>
            </div>

            <div className="space-y-5">
              <Input
                label="Nama Pasien"
                placeholder="Masukkan nama lengkap"
                defaultValue="Siti Aminah"
              />

              <Select label="Status Risiko" defaultValue="medium">
                <option value="low">Risiko Rendah</option>
                <option value="medium">Risiko Sedang</option>
                <option value="high">Risiko Tinggi</option>
              </Select>

              <Textarea
                label="Catatan"
                placeholder="Tambahkan catatan singkat"
                defaultValue="Pasien memerlukan pemantauan berkala."
              />

              <Checkbox
                label="Konfirmasi data"
                description="Pastikan data sudah diperiksa sebelum disimpan."
                defaultChecked
              />
            </div>
          </Card>

          <div className="space-y-6">
            <LoadingState rows={3} />

            <EmptyState
              title="Belum ada data"
              description="Data akan muncul setelah informasi tersedia dari backend."
            />
          </div>
        </section>
      </div>

      <Modal
        open={modalOpen}
        title="Preview Modal"
        description="Modal digunakan untuk form pendek atau konfirmasi sederhana."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>

            <Button onClick={() => setModalOpen(false)}>Simpan Contoh</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nama Pasien" placeholder="Masukkan nama pasien" />

          <Select label="Lokasi Pasien" defaultValue="">
            <option value="" disabled>
              Pilih lokasi
            </option>
            <option value="labor-room-1">Ruang Bersalin 1</option>
            <option value="labor-room-2">Ruang Bersalin 2</option>
            <option value="observation-room">Ruang Observasi</option>
          </Select>
        </div>
      </Modal>
    </>
  );
}
