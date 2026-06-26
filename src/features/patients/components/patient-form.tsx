import type { ChangeEvent, FormEvent, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form-controls';
import {
  PATIENT_EDUCATION_OPTIONS,
  PATIENT_LOCATION_OPTIONS,
  PATIENT_RELIGION_OPTIONS,
} from '@/features/patients/constants/patient-options';
import type {
  PatientFormFieldErrors,
  PatientFormValues,
} from '@/features/patients/lib/patient-form-validation';
import type {
  PatientEducation,
  PatientLocation,
  PatientReligion,
} from '@/features/patients/types/patient.types';

interface PatientFormProps {
  values: PatientFormValues;
  errors: PatientFormFieldErrors;
  isSubmitting: boolean;
  submitLabel: string;
  submitIcon?: ReactNode;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: <Key extends keyof PatientFormValues>(field: Key, value: PatientFormValues[Key]) => void;
  formError?: string | null;
}

export function PatientForm({
  errors,
  formError,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitIcon,
  submitLabel,
  values,
}: PatientFormProps) {
  function handleTextChange(field: keyof PatientFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onChange(field, event.target.value);
    };
  }

  function handleReligionChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange('religion', event.target.value as PatientReligion | '');
  }

  function handleEducationChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange('education', event.target.value as PatientEducation | '');
  }

  function handleLocationChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange('location', event.target.value as PatientLocation | '');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Nama pasien"
          value={values.name}
          onChange={handleTextChange('name')}
          placeholder="Contoh: Rina Nuraini"
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          type="date"
          label="Tanggal lahir"
          value={values.dateOfBirth}
          onChange={handleTextChange('dateOfBirth')}
          error={errors.dateOfBirth}
          disabled={isSubmitting}
        />

        <Select
          label="Agama"
          value={values.religion}
          onChange={handleReligionChange}
          error={errors.religion}
          disabled={isSubmitting}
        >
          <option value="">Pilih agama</option>

          {PATIENT_RELIGION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          label="Pendidikan"
          value={values.education}
          onChange={handleEducationChange}
          error={errors.education}
          disabled={isSubmitting}
        >
          <option value="">Pilih pendidikan</option>

          {PATIENT_EDUCATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          label="Pekerjaan"
          value={values.occupation}
          onChange={handleTextChange('occupation')}
          placeholder="Contoh: Ibu Rumah Tangga"
          error={errors.occupation}
          disabled={isSubmitting}
        />

        <Input
          label="Ras/Suku"
          value={values.ethnicity}
          onChange={handleTextChange('ethnicity')}
          placeholder="Contoh: Sunda"
          error={errors.ethnicity}
          disabled={isSubmitting}
        />

        <Input
          label="Nomor telepon"
          value={values.phoneNumber}
          onChange={handleTextChange('phoneNumber')}
          placeholder="Opsional, contoh: 081234567890"
          error={errors.phoneNumber}
          disabled={isSubmitting}
        />

        <Input
          label="Alamat tempat tinggal"
          value={values.address}
          onChange={handleTextChange('address')}
          placeholder="Contoh: Jl. Melati No. 12, Bandung"
          error={errors.address}
          disabled={isSubmitting}
        />

        <Select
          label="Lokasi pelayanan"
          value={values.location}
          onChange={handleLocationChange}
          error={errors.location}
          disabled={isSubmitting}
          containerClassName="md:col-span-2"
        >
          <option value="">Pilih lokasi pelayanan</option>

          {PATIENT_LOCATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>
          Batal
        </Button>

        <Button type="submit" isLoading={isSubmitting} leadingIcon={submitIcon}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
