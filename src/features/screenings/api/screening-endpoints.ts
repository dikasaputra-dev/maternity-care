export const SCREENING_ENDPOINTS = {
  CREATE: '/screenings',
  LATEST_BY_PATIENT: (patientId: number) => `/patients/${patientId}/latest-screening`,
} as const;
