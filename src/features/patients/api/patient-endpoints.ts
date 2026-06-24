export const PATIENT_ENDPOINTS = {
  LIST: '/patients',
  CREATE: '/patients',
  DETAIL: (patientId: number) => `/patients/${patientId}`,
  UPDATE: (patientId: number) => `/patients/${patientId}`,
  DELETE: (patientId: number) => `/patients/${patientId}`,
} as const;
