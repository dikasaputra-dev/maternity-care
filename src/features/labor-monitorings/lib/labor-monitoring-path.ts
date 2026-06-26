export function getLaborMonitoringCreatePath(patientId: number) {
  return `/patients/${patientId}/labor-monitorings/create`;
}

export function getLaborMonitoringDetailPath(laborMonitoringId: number) {
  return `/labor-monitorings/${laborMonitoringId}`;
}
