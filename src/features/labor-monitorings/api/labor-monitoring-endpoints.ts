export const LABOR_MONITORING_ENDPOINTS = {
  LIST: '/labor-monitorings',

  DETAIL: (laborMonitoringId: number) => `/labor-monitorings/${laborMonitoringId}`,

  BY_PATIENT: (patientId: number) => `/patients/${patientId}/labor-monitorings`,

  CREATE_BY_PATIENT: (patientId: number) => `/patients/${patientId}/labor-monitorings`,

  LATEST_BY_PATIENT: (patientId: number) => `/patients/${patientId}/latest-labor-monitoring`,
} as const;
