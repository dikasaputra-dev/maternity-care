export const SCREENING_ENDPOINTS = {
  LATEST_BY_PATIENT: (patientId: number) => `/patients/${patientId}/latest-screening`,
} as const;
