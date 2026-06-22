import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/surface';
import {
  PATIENT_LOCATION_OPTIONS,
  isPatientLocation,
  type PatientLocation,
} from '@/features/patients/constants/patient-options';
import {
  createPatient,
  getNextMedicalRecordNumberPreview,
} from '@/features/patients/lib/patient-query';
import { getPatientDetailPath } from '@/features/patients/lib/patient-routes';

interface PatientCreateFormState {
  name: string;
  age: string;
  location: PatientLocation | '';
  address: string;
  phoneNumber: string;
}

type PatientCreateField = keyof PatientCreateFormState;

type PatientCreateErrors = Partial<Record<PatientCreateField, string>>;

const initialFormState: PatientCreateFormState = {
  name: '',
  age: '',
  location: '',
  address: '',
  phoneNumber: '',
};

const PHONE_PATTERN = /^[0-9+()\-\s]{8,20}$/;

function parseAge(value: string) {
  const parsedAge = Number(value);

  if (!Number.isInteger(parsedAge)) {
    return null;
  }

  return parsedAge;
}

function validateForm(form: PatientCreateFormState): PatientCreateErrors {
  const errors: PatientCreateErrors = {};

  const name = form.name.trim();
  const age = parseAge(form.age);
  const address = form.address.trim();
  const phoneNumber = form.phoneNumber.trim();

  if (!name) {
    errors.name = 'Nama pasien wajib diisi.';
  } else if (name.length < 3) {
    errors.name = 'Nama pasien minimal 3 karakter.';
  }

  if (age === null) {
    errors.age = 'Usia harus berupa angka.';
  } else if (age < 10 || age > 60) {
    errors.age = 'Usia ibu harus berada antara 10 sampai 60 tahun.';
  }

  if (!form.location) {
    errors.location = 'Lokasi pasien wajib dipilih.';
  } else if (!isPatientLocation(form.location)) {
    errors.location = 'Lokasi pasien tidak valid.';
  }

  if (!address) {
    errors.address = 'Alamat pasien wajib diisi.';
  } else if (address.length < 5) {
    errors.address = 'Alamat pasien terlalu pendek.';
  }

  if (!phoneNumber) {
    errors.phoneNumber = 'Nomor telepon wajib diisi.';
  } else if (!PHONE_PATTERN.test(phoneNumber)) {
    errors.phoneNumber = 'Format nomor telepon tidak valid.';
  }

  return errors;
}

export function PatientCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientCreateFormState>(initialFormState);

  const [errors, setErrors] = useState<PatientCreateErrors>({});

  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [medicalRecordNumberPreview] = useState(() => getNextMedicalRecordNumberPreview());

  function updateField(field: PatientCreateField, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setFormError(null);
  }

  function updateLocation(value: string) {
    setForm((current) => ({
      ...current,
      location: isPatientLocation(value) ? value : '',
    }));

    setErrors((current) => ({
      ...current,
      location: undefined,
    }));

    setFormError(null);
  }

  function handleBack() {
    void navigate(APP_PATHS.PATIENTS);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(form);

    setErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const parsedAge = parseAge(form.age);

    if (parsedAge === null || !isPatientLocation(form.location)) {
      setFormError('Data pasien belum valid.');

      return;
    }

    setIsSubmitting(true);

    try {
      const patient = createPatient({
        name: form.name,
        age: parsedAge,
        location: form.location,
        address: form.address,
        phoneNumber: form.phoneNumber,
      });

      await navigate(getPatientDetailPath(patient.id), {
        replace: true,
      });
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Data pasien gagal disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <Button
          variant="ghost"
          leadingIcon={<ArrowBackOutlinedIcon aria-hidden="true" fontSize="small" />}
          onClick={handleBack}
        >
          Kembali ke Daftar Pasien
        </Button>

        <div className="mt-5">
          <p className="text-sm font-semibold text-brand-600">Data Pasien</p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Tambah pasien
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Isi identitas dasar pasien terlebih dahulu. Nomor rekam medis dibuat otomatis oleh
            sistem.
          </p>
        </div>
      </section>

      <Card>
        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="space-y-5"
        >
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Nomor Rekam Medis Otomatis
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-950">
              {medicalRecordNumberPreview}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Nomor ini akan digunakan saat pasien disimpan.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nama Pasien"
              value={form.name}
              disabled={isSubmitting}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Masukkan nama pasien"
              error={errors.name}
            />

            <Input
              label="Usia Ibu"
              type="number"
              min={10}
              max={60}
              value={form.age}
              disabled={isSubmitting}
              onChange={(event) => updateField('age', event.target.value)}
              placeholder="Contoh: 28"
              error={errors.age}
            />

            <Select
              label="Lokasi Pasien"
              value={form.location}
              disabled={isSubmitting}
              onChange={(event) => updateLocation(event.target.value)}
              error={errors.location}
            >
              <option value="">Pilih lokasi pasien</option>

              {PATIENT_LOCATION_OPTIONS.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </Select>

            <Input
              label="Nomor Telepon"
              value={form.phoneNumber}
              disabled={isSubmitting}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
              placeholder="Contoh: 081234567006"
              error={errors.phoneNumber}
            />

            <div className="md:col-span-2">
              <Input
                label="Alamat"
                value={form.address}
                disabled={isSubmitting}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="Masukkan alamat pasien"
                error={errors.address}
              />
            </div>
          </div>

          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              leadingIcon={<SaveOutlinedIcon aria-hidden="true" fontSize="small" />}
            >
              Simpan Pasien
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
