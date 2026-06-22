export function getPatientDetailPath(patientId: string) {
  return `/patients/${encodeURIComponent(patientId)}`;
}
