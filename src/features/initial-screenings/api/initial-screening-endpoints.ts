export const INITIAL_SCREENING_ENDPOINTS = {
  LIST: '/initial-screenings',
  DETAIL: (initialScreeningId: number) =>
    `/initial-screenings/${initialScreeningId}`,
  BY_PATIENT: (patientId: number) =>
    `/patients/${patientId}/initial-screening`,
  CREATE_BY_PATIENT: (patientId: number) =>
    `/patients/${patientId}/initial-screening`,
} as const;