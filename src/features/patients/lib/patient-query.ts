import { MOCK_PATIENTS } from '@/features/patients/mocks/patient.mock';
import type {
  CreatePatientInput,
  Patient,
  PatientObstetricSummary,
  PatientRiskStatus,
  PatientWorkflowStatus,
} from '@/features/patients/types/patient.types';
import {
  isPatientLocation,
  type PatientLocation,
} from '@/features/patients/constants/patient-options';

const CREATED_PATIENTS_STORAGE_KEY = 'maternity-care.created-patients';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRiskStatus(value: unknown): value is PatientRiskStatus {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'unknown';
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === 'number' || value === null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isObstetricSummary(value: unknown): value is PatientObstetricSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNullableNumber(value.gravida) &&
    isNullableNumber(value.partus) &&
    isNullableNumber(value.abortus) &&
    isNullableNumber(value.gestationalAgeWeeks) &&
    isNullableString(value.bloodPressure) &&
    isNullableNumber(value.estimatedFetalWeightGram)
  );
}

function isWorkflowStatus(value: unknown): value is PatientWorkflowStatus {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.initialScreeningCompleted === 'boolean' &&
    typeof value.monitoringEntryCount === 'number' &&
    typeof value.actionRecorded === 'boolean' &&
    typeof value.deliveryOutcomeRecorded === 'boolean' &&
    typeof value.newbornOutcomeRecorded === 'boolean'
  );
}

function isPatientLocationValue(value: unknown): value is PatientLocation {
  return typeof value === 'string' && isPatientLocation(value);
}

function isPatient(value: unknown): value is Patient {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.medicalRecordNumber === 'string' &&
    typeof value.name === 'string' &&
    typeof value.age === 'number' &&
    isPatientLocationValue(value.location) &&
    typeof value.address === 'string' &&
    typeof value.phoneNumber === 'string' &&
    typeof value.registeredAt === 'string' &&
    isRiskStatus(value.riskStatus) &&
    isNullableString(value.latestScreeningAt) &&
    isObstetricSummary(value.obstetricSummary) &&
    isWorkflowStatus(value.workflowStatus)
  );
}

function readCreatedPatients() {
  const rawValue = window.sessionStorage.getItem(CREATED_PATIENTS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isPatient);
  } catch {
    return [];
  }
}

function writeCreatedPatients(patients: readonly Patient[]) {
  window.sessionStorage.setItem(CREATED_PATIENTS_STORAGE_KEY, JSON.stringify(patients));
}

function getMedicalRecordSequence(value: string) {
  const match = /^RM-(\d{4})-(\d+)$/u.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const sequence = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(sequence)) {
    return null;
  }

  return {
    year,
    sequence,
  };
}

function generateMedicalRecordNumber(patients: readonly Patient[]) {
  const currentYear = new Date().getFullYear();

  const latestSequence = patients.reduce((maxSequence, patient) => {
    const parsedSequence = getMedicalRecordSequence(patient.medicalRecordNumber);

    if (parsedSequence?.year !== currentYear) {
      return maxSequence;
    }

    return Math.max(maxSequence, parsedSequence.sequence);
  }, 0);

  const nextSequence = String(latestSequence + 1).padStart(3, '0');

  return `RM-${currentYear}-${nextSequence}`;
}

export function listPatients() {
  return [...readCreatedPatients(), ...MOCK_PATIENTS];
}

export function getNextMedicalRecordNumberPreview() {
  return generateMedicalRecordNumber(listPatients());
}

export function getPatientById(patientId: string) {
  return listPatients().find((patient) => patient.id === patientId) ?? null;
}

export function createPatient(input: CreatePatientInput) {
  const existingPatients = listPatients();

  const patient: Patient = {
    id: `patient-${crypto.randomUUID()}`,
    medicalRecordNumber: generateMedicalRecordNumber(existingPatients),
    name: input.name.trim(),
    age: input.age,
    location: input.location,
    address: input.address.trim(),
    phoneNumber: input.phoneNumber.trim(),
    registeredAt: new Date().toISOString(),
    riskStatus: 'unknown',
    latestScreeningAt: null,
    obstetricSummary: {
      gravida: null,
      partus: null,
      abortus: null,
      gestationalAgeWeeks: null,
      bloodPressure: null,
      estimatedFetalWeightGram: null,
    },
    workflowStatus: {
      initialScreeningCompleted: false,
      monitoringEntryCount: 0,
      actionRecorded: false,
      deliveryOutcomeRecorded: false,
      newbornOutcomeRecorded: false,
    },
  };

  const createdPatients = readCreatedPatients();

  writeCreatedPatients([patient, ...createdPatients]);

  return patient;
}
